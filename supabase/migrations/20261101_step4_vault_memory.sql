-- ====================================================================
-- JANSAATHI AI - Step 4 Persistent Citizen Memory and Secure Document Vault
-- Schema: Extended Profile Memory, Reusable Citizen Documents, DPDP Consent
-- ====================================================================

-- 1. EXTEND PROFILES TABLE WITH REUSABLE APPLICATION MEMORY & SOURCES
alter table public.profiles
  add column if not exists age integer,
  add column if not exists date_of_birth date,
  add column if not exists taluka text default 'Haveli',
  add column if not exists village text default 'Wadebolhai',
  add column if not exists housing_status text default 'Kutcha House',
  add column if not exists annual_income numeric default 48000,
  add column if not exists land_holding_acres numeric default 0,
  add column if not exists field_sources jsonb default '{
    "name": {"source": "verified_document", "verifiedAt": "2026-10-31T00:00:00Z"},
    "district": {"source": "authenticated_profile", "verifiedAt": "2026-10-31T00:00:00Z"},
    "housing_status": {"source": "citizen_provided", "verifiedAt": "2026-10-31T00:00:00Z"},
    "annual_income": {"source": "verified_document", "verifiedAt": "2026-10-31T00:00:00Z"}
  }'::jsonb;

-- 2. ENHANCE CONSENT RECORDS TABLE FOR GRANULAR DOCUMENT ACCESS
-- Allow consent per document category and scheme purpose
alter table public.consent_records drop constraint if exists consent_records_consent_type_check;

alter table public.consent_records
  add column if not exists purpose text,
  add column if not exists document_category text,
  add column if not exists scheme_id text;

create index if not exists idx_consent_records_user_doc on public.consent_records(user_id, document_category, scheme_id);

-- 3. CITIZEN DOCUMENTS METADATA TABLE
-- Stores metadata of verified documents in the private storage bucket
create table if not exists public.citizen_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null, -- 'Aadhaar Card', 'Income Certificate', 'Ration Card', 'Land Record 7/12', 'Bank Passbook'
  category text not null,      -- 'Identity Proof', 'Income Eligibility', 'Asset Proof', 'Socio-Economic'
  file_name text not null,
  storage_path text not null,
  file_size integer,
  mime_type text default 'application/pdf',
  verification_status text not null default 'Verified' check (verification_status in ('Pending', 'Verified', 'Rejected', 'Expired')),
  verified_at timestamptz default now(),
  expiry_date date,
  extracted_summary jsonb default '{}'::jsonb, -- Safe metadata only! Masked UID tokens, zero raw Aadhaar
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_citizen_documents_user_id on public.citizen_documents(user_id);
create index if not exists idx_citizen_documents_type on public.citizen_documents(user_id, document_type);

-- Trigger for citizen_documents updated_at
drop trigger if exists trg_citizen_documents_updated_at on public.citizen_documents;
create trigger trg_citizen_documents_updated_at
  before update on public.citizen_documents
  for each row execute function public.update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS) FOR CITIZEN DOCUMENTS
alter table public.citizen_documents enable row level security;

drop policy if exists "Users can view their own document metadata" on public.citizen_documents;
create policy "Users can view their own document metadata"
  on public.citizen_documents for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert their own document metadata" on public.citizen_documents;
create policy "Users can insert their own document metadata"
  on public.citizen_documents for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own document metadata" on public.citizen_documents;
create policy "Users can update their own document metadata"
  on public.citizen_documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own document metadata" on public.citizen_documents;
create policy "Users can delete their own document metadata"
  on public.citizen_documents for delete
  using (auth.uid() = user_id);

-- 5. VERIFY & ENFORCE STORAGE POLICIES ON citizen_documents BUCKET
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'citizen_documents',
  'citizen_documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760;

drop policy if exists "Users can upload their own documents" on storage.objects;
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'citizen_documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can view their own documents" on storage.objects;
create policy "Users can view their own documents"
  on storage.objects for select
  using (
    bucket_id = 'citizen_documents' and
    (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );

drop policy if exists "Users can delete their own documents" on storage.objects;
create policy "Users can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'citizen_documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 6. SEED REUSABLE TEST CITIZEN VAULT (ramesh.pawar@jansaathi.in)
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'ramesh.pawar@jansaathi.in' limit 1;
  
  if v_user_id is not null then
    -- Update reusable profile memory
    update public.profiles set
      age = 60,
      taluka = 'Haveli',
      village = 'Wadebolhai',
      housing_status = 'Kutcha House',
      annual_income = 48000,
      land_holding_acres = 0.5,
      field_sources = jsonb_build_object(
        'name', jsonb_build_object('source', 'verified_document', 'verifiedAt', now(), 'docType', 'Aadhaar Card'),
        'age', jsonb_build_object('source', 'verified_document', 'verifiedAt', now(), 'docType', 'Aadhaar Card'),
        'district', jsonb_build_object('source', 'authenticated_profile', 'verifiedAt', now()),
        'taluka', jsonb_build_object('source', 'authenticated_profile', 'verifiedAt', now()),
        'village', jsonb_build_object('source', 'authenticated_profile', 'verifiedAt', now()),
        'housing_status', jsonb_build_object('source', 'verified_document', 'verifiedAt', now(), 'docType', 'Land Record 7/12'),
        'annual_income', jsonb_build_object('source', 'verified_document', 'verifiedAt', now(), 'docType', 'Income Certificate')
      )
    where id = v_user_id;

    -- Seed 3 verified documents in the secure vault
    delete from public.citizen_documents where user_id = v_user_id;

    insert into public.citizen_documents (
      user_id, document_type, category, file_name, storage_path, verification_status, extracted_summary
    ) values
    (
      v_user_id,
      'Aadhaar Card',
      'Identity Proof',
      'Aadhaar_Ramesh_Pawar_Senior.pdf',
      v_user_id || '/aadhaar_verified.pdf',
      'Verified',
      jsonb_build_object(
        'name', 'Ramesh Yashwant Pawar (रमेश पवार)',
        'age', 60,
        'gender', 'Male',
        'maskedAadhaar', 'XXXX-XXXX-4912',
        'district', 'Pune',
        'state', 'Maharashtra'
      )
    ),
    (
      v_user_id,
      'Income Certificate',
      'Income Eligibility',
      'Tehsildar_Income_Certificate_2026.pdf',
      v_user_id || '/income_cert_2026.pdf',
      'Verified',
      jsonb_build_object(
        'annualIncome', 48000,
        'financialYear', '2025-2026',
        'issuingAuthority', 'Office of Tehsildar, Haveli, Pune',
        'certificateNumber', 'MH/PUN/INC/2026/89104'
      )
    ),
    (
      v_user_id,
      'Land Record 7/12',
      'Asset Proof',
      'Gram_Panchayat_Kutcha_House_Certificate.pdf',
      v_user_id || '/land_record_712.pdf',
      'Verified',
      jsonb_build_object(
        'existingStructure', 'Kutcha House (Mud walls, thatched roof)',
        'gramPanchayat', 'Wadebolhai, Taluka Haveli, Pune',
        'surveyNumber', 'Gat No. 184/2 (0.02 Hectare plot)',
        'housingDeficitConfirmed', true
      )
    );
  end if;
end $$;
