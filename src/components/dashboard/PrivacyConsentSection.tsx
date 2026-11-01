import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Download, 
  FileCheck
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useTranslation } from '../../context/LanguageContext';

export interface PrivacyConsentSectionProps {
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const PrivacyConsentSection: React.FC<PrivacyConsentSectionProps> = ({ onShowToast }) => {
  const { t } = useTranslation();
  const [digilockerConsent, setDigilockerConsent] = useState(true);
  const [schemeMatchingConsent, setSchemeMatchingConsent] = useState(true);
  const [dbtConsent, setDbtConsent] = useState(true);

  const handleToggle = (type: string, currentState: boolean, setter: (val: boolean) => void) => {
    setter(!currentState);
    onShowToast(
      `${type} Consent ${!currentState ? 'Granted' : 'Revoked'}`,
      `[Demo Consent Manager] Live consent ledger updates will sync with National Consent Artifacts in Phase 2.`,
      !currentState ? 'success' : 'warning'
    );
  };

  return (
    <Card accent="green">
      <CardHeader
        title={t('dashboard.privacyCardTitle')}
        subtitle={t('dashboard.privacyCardSubtitle')}
        icon={<ShieldCheck className="w-5 h-5 text-emerald-700" />}
        action={
          <Badge variant="green" size="sm" icon={<Lock className="w-3 h-3 text-emerald-600" />}>
            DPDP Compliant (Demo)
          </Badge>
        }
      />

      <CardBody className="space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          {t('dashboard.dpdpStatement')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Consent Item 1 */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  {t('dashboard.digilockerAccessTitle')}
                </span>
                <Badge variant={digilockerConsent ? 'green' : 'amber'} size="sm">
                  {digilockerConsent ? t('dashboard.authorized') : t('dashboard.revoked')}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('dashboard.digilockerAccessDesc')}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggle('DigiLocker', digilockerConsent, setDigilockerConsent)}
              className="text-xs w-full py-1 cursor-pointer"
            >
              {digilockerConsent ? t('dashboard.revokeConsent') : t('dashboard.grantConsent')}
            </Button>
          </div>

          {/* Consent Item 2 */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  {t('dashboard.schemeMatchTitle')}
                </span>
                <Badge variant={schemeMatchingConsent ? 'green' : 'amber'} size="sm">
                  {schemeMatchingConsent ? t('dashboard.authorized') : t('dashboard.revoked')}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('dashboard.schemeMatchDesc')}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggle('Scheme Matching', schemeMatchingConsent, setSchemeMatchingConsent)}
              className="text-xs w-full py-1 cursor-pointer"
            >
              {schemeMatchingConsent ? t('dashboard.revokeConsent') : t('dashboard.grantConsent')}
            </Button>
          </div>

          {/* Consent Item 3 */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {t('dashboard.dbtCreditTitle')}
                </span>
                <Badge variant={dbtConsent ? 'green' : 'amber'} size="sm">
                  {dbtConsent ? t('dashboard.authorized') : t('dashboard.revoked')}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('dashboard.dbtCreditDesc')}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggle('DBT Status', dbtConsent, setDbtConsent)}
              className="text-xs w-full py-1 cursor-pointer"
            >
              {dbtConsent ? t('dashboard.revokeConsent') : t('dashboard.grantConsent')}
            </Button>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Zero data monetization guarantee. Data is never shared with third-party advertisers.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShowToast('Export Citizen Data', '[Demo Placeholder] Full DPDP data package download will be enabled in Phase 2.', 'info')}
            iconLeft={<Download className="w-3.5 h-3.5" />}
            className="text-xs text-slate-700 hover:text-slate-900 shrink-0 cursor-pointer"
          >
            {t('dashboard.exportDataPackage')}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
