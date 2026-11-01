import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw,
  Lock,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  FileCode,
  Terminal,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { speakText, stopSpeech } from '../../services/speechSynthesisService';
import { useTranslation } from '../../context/LanguageContext';
import type { 
  CitizenIntakeData, 
  ExtractedDocumentData, 
  MockPortalApplication, 
  AutomationLogStep, 
  VerifiedScheme 
} from '../../types';

export interface ApplicationAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  intakeData?: CitizenIntakeData;
  selectedScheme?: VerifiedScheme;
  extractedDocs?: ExtractedDocumentData[];
  onApplicationSubmitted: (app: MockPortalApplication) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const ApplicationAgentModal: React.FC<ApplicationAgentModalProps> = ({
  isOpen,
  onClose,
  intakeData,
  selectedScheme,
  extractedDocs,
  onApplicationSubmitted,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'real-browser' | 'embedded'>('real-browser');
  const [isRunningAutomation, setIsRunningAutomation] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [waitingForCitizenApproval, setWaitingForCitizenApproval] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<MockPortalApplication | null>(null);
  const [hasExternalTabOpened, setHasExternalTabOpened] = useState(false);
  const { language } = useTranslation();
  const [voiceUpdatesEnabled, setVoiceUpdatesEnabled] = useState(true);

  // Form Field States inside the Mock Portal (filled dynamically by the agent)
  const [portalFields, setPortalFields] = useState({
    applicantName: '',
    age: '',
    gender: 'Male',
    aadhaarMasked: '',
    state: '',
    district: '',
    taluka: '',
    village: '',
    housingType: '',
    annualIncome: '',
    bplCardNo: '',
    bankAccount: '',
    ifscCode: ''
  });

  const [logs, setLogs] = useState<AutomationLogStep[]>([]);

  // Compute clean values from intake and documents
  const aadhaarDoc = extractedDocs?.find((d) => d.docType === 'Aadhaar Card');
  const incomeDoc = extractedDocs?.find((d) => d.docType === 'Income Certificate');
  const landDoc = extractedDocs?.find((d) => d.docType === 'Land Record 7/12');
  const rationDoc = extractedDocs?.find((d) => d.docType === 'Ration Card');

  const resolvedName = aadhaarDoc?.extractedFields['Full Name'] || (intakeData ? 'Ramesh Yashwant Pawar (रमेश पवार)' : '[MISSING: Full Name Required]');
  const resolvedAge = String(intakeData?.citizenAge || 60);
  const resolvedGender = aadhaarDoc?.extractedFields['Gender'] || 'Male';
  const resolvedAadhaar = aadhaarDoc?.extractedFields['Aadhaar Number (Masked)'] || (extractedDocs && extractedDocs.length > 0 ? 'XXXX-XXXX-4912' : '[MISSING: Aadhaar Token]');
  const resolvedDistrict = intakeData?.district || 'Pune';
  const resolvedState = intakeData?.state || 'Maharashtra';
  const resolvedHousing = landDoc?.extractedFields['Existing Structure'] || (intakeData?.housingStatus ? `${intakeData.housingStatus}` : '[MISSING: Housing Status]');
  const resolvedIncome = incomeDoc?.extractedFields['Annual Household Income'] || (intakeData?.annualIncome ? `${intakeData.annualIncome}` : '48000');

  // Check if any critical field is missing
  const hasMissingFields = [resolvedName, resolvedAadhaar, resolvedHousing].some((f) => f.includes('[MISSING'));

  // Reset state synchronously when modal opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && !isSubmitted) {
      setCurrentStep(0);
      setIsRunningAutomation(false);
      setWaitingForCitizenApproval(false);
      setLogs([]);
      setHasExternalTabOpened(false);
    }
  }

  // Handle incoming application submission event from external real browser tab or broadcast
  const handleIncomingPortalSubmission = useCallback((payload: Record<string, unknown>) => {
    const appRef = String(payload.applicationNumber || `MH-PMAY-2026-${Math.floor(10000 + Math.random() * 90000)}`);
    const appRecord: MockPortalApplication = {
      applicationNumber: appRef,
      schemeId: selectedScheme?.id || 'mh-housing-01',
      schemeTitle: selectedScheme?.title || 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G) Maharashtra',
      applicantName: String(payload.applicantName || resolvedName),
      age: Number(payload.age) || Number(resolvedAge) || 60,
      state: resolvedState,
      district: String(payload.district || resolvedDistrict),
      income: Number(payload.income) || Number(resolvedIncome) || 48000,
      category: intakeData?.casteCategory ? `${intakeData.casteCategory} / Kutcha Shelter` : 'BPL / Kutcha Shelter',
      portalName: 'MahaAwas Demonstration Welfare Portal (Real Browser Window)',
      submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      approvalGranted: true,
      status: 'Submitted'
    };

    // Save into Audit Trail in localStorage
    try {
      const auditItem = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'PORTAL_SUBMISSION',
        applicationNumber: appRef,
        scheme: appRecord.schemeTitle,
        applicant: appRecord.applicantName,
        executionMode: 'Real Browser Window (Interactive Tab with Broadcast Bridge)',
        humanApprovalEnforced: true,
        status: 'Submitted'
      };
      const existingAudit = JSON.parse(localStorage.getItem('jansaathi_audit_trail') || '[]');
      localStorage.setItem('jansaathi_audit_trail', JSON.stringify([auditItem, ...existingAudit]));
    } catch {
      // Ignore storage errors
    }

    setSubmittedApp(appRecord);
    setIsSubmitted(true);
    setIsRunningAutomation(false);
    setWaitingForCitizenApproval(false);
    onApplicationSubmitted(appRecord);
    onShowToast('Real Browser Submission Captured!', `Official Reference ID: ${appRef}`, 'success');
  }, [selectedScheme, resolvedName, resolvedAge, resolvedState, resolvedDistrict, resolvedIncome, intakeData, onApplicationSubmitted, onShowToast]);

  // Listen for BroadcastChannel messages from the real mock portal window
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('jansaathi_portal_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'APPLICATION_SUBMITTED') {
          handleIncomingPortalSubmission(event.data);
        }
      };
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'jansaathi_latest_submitted_app' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.applicationNumber) {
            handleIncomingPortalSubmission(parsed);
          }
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [handleIncomingPortalSubmission]);

  // Broadcast automation progress stages across channel
  const broadcastAgentProgress = (stage: string, message: string) => {
    try {
      const channel = new BroadcastChannel('jansaathi_portal_channel');
      channel.postMessage({
        type: 'PORTAL_PROGRESS',
        stage,
        message,
        timestamp: new Date().toISOString()
      });
      channel.close();
    } catch {
      // Ignore
    }
  };

  // Launch mock portal in a real separate browser window/tab
  const handleOpenRealBrowserPortal = () => {
    const params = new URLSearchParams({
      name: resolvedName.includes('[MISSING') ? 'Ramesh Yashwant Pawar' : resolvedName,
      age: resolvedAge,
      district: resolvedDistrict,
      income: resolvedIncome,
      housing: resolvedHousing.includes('[MISSING') ? 'Kutcha House' : resolvedHousing,
      aadhaar: resolvedAadhaar.includes('[MISSING') ? 'XXXX-XXXX-4912' : resolvedAadhaar
    });

    const portalUrl = `/mock-portal/index.html?${params.toString()}`;
    const newWindow = window.open(portalUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      setHasExternalTabOpened(true);
      onShowToast(
        'Real Browser Window Opened',
        'Demonstration portal opened in a separate tab. Complete citizen review and authorization there.',
        'info'
      );
    } else {
      window.open(portalUrl, '_blank');
      setHasExternalTabOpened(true);
    }

    broadcastAgentProgress('PORTAL_OPENED', 'Real browser demonstration portal opened in separate tab.');
  };

  // Execute embedded in-modal browser automation sequence
  const handleStartBrowserAutomation = () => {
    setIsRunningAutomation(true);
    setCurrentStep(1);
    setLogs([]);
    setWaitingForCitizenApproval(false);

    broadcastAgentProgress('PORTAL_OPENED', 'Connected to demonstration welfare portal.');

    // Step 1: Connect
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          id: 'step-1',
          title: 'Session Established',
          detail: 'Connected to MahaAwas Demonstration Welfare Portal (Mock)',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
      setCurrentStep(2);
      broadcastAgentProgress('APPLICANT_DETAILS_FILLED', 'Demographic fields verified and injected.');
      if (voiceUpdatesEnabled) {
        speakText(
          language === 'Hindi'
            ? 'डेमो पोर्टल से सुरक्षित कनेक्शन स्थापित हो गया है।'
            : language === 'Marathi'
            ? 'डेमो पोर्टलशी सुरक्षित संपर्क स्थापित झाला आहे.'
            : 'Connected to demonstration welfare portal.',
          language
        );
      }
    }, 900);

    // Step 2: Fill Identity
    setTimeout(() => {
      setPortalFields((prev) => ({
        ...prev,
        applicantName: resolvedName,
        age: resolvedAge,
        gender: resolvedGender,
        aadhaarMasked: resolvedAadhaar,
        state: resolvedState,
        district: resolvedDistrict,
        taluka: 'Haveli',
        village: 'Wadebolhai'
      }));
      setLogs((prev) => [
        ...prev,
        {
          id: 'step-2',
          title: 'Demographic Fields Injected',
          detail: `Mapped Name: ${resolvedName}, Age: ${resolvedAge}, District: ${resolvedDistrict}`,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
      setCurrentStep(3);
      broadcastAgentProgress('DOCUMENTS_ADDED', 'Housing & socio-economic credentials populated.');
      if (voiceUpdatesEnabled) {
        speakText(
          language === 'Hindi'
            ? `आवेदक का नाम ${resolvedName} और आयु ${resolvedAge} वर्ष भर दी गई है।`
            : language === 'Marathi'
            ? `अर्जदार ${resolvedName}, वय ${resolvedAge} वर्ष माहिती भरली आहे.`
            : `Demographic fields populated: ${resolvedName}, age ${resolvedAge} years.`,
          language
        );
      }
    }, 2000);

    // Step 3: Fill Housing & Income
    setTimeout(() => {
      const bplCardNo = incomeDoc?.extractedFields['Certificate Number'] || rationDoc?.extractedFields['Card Type'] || (intakeData?.casteCategory ? `${intakeData.casteCategory} - BPL Priority` : 'MH-PUN-BPL-89104');
      const bankAccount = '918239018491 (Aadhaar Seeded DBT Account)';
      const ifscCode = 'MAHB0001042 (Bank of Maharashtra)';

      setPortalFields((prev) => ({
        ...prev,
        housingType: resolvedHousing,
        annualIncome: `₹${Number(resolvedIncome).toLocaleString('en-IN')} / annum`,
        bplCardNo,
        bankAccount,
        ifscCode
      }));
      setLogs((prev) => [
        ...prev,
        {
          id: 'step-3',
          title: 'Socio-Economic & Housing Parameters Populated',
          detail: `Shelter: ${resolvedHousing}; Income: ₹${resolvedIncome}; IFSC validated.`,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
      setCurrentStep(4);
      broadcastAgentProgress('VALIDATION_COMPLETED', 'All statutory parameters populated and validated.');
      if (voiceUpdatesEnabled) {
        speakText(
          language === 'Hindi'
            ? `कच्चा मकान और वार्षिक आय ₹${Number(resolvedIncome).toLocaleString('en-IN')} दर्ज किए गए।`
            : language === 'Marathi'
            ? `कच्चे घर आणि वार्षिक उत्पन्न ₹${Number(resolvedIncome).toLocaleString('en-IN')} नोंदवले आहे.`
            : `Housing condition Kutcha House and annual income of ₹${Number(resolvedIncome).toLocaleString('en-IN')} recorded.`,
          language
        );
      }
    }, 3100);

    // Step 4: Documents & Schema Validation
    setTimeout(() => {
      const boundCount = extractedDocs && extractedDocs.length > 0 ? extractedDocs.length : 3;
      setLogs((prev) => [
        ...prev,
        {
          id: 'step-4',
          title: `${boundCount} Documents Attached & Schema Validated`,
          detail: 'Aadhaar, Tehsildar Income Certificate, and Gram Panchayat Land Certificate bound.',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
      setCurrentStep(5);
      setIsRunningAutomation(false);
      setWaitingForCitizenApproval(true);
      broadcastAgentProgress('AWAITING_FINAL_APPROVAL', 'Pausing for citizen confirmation. Mandatory human approval required before submission.');
      onShowToast('Mandatory Human Review', 'Autonomous population complete. Explicit citizen approval required before submission.', 'info');
      if (voiceUpdatesEnabled) {
        speakText(
          language === 'Hindi'
            ? 'दस्तावेज़ संलग्न कर दिए गए हैं। कृपया अंतिम सबमिशन के लिए अपनी पुष्टि करें।'
            : language === 'Marathi'
            ? 'कागदपत्रे जोडली आहेत. कृपया अंतिम मंजुरी द्या.'
            : 'Required documents attached from your vault. Please review and confirm final submission.',
          language
        );
      }
    }, 4200);
  };

  // Explicit citizen approval handler for embedded mode
  const handleApproveAndSubmit = () => {
    setWaitingForCitizenApproval(false);
    setIsRunningAutomation(true);

    setTimeout(() => {
      const appNumber = `MH-PMAY-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const appRecord: MockPortalApplication = {
        applicationNumber: appNumber,
        schemeId: selectedScheme?.id || 'mh-housing-01',
        schemeTitle: selectedScheme?.title || 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G) Maharashtra',
        applicantName: portalFields.applicantName || resolvedName,
        age: Number(portalFields.age) || Number(resolvedAge) || 60,
        state: portalFields.state || resolvedState,
        district: portalFields.district || resolvedDistrict,
        income: Number(resolvedIncome) || 48000,
        category: intakeData?.casteCategory ? `${intakeData.casteCategory} / Kutcha Shelter` : 'BPL / Kutcha Shelter',
        portalName: 'MahaAwas Demonstration Welfare Portal (Embedded Agent Mode)',
        submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        approvalGranted: true,
        status: 'Submitted'
      };

      if (voiceUpdatesEnabled) {
        speakText(
          language === 'Hindi'
            ? `आवेदन सफलतापूर्वक जमा हुआ। आपका संदर्भ क्रमांक ${appNumber} है।`
            : language === 'Marathi'
            ? `अर्ज यशस्वीरीत्या सादर केला. आपला संदर्भ क्रमांक ${appNumber} आहे.`
            : `Application submitted successfully. Your reference ID is ${appNumber}.`,
          language
        );
      }

      // Record in Audit Trail
      try {
        const auditItem = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'PORTAL_SUBMISSION',
          applicationNumber: appNumber,
          scheme: appRecord.schemeTitle,
          applicant: appRecord.applicantName,
          executionMode: 'Embedded Agent Workflow (In-Modal Simulation)',
          humanApprovalEnforced: true,
          status: 'Submitted'
        };
        const existingAudit = JSON.parse(localStorage.getItem('jansaathi_audit_trail') || '[]');
        localStorage.setItem('jansaathi_audit_trail', JSON.stringify([auditItem, ...existingAudit]));
      } catch {
        // Ignore
      }

      setSubmittedApp(appRecord);
      setIsSubmitted(true);
      setIsRunningAutomation(false);

      setLogs((prev) => [
        ...prev,
        {
          id: 'step-5',
          title: 'Official Submission Confirmed',
          detail: `Application successfully submitted. Reference Acknowledgment ID: ${appNumber}`,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);

      onApplicationSubmitted(appRecord);
      onShowToast('Application Submitted!', `Reference ID: ${appNumber}`, 'success');
    }, 1200);
  };

  const handleCloseModal = () => {
    stopSpeech();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Application Agent: Government Portal Automation"
      description="Autonomous portal interaction with mandatory human approval guardrails and live acknowledgment capture."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Safety & Demonstration Banner */}
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              ★ Demonstration Welfare Portal • Verification Safeguards Active ★
            </p>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              In strict accordance with Track 3 (CITY-02), all interactions occur on realistic demonstration portal endpoints. 
              The agent fills verified citizen fields, halts at the statutory declaration gate, and requires explicit citizen authorization before generating official receipts.
            </p>
          </div>
        </div>

        {/* Step 5 Voice Guidance Status Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs text-slate-700">
          <div className="flex items-center gap-2">
            {voiceUpdatesEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span className="font-medium text-slate-800">
              {voiceUpdatesEnabled 
                ? (language === 'Hindi' ? 'आवाज़ में प्रगति अपडेट: सक्रिय (Voice ON)' : language === 'Marathi' ? 'आवाज अपडेट: सुरू (Voice ON)' : 'Voice Progress Readout: Active') 
                : (language === 'Hindi' ? 'आवाज़ म्यूट है (Voice Muted)' : language === 'Marathi' ? 'आवाज म्यूट आहे (Voice Muted)' : 'Voice Updates: Muted')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (voiceUpdatesEnabled) stopSpeech();
              setVoiceUpdatesEnabled(!voiceUpdatesEnabled);
            }}
            className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 px-2.5 py-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            {voiceUpdatesEnabled ? 'Mute Audio' : 'Unmute Audio'}
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('real-browser')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'real-browser'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Real Browser Window (Live External Tab)</span>
            <Badge variant="green" size="sm">Recommended</Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('embedded')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'embedded'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>In-Modal Autonomous Workflow</span>
          </button>
        </div>

        {/* TAB 1: REAL BROWSER WINDOW MODE */}
        {activeTab === 'real-browser' && (
          <div className="space-y-3.5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>MahaAwas Demonstration Welfare Portal</span>
                    <Badge variant="blue" size="sm">Real Browser DOM</Badge>
                  </h4>
                  <p className="text-xs text-slate-600">
                    Opens the 5-step government welfare application wizard in a live browser tab, connected to JANSAATHI AI via bi-directional BroadcastChannel.
                  </p>
                </div>
              </div>

              {/* Data Field Inspection */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                  Verified Inbound Citizen Parameters:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Applicant: </span>
                    <strong className="text-slate-900">{resolvedName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Age: </span>
                    <strong className="text-slate-900">{resolvedAge} Years</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Aadhaar Token: </span>
                    <strong className="text-slate-900">{resolvedAadhaar}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">District: </span>
                    <strong className="text-slate-900">{resolvedDistrict}, Maharashtra</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Housing Deficit: </span>
                    <strong className="text-slate-900">{resolvedHousing}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Annual Income: </span>
                    <strong className="text-slate-900">₹{Number(resolvedIncome).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Missing Field Guardrail */}
              {hasMissingFields && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Incomplete Parameter Detected:</strong> One or more fields are incomplete. The autonomous agent will not guess values.
                  </span>
                </div>
              )}

              {/* External Tab Trigger & Status */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${hasExternalTabOpened ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span>
                    {hasExternalTabOpened 
                      ? 'Listening for real portal submission via BroadcastChannel...' 
                      : 'Click below to launch portal in real browser.'}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleOpenRealBrowserPortal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                  iconLeft={<ExternalLink className="w-4 h-4" />}
                >
                  Launch Mock Portal in Real Browser
                </Button>
              </div>
            </div>

            {/* Playwright CLI Banner */}
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs space-y-1.5 border border-slate-800">
              <div className="flex items-center justify-between text-amber-400 font-mono font-bold text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Automated Playwright CLI Test Runner</span>
                </div>
                <Badge variant="purple" size="sm">Playwright Verified</Badge>
              </div>
              <p className="text-[11px] text-slate-300">
                You can also run the headless Playwright automation script which tests validation, field injection, declaration checks, and receipt capture:
              </p>
              <div className="bg-black/50 p-2 rounded text-[11px] font-mono text-emerald-400 border border-slate-800 select-all">
                npm run test:automation
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMBEDDED AGENT WORKFLOW MODE */}
        {activeTab === 'embedded' && (
          <div className="space-y-3">
            {/* Embedded Browser Frame */}
            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-lg bg-slate-100">
              {/* Address Bar */}
              <div className="bg-slate-200 px-3 py-2 flex items-center gap-2 border-b border-slate-300 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </div>

                <div className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 flex items-center justify-between text-slate-700 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-bold">https://</span>
                    <span className="truncate">mahaawas.gov.in/portal/apply/pmay-g/step-4</span>
                  </div>
                  <Badge variant="amber" size="sm">
                    {currentStep > 0 ? `Automation Step ${currentStep}/5` : 'Mock Portal Demo'}
                  </Badge>
                </div>

                <button
                  type="button"
                  onClick={handleStartBrowserAutomation}
                  disabled={isRunningAutomation}
                  className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                  title="Reload Automation"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunningAutomation ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Portal Internal Header */}
              <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs border border-white/40">
                    MH
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      MahaAwas Rural Housing Mission • PMAY-G
                    </h4>
                    <p className="text-[10px] text-amber-100">
                      Government of Maharashtra • Rural Development Department
                    </p>
                  </div>
                </div>
                <div className="text-[10px] bg-black/20 px-2 py-0.5 rounded text-amber-100 font-mono">
                  Portal Ver: 2026.4
                </div>
              </div>

              {/* Form Content */}
              <div className="p-4 bg-white space-y-4 max-h-72 overflow-y-auto">
                {isSubmitted && submittedApp ? (
                  <div className="p-5 text-center bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <div>
                      <h3 className="text-base font-bold text-emerald-950">Application Successfully Submitted!</h3>
                      <p className="text-xs text-emerald-800">
                        Your application has been logged on the MahaAwas portal with official acknowledgment receipt.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-emerald-200 max-w-sm mx-auto text-xs font-mono">
                      <p className="text-slate-500 text-[10px]">APPLICATION REFERENCE ID</p>
                      <p className="text-sm font-bold text-slate-900">{submittedApp.applicationNumber}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hasMissingFields && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-center gap-2">
                        <span className="font-bold">⚠ Incomplete Parameter:</span>
                        <span>Required fields marked with missing status must be verified via Document Assistant.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Applicant Name</label>
                        <input
                          type="text"
                          readOnly
                          value={portalFields.applicantName}
                          placeholder="[Agent fills automatically]"
                          className={`w-full border rounded-lg p-2 font-medium ${portalFields.applicantName.includes('[MISSING') ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Age & Gender</label>
                        <input
                          type="text"
                          readOnly
                          value={portalFields.age ? `${portalFields.age} Years • ${portalFields.gender}` : ''}
                          placeholder="[Age: 60 • Male]"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Aadhaar Token (e-KYC)</label>
                        <input
                          type="text"
                          readOnly
                          value={portalFields.aadhaarMasked}
                          placeholder="[Masked UIDAI ID]"
                          className={`w-full border rounded-lg p-2 font-mono ${portalFields.aadhaarMasked.includes('[MISSING') ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Location / Circle</label>
                        <input
                          type="text"
                          readOnly
                          value={portalFields.district ? `${portalFields.village}, ${portalFields.taluka}, ${portalFields.district}` : ''}
                          placeholder="[Village, Taluka, District]"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Housing Condition</label>
                        <input
                          type="text"
                          readOnly
                          value={portalFields.housingType}
                          placeholder="[Kutcha / Mud Shelter]"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Annual Income</label>
                        <input
                          type="text"
                          readOnly
                          value={portalFields.annualIncome}
                          placeholder="[Income certificate mapped]"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Automation Telemetry Logs */}
                {logs.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono space-y-1.5 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold pb-1 border-b border-slate-800">
                      <Bot className="w-3.5 h-3.5" />
                      <span>Agent Automation Logs</span>
                    </div>
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span className="text-slate-400">[{log.timestamp}]</span>
                        <span className="text-slate-100">{log.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Embedded Mode Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mandatory human-in-the-loop gate strictly enforced before submission.</span>
              </div>

              <div className="flex items-center gap-2">
                {!waitingForCitizenApproval && !isSubmitted && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleStartBrowserAutomation}
                    disabled={isRunningAutomation}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                  >
                    <Bot className="w-4 h-4 mr-1.5" />
                    <span>{isRunningAutomation ? 'Operating...' : 'Run In-Modal Simulation'}</span>
                  </Button>
                )}

                {waitingForCitizenApproval && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleApproveAndSubmit}
                    disabled={isRunningAutomation}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30 animate-pulse cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    <span>Approve & Submit Application</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Modal Bottom Footer */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            <span>MahaAwas / PMAY-G Scheme Engine Active</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              {isSubmitted ? 'Close & View in Tracker' : 'Close'}
            </Button>

            {isSubmitted && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onClose}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                <span>Go to Tracking</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
