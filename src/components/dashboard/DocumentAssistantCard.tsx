import React from 'react';
import { 
  FileCheck2, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { PageRoute } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

export interface DocumentAssistantCardProps {
  onRouteChange: (route: PageRoute) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const DocumentAssistantCard: React.FC<DocumentAssistantCardProps> = ({
  onRouteChange,
  onShowToast
}) => {
  const { t } = useTranslation();

  const documents = [
    { name: 'Aadhaar Card (UIDAI)', status: t('common.verified'), isVerified: true, date: 'DigiLocker Synced', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
    { name: 'Khasra / Land Record (Bhu-Abhilekh)', status: t('common.verified'), isVerified: true, date: 'Valid for PM-KISAN', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
    { name: 'Income Certificate (FY 2026-27)', status: t('common.actionNeeded'), isVerified: false, date: 'Required for PMAY-G', icon: <AlertCircle className="w-4 h-4 text-amber-600" /> },
    { name: 'Bank Passbook / Cancelled Cheque', status: t('common.verified'), isVerified: true, date: 'DBT Enabled', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> }
  ];

  const handleUploadClick = () => {
    onShowToast(
      'Document Analyzer & OCR',
      '[Demo Placeholder] The OCR ingestion pipeline and tamper detection will be wired in Phase 2.',
      'info'
    );
  };

  return (
    <Card accent="green" className="h-full flex flex-col justify-between">
      <div>
        <CardHeader
          title={t('dashboard.docCardTitle')}
          subtitle={t('dashboard.docCardSubtitle')}
          icon={<FileCheck2 className="w-5 h-5 text-emerald-700" />}
          action={
            <Badge variant="green" size="sm">
              3/4 {t('common.verified')}
            </Badge>
          }
        />

        <CardBody className="space-y-4">
          {/* Interactive Drag & Drop Upload Placeholder Zone */}
          <div 
            onClick={handleUploadClick}
            className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20 rounded-2xl p-4 text-center transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">
              {t('dashboard.uploadDocPrompt')}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('dashboard.uploadDocSubtext')}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span>{t('dashboard.privacyShield')}</span>
            </div>
          </div>

          {/* Document Status Checklist */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              {t('dashboard.vaultListTitle')}
            </div>
            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {doc.icon}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{doc.date}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={doc.isVerified ? 'green' : 'amber'} 
                    size="sm"
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </div>

      <CardFooter>
        <span className="text-slate-500 text-[11px]">DigiLocker Sync (Demo Preview)</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRouteChange('documents')}
          iconRight={<ChevronRight className="w-4 h-4" />}
          className="text-xs text-slate-900 hover:text-emerald-700 cursor-pointer"
        >
          {t('dashboard.manageVault')}
        </Button>
      </CardFooter>
    </Card>
  );
};
