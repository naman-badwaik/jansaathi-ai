import React from 'react';
import { 
  History, 
  FileCheck, 
  Compass, 
  Layers3, 
  Clock 
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import type { ActivityItem } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

export interface RecentActivityProps {
  activities: ActivityItem[];
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onShowToast
}) => {
  const { t } = useTranslation();

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'application':
        return <Layers3 className="w-4 h-4 text-blue-600" />;
      case 'document':
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case 'scheme':
        return <Compass className="w-4 h-4 text-amber-600" />;
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleActivityClick = (act: ActivityItem) => {
    onShowToast(
      act.title,
      `[Demo Audit Trail] Event: ${act.description}`,
      'info'
    );
  };

  return (
    <Card className="h-full">
      <CardHeader
        title={t('dashboard.activityTitle')}
        subtitle={t('dashboard.activitySubtitle')}
        icon={<History className="w-5 h-5 text-slate-800" />}
        action={
          <Badge variant="slate" size="sm">
            Demo Audit Trail
          </Badge>
        }
      />

      <CardBody className="space-y-4">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
              className="relative group cursor-pointer"
            >
              {/* Timeline Bullet Node */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-slate-900 group-hover:scale-110 flex items-center justify-center transition-all shadow-2xs">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 hover:border-slate-200 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-white border border-slate-200 shrink-0">
                      {getActivityIcon(activity.type)}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-700">
                      {activity.title}
                    </h4>
                  </div>
                  {activity.statusTag && (
                    <Badge variant="navy" size="sm">
                      {activity.statusTag}
                    </Badge>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {activity.description}
                </p>

                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
