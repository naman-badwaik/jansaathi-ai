import React, { useState } from 'react';
import { 
  FileCheck2, 
  UploadCloud, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  SAMPLE_SYNTHETIC_DOCS, 
  processDocumentIntelligence, 
  type SampleSyntheticDocument 
} from '../../services/documentIntelligenceService';
import type { ExtractedDocumentData, CitizenIntakeData, VerifiedScheme } from '../../types';

export interface DocumentIntelligencePanelProps {
  intakeData?: CitizenIntakeData;
  selectedScheme?: VerifiedScheme;
  onDocumentsVerified: (docs: ExtractedDocumentData[]) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const DocumentIntelligencePanel: React.FC<DocumentIntelligencePanelProps> = ({
  intakeData,
  selectedScheme,
  onDocumentsVerified,
  onShowToast
}) => {
  const [hasConsent, setHasConsent] = useState(false);
  const [processedDocs, setProcessedDocs] = useState<ExtractedDocumentData[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(SAMPLE_SYNTHETIC_DOCS[0].id);

  const handleProcessSampleDoc = (doc: SampleSyntheticDocument) => {
    if (!hasConsent) {
      onShowToast('Consent Required', 'Please check the DPDP 2023 consent box before processing documents.', 'warning');
      return;
    }

    const extracted = processDocumentIntelligence(doc, {
      name: 'Ramesh Yashwant Pawar',
      age: intakeData?.citizenAge || 60,
      district: intakeData?.district || 'Pune'
    });

    setProcessedDocs((prev) => {
      const existing = prev.filter((d) => d.docType !== extracted.docType);
      return [...existing, extracted];
    });

    onShowToast('Document Analyzed', `${doc.name} processed and fields mapped.`, 'success');
  };

  const handleProcessAllSyntheticDocs = () => {
    if (!hasConsent) {
      setHasConsent(true);
    }

    const results = SAMPLE_SYNTHETIC_DOCS.map((doc) =>
      processDocumentIntelligence(doc, {
        name: 'Ramesh Yashwant Pawar',
        age: intakeData?.citizenAge || 60,
        district: intakeData?.district || 'Pune'
      })
    );

    setProcessedDocs(results);
    onShowToast('All Documents Verified', 'Synthetic Aadhaar, Income Certificate, and Land Affidavit extracted.', 'success');
  };

  const handleConfirmAndProceed = () => {
    if (processedDocs.length === 0) {
      onShowToast('Action Required', 'Please process at least one required verification document.', 'warning');
      return;
    }

    onDocumentsVerified(processedDocs);
    onShowToast('Intelligence Complete', 'Extracted metadata mapped to Application Agent.', 'success');
  };

  const selectedSample = SAMPLE_SYNTHETIC_DOCS.find((d) => d.id === selectedDocId) || SAMPLE_SYNTHETIC_DOCS[0];
  const activeExtraction = processedDocs.find((p) => p.docType === selectedSample.type);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-850 p-5 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="green" size="sm">Phase 3 Document Intelligence</Badge>
            <span className="text-xs text-emerald-400 font-mono">DPDP 2023 Compliant</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Document Extraction & Eligibility Mapping
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Extracts vital fields from Aadhaar, Income Certificate, and Land Affidavits. Flags inconsistencies and auto-maps parameters to government portal schemas.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleProcessAllSyntheticDocs}
          className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
          <span>Auto-Verify Demo Documents</span>
        </Button>
      </div>

      {/* Selected Scheme Document Checklist */}
      {selectedScheme && (
        <Card className="p-4 bg-slate-900 text-white border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="amber" size="sm">Target Scheme Requirements</Badge>
                <span className="text-xs text-amber-300 font-bold">{selectedScheme.title}</span>
              </div>
              <p className="text-xs text-slate-300">
                Official Department: {selectedScheme.department} ({selectedScheme.state})
              </p>
            </div>
            <div className="shrink-0">
              <Badge variant="blue" size="sm">
                {selectedScheme.requiredDocuments.length} Documents Required
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
            {selectedScheme.requiredDocuments.map((reqDoc, idx) => {
              const isMatched = processedDocs.some((d) =>
                reqDoc.toLowerCase().includes(d.docType.toLowerCase().split(' ')[0]) ||
                d.docType.toLowerCase().includes(reqDoc.toLowerCase().split(' ')[0])
              );
              return (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-200">{reqDoc}</span>
                  {isMatched ? (
                    <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium text-[11px]">
                      Pending Extraction
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* DPDP Consent Checkbox */}
      <Card className="p-4 bg-amber-50/70 border-amber-200/90 shadow-2xs">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasConsent}
            onChange={(e) => setHasConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300 cursor-pointer"
          />
          <div className="text-xs text-amber-950 space-y-0.5">
            <p className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Digital Personal Data Protection (DPDP) Act 2023 Consent</span>
            </p>
            <p className="text-amber-900 leading-relaxed text-[11px]">
              I authorize JANSAATHI AI to analyze my uploaded documents solely for the purpose of government welfare scheme eligibility matching and portal form automation. Data will not be shared with unauthorized third parties.
            </p>
          </div>
        </label>
      </Card>

      {/* Synthetic Document Showcase & Extraction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sample Documents List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Synthetic Verification Documents
          </h3>

          <div className="space-y-2">
            {SAMPLE_SYNTHETIC_DOCS.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              const isExtracted = processedDocs.some((d) => d.docType === doc.type);

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-white/80 hover:bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-700 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{doc.type}</h4>
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
                          {doc.name}
                        </p>
                      </div>
                    </div>

                    {isExtracted ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Extracted</span>
                      </span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProcessSampleDoc(doc);
                        }}
                        className="text-[11px] text-amber-700 hover:text-amber-900 hover:bg-amber-50 p-1"
                      >
                        Extract
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>Supabase Private Storage Ready</span>
            </div>
            <p className="text-[11px]">
              Files are stored under private RLS storage bucket <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">citizen_documents</code> with folder-level tenant isolation.
            </p>
          </div>
        </div>

        {/* Right Column: Extracted Fields Inspection Card */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-200 shadow-md p-5 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedSample.type} Analysis
                </h4>
                <p className="text-xs text-slate-500">{selectedSample.name}</p>
              </div>

              {activeExtraction ? (
                <Badge variant="green" size="sm">
                  Confidence 96%
                </Badge>
              ) : (
                <Badge variant="amber" size="sm">
                  Pending Extraction
                </Badge>
              )}
            </div>

            {activeExtraction ? (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(activeExtraction.extractedFields).map(([k, v], i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{k}</p>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Consistency Audit: </span>
                    <span>{activeExtraction.notes}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Click below to simulate optical character recognition (OCR) and parameter extraction on {selectedSample.type}.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleProcessSampleDoc(selectedSample)}
                >
                  <span>Extract Document Fields</span>
                </Button>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {processedDocs.length} of {SAMPLE_SYNTHETIC_DOCS.length} documents verified
              </span>

              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmAndProceed}
                disabled={processedDocs.length === 0}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <span>Proceed to Application Agent</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
