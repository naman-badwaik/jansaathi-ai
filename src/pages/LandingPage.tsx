import React from 'react';
import { 
  Compass, 
  FileCheck2, 
  Layers3, 
  Mic, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Lock,
  KeyRound,
  FileText,
  UserCheck
} from 'lucide-react';
import type { PageRoute } from '../types';
import { BrandLogo } from '../components/layout/BrandLogo';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useTranslation } from '../context/LanguageContext';

export interface LandingPageProps {
  onRouteChange: (route: PageRoute) => void;
  onOpenVoiceModal: () => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onRouteChange,
  onOpenVoiceModal,
  onShowToast
}) => {
  const { t } = useTranslation();

  const pillars = [
    {
      icon: <Compass className="w-6 h-6 text-amber-600" />,
      title: t('landing.p1Title'),
      description: t('landing.p1Desc'),
      accent: 'border-t-amber-500'
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-emerald-600" />,
      title: t('landing.p2Title'),
      description: t('landing.p2Desc'),
      accent: 'border-t-emerald-600'
    },
    {
      icon: <Mic className="w-6 h-6 text-orange-600" />,
      title: t('landing.p3Title'),
      description: t('landing.p3Desc'),
      accent: 'border-t-orange-500'
    },
    {
      icon: <Layers3 className="w-6 h-6 text-blue-600" />,
      title: t('landing.p4Title'),
      description: t('landing.p4Desc'),
      accent: 'border-t-blue-600'
    }
  ];

  const steps = [
    {
      step: '01',
      title: t('landing.s1Title'),
      desc: t('landing.s1Desc')
    },
    {
      step: '02',
      title: t('landing.s2Title'),
      desc: t('landing.s2Desc')
    },
    {
      step: '03',
      title: t('landing.s3Title'),
      desc: t('landing.s3Desc')
    },
    {
      step: '04',
      title: t('landing.s4Title'),
      desc: t('landing.s4Desc')
    }
  ];

  const consentPoints = [
    {
      icon: <Lock className="w-5 h-5 text-emerald-600" />,
      title: t('landing.dpdpTitle'),
      desc: t('landing.dpdpDesc')
    },
    {
      icon: <KeyRound className="w-5 h-5 text-amber-600" />,
      title: t('landing.consentTitle'),
      desc: t('landing.consentDesc')
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      title: t('landing.noAdsTitle'),
      desc: t('landing.noAdsDesc')
    },
    {
      icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
      title: t('landing.revokeTitle'),
      desc: t('landing.revokeDesc')
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-white border-b border-slate-200/80">
        {/* Subtle Decorative Backdrop Blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-semibold text-amber-400">{t('landing.badgeInitiative')}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{t('landing.badgeEmpower')}</span>
          </div>

          {/* Logo & Headline */}
          <div className="flex justify-center">
            <BrandLogo size="lg" variant="dark" />
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {t('landing.heroTitlePrefix')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-700">
                {t('landing.heroTitleHighlight')}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>
          </div>

          {/* Hero Action Buttons - Get Started button opens the Citizen Dashboard */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onRouteChange('dashboard')}
              iconRight={<ArrowRight className="w-5 h-5 text-amber-400" />}
              className="w-full sm:w-auto shadow-lg hover:shadow-xl font-semibold"
            >
              {t('landing.getStartedButton')}
            </Button>

            <Button
              variant="saffron"
              size="lg"
              onClick={onOpenVoiceModal}
              iconLeft={<Mic className="w-5 h-5" />}
              className="w-full sm:w-auto shadow-lg hover:shadow-xl font-semibold"
            >
              {t('landing.voiceButton')}
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => onShowToast(t('landing.trustSchemes'), 'Central and 28 State schemes mapped in the citizen database.', 'info')}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('landing.trustSchemes')}</span>
            </div>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => onShowToast(t('landing.trustMiddlemen'), 'Direct benefit transfers are credited straight to your Aadhaar-seeded bank account.', 'info')}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('landing.trustMiddlemen')}</span>
            </div>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => onShowToast(t('landing.trustOfficial'), 'Compliant with DigiLocker national credential standards.', 'info')}
            >
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>{t('landing.trustOfficial')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="navy" size="md">{t('landing.pillarsBadge')}</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t('landing.pillarsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('landing.pillarsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all ${pillar.accent} border-t-4`}
            >
              <div className="p-3 rounded-xl bg-slate-50 w-fit mb-4 border border-slate-100">
                {pillar.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                {pillar.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{t('landing.howTitleBadge')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('landing.howTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {t('landing.howSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 relative">
                <span className="text-3xl font-black text-amber-500/40 font-mono">
                  {st.step}
                </span>
                <h3 className="text-sm font-bold text-white">{st.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Button
              variant="saffron"
              size="md"
              onClick={() => onRouteChange('dashboard')}
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              {t('landing.openDashboard')}
            </Button>
          </div>
        </div>
      </section>

      {/* PRIVACY AND CONSENT INFORMATION SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="green" size="md" icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}>
            {t('landing.privacyBadge')}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t('landing.privacyTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('landing.privacySubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {consentPoints.map((point, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-2.5"
            >
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                {point.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {point.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {point.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Detailed Consent Statement Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-white to-amber-50/70 border border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900">
                {t('landing.consentGuaranteeTitle')}
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('landing.consentGuaranteeDesc')}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowToast(t('landing.reviewConsentTerms'), 'Reviewing statutory DPDP compliance terms and citizen data consent parameters.', 'info')}
            className="shrink-0 text-xs bg-white hover:bg-slate-50"
          >
            {t('landing.reviewConsentTerms')}
          </Button>
        </div>
      </section>

      {/* Citizen Trust & Inclusion Callout */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-amber-50/50 via-white to-emerald-50/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-900" />
              <h3 className="text-base font-bold text-slate-900">
                {t('landing.kendraSupportTitle')}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('landing.kendraSupportDesc')}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => onRouteChange('centres')}
            iconLeft={<Building2 className="w-4 h-4 text-amber-400" />}
            className="shrink-0 font-semibold"
          >
            {t('landing.findKendraButton')}
          </Button>
        </div>
      </section>
    </div>
  );
};
