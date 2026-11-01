import React from 'react';
import { 
  Layers3, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { ApplicationItem, PageRoute } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

export interface ApplicationsCardProps {
  applications: ApplicationItem[];
  onRouteChange: (route: PageRoute) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const ApplicationsCard: React.FC<ApplicationsCardProps> = ({
  applications,
  onRouteChange,
  onShowToast
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'Approved':
      case 'Disbursed':
        return <Badge variant="green" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>{t('common.approved')}</Badge>;
      case 'Under Review':
      case 'Submitted':
        return <Badge variant="blue" size="sm" icon={<Clock className="w-3 h-3 text-blue-600" />}>{t('common.underReview')}</Badge>;
      case 'Action Required':
        return <Badge variant="amber" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-600" />}>{t('common.actionNeeded')}</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  const handleAppClick = (app: ApplicationItem) => {
    onShowToast(
      `Application: ${app.applicationNumber}`,
      `[Demo Record] Live government portal sync for ${app.schemeTitle} will be activated in Phase 2.`,
      'info'
    );
  };

  return (
    <Card accent="navy" className="h-full flex flex-col justify-between">
      <div>
        <CardHeader
          title={t('dashboard.appCardTitle')}
          subtitle={t('dashboard.appCardSubtitle')}
          icon={<Layers3 className="w-5 h-5 text-slate-900" />}
          action={
            <Badge variant="navy" size="sm">
              {applications.length} Demo Active
            </Badge>
          }
        />

        <CardBody className="space-y-3.5">
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => handleAppClick(app)}
              className="p-3.5 rounded-xl border border-slate-200/90 hover:border-slate-400 bg-white hover:bg-slate-50/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      {app.applicationNumber}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-500">{t('dashboard.appliedOn')} {app.appliedDate}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-700 truncate">
                    {app.schemeTitle}
                  </h4>
                </div>
                {getStatusBadge(app.status)}
              </div>

              {/* Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate max-w-[200px]">
                    {t('dashboard.currentStage')}: <strong className="text-slate-700">{app.currentStage}</strong>
                  </span>
                  <span className="font-semibold text-slate-700 shrink-0 font-mono">
                    {app.overallProgress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      app.status === 'Approved' ? 'bg-emerald-600' :
                      app.status === 'Action Required' ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${app.overallProgress}%` }}
                  />
                </div>
              </div>

              {/* Next action hint */}
              {app.nextAction && (
                <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="truncate pr-2">Notice: {app.nextAction}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </div>
          ))}
        </CardBody>
      </div>

      <CardFooter>
        <span className="text-slate-500 text-[11px]">Demo records • Live sync in Phase 2</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRouteChange('applications')}
          iconRight={<ChevronRight className="w-4 h-4" />}
          className="text-xs text-slate-900 hover:text-slate-700 cursor-pointer"
        >
          {t('dashboard.trackAllPortals')}
        </Button>
      </CardFooter>
    </Card>
  );
};
