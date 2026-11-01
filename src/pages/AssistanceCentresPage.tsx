import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Phone, 
  Clock, 
  Navigation, 
  ShieldCheck, 
  Calendar,
  ArrowLeft 
} from 'lucide-react';
import type { AssistanceCentre, PageRoute } from '../types';
import { Card, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PlaceholderBanner } from '../components/common/PlaceholderBanner';
import { useTranslation } from '../context/LanguageContext';

export interface AssistanceCentresPageProps {
  centres: AssistanceCentre[];
  onRouteChange: (route: PageRoute) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const AssistanceCentresPage: React.FC<AssistanceCentresPageProps> = ({
  centres,
  onRouteChange,
  onShowToast
}) => {
  const { t } = useTranslation();
  const [searchPin, setSearchPin] = useState('');

  const filteredCentres = centres.filter(c => 
    searchPin === '' || 
    c.name.toLowerCase().includes(searchPin.toLowerCase()) ||
    c.address.toLowerCase().includes(searchPin.toLowerCase())
  );

  const handleAction = (type: string, centre: AssistanceCentre) => {
    onShowToast(
      centre.name,
      `${type} and official CSC VLE appointment booking will be activated in Phase 2.`,
      'info'
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <Badge variant="saffron" size="sm" icon={<MapPin className="w-3.5 h-3.5 text-orange-400" />}>
              {t('centresPage.badge')}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('centresPage.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('centresPage.subtitle')}
            </p>
          </div>
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

      <PlaceholderBanner
        title="GIS Mapping & Physical Seva Integration"
        description="Showing certified CSC centres in Bhopal, MP. Real-time GPS distance calculation and live appointment slot booking will connect in Phase 2."
        variant="compact"
      />

      {/* Search Bar */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPin}
                onChange={(e) => setSearchPin(e.target.value)}
                placeholder={t('centresPage.searchPlaceholder')}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchPin('')}
            >
              {t('common.reset')}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Centres List */}
      <div className="space-y-4">
        {filteredCentres.map((cen) => (
          <div
            key={cen.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="saffron" size="sm">{cen.type}</Badge>
                  {cen.isVerified && (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {t('dashboard.verifiedHub')}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">{cen.name}</h3>
                <p className="text-xs text-slate-600 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{cen.address}</span>
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xl font-bold text-slate-900 font-mono">{cen.distanceKm} km</div>
                <span className="text-[10px] text-slate-500">{t('centresPage.fromRegistered')}</span>
              </div>
            </div>

            {/* Timings and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{cen.workingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono">{cen.contactNumber}</span>
              </div>
            </div>

            {/* Services Tags */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                {t('centresPage.servicesAvailable')}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {cen.servicesAvailable.map((srv, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-100 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('Appointment booking', cen)}
                iconLeft={<Calendar className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                {t('centresPage.bookSlot')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAction('GIS Map Directions', cen)}
                iconLeft={<Navigation className="w-3.5 h-3.5 text-amber-400" />}
                className="text-xs"
              >
                {t('centresPage.getDirections')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
