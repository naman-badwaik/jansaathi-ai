import React from 'react';
import { ShieldCheck, Heart, ExternalLink, HelpCircle, Lock } from 'lucide-react';
import type { PageRoute } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

export interface FooterProps {
  onRouteChange: (route: PageRoute) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const Footer: React.FC<FooterProps> = ({ onRouteChange, onShowToast }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      {/* Tricolor Accent Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold text-base tracking-tight">JANSAATHI</span>
              <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footer.missionText')}
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('footer.dedicatedPrivacy')}</span>
            </div>
          </div>

          {/* Quick Citizen Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              {t('footer.citizenServicesTitle')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onRouteChange('dashboard')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {t('nav.dashboard')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onRouteChange('schemes')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {t('nav.schemes')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onRouteChange('documents')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {t('nav.documents')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onRouteChange('applications')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {t('nav.applications')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onRouteChange('centres')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {t('nav.centres')}
                </button>
              </li>
            </ul>
          </div>

          {/* Official Indian Portals (Directory Placeholders) */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              {t('footer.officialPortalsTitle')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a 
                  href="https://www.india.gov.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.myscheme.gov.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>myScheme Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.digilocker.gov.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>DigiLocker National Vault</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://uidai.gov.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>UIDAI Aadhaar Services</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Citizen Helpline & Accessibility */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              {t('footer.supportTitle')}
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              {t('footer.helplineText')}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onShowToast(
                  'Citizen Grievance Support',
                  'CPGRAMS national grievance integration will be activated in Phase 2.',
                  'info'
                )}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs cursor-pointer w-fit"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('footer.cpgramsPortal')}</span>
              </button>
              <button
                type="button"
                onClick={() => onRouteChange('profile')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs cursor-pointer w-fit"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('footer.privacyConsentControls')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              {t('footer.builtForCitizens')} <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            </span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
              {t('footer.phaseBadge')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
