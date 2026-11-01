import React, { useState } from 'react';
import { Database, Copy, Check, Terminal, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const envSample = `VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key`;

  const sqlSample = `-- Open supabase/migrations/20261031_phase2_foundation.sql
-- Run in Supabase Dashboard -> SQL Editor to create:
-- 1. profiles (with RLS)
-- 2. login_history (with RLS)
-- 3. citizen_preferences (with RLS)
-- 4. applications (with RLS)
-- 5. consent_records (with RLS)
-- 6. activity_logs (with RLS)
-- 7. citizen_documents private Storage bucket`;

  const copyToClipboard = (text: string, type: 'env' | 'sql') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
      onShowToast('Copied', 'Environment variables template copied to clipboard.', 'success');
    } else {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
      onShowToast('Copied', 'Migration summary copied.', 'success');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Phase 2 Setup Guide"
      description="Connect your Supabase PostgreSQL database, Authentication, and Storage."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end w-full">
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Setup Guide
          </Button>
        </div>
      }
    >
      <div className="space-y-5 py-2 text-xs text-slate-700">
        {/* Step 1 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span>
            <h4>Obtain Supabase API Credentials</h4>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Create a project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">supabase.com</a>. Navigate to <strong>Project Settings → API</strong> and copy your <strong>Project URL</strong> and <strong>anon / public API key</strong>.
          </p>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2 text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Never expose your <code className="font-mono bg-amber-100 px-1 rounded">service_role</code> secret key in frontend code. Use only the anonymous public key.</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
              <h4>Add Environment Variables to .env.local</h4>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(envSample, 'env')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 px-2.5 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEnv ? 'Copied' : 'Copy Template'}</span>
            </button>
          </div>
          <p className="text-slate-600">
            Create a <code className="font-mono bg-slate-200 px-1 rounded text-slate-900">.env.local</code> file in your project root with:
          </p>
          <pre className="p-3 rounded-lg bg-slate-900 text-amber-400 font-mono text-[11px] overflow-x-auto">
            {envSample}
          </pre>
        </div>

        {/* Step 3 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">3</span>
              <h4>Execute PostgreSQL Migration & Storage Policies</h4>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(sqlSample, 'sql')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 px-2.5 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Database className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied' : 'Copy Migration File Path'}</span>
            </button>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Open the <strong>SQL Editor</strong> in your Supabase Dashboard and run the migration script located in this repository at:
          </p>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px]">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="select-all">supabase/migrations/20261031_phase2_foundation.sql</span>
          </div>
          <p className="text-[11px] text-slate-500">
            This script configures Row Level Security (RLS), auto-provisioning triggers, and the private <code className="font-mono bg-slate-200 px-1 rounded text-slate-800">citizen_documents</code> bucket.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">4</span>
            <h4>Assign Administrator Privileges (Optional)</h4>
          </div>
          <p className="text-slate-600 leading-relaxed">
            After registering an account in the portal, run this SQL query to grant that user administrator access to the Admin Dashboard:
          </p>
          <pre className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`update public.profiles
set role = 'admin'
where email = 'your-registered-email@example.com';`}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
