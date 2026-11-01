-- ====================================================================
-- JANSAATHI AI - Phase 2 Database & Storage Migration
-- Schema: Profiles, Login History, Preferences, Applications, Consent, Activity
-- ====================================================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with citizen demographic and verification data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  state text not null default 'Madhya Pradesh',
  district text not null default 'Bhopal',
  category text not null default 'General',
  occupation text not null default 'Farmer / Small Business',
  annual_income_bracket text not null default '₹1,50,000 - ₹2,50,000',
  digilocker_linked boolean not null default false,
  aadhaar_verified boolean not null default false,
  role text not null default 'citizen' check (role in ('citizen', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast lookup by email and role
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);

-- 2. LOGIN HISTORY TABLE
-- Records successful authentication events with user ID, timestamp, and client telemetry
create table if not exists public.login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  login_timestamp timestamptz not null default now(),
  user_agent text,
  ip_address text
);

create index if not exists idx_login_history_user_id on public.login_history(user_id);
create index if not exists idx_login_history_timestamp on public.login_history(login_timestamp desc);

-- 3. CITIZEN PREFERENCES TABLE
-- Stores persistent interface and communication preferences (Language, Notifications)
create table if not exists public.citizen_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_language text not null default 'English' check (preferred_language in ('English', 'Hindi', 'Marathi')),
  notifications_enabled boolean not null default true,
  theme text not null default 'light',
  updated_at timestamptz not null default now()
);

-- 4. APPLICATIONS TABLE
-- Stores citizen welfare scheme applications and milestone progression
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_number text not null unique,
  scheme_title text not null,
  category text not null,
  applied_date text not null,
  last_updated text not null,
  current_stage text not null,
  overall_progress integer not null default 0 check (overall_progress >= 0 and overall_progress <= 100),
  status text not null default 'Submitted' check (status in ('Draft', 'Submitted', 'Under Review', 'Approved', 'Disbursed', 'Action Required')),
  status_color text not null default 'blue',
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_applications_user_id on public.applications(user_id);
create index if not exists idx_applications_status on public.applications(status);

-- 5. CONSENT RECORDS TABLE
-- DPDP Act 2023 compliant explicit electronic consent ledger
create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (consent_type in ('digilocker', 'scheme_matching', 'dbt_credit')),
  is_granted boolean not null default true,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  dpdp_version text not null default 'DPDP Act 2023',
  created_at timestamptz not null default now()
);

create index if not exists idx_consent_records_user_id on public.consent_records(user_id);

-- 6. ACTIVITY LOGS TABLE
-- Citizen activity trail and audit log
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (action_type in ('scheme', 'document', 'application', 'assistant', 'auth', 'consent')),
  title text not null,
  description text not null,
  status_tag text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_user_id on public.activity_logs(user_id);
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);

-- ====================================================================
-- SECURITY: FUNCTIONS & TRIGGERS
-- ====================================================================

-- Helper: Check if requesting user is an administrator
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Helper: Update updated_at column
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

drop trigger if exists trg_citizen_preferences_updated_at on public.citizen_preferences;
create trigger trg_citizen_preferences_updated_at
  before update on public.citizen_preferences
  for each row execute function public.update_updated_at_column();

drop trigger if exists trg_applications_updated_at on public.applications;
create trigger trg_applications_updated_at
  before update on public.applications
  for each row execute function public.update_updated_at_column();

-- Prevent role escalation by ordinary users:
create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Unauthorized: Only system administrators may alter account roles.';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- Trigger: Automatically provision profile and preferences when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'citizen'
  )
  on conflict (id) do nothing;

  insert into public.citizen_preferences (user_id, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'preferred_language', 'English')
  )
  on conflict (user_id) do nothing;

  insert into public.activity_logs (user_id, action_type, title, description, status_tag)
  values (
    new.id,
    'auth',
    'Account Registered',
    'Citizen identity registered with JANSAATHI AI.',
    'Verified'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. PROFILES RLS
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile or admins view all" on public.profiles;
create policy "Users can view their own profile or admins view all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. LOGIN HISTORY RLS
alter table public.login_history enable row level security;

drop policy if exists "Users can insert their own login entry" on public.login_history;
create policy "Users can insert their own login entry"
  on public.login_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view only their own login history, admins view all" on public.login_history;
create policy "Users can view only their own login history, admins view all"
  on public.login_history for select
  using (auth.uid() = user_id or public.is_admin());

-- 3. CITIZEN PREFERENCES RLS
alter table public.citizen_preferences enable row level security;

drop policy if exists "Users can view their own preferences" on public.citizen_preferences;
create policy "Users can view their own preferences"
  on public.citizen_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own preferences" on public.citizen_preferences;
create policy "Users can insert their own preferences"
  on public.citizen_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own preferences" on public.citizen_preferences;
create policy "Users can update their own preferences"
  on public.citizen_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. APPLICATIONS RLS
alter table public.applications enable row level security;

drop policy if exists "Users can view their own applications, admins view all" on public.applications;
create policy "Users can view their own applications, admins view all"
  on public.applications for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can create their own applications" on public.applications;
create policy "Users can create their own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own applications" on public.applications;
create policy "Users can update their own applications"
  on public.applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. CONSENT RECORDS RLS
alter table public.consent_records enable row level security;

drop policy if exists "Users can view their own consent records, admins view all" on public.consent_records;
create policy "Users can view their own consent records, admins view all"
  on public.consent_records for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can manage their own consent records" on public.consent_records;
create policy "Users can manage their own consent records"
  on public.consent_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. ACTIVITY LOGS RLS
alter table public.activity_logs enable row level security;

drop policy if exists "Users can view their own activity, admins view all" on public.activity_logs;
create policy "Users can view their own activity, admins view all"
  on public.activity_logs for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert their own activity" on public.activity_logs;
create policy "Users can insert their own activity"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

-- ====================================================================
-- DOCUMENT STORAGE: BUCKET & STORAGE POLICIES
-- ====================================================================

-- Create private bucket for citizen documents if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'citizen_documents',
  'citizen_documents',
  false,
  10485760, -- 10MB limit
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760;

-- Storage Policy: Users can only upload into their own folder (folder name = user_id)
drop policy if exists "Users can upload their own documents" on storage.objects;
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'citizen_documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage Policy: Users can only read their own documents (or admins)
drop policy if exists "Users can view their own documents" on storage.objects;
create policy "Users can view their own documents"
  on storage.objects for select
  using (
    bucket_id = 'citizen_documents' and
    (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );

-- Storage Policy: Users can delete their own documents
drop policy if exists "Users can delete their own documents" on storage.objects;
create policy "Users can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'citizen_documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
