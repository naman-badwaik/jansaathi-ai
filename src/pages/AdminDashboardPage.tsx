import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  History, 
  Layers3, 
  Activity, 
  ArrowLeft, 
  RefreshCw,
  Lock,
  Compass
} from 'lucide-react';
import type { PageRoute, DbProfile, DbLoginHistory, DbApplication, DbActivityLog } from '../types';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

export interface AdminDashboardPageProps {
  onRouteChange: (route: PageRoute) => void;
  onOpenAuthModal: () => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onRouteChange,
  onOpenAuthModal,
  onShowToast
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, isConfigured, profile, user } = useAuth();

  const [profilesList, setProfilesList] = useState<DbProfile[]>([]);
  const [loginsList, setLoginsList] = useState<DbLoginHistory[]>([]);
  const [applicationsList, setApplicationsList] = useState<DbApplication[]>([]);
  const [activityList, setActivityList] = useState<DbActivityLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Load real telemetry from Supabase if configured and user is admin
  useEffect(() => {
    if (!isAdmin || !isConfigured) return;
    let isMounted = true;

    // Async load avoiding synchronous setState in effect
    Promise.resolve().then(async () => {
      if (!isMounted) return;
      setIsLoadingData(true);
      try {
        const [pRes, lRes, aRes, actRes] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(20),
          supabase.from('login_history').select('*').order('login_timestamp', { ascending: false }).limit(25),
          supabase.from('applications').select('*').order('created_at', { ascending: false }).limit(20),
          supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(25),
        ]);

        if (!isMounted) return;
        if (pRes.data) setProfilesList(pRes.data as DbProfile[]);
        if (lRes.data) setLoginsList(lRes.data as DbLoginHistory[]);
        if (aRes.data) setApplicationsList(aRes.data as DbApplication[]);
        if (actRes.data) setActivityList(actRes.data as DbActivityLog[]);
      } catch (err: any) {
        console.warn('Admin telemetry fetch notice:', err.message);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isAdmin, isConfigured, reloadTrigger]);

  const handleRefresh = () => {
    setReloadTrigger(prev => prev + 1);
    onShowToast('Admin Console', 'Telemetry and audit logs reloaded.', 'info');
  };

  // ACCESS DENIED VIEW: Non-admin or unauthenticated access
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <Badge variant="red" size="md" icon={<Lock className="w-3.5 h-3.5 text-rose-600" />}>
              Security Clearance Restricted
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('admin.accessDeniedTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('admin.accessDeniedDesc')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto space-y-1 text-left">
            <p><strong>Current Identity:</strong> {profile?.name || user?.email || 'Unauthenticated Citizen'}</p>
            <p><strong>Assigned Role:</strong> <span className="font-mono bg-slate-200 px-1 rounded">{profile?.role || 'Guest'}</span></p>
            <p className="text-[11px] text-slate-500 pt-1">
              To test administrative telemetry, assign <code className="font-mono bg-slate-200 px-1 rounded">role = 'admin'</code> in the Supabase PostgreSQL <code className="font-mono bg-slate-200 px-1 rounded">profiles</code> table.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => onRouteChange('dashboard')}
              iconLeft={<ArrowLeft className="w-4 h-4 text-amber-400" />}
            >
              {t('admin.returnToDashboard')}
            </Button>

            {!isAuthenticated && (
              <Button
                variant="outline"
                size="md"
                onClick={onOpenAuthModal}
              >
                Sign In as Administrator
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Real-time telemetry counts from Supabase database
  const totalUsersDisplay = profilesList.length;
  const totalLoginsDisplay = loginsList.length;
  const totalAppsDisplay = applicationsList.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Admin Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="saffron" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}>
                {t('admin.badge')}
              </Badge>
              {isConfigured && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  {t('admin.liveDataConnected')}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('admin.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {t('admin.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingData}
              iconLeft={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />}
              className="text-white border-slate-700 bg-slate-800/80 hover:bg-slate-700"
            >
              Refresh Telemetry
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRouteChange('dashboard')}
              iconLeft={<ArrowLeft className="w-4 h-4 text-slate-900" />}
            >
              Citizen Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 border-t-4 border-t-blue-600">
          <div className="flex items-center justify-between text-blue-600">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profiles</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalUsersDisplay}</div>
          <div className="text-xs text-slate-500">{t('admin.statTotalUsers')}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between text-emerald-600">
            <History className="w-5 h-5" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telemetry</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalLoginsDisplay}</div>
          <div className="text-xs text-slate-500">{t('admin.statLogins')}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between text-amber-600">
            <Layers3 className="w-5 h-5" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applications</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalAppsDisplay}</div>
          <div className="text-xs text-slate-500">{t('admin.statApplications')}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 border-t-4 border-t-purple-600">
          <div className="flex items-center justify-between text-purple-600">
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog</span>
          </div>
          <div className="text-2xl font-black text-slate-900">2,500+</div>
          <div className="text-xs text-slate-500">{t('admin.statActiveSchemes')}</div>
        </div>
      </div>

      {/* Main Grid: Registrations & Login Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations Table */}
        <Card>
          <CardHeader
            title={t('admin.recentRegistrations')}
            subtitle="Verified citizen identities stored in public.profiles with Row Level Security."
            icon={<Users className="w-5 h-5 text-blue-600" />}
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">{t('admin.userHeader')}</th>
                    <th className="py-2.5 px-3">{t('admin.emailHeader')}</th>
                    <th className="py-2.5 px-3">{t('admin.roleHeader')}</th>
                    <th className="py-2.5 px-4">{t('admin.registeredOnHeader')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profilesList.length > 0 ? (
                    profilesList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{p.email}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={p.role === 'admin' ? 'saffron' : 'slate'} size="sm">
                            {p.role}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center text-xs text-slate-500">
                        No registered citizens in database yet. New accounts will appear here in real time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Login Telemetry Table */}
        <Card>
          <CardHeader
            title={t('admin.loginAuditTrail')}
            subtitle="Successful authentication timestamps in public.login_history (RLS restricted)."
            icon={<History className="w-5 h-5 text-emerald-600" />}
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">{t('admin.emailHeader')}</th>
                    <th className="py-2.5 px-3">{t('admin.loginTimeHeader')}</th>
                    <th className="py-2.5 px-4">{t('admin.clientHeader')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loginsList.length > 0 ? (
                    loginsList.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-900 font-mono text-[11px]">{log.user_email}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {new Date(log.login_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 truncate max-w-[150px] font-mono text-[10px]">
                          {log.user_agent ? log.user_agent.slice(0, 30) + '...' : 'Browser Session'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 px-4 text-center text-xs text-slate-500">
                        No login events recorded in public.login_history yet. Successful logins will record telemetry here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* System Activity Log Stream */}
      <Card>
        <CardHeader
          title={t('admin.systemActivity')}
          subtitle="Audit events recorded in public.activity_logs across citizen interactions."
          icon={<Activity className="w-5 h-5 text-slate-800" />}
        />
        <CardBody>
          <div className="space-y-3">
            {activityList.length > 0 ? (
              activityList.map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 mr-2">{act.title}</span>
                    <span className="text-slate-600">{act.description}</span>
                  </div>
                  <Badge variant="navy" size="sm">{act.action_type}</Badge>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No system activity logs recorded yet. Events will appear as citizens interact with schemes, applications, and authentication.
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
