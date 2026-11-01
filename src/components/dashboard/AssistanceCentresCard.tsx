import React from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { AssistanceCentre, PageRoute } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

export interface AssistanceCentresCardProps {
  centres: AssistanceCentre[];
  onRouteChange: (route: PageRoute) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const AssistanceCentresCard: React.FC<AssistanceCentresCardProps> = ({
  centres,
  onRouteChange,
  onShowToast
}) => {
  const { t } = useTranslation();
  const primaryCentre = centres[0];

  const handleCentreAction = (actionType: string) => {
    onShowToast(
      `${actionType}: ${primaryCentre.name}`,
      `[Demo Placeholder] Live GIS map routing and slot booking for ${primaryCentre.name} will be connected in Phase 2.`,
      'info'
    );
  };

  return (
    <Card accent="saffron" className="h-full flex flex-col justify-between">
      <div>
        <CardHeader
          title={t('dashboard.centresCardTitle')}
          subtitle={t('dashboard.centresCardSubtitle')}
          icon={<MapPin className="w-5 h-5 text-orange-600" />}
          action={
            <Badge variant="saffron" size="sm">
              {primaryCentre.distanceKm} km (Demo)
            </Badge>
          }
        />

        <CardBody className="space-y-4">
          {/* Main Featured Centre */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-amber-50/20 border border-slate-200/90 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded">
                    {primaryCentre.type}
                  </span>
                  {primaryCentre.isVerified && (
                    <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {t('dashboard.verifiedHub')}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {primaryCentre.name}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{primaryCentre.address}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{primaryCentre.workingHours}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-mono">{primaryCentre.contactNumber}</span>
              </div>
            </div>

            {/* Services Available Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {primaryCentre.servicesAvailable.slice(0, 3).map((service, idx) => (
                <span key={idx} className="text-[10px] bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                  {service}
                </span>
              ))}
              <span className="text-[10px] text-slate-400 font-medium">+2 more</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                iconLeft={<Navigation className="w-3.5 h-3.5 text-orange-600" />}
                onClick={() => handleCentreAction(t('dashboard.getDirections'))}
              >
                {t('dashboard.getDirections')}
              </Button>
            </div>
          </div>

          {/* Quick list of other nearby centers */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t('dashboard.otherNearby')} (Demo):
            </span>
            {centres.slice(1, 3).map((cen) => (
              <div
                key={cen.id}
                onClick={() => handleCentreAction(`View ${cen.name}`)}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs hover:bg-slate-100/50 cursor-pointer transition-colors"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-800 block truncate">{cen.name}</span>
                  <span className="text-[10px] text-slate-500">{cen.distanceKm} km away • {cen.type}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </CardBody>
      </div>

      <CardFooter>
        <span className="text-slate-600">Demo directory preview</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRouteChange('centres')}
          iconRight={<ChevronRight className="w-4 h-4" />}
          className="text-xs text-slate-900 hover:text-orange-600 cursor-pointer"
        >
          {t('dashboard.viewMapDirectory')}
        </Button>
      </CardFooter>
    </Card>
  );
};
