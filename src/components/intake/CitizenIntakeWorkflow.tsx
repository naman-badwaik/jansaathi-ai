import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  MapPin, 
  Home, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useTranslation } from '../../context/LanguageContext';
import type { CitizenIntakeData, SupportedLanguage } from '../../types';
import { INTAKE_QUESTIONS, parseCitizenInitialPrompt } from '../../services/intakeService';
import { useSpeechInput } from '../../services/useSpeechInput';

export interface CitizenIntakeWorkflowProps {
  onIntakeCompleted: (data: CitizenIntakeData) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const CitizenIntakeWorkflow: React.FC<CitizenIntakeWorkflowProps> = ({
  onIntakeCompleted,
  onShowToast
}) => {
  const { language } = useTranslation();
  
  const [promptText, setPromptText] = useState('');
  const [intakeData, setIntakeData] = useState<Partial<CitizenIntakeData>>({
    state: 'Maharashtra',
    casteCategory: 'General',
    areaType: 'Rural'
  });
  
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSynthesized, setIsSynthesized] = useState(false);

  // Native Web Speech Recognition hook
  const {
    isListening: isRecording,
    toggleListening: handleToggleVoice,
    error: speechError
  } = useSpeechInput({
    language,
    onTranscript: (transcript, isFinal) => {
      setPromptText(transcript);
      if (isFinal) {
        handleAnalyzeInitialPrompt(transcript);
      }
    },
    onShowToast
  });

  // Quick preset queries for the hackathon demo
  const DEMO_PRESETS: Record<SupportedLanguage, { label: string; text: string }> = {
    Hindi: {
      label: 'डेमो: 60 वर्षीय महाराष्ट्र नागरिक आवास आवश्यकता (Hindi)',
      text: 'नमस्ते, मैं 60 साल का हूँ, महाराष्ट्र के पुणे जिले से। मेरे पास पक्का घर नहीं है, मुझे सरकार से घर चाहिए।'
    },
    Marathi: {
      label: 'डेमो: ६० वर्षीय महाराष्ट्र नागरिक घरकुल आवश्यकता (Marathi)',
      text: 'नमस्कार, माझे वय ६० वर्षे आहे आणि मी पुणे, महाराष्ट्रात राहतो. मला राहण्यासाठी पक्के घर नाही, मला शासकीय घरकुल हवे आहे.'
    },
    English: {
      label: 'Demo: 60-Year-Old Maharashtra Citizen Housing Need (English)',
      text: 'Namaste, I am 60 years old from Pune, Maharashtra. I live in a kutcha house and need government housing assistance.'
    }
  };



  const handleApplyPreset = () => {
    const preset = DEMO_PRESETS[language] || DEMO_PRESETS.English;
    setPromptText(preset.text);
    handleAnalyzeInitialPrompt(preset.text);
  };

  const handleAnalyzeInitialPrompt = (textToParse?: string) => {
    const text = textToParse || promptText;
    if (!text.trim()) return;

    const parsed = parseCitizenInitialPrompt(text, language);
    setIntakeData((prev) => ({
      ...prev,
      ...parsed,
      rawNeedDescription: text
    }));

    setIsSynthesized(true);
    setCurrentStepIndex(0);
    onShowToast('Need Extracted', 'Parameters understood. Please review clarification steps.', 'success');
  };

  const handleFieldChange = (field: keyof CitizenIntakeData, value: any) => {
    setIntakeData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextQuestion = () => {
    if (currentStepIndex < INTAKE_QUESTIONS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinalizeIntake();
    }
  };

  const handleFinalizeIntake = () => {
    const finalData: CitizenIntakeData = {
      needCategory: intakeData.needCategory || 'Housing Assistance (घर / आवास)',
      rawNeedDescription: intakeData.rawNeedDescription || promptText || 'Citizen housing inquiry',
      citizenAge: intakeData.citizenAge || 60,
      state: intakeData.state || 'Maharashtra',
      district: intakeData.district || 'Pune',
      areaType: intakeData.areaType || 'Rural',
      annualIncome: intakeData.annualIncome || 48000,
      casteCategory: intakeData.casteCategory || 'General',
      housingStatus: intakeData.housingStatus || 'Kutcha House',
      landHoldingAcres: intakeData.landHoldingAcres || 0,
      confirmedByCitizen: true
    };

    setIntakeData(finalData);
    onIntakeCompleted(finalData);
  };

  const handleResetIntake = () => {
    setPromptText('');
    setIsSynthesized(false);
    setCurrentStepIndex(0);
    setIntakeData({
      state: 'Maharashtra',
      casteCategory: 'General',
      areaType: 'Rural'
    });
  };

  const currentQ = INTAKE_QUESTIONS[currentStepIndex];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="amber" size="sm">CITY-02 Guided Intake</Badge>
              <span className="text-xs text-amber-300 font-mono">Phase 1: Need Clarification</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {language === 'Hindi' 
                ? 'नागरिक सेवा आवश्यकता एवं मार्गदर्शन' 
                : language === 'Marathi'
                ? 'नागरिक सेवा आवश्यकता आणि मार्गदर्शन'
                : 'Citizen Service Intake & Need Clarification'}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              {language === 'Hindi'
                ? 'अपनी आवश्यकता अपनी भाषा में बोलकर या लिखकर बताएं। जनसाथी AI आपके लिए सही सरकारी योजना और पात्रता खोजेगा।'
                : language === 'Marathi'
                ? 'आपली गरज आपल्या भाषेत बोलून किंवा लिहून सांगा. जनसाथी AI आपल्यासाठी योग्य शासकीय योजना आणि पात्रता शोधेल.'
                : 'Express your problem or need in plain language. JANSAATHI AI identifies the right schemes, verifies eligibility, and coordinates application preparation.'}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleApplyPreset}
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
            <span>Load 60-Yr MH Housing Scenario</span>
          </Button>
        </div>
      </div>

