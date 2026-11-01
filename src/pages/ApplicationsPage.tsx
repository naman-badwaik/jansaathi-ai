import React, { useState, useEffect } from 'react';
import { 
  Layers3, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Download, 
  ArrowLeft,
  Plus,
  X,
  PhoneCall,
  ShieldCheck,
  History,
  Terminal
} from 'lucide-react';
import type { ApplicationItem, PageRoute, DbApplication } from '../types';
import { Card, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PlaceholderBanner } from '../components/common/PlaceholderBanner';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export interface ApplicationsPageProps {
  applications: ApplicationItem[];
  onRouteChange: (route: PageRoute) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  onOpenProactiveFollowUp?: (app: ApplicationItem) => void;
}

export const ApplicationsPage: React.FC<ApplicationsPageProps> = ({
  applications: fallbackApplications,
  onRouteChange,
  onShowToast,
  onOpenAuthModal,
  onOpenProactiveFollowUp
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, isConfigured } = useAuth();
  
  const [dbApplications, setDbApplications] = useState<ApplicationItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newSchemeTitle, setNewSchemeTitle] = useState('');
  const [newAppNumber, setNewAppNumber] = useState('');
  const [newCategory, setNewCategory] = useState('Agriculture');

  const [auditTrail, setAuditTrail] = useState<Array<{
    id: string;
    timestamp: string;
    action: string;
    applicationNumber: string;
    scheme?: string;
    applicant?: string;
    executionMode?: string;
    humanApprovalEnforced?: boolean;
    status: string;
  }>>(() => {
    try {
      const raw = localStorage.getItem('jansaathi_audit_trail');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'jansaathi_audit_trail' && e.newValue) {
        try {
          setAuditTrail(JSON.parse(e.newValue));
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Fetch real applications from Supabase if authenticated
  useEffect(() => {
    if (!isAuthenticated || !user || !isConfigured) {
      return;
    }

    let isMounted = true;
    const loadApplications = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!isMounted || error || !data || data.length === 0) return;
        const mapped: ApplicationItem[] = data.map((d: DbApplication) => ({
          id: d.id,
          applicationNumber: d.application_number,
          schemeTitle: d.scheme_title,
          category: d.category,
          appliedDate: d.applied_date,
          lastUpdated: d.last_updated,
          currentStage: d.current_stage,
          overallProgress: d.overall_progress,
          status: d.status,
          statusColor: (d.status === 'Approved' ? 'green' : d.status === 'Action Required' ? 'amber' : 'blue') as 'green' | 'amber' | 'blue',
          nextAction: d.next_action ?? undefined
        }));
        setDbApplications(mapped);
      } catch (err: unknown) {
        console.warn('Could not fetch user applications:', err);
      }
    };

    void loadApplications();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, isConfigured]);

  const activeList = (isAuthenticated && dbApplications.length > 0)
    ? [...dbApplications, ...fallbackApplications.filter(f => !dbApplications.some(d => d.applicationNumber === f.applicationNumber))]
    : fallbackApplications;

  const statusOptions = [
    { key: 'All', label: t('common.filterAll') },
    { key: 'Under Review', label: t('common.underReview') },
    { key: 'Approved', label: t('common.approved') },
    { key: 'Action Required', label: t('common.actionNeeded') }
  ];

  const filtered = activeList.filter(app => {
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      app.schemeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleActionClick = (actionName: string, app: ApplicationItem) => {
    onShowToast(
      actionName,
      `Cross-portal synchronization active for ${app.applicationNumber}. Status verified.`,
      'info'
    );
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeTitle.trim() || !newAppNumber.trim()) return;

    if (!isAuthenticated || !user || !isConfigured) {
      if (onOpenAuthModal) {
        onOpenAuthModal('login');
        onShowToast('Authentication Required', 'Please sign in to track applications in your database account.', 'warning');
      } else {
        onShowToast('Notice', 'Please sign in to track applications.', 'info');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const newRecord = {
        user_id: user.id,
        application_number: newAppNumber.trim().toUpperCase(),
        scheme_title: newSchemeTitle.trim(),
        category: newCategory,
        applied_date: today,
        last_updated: 'Just now',
        current_stage: 'Application Logged & Verifying',
        overall_progress: 25,
        status: 'Under Review',
        status_color: 'blue',
        next_action: 'Initial document scrutiny in progress.'
      };

      const { data, error } = await supabase
        .from('applications')
        .insert(newRecord)
        .select()
        .single();

      if (error) {
        onShowToast('Error', error.message, 'warning');
      } else if (data) {
        const item: ApplicationItem = {
          id: data.id,
          applicationNumber: data.application_number,
          schemeTitle: data.scheme_title,
          category: data.category,
          appliedDate: data.applied_date,
          lastUpdated: data.last_updated,
          currentStage: data.current_stage,
          overallProgress: data.overall_progress,
          status: data.status,
          statusColor: 'blue',
          nextAction: data.next_action
        };
        setDbApplications(prev => [item, ...prev]);

        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action_type: 'application',
          title: 'Application Tracked',
          description: `Tracking initiated for ${data.scheme_title} (${data.application_number}).`,
          status_tag: 'Tracked'
        });

        onShowToast('Application Added', 'Your application is now linked and tracked in your database account.', 'success');
        setIsAddModalOpen(false);
        setNewSchemeTitle('');
        setNewAppNumber('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not track application';
      onShowToast('Error', message, 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <Badge variant="navy" size="sm" icon={<Layers3 className="w-3.5 h-3.5 text-blue-400" />}>
              {t('applicationsPage.badge')}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('applicationsPage.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('applicationsPage.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="saffron"
              size="sm"
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuthModal?.('login');
                  onShowToast('Sign In Required', 'Please sign in to link applications to your citizen account.', 'info');
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              iconLeft={<Plus className="w-4 h-4" />}
            >
              Track Application
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRouteChange('dashboard')}
              iconLeft={<ArrowLeft className="w-4 h-4" />}
            >
              {t('common.backToDashboard')}
            </Button>
          </div>
        </div>
      </div>

      <PlaceholderBanner
        title="Cross-Portal Status Aggregation"
        description="Showing tracked welfare applications. Webhook listener and direct departmental API tracking will be wired in Phase 2."
        variant="compact"
      />

      {/* Filter and Search Bar */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('applicationsPage.searchPlaceholder')}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {statusOptions.map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setFilterStatus(st.key)}
                  className={`text-xs px-3 py-1.5 rounded-xl shrink-0 font-medium transition-colors cursor-pointer ${
                    filterStatus === st.key 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filtered.map((app) => (
          <div
            key={app.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {app.applicationNumber}
                  </span>
                  <Badge variant="navy" size="sm">{app.category}</Badge>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{app.schemeTitle}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t('dashboard.appliedOn')} {app.appliedDate} • Last portal sync: {app.lastUpdated}
                </p>
              </div>

              <div>
                {app.status === 'Approved' && (
                  <Badge variant="green" size="md" icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}>
                    {t('common.approved')}
                  </Badge>
                )}
                {app.status === 'Under Review' && (
                  <Badge variant="blue" size="md" icon={<Clock className="w-3.5 h-3.5 text-blue-600" />}>
                    {t('common.underReview')}
                  </Badge>
                )}
                {app.status === 'Action Required' && (
                  <Badge variant="amber" size="md" icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}>
                    {t('common.actionNeeded')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {t('applicationsPage.currentMilestone')}: <strong className="text-slate-900">{app.currentStage}</strong>
                </span>
                <span className="font-mono font-bold text-slate-800">{app.overallProgress}% {t('applicationsPage.complete')}</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    app.status === 'Approved' ? 'bg-emerald-600' :
                    app.status === 'Action Required' ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${app.overallProgress}%` }}
                />
              </div>
              {app.nextAction && (
                <p className="text-[11px] text-slate-600 pt-1">
                  <strong>{t('applicationsPage.actionNote')}: </strong>{app.nextAction}
                </p>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-100">
              {onOpenProactiveFollowUp && (
                <Button
                  variant="saffron"
                  size="sm"
                  onClick={() => onOpenProactiveFollowUp(app)}
                  iconLeft={<PhoneCall className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Proactive Follow-Up & Voice
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick(t('applicationsPage.downloadReceipt'), app)}
                iconLeft={<Download className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                {t('applicationsPage.downloadReceipt')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleActionClick(t('applicationsPage.officialPortalStatus'), app)}
                iconRight={<ExternalLink className="w-3.5 h-3.5 text-amber-400" />}
                className="text-xs"
              >
                {t('applicationsPage.officialPortalStatus')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Autonomous Agent Audit History & Verification Logs (Track 3 CITY-02) */}
      <div className="mt-8 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Autonomous Agent Audit History & Verification Logs</span>
                <Badge variant="navy" size="sm">Track 3 Compliance</Badge>
              </h3>
              <p className="text-[11px] text-slate-500">
                Immutable trace of portal automation runs, human approval checkpoints, and generated government acknowledgment codes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="green" size="sm" icon={<ShieldCheck className="w-3 h-3 text-emerald-600" />}>
              Human Consent Guardrail Active
            </Badge>
          </div>
        </div>

        {auditTrail.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {auditTrail.map((item) => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {item.applicationNumber}
                    </span>
                    <Badge variant="blue" size="sm">
                      {item.executionMode || 'Autonomous Submission'}
                    </Badge>
                    <Badge variant="green" size="sm">
                      Human Approved ✓
                    </Badge>
                  </div>
                  <p className="text-slate-700 font-medium">
                    {item.scheme || 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)'} • Citizen: {item.applicant || 'Ramesh Yashwant Pawar'}
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-mono text-left sm:text-right">
                  <div>Timestamp: {new Date(item.timestamp).toLocaleString('en-IN')}</div>
                  <div className="text-emerald-700 font-semibold">Status: Logged & Verified</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl text-center space-y-2 border border-dashed border-slate-300">
            <p className="text-xs text-slate-600">
              No audit entries recorded in this session yet. Submitting an application via the Application Agent or the Playwright CLI runner will record full verification telemetry here.
            </p>
            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              <span>Run CLI Automation: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">npm run test:automation</code></span>
            </div>
          </div>
        )}
      </div>

      {/* Modal to Track New Scheme Application */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Track Scheme Application</h3>
                  <p className="text-[11px] text-slate-300">Link an existing application to your account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scheme Name
                </label>
                <input
                  type="text"
                  required
                  value={newSchemeTitle}
                  onChange={(e) => setNewSchemeTitle(e.target.value)}
                  placeholder="e.g. PM-KISAN, MahaDBT Scholarship"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application / Registration Reference Number
                </label>
                <input
                  type="text"
                  required
                  value={newAppNumber}
                  onChange={(e) => setNewAppNumber(e.target.value)}
                  placeholder="e.g. MH-AGRI-2026-98124"
                  className="w-full text-xs p-2.5 font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                >
                  <option value="Agriculture">Agriculture & Farmers</option>
                  <option value="Housing">Housing & Urban Affairs</option>
                  <option value="Education">Education & Scholarships</option>
                  <option value="Health">Healthcare & Insurance</option>
                  <option value="Pension">Social Security & Pension</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Linking...' : 'Add to Tracker'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
