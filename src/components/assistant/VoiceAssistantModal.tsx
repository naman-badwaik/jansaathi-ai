import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Globe, 
  Send,
  AlertTriangle,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AssistantAvatar } from './AssistantAvatar';
import type { SupportedLanguage } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { useSpeechInput } from '../../services/useSpeechInput';
import { unlockSpeechSynthesis } from '../../services/speechSynthesisService';

export interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  onTranscriptComplete?: (transcript: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage: propLang,
  onLanguageChange: propOnLangChange,
  onShowToast,
  onTranscriptComplete
}) => {
  const { language, setLanguage, t } = useTranslation();
  const activeLanguage = propLang || language;
  const [capturedSpeech, setCapturedSpeech] = useState('');
  const [copied, setCopied] = useState(false);

  // Hook for real Web Speech API recognition
  const {
    isListening,
    error: speechError,
    isSupported,
    toggleListening,
    stopListening,
    abortListening,
    clearTranscript
  } = useSpeechInput({
    language: activeLanguage,
    onTranscript: (liveTranscript) => {
      setCapturedSpeech(liveTranscript);
    },
    onFinalTranscript: (finalTranscript) => {
      // Immediately finalize and submit to AI assistant without requiring a second click
      const clean = finalTranscript.trim();
      if (clean) {
        unlockSpeechSynthesis();
        onClose();
        if (onTranscriptComplete) {
          onTranscriptComplete(clean);
        }
      }
    },
    onShowToast
  });

  // Reset captured speech when modal closes
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen && capturedSpeech) {
      setCapturedSpeech('');
    }
  }

  // Abort listening when modal closes
  useEffect(() => {
    if (!isOpen) {
      abortListening();
    }
  }, [isOpen, abortListening]);

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    if (isListening) {
      stopListening();
    }
    setLanguage(lang);
    if (propOnLangChange) {
      propOnLangChange(lang);
    }
    clearTranscript();
    setCapturedSpeech('');
    onShowToast('Voice Input Language', `Language changed to ${lang}`, 'info');
  };

  const handleCopyTranscript = () => {
    if (!capturedSpeech) return;
    navigator.clipboard.writeText(capturedSpeech);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Copied', 'Speech transcript copied to clipboard', 'info');
  };

  const handleSendToAssistant = () => {
    const clean = capturedSpeech.trim();
    if (!clean) return;
    unlockSpeechSynthesis();
    abortListening();
    onClose();
    if (onTranscriptComplete) {
      onTranscriptComplete(clean);
    }
  };

  const sampleVoicePrompts: Record<SupportedLanguage, string[]> = {
    Hindi: [
      '“मेरी किसान सम्मान निधि की अगली किश्त कब आएगी?”',
      '“महाराष्ट्र में ग्रामीण परिवारों के लिए घरकुल योजनाएं बताएं।”',
      '“आयुष्मान भारत कार्ड डाउनलोड करने के लिए क्या चाहिए?”'
    ],
    English: [
      '“When is my PM-KISAN installment expected?”',
      '“Show me housing schemes for rural families in Maharashtra.”',
      '“What documents are needed to generate an Ayushman Bharat card?”'
    ],
    Marathi: [
      '“माझ्या शेतकरी सन्मान निधीचा पुढील हप्ता कधी येईल?”',
      '“ग्रामीण कुटुंबांसाठी उपलब्ध असणाऱ्या घरकुल योजना दाखवा.”',
      '“आयुष्मान भारत गोल्डन कार्डसाठी कोणती कागदपत्रे लागतात?”'
    ]
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopListening();
        onClose();
      }}
      title={t('assistant.voiceModalTitle')}
      description={t('assistant.voiceModalDesc')}
      maxWidth="md"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('assistant.voiceLanguageLabel')} <strong>{activeLanguage}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Select Voice Language"
              value={activeLanguage}
              onChange={(e) => handleLanguageSelect(e.target.value as SupportedLanguage)}
              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium cursor-pointer"
            >
              <option value="Hindi">हिंदी (Hindi • hi-IN)</option>
              <option value="English">English (India • en-IN)</option>
              <option value="Marathi">मराठी (Marathi • mr-IN)</option>
            </select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                stopListening();
                onClose();
              }}
            >
              {t('assistant.close')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center py-4 space-y-5">
        {/* Animated Avatar */}
        <div className="pt-2">
          <AssistantAvatar 
            state={isListening ? 'listening' : 'idle'} 
            size="xl" 
          />
        </div>

        {/* Status Text & Audio Visualizer Bars */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-800">
            <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
            {isListening 
              ? `${activeLanguage === 'Hindi' ? 'सुन रहे हैं' : activeLanguage === 'Marathi' ? 'ऐकत आहोत' : 'Listening'} (${activeLanguage === 'Hindi' ? 'hi-IN' : activeLanguage === 'Marathi' ? 'mr-IN' : 'en-IN'})` 
              : t('assistant.tapToSpeak')}
          </div>
          <p className="text-xs text-slate-600 max-w-sm">
            {isListening 
              ? 'Speak your question clearly in your chosen language. The transcript will appear below.'
              : 'Tap the microphone to speak in Hindi, Marathi, or English.'}
          </p>
        </div>

        {/* Audio Wave Visualizer Simulation */}
        <div className="h-10 flex items-center justify-center gap-1.5 px-6 py-2 bg-slate-50 rounded-xl w-full border border-slate-100">
          {[40, 70, 30, 85, 50, 95, 60, 80, 45, 90, 35, 65, 55, 75, 40].map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${
                isListening 
                  ? 'bg-gradient-to-t from-rose-500 via-amber-500 to-emerald-500 animate-pulse' 
                  : 'bg-slate-200'
              }`}
              style={{
                height: isListening ? `${height}%` : '20%',
                animationDelay: `${i * 0.08}s`
              }}
            />
          ))}
        </div>

        {/* Browser Support Warning */}
        {!isSupported && (
          <div className="w-full text-left p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Web Speech API Not Supported In This Browser</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Google Chrome or Microsoft Edge is recommended for native speech recognition in Hindi, Marathi, and Indian English.
            </p>
          </div>
        )}

        {/* Speech Error Banner (Permission Denied / No Mic) */}
        {speechError && (
          <div className="w-full text-left p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{speechError.message}</span>
            </div>
            {speechError.actionableHint && (
              <p className="text-[11px] text-rose-800 leading-relaxed">
                {speechError.actionableHint}
              </p>
            )}
          </div>
        )}

        {/* Interactive Microphone Button */}
        <div>
          <button
            type="button"
            id="voice-modal-mic-button"
            onClick={() => {
              unlockSpeechSynthesis();
              toggleListening();
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 cursor-pointer ${
              isListening 
                ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-200 animate-pulse' 
                : 'bg-gradient-to-tr from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 ring-4 ring-orange-100 hover:shadow-xl'
            }`}
            aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
          >
            {isListening ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">
            {isListening ? 'Tap to Stop Recording' : 'Tap to Start Speaking'}
          </div>
        </div>

        {/* Live Speech Recognition Transcript Card */}
        {capturedSpeech && (
          <div className="w-full text-left bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recognized Speech ({activeLanguage})</span>
              </div>
              <Badge variant="green" size="sm">
                {isListening ? 'Transcribing...' : 'Complete'}
              </Badge>
            </div>

            <p className="text-sm font-medium text-slate-900 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              {capturedSpeech}
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyTranscript}
                iconLeft={<Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSendToAssistant}
                iconRight={<Send className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Send to JANSAATHI AI
              </Button>
            </div>
          </div>
        )}

        {/* Sample Prompts */}
        <div className="w-full text-left bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('assistant.trySpeakingPrompt')} ({activeLanguage})</span>
          </div>
          <div className="space-y-1.5">
            {sampleVoicePrompts[activeLanguage].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const cleaned = prompt.replace(/[“”"']/g, '');
                  unlockSpeechSynthesis();
                  abortListening();
                  onClose();
                  if (onTranscriptComplete) {
                    onTranscriptComplete(cleaned);
                  }
                }}
                className="w-full text-left text-xs text-slate-700 bg-white hover:bg-amber-50 hover:border-amber-300 p-2.5 rounded-lg border border-slate-200/60 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