      {/* Main Interactive Intake Flow */}
      {!isSynthesized ? (
        <Card className="border-slate-200/90 shadow-md p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="intake-prompt" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'Hindi'
                    ? 'अपनी समस्या या आवश्यकता बताएं:'
                    : language === 'Marathi'
                    ? 'आपली अडचण किंवा आवश्यकता सांगा:'
                    : 'Describe your need or problem:'}
                </span>
              </label>

              <button
                type="button"
                id="intake-voice-button"
                onClick={handleToggleVoice}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  isRecording 
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30' 
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-amber-700" />}
                <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
              </button>
            </div>

            {speechError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-0.5">
                <p className="font-bold">{speechError.message}</p>
                {speechError.actionableHint && (
                  <p className="text-[11px] text-amber-900">{speechError.actionableHint}</p>
                )}
              </div>
            )}

            <textarea
              id="intake-prompt"
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={
                language === 'Hindi'
                  ? 'उदा. "मुझे 60 साल की उम्र में आवास सहायता चाहिए, मैं महाराष्ट्र के पुणे में कच्चे मकान में रहता हूँ..."'
                  : language === 'Marathi'
                  ? 'उदा. "माझे वय ६० वर्षे असून मी पुण्यात राहतो, मला राहण्यासाठी पक्के घर हवे आहे..."'
                  : 'e.g. "I am a 60-year-old living in a kutcha house in Pune, Maharashtra and need government housing support..."'
              }
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                {language === 'Hindi' 
                  ? 'हिंदी, मराठी और अंग्रेजी तीनों भाषाओं में समर्थित।' 
                  : language === 'Marathi'
                  ? 'मराठी, हिंदी आणि इंग्रजी तिन्ही भाषांमध्ये उपलब्ध.'
                  : 'Supports natural Hindi, Marathi, and English voice/text input.'}
              </span>

              <Button
                type="button"
                variant="primary"
                onClick={() => handleAnalyzeInitialPrompt()}
                disabled={!promptText.trim()}
              >
                <span>Process & Clarify Need</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Clarification Questions (One at a time) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-slate-200 shadow-md p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80">
                  Question {currentStepIndex + 1} of {INTAKE_QUESTIONS.length}
                </span>
                <button
                  type="button"
                  onClick={handleResetIntake}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Over</span>
                </button>
              </div>

              {currentQ && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-slate-900 leading-snug">
                    {currentQ.question[language] || currentQ.question.English}
                  </h3>

                  {currentQ.inputType === 'select' && currentQ.options ? (
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {currentQ.options.map((opt, i) => {
                        const isSelected = intakeData[currentQ.field] === opt || (currentQ.field === 'needCategory' && String(intakeData[currentQ.field]).includes(opt.split(' ')[0]));
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleFieldChange(currentQ.field, opt)}
                            className={`p-3 text-left rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500 text-amber-950 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : currentQ.inputType === 'number' ? (
                    <input
                      type="number"
                      value={intakeData[currentQ.field] as number || ''}
                      onChange={(e) => handleFieldChange(currentQ.field, parseInt(e.target.value, 10))}
                      placeholder={currentQ.placeholder?.[language] || '60'}
                      className="w-full text-base bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(intakeData[currentQ.field] || '')}
                      onChange={(e) => handleFieldChange(currentQ.field, e.target.value)}
                      placeholder={currentQ.placeholder?.[language] || 'Pune, Haveli'}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={currentStepIndex === 0}
                      onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                    >
                      Back
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleNextQuestion}
                    >
                      <span>{currentStepIndex === INTAKE_QUESTIONS.length - 1 ? 'Review Summary' : 'Next Question'}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Structured Service Request Draft Summary */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-slate-200 shadow-md p-5 bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Structured Service Request
                  </h4>
                </div>
                <Badge variant="green" size="sm">Confirmed Draft</Badge>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Need Category:</span>
                  </span>
                  <span className="font-semibold text-slate-900">{intakeData.needCategory || 'Housing Assistance'}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Citizen Age:</span>
                  </span>
                  <span className="font-semibold text-slate-900">{intakeData.citizenAge || 60} Years (Senior)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>State & District:</span>
                  </span>
                  <span className="font-semibold text-slate-900">{intakeData.state || 'Maharashtra'}, {intakeData.district || 'Pune'}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Shelter Status:</span>
                  </span>
                  <span className="font-semibold text-slate-900">{intakeData.housingStatus || 'Kutcha House'}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 space-y-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full justify-center shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleFinalizeIntake}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  <span>Confirm & Run Scheme Discovery</span>
                </Button>
                <p className="text-[11px] text-slate-500 text-center">
                  Explicit citizen consent requested before evaluating eligibility or accessing documents.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
