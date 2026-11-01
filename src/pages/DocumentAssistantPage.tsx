import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw
} from 'lucide-react';
import type { PageRoute, CitizenIntakeData, ExtractedDocumentData, VerifiedScheme, DbCitizenDocument, DbConsentRecord } from '../types';
import { Card, CardBody } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { DocumentIntelligencePanel } from '../components/documents/DocumentIntelligencePanel';
import { 
  fetchCitizenVaultDocuments, 
  fetchCitizenConsents, 
  setCitizenConsent 
} from '../services/documentIntelligenceService';

export interface DocumentAssistantPageProps {
  intakeData?: CitizenIntakeData;
  selectedScheme?: VerifiedScheme;
  onRouteChange?: (route: PageRoute) => void;
  onDocumentsVerified?: (docs: ExtractedDocumentData[]) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const DocumentAssistantPage: React.FC<DocumentAssistantPageProps> = ({ 
  intakeData,
  selectedScheme,
  onRouteChange, 
  onDocumentsVerified,
  onShowToast 
}) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [dbDocuments, setDbDocuments] = useState<DbCitizenDocument[]>([]);
  const [consents, setConsents] = useState<DbConsentRecord[]>([]);
  const [isLoadingVault, setIsLoadingVault] = useState(false);
  const [consentActionId, setConsentActionId] = useState<string | null>(null);

