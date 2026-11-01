import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Volume2, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { parseCitizenInitialPrompt } from '../../services/intakeService';
import { VERIFIED_SCHEMES_DB, evaluateSchemeEligibility } from '../../services/schemeKnowledgeBase';
import { SAMPLE_SYNTHETIC_DOCS, processDocumentIntelligence } from '../../services/documentIntelligenceService';
import type { MockPortalApplication } from '../../types';

export interface FullDemoRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationSubmitted?: (app: MockPortalApplication) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const FullDemoRunnerModal: React.FC<FullDemoRunnerModalProps> = ({
  isOpen,
  onClose,
  onApplicationSubmitted,
  onShowToast
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Live execution across shared services (CITY-02 Integration)
  const demoSpeech = 'नमस्ते, मैं 60 साल का हूँ, महाराष्ट्र के पुणे जिले से। मेरे पास पक्का घर नहीं है, मुझे सरकार से घर चाहिए।';
  const liveParsed = parseCitizenInitialPrompt(demoSpeech, 'Hindi');
  const pmayScheme = VERIFIED_SCHEMES_DB.find((s) => s.id === 'mh-housing-01') || VERIFIED_SCHEMES_DB[0];
  const ramaiScheme = VERIFIED_SCHEMES_DB.find((s) => s.id === 'mh-housing-02');
  const liveEval = evaluateSchemeEligibility(pmayScheme, liveParsed);
  const liveExtractedDocs = SAMPLE_SYNTHETIC_DOCS.slice(0, 3).map((d) =>
    processDocumentIntelligence(d, {
      name: 'Ramesh Yashwant Pawar',
      age: liveParsed.citizenAge || 60,
      district: liveParsed.district || 'Pune'
    })
  );

  const DEMO_STEPS = [
    { num: 1, title: 'Hindi Voice Intake', subtitle: 'Capture vague citizen voice prompt in Hindi' },
    { num: 2, title: 'Requirement Clarification', subtitle: 'Extract Age 60, Pune Maharashtra, Kutcha House' },
    { num: 3, title: 'Verified Scheme Discovery', subtitle: 'Match PMAY-Gramin & Ramai Awas from official database' },
    { num: 4, title: 'Eligibility Grading', subtitle: 'Grade as "Likely Eligible" with official criteria' },
    { num: 5, title: 'Document Intelligence', subtitle: 'Extract Aadhaar, Income Certificate, and Land Affidavit' },
    { num: 6, title: 'Browser Automation', subtitle: 'Automate form field filling on mock MahaAwas portal' },
    { num: 7, title: 'Citizen Approval', subtitle: 'Mandatory human approval check before submission' },
    { num: 8, title: 'Submission & Reference ID', subtitle: 'Issue reference receipt #MH-PMAY-2026-60841' },
    { num: 9, title: 'Application Tracking', subtitle: 'Live status timeline across Panchayat and Tehsil' },
    { num: 10, title: 'SLA Delay Detection', subtitle: 'Flag 18 days pending against 14-day statutory SLA' },
    { num: 11, title: 'Hindi Voice Escalation', subtitle: 'Synthesize automated phone call to BDO / Talathi' },
    { num: 12, title: 'Consent & Audit Trail', subtitle: 'DPDP 2023 compliance & full action ledger' }
  ];

  const handleNextStep = () => {
    if (activeStep < 12) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handlePlayVoice = (text: string, lang = 'hi-IN') => {
    if (!('speechSynthesis' in window)) {
      onShowToast('Voice Synthesis', 'Speech synthesis is not supported on this browser.', 'warning');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Track 3 (CITY-02) End-to-End Demonstration"
      description="Scenario: 60-year-old Maharashtra rural citizen requesting housing assistance in Hindi."
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Step Indicator Carousel / Progress Bar */}
        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-amber-400">Step {activeStep} of 12</span>
            <span className="text-slate-300 font-medium">{DEMO_STEPS[activeStep - 1].title}</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(activeStep / 12) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Dynamic Stage Content Panel */}
        <div className="min-h-[260px] p-4 bg-slate-50 border border-slate-200 rounded-xl">
          {activeStep === 1 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <Badge variant="amber">Step 1: Voice Input</Badge>
                <button
                  type="button"
                  onClick={() => handlePlayVoice('नमस्ते, मैं 60 साल का हूँ, महाराष्ट्र के पुणे जिले से। मेरे पास पक्का घर नहीं है, मुझे सरकार से घर चाहिए।', 'hi-IN')}
                  className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio ? 'Stop Voice' : 'Listen to Citizen Speech'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 font-mono">Citizen speaks in natural Hindi:</p>
              <div className="p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 italic">
                "नमस्ते, मैं 60 साल का हूँ, महाराष्ट्र के पुणे जिले से। मेरे पास पक्का घर नहीं है, मुझे सरकार से घर चाहिए।"
              </div>
              <p className="text-xs text-slate-500">
                JANSAATHI AI captures the unstructured voice prompt and streams it to the intent analyzer.
              </p>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-3 animate-in fade-in">
              <Badge variant="blue">Step 2: Real-time Rule Extracted Parameters</Badge>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Need Category</p>
                  <p className="font-semibold text-slate-900">{liveParsed.needCategory}</p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Applicant Age</p>
                  <p className="font-semibold text-slate-900">{liveParsed.citizenAge} Years (Senior Citizen)</p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Jurisdiction</p>
                  <p className="font-semibold text-slate-900">{liveParsed.state}, {liveParsed.district}, Haveli</p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Shelter Condition</p>
                  <p className="font-semibold text-slate-900">{liveParsed.housingStatus} (Rural Survey Recorded)</p>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-3 animate-in fade-in">
              <Badge variant="purple">Step 3: Verified Scheme Database Matching</Badge>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-900">1. {pmayScheme.title}</p>
                <p className="text-[11px] text-slate-600">Benefit: {pmayScheme.benefit}</p>
                <p className="text-[10px] text-emerald-700 font-mono font-bold">Official Source: {pmayScheme.officialSourceUrl}</p>
              </div>
              {ramaiScheme && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-900">2. {ramaiScheme.title}</p>
                  <p className="text-[11px] text-slate-600">Benefit: {ramaiScheme.benefit}</p>
                  <p className="text-[10px] text-emerald-700 font-mono font-bold">Official Source: {ramaiScheme.officialSourceUrl}</p>
                </div>
              )}
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-3 animate-in fade-in">
              <Badge variant="green">Step 4: Strict Deterministic Eligibility Evaluation</Badge>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">{pmayScheme.title}</span>
                  <Badge variant={liveEval.grade === 'Eligible' || liveEval.grade === 'Likely Eligible' ? 'green' : 'amber'}>
                    {liveEval.grade}
                  </Badge>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Reasoning: {liveEval.reasoning}
                </p>
              </div>
            </div>
          )}

          {activeStep === 5 && (
            <div className="space-y-3 animate-in fade-in">
              <Badge variant="amber">Step 5: Document Intelligence OCR & Extraction</Badge>
              <div className="space-y-1.5 text-xs">
                {liveExtractedDocs.map((d) => (
                  <div key={d.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{d.docType}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{d.fileName}</p>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Extracted ({d.confidenceScore}% Confidence)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 6 && (
            <div className="space-y-3 animate-in fade-in">
              <Badge variant="blue">Step 6: Browser Automation on Mock Portal</Badge>
              <div className="p-3 bg-slate-900 text-white rounded-xl text-xs font-mono space-y-1">
                <p className="text-amber-400 font-bold">&gt; Connecting to mahaawas.gov.in portal...</p>
                <p className="text-emerald-400">&gt; Filling form field: applicant_name = "Ramesh Yashwant Pawar"</p>
                <p className="text-emerald-400">&gt; Filling form field: age = 60, district = "Pune", taluka = "Haveli"</p>
                <p className="text-emerald-400">&gt; Filling form field: shelter_type = "Kutcha Wall / Roof"</p>
                <p className="text-emerald-400">&gt; Attaching document: Aadhaar_Ramesh_Pawar.pdf</p>
                <p className="text-blue-300">&gt; Form validation completed: 14/14 fields verified.</p>
              </div>
            </div>
          )}

          {activeStep === 7 && (
            <div className="space-y-3 animate-in fade-in">
              <Badge variant="red">Step 7: Human Approval Halt</Badge>
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Agent Paused for Citizen Review</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  CITY-02 strictly forbids automatic submission without explicit approval. The citizen reviews the 14 filled fields and provides one-click authorization.
                </p>
              </div>
            </div>
          )}

          {activeStep === 8 && (
            <div className="space-y-3 animate-in fade-in text-center py-2">
              <Badge variant="green">Step 8: Official Submission</Badge>
              <div className="p-4 bg-white border border-slate-300 rounded-xl space-y-2.5 max-w-sm mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Application Reference Receipt</p>
                <p className="text-base font-bold font-mono text-slate-900">MH-PMAY-2026-60841</p>
                <p className="text-[10px] text-slate-500">Submitted to MahaAwas Portal on 14 Oct 2026</p>
                {onApplicationSubmitted && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onApplicationSubmitted({
                        applicationNumber: 'MH-PMAY-2026-60841',
                        schemeId: pmayScheme.id,
                        schemeTitle: pmayScheme.title,
                        applicantName: 'Ramesh Yashwant Pawar',
                        age: 60,
                        state: 'Maharashtra',
                        district: 'Pune',
                        income: 48000,
                        category: 'BPL / Kutcha Shelter',
                        portalName: 'MahaAwas Demonstration Portal',
                        submittedAt: '14 Oct 2026',
                        approvalGranted: true,
                        status: 'Submitted'
                      });
                      onShowToast('Application Saved', 'Demo Application #MH-PMAY-2026-60841 saved to active applications tracker.', 'success');
                      onClose();
                    }}
                    className="w-full text-xs font-bold justify-center"
                  >
                    Save to My Applications Tracker
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeStep === 9 && (
            <div className="space-y-3 animate-in fade-in">
              <Badge variant="purple">Step 9: Persistent Application Tracking</Badge>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  <div>
                    <p className="font-bold text-slate-900">Gram Panchayat Preliminary Verification</p>
                    <p className="text-[10px] text-emerald-700">Completed & Forwarded to Taluka (14 Oct 2026)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-amber-50 border border-amber-300 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  <div>
                    <p className="font-bold text-slate-900">Taluka BDO & Site Geo-tagging</p>
                    <p className="text-[10px] text-amber-800 font-bold">Pending: 18 Days (Overdue)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 10 && (
            <div className="space-y-3 animate-in fade-in">
              <Badge variant="red">Step 10: SLA Delay Detection</Badge>
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Statutory Service Level Agreement Breached</span>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed">
                  Application #MH-PMAY-2026-60841 has been held at the Taluka verification stage for 18 days. The statutory citizen charter threshold is 14 days (4 days overdue). Proactive follow-up engine triggers automatic escalation.
                </p>
              </div>
            </div>
          )}

          {activeStep === 11 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <Badge variant="amber">Step 11: Localized Follow-Up Call</Badge>
                <button
                  type="button"
                  onClick={() => handlePlayVoice('नमस्ते। मैं जनसाथी AI बोल रहा हूँ, नागरिक रमेश यशवंत पवार की ओर से। उनका आवास आवेदन क्रमांक MH-PMAY-2026-60841 अठारह दिनों से लंबित है। कृपया त्वरित स्थिति स्पष्ट करें।', 'hi-IN')}
                  className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio ? 'Stop Call' : 'Simulate Phone Call'}</span>
                </button>
              </div>
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono leading-relaxed">
                "नमस्ते। मैं जनसाथी AI बोल रहा हूँ, नागरिक रमेश यशवंत पवार (आयु 60 वर्ष, हवेली, पुणे) की ओर से। उनका प्रधानमंत्री आवास योजना ग्रामीण आवेदन क्रमांक MH-PMAY-2026-60841 ब्लॉक विकास अधिकारी कार्यालय में पिछले 18 दिनों से लंबित है..."
              </div>
            </div>
          )}

          {activeStep === 12 && (
            <div className="space-y-3 animate-in fade-in">
              <Badge variant="green">Step 12: DPDP Consent & Action Audit Log</Badge>
              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                  <span>[00:01] Citizen Hindi Voice Consent</span>
                  <span className="text-emerald-600 font-bold">Granted</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                  <span>[00:03] Document OCR Processing Authorization</span>
                  <span className="text-emerald-600 font-bold">Granted</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                  <span>[00:06] Portal Form Submission Authorization</span>
                  <span className="text-emerald-600 font-bold">Human Verified</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                  <span>[00:10] Proactive BDO Escalation Call Approval</span>
                  <span className="text-emerald-600 font-bold">Approved</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={activeStep === 1}
            onClick={handlePrevStep}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {activeStep === 12 ? (
              <Button
                type="button"
                variant="primary"
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Complete Demonstration</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNextStep}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                <span>Next: {DEMO_STEPS[activeStep].title}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
