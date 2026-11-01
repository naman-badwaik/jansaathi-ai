import React, { useState } from 'react';
import { 
  PhoneOff, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Volume2, 
  ShieldCheck, 
  Building2,
  Calendar
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useTranslation } from '../../context/LanguageContext';
import type { FollowUpRecord, SupportedLanguage, ApplicationItem } from '../../types';

export interface ProactiveFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  application?: ApplicationItem;
  applicationNumber?: string;
  schemeTitle?: string;
  citizenName?: string;
  onEscalationRecorded: (record: FollowUpRecord) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const ProactiveFollowUpModal: React.FC<ProactiveFollowUpModalProps> = ({
  isOpen,
  onClose,
  application,
  applicationNumber: propAppNumber,
  schemeTitle: propSchemeTitle,
  citizenName,
  onEscalationRecorded,
  onShowToast
}) => {
  const { language } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasCitizenApproved, setHasCitizenApproved] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);

  const activeAppNumber = application?.applicationNumber || propAppNumber || 'MH-PMAY-2026-60841';
  const activeSchemeTitle = application?.schemeTitle || propSchemeTitle || 'PMAY-G Maharashtra Rural Housing';
  const name = citizenName || 'Ramesh Yashwant Pawar';

  // Calculate pending duration using its submission date
  const [daysPending] = useState<number>(() => {
    if (!application?.appliedDate) return 18;
    try {
      const parsed = Date.parse(application.appliedDate);
      if (!isNaN(parsed)) {
        const diffDays = Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 18;
      }
    } catch {
      // fallback
    }
    return 18;
  });

  const slaThreshold = 14;
  const isDelayed = daysPending > slaThreshold;

  const CALL_SCRIPTS: Record<SupportedLanguage, string> = {
    Hindi: `नमस्ते। मैं जनसाथी AI बोल रहा हूँ, नागरिक ${name} (आयु 60 वर्ष, पुणे) की ओर से। उनका ${activeSchemeTitle} आवेदन क्रमांक ${activeAppNumber} ब्लॉक विकास अधिकारी कार्यालय में पिछले ${daysPending} दिनों से लंबित है, जबकि आधिकारिक समय-सीमा ${slaThreshold} दिन है। साइट जियो-टैगिंग और ग्राम सेवक सत्यापन रिपोर्ट के संबंध में त्वरित स्थिति स्पष्ट करें।`,
    Marathi: `नमस्कार. मी जनसाथी AI बोलत आहे, नागरिक ${name} (वय ६० वर्षे, हवेली, पुणे) यांच्या वतीने. त्यांचा ${activeSchemeTitle} अर्ज क्रमांक ${activeAppNumber} तालुका कार्यालयाकडे मागील ${daysPending} दिवसांपासून प्रलंबित आहे, नियमानुसार ही मुदत ${slaThreshold} दिवस आहे. कृपया स्थळ पाहणी व मंजुरीच्या सद्यस्थितीबाबत त्वरित माहिती द्यावी.`,
    English: `Hello, this is JANSAATHI AI representing citizen ${name} (Age 60, Pune, Maharashtra). The ${activeSchemeTitle} application #${activeAppNumber} has remained pending at the administrative office for ${daysPending} days, exceeding the ${slaThreshold}-day standard service level timeline. Please confirm the status of the field verification report.`
  };

  const activeScript = CALL_SCRIPTS[selectedLang] || CALL_SCRIPTS.Hindi;

  // Real Speech Synthesis Voice Agent
  const handlePlayVoiceAgent = () => {
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
    const utterance = new SpeechSynthesisUtterance(activeScript);
    utterance.lang = selectedLang === 'Hindi' ? 'hi-IN' : selectedLang === 'Marathi' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      onShowToast('Voice Agent Active', `Synthesizing automated escalation speech in ${selectedLang}...`, 'info');
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleConfirmFollowUp = () => {
    if (!hasCitizenApproved) {
      onShowToast('Citizen Approval Required', 'Please check the authorization box before executing follow-up.', 'warning');
      return;
    }

    const record: FollowUpRecord = {
      id: `flw-${Date.now()}`,
      applicationNumber: activeAppNumber,
      schemeTitle: activeSchemeTitle,
      daysPending,
      slaDays: slaThreshold,
      isDelayed,
      targetOffice: 'Block Development Officer (BDO) & Talathi Office, Haveli, Pune',
      phoneTarget: '+91-20-2612-XXXX (Public Grievance Line)',
      generatedMessage: `Escalation lodged for application ${activeAppNumber} overdue by ${Math.max(1, daysPending - slaThreshold)} days.`,
      callScript: CALL_SCRIPTS,
      approvedByCitizen: true,
      actionTaken: isPlayingAudio ? 'Call Simulation Executed' : 'Script Prepared',
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const stored = localStorage.getItem('jansaathi_followup_history');
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem('jansaathi_followup_history', JSON.stringify([record, ...list]));
    } catch {
      // ignore
    }

    setIsEscalated(true);
    onEscalationRecorded(record);
    onShowToast('Escalation Recorded', 'Proactive follow-up action saved to audit log.', 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proactive Follow-up & Voice Escalation Engine"
      description="Monitors statutory service level agreements (SLAs), detects delayed applications, and generates automated inquiry calls."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* SLA Delay Alert Banner */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-950 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Application Delay Detected</span>
              <Badge variant="red" size="sm">{Math.max(1, daysPending - slaThreshold)} Days Overdue</Badge>
            </div>
            <p className="leading-relaxed">
              Application <strong>{activeAppNumber}</strong> ({activeSchemeTitle}) has been pending at the Taluka Verification stage for <strong>{daysPending} days</strong>. The statutory citizen charter threshold is <strong>{slaThreshold} days</strong>.
            </p>
          </div>
        </div>

        {/* Office & Target Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Jurisdictional Office</span>
            </span>
            <p className="font-semibold text-slate-900">Taluka Panchayat Samiti & BDO Office, Haveli</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>SLA Target Limit</span>
            </span>
            <p className="font-semibold text-slate-900">14 Business Days (Citizen Charter 2026)</p>
          </div>
        </div>

        {/* Localized Voice Call Script Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Prepared Escalation Voice Call Script</span>
            </label>

            <div className="flex items-center gap-1">
              {(['Hindi', 'Marathi', 'English'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLang(lang)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    selectedLang === lang
                      ? 'bg-amber-500 text-slate-950 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {lang === 'Hindi' ? 'हिंदी' : lang === 'Marathi' ? 'मराठी' : 'English'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono leading-relaxed border border-slate-800 relative">
            <p className="text-slate-300">"{activeScript}"</p>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-amber-400">Speech Language: {selectedLang} (Female/Male Indic Neural)</span>

              <button
                type="button"
                onClick={handlePlayVoiceAgent}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {isPlayingAudio ? <PhoneOff className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Stop Voice' : 'Play Voice Agent'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mandatory Citizen Approval Checkbox */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasCitizenApproved}
              onChange={(e) => setHasCitizenApproved(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300 cursor-pointer"
            />
            <div className="text-xs text-amber-950 space-y-0.5">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Explicit Citizen Approval Required</span>
              </p>
              <p className="text-amber-900 leading-relaxed text-[11px]">
                I authorize JANSAATHI AI to transmit this status inquiry escalation to the designated administrative officer and record the action in the government portal registry.
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            type="button"
            variant="primary"
            disabled={!hasCitizenApproved || isEscalated}
            onClick={handleConfirmFollowUp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>{isEscalated ? 'Escalation Recorded' : 'Approve & Escalate Application'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
