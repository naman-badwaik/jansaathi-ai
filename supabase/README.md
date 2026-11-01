# JANSAATHI AI - Supabase Setup & Architecture Guide

This directory contains the database schema, Row Level Security (RLS) policies, storage configuration, and Supabase Edge Functions for JANSAATHI AI.

---

## Part 1: Database & Authentication Setup

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create or open your project.
2. In the Supabase Dashboard, go to **Project Settings** -> **API**.
3. Copy:
   - **Project URL** (`VITE_SUPABASE_URL`)
   - **Project API Keys** -> `anon` / `public` (`VITE_SUPABASE_ANON_KEY`)

### 2. Configure Environment Variables
Create a `.env.local` (or `.env`) file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Security Note**: Never expose your `service_role` secret key or Gemini API key in frontend application code or in any `VITE_` variables.

### 3. Run the SQL Migration
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Click **New Query**.
3. Copy and paste the entire contents of `supabase/migrations/20261031_phase2_foundation.sql`.
4. Click **Run**.

This script:
- Provisions 6 tables: `profiles`, `login_history`, `citizen_preferences`, `applications`, `consent_records`, `activity_logs`.
- Enables Row Level Security (RLS) on all tables so citizens can only read/write their own records.
- Installs triggers to automatically provision a citizen profile upon registration and prevent unauthorized role elevation.
- Sets up the private `citizen_documents` storage bucket with folder-level isolation (`auth.uid()::text`).

### 4. Create an Administrator (Optional)
To promote a registered citizen user to an administrator:
```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

Administrators gain access to the protected **Admin Intelligence Dashboard** (`/admin`) for monitoring login statistics, registration trends, and platform metrics.

---

## Part 2: Phase 3 - Real LLM Integration (Gemini 2.5 Flash)

JANSAATHI AI uses a secure **Supabase Edge Function** (`supabase/functions/chat/index.ts`) as a backend proxy to interface with Google's Gemini 2.5 Flash via the official `@google/genai` SDK.

### Architecture & Security Guarantees:
- **No Client Secrets**: The `GEMINI_API_KEY` is stored solely inside Supabase Edge Function Secrets (`Deno.env.get('GEMINI_API_KEY')`).
- **Flexible & Safe Citizen Access**: Supports both authenticated citizens and unauthenticated guest citizens (ideal for hackathon demos, public inquiries, and onboarding).
- **Request Sanitization & Rate Boundaries**:
  - Max message length enforced (2,000 characters).
  - Conversation history capped at 15 messages to prevent prompt inflation.
  - Demographic fields sanitized and length-restricted.
- **Grounded Indic Personas**: System instructions enforce the JANSAATHI AI persona with support for English, Hindi (हिंदी), and Marathi (मराठी).
- **Strict 4-Category Eligibility**: Responses evaluate citizen eligibility strictly into:
  - `Eligible`
  - `Likely eligible`
  - `More information needed`
  - `Not eligible`

### Edge Function Deployment Steps

#### 1. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

#### 2. Link your Project
```bash
supabase login
supabase link --project-ref your-project-ref
```

#### 3. Set the Gemini API Key Secret
Set your Gemini API key in Supabase Secrets (never place this in frontend code):
```bash
supabase secrets set GEMINI_API_KEY="AIzaSy..."
```

#### 4. Deploy the `chat` Edge Function
The function is configured in `supabase/config.toml` with `verify_jwt = false` to enable public and guest citizen queries without gateway-level JWT rejection.

```bash
supabase functions deploy chat
# or explicitly with the flag:
supabase functions deploy chat --no-verify-jwt
```

#### 5. Verify the Function
Once deployed, the function endpoint will be available at:
```
https://<your-project-ref>.supabase.co/functions/v1/chat
```
When invoked from the JANSAATHI AI web application, `@supabase/supabase-js` calls:
```ts
const { data, error } = await supabase.functions.invoke('chat', {
  body: {
    message: 'Check my PM-KISAN eligibility',
    history: conversationHistory,
    language: 'Hindi', // 'English' | 'Hindi' | 'Marathi'
    citizenProfile: {
      name: 'Rameshwar',
      state: 'Madhya Pradesh',
      occupation: 'Small Farmer'
    }
  }
});
```