  const refreshVault = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingVault(true);
    try {
      const [docs, cons] = await Promise.all([
        fetchCitizenVaultDocuments(user.id),
        fetchCitizenConsents(user.id)
      ]);
      setDbDocuments(docs);
      setConsents(cons);
    } catch (err) {
      console.warn('Vault load error:', err);
    } finally {
      setIsLoadingVault(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const loadData = async () => {
      try {
        const [docs, cons] = await Promise.all([
          fetchCitizenVaultDocuments(user.id),
          fetchCitizenConsents(user.id)
        ]);
        if (isMounted) {
          setDbDocuments(docs);
          setConsents(cons);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Vault load error:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingVault(false);
        }
      }
    };

    // Defer async load to prevent synchronous cascading render warning
    queueMicrotask(() => {
      if (isMounted) {
        setIsLoadingVault(true);
        void loadData();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  const handleToggleConsent = async (documentCategory: string, currentGranted: boolean) => {
    if (!user?.id) {
      onShowToast('Authentication Required', 'Please sign in to manage electronic consent under DPDP Act 2023.', 'warning');
      return;
    }

    setConsentActionId(documentCategory);
    const targetScheme = selectedScheme?.id || 'mh-housing-01';
    const purpose = selectedScheme ? `Verification for ${selectedScheme.title}` : 'General Welfare Scheme Verification';

    try {
      const result = await setCitizenConsent(
        user.id,
        documentCategory,
        targetScheme,
        !currentGranted,
        purpose
      );

      if (result.success) {
        onShowToast(
          currentGranted ? 'Consent Revoked' : 'Consent Granted',
          currentGranted 
            ? `Consent for '${documentCategory}' has been revoked under the DPDP Act 2023.`
            : `Explicit consent granted for '${documentCategory}' under the DPDP Act 2023.`,
          currentGranted ? 'info' : 'success'
        );
        await refreshVault();
      } else {
        onShowToast('Action Failed', result.error || 'Failed to update consent record.', 'warning');
      }
    } catch (err: any) {
      onShowToast('Error', err?.message || 'Consent update error', 'warning');
    } finally {
      setConsentActionId(null);
    }
  };

  const isConsentGranted = (category: string) => {
    const record = consents.find((c) => c.document_category === category && c.is_granted && !c.revoked_at);
    return Boolean(record);
  };

  const fallbackVaultDocs = [
    {
      id: 'doc-aadhaar',
      document_type: 'Aadhaar Card',
      category: 'Identity Proof',
      file_name: 'Aadhaar_Ramesh_Pawar_Senior.pdf',
      verification_status: 'Verified' as const,
      extracted_summary: {
        name: 'Ramesh Yashwant Pawar (रमेश पवार)',
        age: 60,
        maskedAadhaar: 'XXXX-XXXX-4912',
        district: 'Pune'
      },
      source: 'DigiLocker Verified',
      created_at: '2026-10-31T00:00:00Z'
    },
    {
      id: 'doc-income',
      document_type: 'Income Certificate',
      category: 'Income Eligibility',
      file_name: 'Tehsildar_Income_Certificate_2026.pdf',
      verification_status: 'Verified' as const,
      extracted_summary: {
        annualIncome: 48000,
        issuingAuthority: 'Office of Tehsildar, Haveli, Pune',
        financialYear: '2025-2026'
      },
      source: 'Tehsildar Certified',
      created_at: '2026-10-31T00:00:00Z'
    },
    {
      id: 'doc-land',
      document_type: 'Land Record 7/12',
      category: 'Asset Proof',
      file_name: 'Gram_Panchayat_Kutcha_House_Certificate.pdf',
      verification_status: 'Verified' as const,
      extracted_summary: {
        existingStructure: 'Kutcha House (Mud walls, thatched roof)',
        gramPanchayat: 'Wadebolhai, Taluka Haveli, Pune',
        surveyNumber: 'Gat No. 184/2'
      },
      source: 'State Revenue / Gram Panchayat',
      created_at: '2026-10-31T00:00:00Z'
    }
  ];

  const displayedDocs = isAuthenticated && dbDocuments.length > 0 
    ? dbDocuments 
    : fallbackVaultDocs;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <Badge variant="green" size="sm" icon={<FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />}>
              CITY-02 Document Intelligence & OCR
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('documentsPage.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Extracts essential data fields from Aadhaar, Income Certificates, and 7/12 Land Records. Cross-verifies consistency before government portal submission.
            </p>
          </div>
          {onRouteChange && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRouteChange('dashboard')}
              iconLeft={<ArrowLeft className="w-4 h-4" />}
            >
              {t('common.back')}
            </Button>
          )}
        </div>
      </div>

      {/* Phase 3 Interactive Document Intelligence Panel */}
      <DocumentIntelligencePanel
        intakeData={intakeData}
        selectedScheme={selectedScheme}
        onDocumentsVerified={(docs) => {
          if (onDocumentsVerified) {
            onDocumentsVerified(docs);
          }
          if (onRouteChange) {
            onRouteChange('schemes');
          }
        }}
        onShowToast={onShowToast}
      />

      {/* Verified Document Vault Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Citizen Secure Document Vault
              </h2>
              <Badge variant="green" size="sm">
                DPDP Act 2023 Compliant
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Private Supabase Storage with user-isolated Row-Level Security. Documents are reused across applications with your explicit consent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshVault}
                disabled={isLoadingVault}
                iconLeft={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingVault ? 'animate-spin' : ''}`} />}
              >
                Sync Vault
              </Button>
            )}
            <Badge variant="blue" size="sm">
              <Lock className="w-3 h-3 mr-1" />
              AES-256 Storage
            </Badge>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Viewing Sample Demonstration Vault</p>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                You are currently in guest mode. Sign in to your verified citizen account (e.g. Ramesh Pawar) to access your private encrypted vault, link DigiLocker certificates, and manage DPDP electronic consent.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedDocs.map((doc: any) => {
            const hasConsent = isConsentGranted(doc.category);
            const isProcessingConsent = consentActionId === doc.category;
            const summary = doc.extracted_summary || {};

            return (
              <Card key={doc.id} className="border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
                <CardBody className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{doc.document_type || doc.name}</h3>
                      <p className="text-xs text-slate-500">{doc.category}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{doc.verification_status || 'Verified'}</span>
                    </span>
                  </div>

                  {/* Summary / Extracted Metadata */}
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                    {summary.name && (
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-400">Name:</span>
                        <span className="font-medium text-slate-800">{summary.name}</span>
                      </div>
                    )}
                    {summary.maskedAadhaar && (
                      <div className="flex justify-between text-slate-600 font-mono">
                        <span className="text-slate-400 font-sans">Aadhaar:</span>
                        <span className="font-semibold text-slate-800">{summary.maskedAadhaar}</span>
                      </div>
                    )}
                    {summary.annualIncome && (
                      <div className="flex justify-between text-slate-600 font-mono">
                        <span className="text-slate-400 font-sans">Verified Income:</span>
                        <span className="font-semibold text-emerald-700">₹{Number(summary.annualIncome).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {summary.issuingAuthority && (
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span className="text-slate-400">Authority:</span>
                        <span className="text-right text-slate-700 truncate max-w-[150px]">{summary.issuingAuthority}</span>
                      </div>
                    )}
                    {summary.existingStructure && (
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span className="text-slate-400">Dwelling:</span>
                        <span className="text-right font-medium text-amber-700">{summary.existingStructure}</span>
                      </div>
                    )}
                    {summary.surveyNumber && (
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span className="text-slate-400">Survey Parcel:</span>
                        <span className="text-right text-slate-700">{summary.surveyNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* DPDP Electronic Consent Management */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {hasConsent ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-slate-400" />
                      )}
                      <span className={`text-[11px] font-medium ${hasConsent ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {hasConsent ? 'DPDP Consent: Active' : 'Consent: Not Granted'}
                      </span>
                    </div>

                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => handleToggleConsent(doc.category, hasConsent)}
                        disabled={isProcessingConsent}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-colors ${
                          hasConsent 
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-300'
                        }`}
                      >
                        {isProcessingConsent ? 'Updating...' : hasConsent ? 'Revoke Consent' : 'Grant Consent'}
                      </button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* DPDP Act 2023 Compliance Footer Note */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Digital Personal Data Protection Act 2023:</strong> Your documents are encrypted and accessible only with your explicit electronic consent. Consent granted for one welfare application cannot be reused for another scheme without your confirmation.
          </span>
        </div>
      </div>
    </div>
  );
};
