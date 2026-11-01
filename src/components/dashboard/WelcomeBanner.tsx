import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Mic, 
  MapPin, 
  FileText, 
  Layers3, 
  Compass 
} from 'lucide-react';
import type { CitizenProfile, PageRoute } from '../../types';
import { Button } from '../common/Button';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export interface WelcomeBannerProps {
  profile: CitizenProfile;
  onRouteChange: (route: PageRoute) => void;
  onOpenVoiceModal: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  profile,
  onRouteChange,
  onOpenVoiceModal
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
      {/* Subtle Background Glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Tricolor Accent Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Welcome Text */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-amber-400 font-semibold">{isAuthenticated ? 'Authenticated Portal' : 'Citizen Portal'}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {isAuthenticated ? t('dashboard.verifiedCitizen') : t('nav.guest')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t('dashboard.welcomeGreeting')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">{profile.name}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t('dashboard.welcomeSubtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="saffron"
              size="sm"
              onClick={onOpenVoiceModal}
              iconLeft={<Mic className="w-4 h-4" />}
            >
              {t('nav.voiceAssistant')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRouteChange('schemes')}
              iconLeft={<Compass className="w-4 h-4 text-slate-700" />}
            >
              {t('nav.schemes')}
            </Button>
          </div>
        </div>

        {/* Quick Citizen Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-80 shrink-0">
          <div 
            onClick={() => onRouteChange('schemes')}
            className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match</span>
            </div>
            <div className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">14</div>
            <div className="text-[11px] text-slate-400">{t('dashboard.statEligible')}</div>
          </div>

          <div 
            onClick={() => onRouteChange('applications')}
            className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-blue-400 mb-1">
              <Layers3 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active</span>
            </div>
            <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">3</div>
            <div className="text-[11px] text-slate-400">{t('dashboard.statApplications')}</div>
          </div>

          <div 
            onClick={() => onRouteChange('documents')}
            className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vault</span>
            </div>
            <div className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">4/5</div>
            <div className="text-[11px] text-slate-400">{t('dashboard.statVault')}</div>
          </div>

          <div 
            onClick={() => onRouteChange('centres')}
            className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-orange-400 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nearest</span>
            </div>
            <div className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">1.2 km</div>
            <div className="text-[11px] text-slate-400">{t('dashboard.statNearestKendra')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
