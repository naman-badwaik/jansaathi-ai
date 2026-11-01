import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  X, 
  Send, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Bot, 
  Sparkles, 
  RotateCcw, 
  HelpCircle,
  Clock,
  AlertCircle,
  Plus,
  History,
  MessageSquare,
  Trash2,
  Minus
} from 'lucide-react';
import { AssistantAvatar } from './AssistantAvatar';
import { ActionCard } from './ActionCard';
import type { 
  ChatMessage, 
  ChatConversation, 
  SupportedLanguage, 
  ClientAction, 
  ClientActionResult 
} from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useSpeechInput } from '../../services/useSpeechInput';
import { speakText, stopSpeech, isSpeechSynthesisSupported, unlockSpeechSynthesis } from '../../services/speechSynthesisService';
import { validateAndSanitizeAction, createPortalBroadcastBridge } from '../../services/clientActionDispatcher';

export interface AiAssistantPanelProps {
  isOpen: boolean;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose: () => void;
  onOpenVoiceModal: () => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  initialPrompt?: string;
  onConsumeInitialPrompt?: () => void;
  autoSubmitVoicePrompt?: boolean;
  onExecuteClientAction?: (action: ClientAction) => Promise<ClientActionResult>;
}

const CONVERSATIONS_STORAGE_KEY = 'jansaathi_chat_conversations';
const ACTIVE_CONV_STORAGE_KEY = 'jansaathi_active_conv_id';

function getFormattedTime(): string {
  try {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '10:30 AM';
  }
}

function getIsoTimestamp(): string {
  try {
    return new Date().toISOString();
  } catch {
    return '2026-10-31T00:00:00.000Z';
  }
}

function createNewConversation(greeting: string, title = 'New Consultation'): ChatConversation {
  const convId = `conv-${Date.now()}`;
  return {
    id: convId,
    title,
    createdAt: getIsoTimestamp(),
    updatedAt: getIsoTimestamp(),
    messages: [
      {
        id: `msg-init-${convId}`,
        sender: 'assistant',
        content: greeting,
        timestamp: getFormattedTime()
      }
    ]
  };
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  isOpen,
  isMinimized = false,
  onMinimize,
  onClose,
  onOpenVoiceModal,
  onShowToast,
  initialPrompt,
  onConsumeInitialPrompt,
  autoSubmitVoicePrompt = true,
  onExecuteClientAction
}) => {
  const { language, t } = useTranslation();
  const { user, profile: authProfile, isAuthenticated } = useAuth();
  
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Persistent Voice Replies Setting (defaults to true for voice users)
  const [voiceRepliesEnabled, setVoiceRepliesEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('jansaathi_voice_replies_enabled');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleVoiceReplies = () => {
    unlockSpeechSynthesis();
    setVoiceRepliesEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jansaathi_voice_replies_enabled', String(next));
      } catch {
        // Ignore localStorage error
      }
      onShowToast(
        'Voice Replies Setting',
        next ? 'AI voice speech replies are now ON.' : 'AI voice speech replies are now OFF.',
        'info'
      );
      if (!next) {
        stopSpeech();
        setIsSpeaking(false);
      }
      return next;
    });
  };

  const lastTurnWasVoiceRef = useRef(false);
  const handleSendMessageRef = useRef<(text?: string, options?: { isVoiceTurn?: boolean }) => Promise<void>>(async () => {});

  // Stop speaking callback
  const handleStopSpeaking = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
  }, []);

  // Sync manual initial prompt if provided and not auto-submitting
  const [prevInitialPrompt, setPrevInitialPrompt] = useState(initialPrompt);
  if (initialPrompt !== prevInitialPrompt) {
    setPrevInitialPrompt(initialPrompt);
    if (initialPrompt && !autoSubmitVoicePrompt) {
      setInputText(initialPrompt);
    }
  }

  // Handle incoming voice prompt auto-submission (e.g. from Voice Assistant Modal)
  const prevAutoPromptRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (initialPrompt && autoSubmitVoicePrompt && initialPrompt !== prevAutoPromptRef.current) {
      prevAutoPromptRef.current = initialPrompt;
      const clean = initialPrompt.trim();
      if (clean) {
        onConsumeInitialPrompt?.();
        void handleSendMessageRef.current(clean, { isVoiceTurn: true });
      }
    }
  }, [initialPrompt, autoSubmitVoicePrompt, onConsumeInitialPrompt]);

  // Native Web Speech Recognition directly for chat input with automatic submission
  const {
    isListening,
    toggleListening: toggleVoiceInputOriginal,
    stopListening,
    abortListening
  } = useSpeechInput({
    language,
    onTranscript: (transcript, _isFinal) => {
      setInputText(transcript);
    },
    onFinalTranscript: (finalTranscript) => {
      // When citizen finishes speaking or clicks Stop Recording, automatically submit final recognized transcript
      const clean = finalTranscript.trim();
      if (clean) {
        setInputText('');
        void handleSendMessageRef.current(clean, { isVoiceTurn: true });
      }
    },
    onShowToast
  });

  // Never start listening while assistant is speaking (UX Requirement)
  const toggleVoiceInput = useCallback(() => {
    // Unlock Chrome speech synthesis from direct user gesture
    unlockSpeechSynthesis();
    if (isSpeaking) {
      handleStopSpeaking();
    }
    toggleVoiceInputOriginal();
  }, [isSpeaking, handleStopSpeaking, toggleVoiceInputOriginal]);

  // Stop speaking and reset speaking state when panel closes
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      stopSpeech();
      if (isSpeaking) {
        setIsSpeaking(false);
      }
    }
  }

  // Abort listening cleanly without auto-submitting if panel closes during speech
  useEffect(() => {
    if (!isOpen && isListening) {
      abortListening();
    }
  }, [isOpen, isListening, abortListening]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);
  
  const msgCounterRef = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved multi-turn conversations from localStorage or initialize with first conversation
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to load conversations from localStorage:', err);
    }
    return [createNewConversation(t('assistant.initialGreeting'))];
  });

  // Load active conversation ID from localStorage or default to the first conversation
  const [activeId, setActiveId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_CONV_STORAGE_KEY);
      if (savedId) return savedId;
    } catch {
      // Ignore storage error
    }
    return conversations[0]?.id || 'conv-default';
  });

  // Current active conversation
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeId) || conversations[0] || createNewConversation(t('assistant.initialGreeting'));
  }, [conversations, activeId, t]);

  const messages = activeConversation.messages;

  // Sync conversations to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    } catch (err) {
      console.warn('Could not persist conversations to localStorage:', err);
    }
  }, [conversations]);

  // Sync active conversation ID to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_CONV_STORAGE_KEY, activeId);
    } catch (err) {
      console.warn('Could not persist active conversation id to localStorage:', err);
    }
  }, [activeId]);

  // Auto-scroll chat to latest message or indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Step 5: Listen for real-time portal submission events across BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('jansaathi_portal_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'APPLICATION_SUBMITTED' && event.data.applicationNumber) {
          const appNo = event.data.applicationNumber;
          const scheme = event.data.schemeTitle || 'Pradhan Mantri Awas Yojana - Gramin';

          const confirmationText = language === 'Hindi'
            ? `आवेदन सफलतापूर्वक जमा कर दिया गया है! आपका आधिकारिक संदर्भ क्रमांक **${appNo}** है। आप मुझसे कभी भी "मेरा आवेदन कहाँ है?" पूछकर लाइव स्थिति जान सकते हैं।`
            : language === 'Marathi'
            ? `अर्ज यशस्वीरीत्या सादर झाला आहे! आपला अधिकृत संदर्भ क्रमांक **${appNo}** आहे. आपण मला कधीही "माझा अर्ज कुठे आहे?" विचारून स्थिती तपासू शकता.`
            : `Application submitted successfully! Your official reference number is **${appNo}** for ${scheme}. You can ask me anytime to track this application.`;

          msgCounterRef.current += 1;
          const receiptMsg: ChatMessage = {
            id: `assistant-receipt-${msgCounterRef.current}`,
            sender: 'assistant',
            content: confirmationText,
            timestamp: getFormattedTime()
          };

          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeConversation.id) {
                return {
                  ...c,
                  updatedAt: getIsoTimestamp(),
                  messages: [...c.messages, receiptMsg]
                };
              }
              return c;
            })
          );

          if (voiceRepliesEnabled) {
            const spokenText = language === 'Hindi'
              ? `आवेदन सफलतापूर्वक जमा हुआ। आपका संदर्भ क्रमांक ${appNo} है।`
              : language === 'Marathi'
              ? `अर्ज यशस्वीरीत्या सादर केला. आपला संदर्भ क्रमांक ${appNo} आहे.`
              : `Application submitted successfully. Your reference ID is ${appNo}.`;
            speakText(spokenText, language, {
              onStart: () => setIsSpeaking(true),
              onEnd: () => setIsSpeaking(false),
              onError: () => setIsSpeaking(false)
            });
          }
        }
      };
    } catch (err) {
      console.warn('BroadcastChannel error in AiAssistantPanel:', err);
    }

    return () => {
      if (channel) channel.close();
    };
  }, [activeConversation.id, language, voiceRepliesEnabled]);

  // Multilingual prompt suggestions tailored to Indic citizen queries
  const promptSuggestions: Record<SupportedLanguage, string[]> = {
    English: [
      'Check my PM-KISAN eligibility',
      'What documents are needed for Ayushman Bharat?',
      'How to apply for Pradhan Mantri Awas Yojana (PMAY)?',
      'Find nearest CSC or Seva Kendra in my district'
    ],
    Hindi: [
      'PM-किसान योजना के लिए मेरी पात्रता जांचें',
      'आयुष्मान भारत के लिए किन दस्तावेजों की आवश्यकता है?',
      'प्रधानमंत्री आवास योजना (PMAY) के लिए आवेदन कैसे करें?',
      'मेरे जिले में निकटतम सीएससी या सेवा केंद्र खोजें'
    ],
    Marathi: [
      'पीएम-किसान योजनेसाठी माझी पात्रता तपासा',
      'आयुष्मान भारतसाठी कोणती कागदपत्रे लागतात?',
      'प्रधानमंत्री आवास योजनेसाठी अर्ज कसा करावा?',
      'माझ्या जिल्ह्यातील जवळचे सीएससी किंवा सेवा केंद्र शोधा'
    ]
  };

  const currentSuggestions = promptSuggestions[language] || promptSuggestions.English;

  // Start a new conversation
  const handleStartNewConversation = () => {
    const defaultTitle = t('assistant.newChat');
    const newConv = createNewConversation(t('assistant.initialGreeting'), defaultTitle);
    
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setIsHistoryOpen(false);
    onShowToast(t('assistant.newChat'), 'Fresh consultation started.', 'info');
  };

  // Delete a specific conversation
  const handleDeleteConversation = (convId: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== convId);
      if (filtered.length === 0) {
        const fresh = createNewConversation(t('assistant.initialGreeting'), t('assistant.newChat'));
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === convId) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
    onShowToast('Consultation Removed', 'The conversation was deleted from local storage.', 'info');
  };

  // Reset active conversation messages
  const handleReset = () => {
    const currentConvId = activeConversation.id;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConvId) {
          return {
            ...c,
            updatedAt: getIsoTimestamp(),
            messages: [
              {
                id: `msg-reset-${currentConvId}`,
                sender: 'assistant',
                content: t('assistant.initialGreeting'),
                timestamp: getFormattedTime()
              }
            ]
          };
        }
        return c;
      })
    );
    onShowToast('Chat Reset', 'Conversation context cleared.', 'info');
  };

  // Handle message sending (unauthenticated guest friendly, voice-conversation aware)
  const handleSendMessage = async (textToSend?: string, options?: { isVoiceTurn?: boolean }) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading || isLoadingRef.current) return;
    isLoadingRef.current = true;

    // Unlock Chrome speech synthesis from user interaction
    unlockSpeechSynthesis();

    // Track whether this specific turn was initiated by voice
    const isVoiceTurn = Boolean(options?.isVoiceTurn);
    lastTurnWasVoiceRef.current = isVoiceTurn;

    // Cancel any active speech playback before sending/processing new query
    handleStopSpeaking();

    msgCounterRef.current += 1;
    const currentCount = msgCounterRef.current;
    const currentTime = getFormattedTime();

    // Step 5 Feature: Check if citizen gives an affirmative approval to an awaiting_approval client action card
    const cleanLower = text.trim().toLowerCase();
    const isAffirmative = /^(yes|proceed|approve|confirm|start|apply|open|haan|ha|हाँ|आगे|बढ़ो|शुरू|मंजूर|हो|पुढे|सुरू|होय|भरा)\b/i.test(cleanLower) ||
      cleanLower.includes('approve') || cleanLower.includes('proceed') || cleanLower.includes('start application') || cleanLower.includes('आगे बढ़ो') || cleanLower.includes('सुरू करा');

    if (isAffirmative) {
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.clientActions) {
          const pending = msg.clientActions.find((a) => a.status === 'awaiting_approval');
          if (pending) {
            void handleApproveAction(pending, msg.id);
            return;
          }
        }
      }
    }

    const userMessage: ChatMessage = {
      id: `user-msg-${currentCount}`,
      sender: 'user',
      content: text,
      timestamp: currentTime
    };

    setInputText('');

    // Determine if title should be updated from default
    const isDefaultTitle = 
      activeConversation.title === 'New Consultation' || 
      activeConversation.title === t('assistant.newChat') ||
      activeConversation.title === 'नयी बातचीत' ||
      activeConversation.title === 'नवीन संभाषण';

    const newTitle = isDefaultTitle 
      ? (text.length > 34 ? text.slice(0, 34) + '...' : text)
      : activeConversation.title;

    // Append user message to active conversation immediately
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            title: newTitle,
            updatedAt: getIsoTimestamp(),
            messages: [...c.messages, userMessage]
          };
        }
        return c;
      })
    );

    setIsLoading(true);

    try {
      // Build conversation history (excluding system notices & error states, max 12 turns)
      const historyPayload = messages
        .filter((m) => !m.isPlaceholder && !m.isError && m.sender !== 'system')
        .slice(-12)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          text: m.content
        }));

      // Construct citizen profile context: use authenticated profile if present, else guest context
      const citizenProfileContext = authProfile ? {
        name: authProfile.name,
        state: authProfile.state,
        district: authProfile.district,
        taluka: authProfile.taluka || 'Haveli',
        village: authProfile.village || 'Wadebolhai',
        age: authProfile.age ?? 60,
        housingStatus: authProfile.housing_status || 'Kutcha House',
        annualIncome: typeof authProfile.annual_income === 'number' ? authProfile.annual_income : 48000,
        landHoldingAcres: typeof authProfile.land_holding_acres === 'number' ? authProfile.land_holding_acres : 0.5,
        category: authProfile.category,
        occupation: authProfile.occupation,
        annualIncomeBracket: authProfile.annual_income_bracket,
        fieldSources: authProfile.field_sources || {}
      } : {
        name: 'Citizen (Guest)',
        state: 'India',
        district: 'Not specified'
      };

      // Load local guest applications from localStorage for application tracking
      let localGuestApplications: any[] = [];
      try {
        const stored = localStorage.getItem('jansaathi_applications');
        if (stored) {
          localGuestApplications = JSON.parse(stored);
        }
      } catch {
        // ignore
      }

      // Invoke Supabase Edge Function 'chat' securely
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: text,
          history: historyPayload,
          language,
          citizenProfile: citizenProfileContext,
          guestApplications: localGuestApplications
        }
      });

      if (error) {
        throw error;
      }

      if (!data || !data.response) {
        throw new Error('No response returned from the assistant service.');
      }

      msgCounterRef.current += 1;

      // Validate and sanitize any structured client action requests from Gemini Edge Function
      const validatedClientActions: ClientAction[] = [];
      if (Array.isArray(data.clientActions)) {
        for (const rawAction of data.clientActions) {
          const cleanAction = validateAndSanitizeAction(rawAction);
          if (cleanAction) {
            validatedClientActions.push(cleanAction);
          }
        }
      }

      const botMessage: ChatMessage = {
        id: `assistant-msg-${msgCounterRef.current}`,
        sender: 'assistant',
        content: data.response,
        timestamp: getFormattedTime(),
        clientActions: validatedClientActions.length > 0 ? validatedClientActions : undefined
      };

      // Append assistant response to active conversation
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              updatedAt: getIsoTimestamp(),
              messages: [...c.messages, botMessage]
            };
          }
          return c;
        })
      );

      // FEATURE 2: AI VOICE RESPONSES
      // Read response aloud if initiated by voice or if voice replies are globally enabled
      // Note: Speaking state is ONLY set when onStart actually fires (Requirement 6)
      const shouldSpeak = isVoiceTurn || voiceRepliesEnabled;
      if (shouldSpeak && isSpeechSynthesisSupported()) {
        speakText(data.response, language, {
          onStart: () => {
            console.info('[JANSAATHI AI] Speech playback confirmed active.');
            setIsSpeaking(true);
          },
          onEnd: () => {
            console.info('[JANSAATHI AI] Speech playback completed.');
            setIsSpeaking(false);
          },
          onError: (err) => {
            console.warn('[JANSAATHI AI] Speech synthesis playback error:', err);
            setIsSpeaking(false);
          }
        });
      }

      // Record activity in citizen's audit trail if authenticated
      if (isAuthenticated && user) {
        try {
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            action_type: 'assistant',
            title: 'AI Scheme Consultation',
            description: text.length > 90 ? text.slice(0, 90) + '...' : text,
            status_tag: 'Completed'
          });
        } catch (logErr) {
          console.warn('Activity logging notice:', logErr);
        }
      }

    } catch (err: any) {
      console.error('JANSAATHI AI invocation error:', err);
      msgCounterRef.current += 1;

      const isConnectionIssue = err?.message?.includes('Failed to send a request') || err?.name === 'FunctionsFetchError' || err?.status === 404;

      let errorMessageText = err?.message || t('assistant.backendOfflineNotice');
      if (isConnectionIssue) {
        errorMessageText = `${t('assistant.backendOfflineNotice')} (Supabase Edge Function 'chat' is awaiting deployment or secret configuration).`;
      }

      const errorMsg: ChatMessage = {
        id: `error-msg-${msgCounterRef.current}`,
        sender: 'system',
        content: errorMessageText,
        timestamp: getFormattedTime(),
        isError: true
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              updatedAt: getIsoTimestamp(),
              messages: [...c.messages, errorMsg]
            };
          }
          return c;
        })
      );

      onShowToast(
        'Assistant Notice',
        'Could not complete assistant query. Please verify connection.',
        'warning'
      );
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  // Requirement 3, 6, 7 & 8: Handle interactive action card approval and execution
  const handleApproveAction = async (action: ClientAction, messageId: string) => {
    // 1. Mark action as running
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== messageId || !m.clientActions) return m;
            return {
              ...m,
              clientActions: m.clientActions.map((act) =>
                act.id === action.id 
                  ? { ...act, status: 'running' as const, approvalGranted: true } 
                  : act
              )
            };
          })
        };
      })
    );

    try {
      let result: ClientActionResult;
      if (onExecuteClientAction) {
        result = await onExecuteClientAction({ ...action, approvalGranted: true });
      } else {
        result = { success: false, message: 'Action execution handler is not configured.' };
      }

      const newStatus = result.success ? ('completed' as const) : ('failed' as const);

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversation.id) return c;
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id !== messageId || !m.clientActions) return m;
              return {
                ...m,
                clientActions: m.clientActions.map((act) =>
                  act.id === action.id 
                    ? { 
                        ...act, 
                        status: newStatus, 
                        executedAt: new Date().toISOString(),
                        result, 
                        error: !result.success ? result.message : undefined 
                      } 
                    : act
                )
              };
            })
          };
        })
      );

      // Requirement 8: Return execution results to the chat so Gemini can explain what happened
      if (result.success) {
        const resultQuery = `[Citizen Action Approved & Executed] Action '${action.title}' (${action.type}) was approved by the citizen and executed successfully. Details: ${result.message}. Please explain to the citizen what this means and what happens next.`;
        void handleSendMessage(resultQuery);
      }
    } catch (err: any) {
      console.error('Error executing approved action:', err);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversation.id) return c;
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id !== messageId || !m.clientActions) return m;
              return {
                ...m,
                clientActions: m.clientActions.map((act) =>
                  act.id === action.id 
                    ? { ...act, status: 'failed' as const, error: err?.message || 'Action failed to execute.' } 
                    : act
                )
              };
            })
          };
        })
      );
    }
  };

  const handleCancelAction = (action: ClientAction, messageId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== messageId || !m.clientActions) return m;
            return {
              ...m,
              clientActions: m.clientActions.map((act) =>
                act.id === action.id 
                  ? { ...act, status: 'failed' as const, error: 'Cancelled by citizen.' } 
                  : act
              )
            };
          })
        };
      })
    );
    onShowToast('Action Cancelled', 'Action cancelled by citizen. No changes made.', 'info');
  };

  // Requirement 3, 5 & 8: Listen to BroadcastChannel for mock portal progress, validation alerts, and submissions
  useEffect(() => {
    const cleanup = createPortalBroadcastBridge({
      onProgress: (event) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeConversation.id) return c;
            let hasUpdated = false;
            const updatedMessages = c.messages.map((m) => {
              if (!m.clientActions) return m;
              const updatedActions = m.clientActions.map((act) => {
                if (
                  (act.type === 'START_APPLICATION' || act.type === 'OPEN_APPLICATION_PORTAL') &&
                  act.status !== 'completed' && act.status !== 'failed'
                ) {
                  hasUpdated = true;
                  return {
                    ...act,
                    status: 'running' as const,
                    currentStage: event.stage,
                    progressMessage: event.message
                  };
                }
                return act;
              });
              return { ...m, clientActions: updatedActions };
            });
            return hasUpdated ? { ...c, messages: updatedMessages } : c;
          })
        );
      },

      onValidationFailed: (event) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeConversation.id) return c;
            let hasUpdated = false;
            const updatedMessages = c.messages.map((m) => {
              if (!m.clientActions) return m;
              const updatedActions = m.clientActions.map((act) => {
                if (
                  (act.type === 'START_APPLICATION' || act.type === 'OPEN_APPLICATION_PORTAL') &&
                  act.status !== 'completed'
                ) {
                  hasUpdated = true;
                  return {
                    ...act,
                    status: 'failed' as const,
                    error: event.message
                  };
                }
                return act;
              });
              return { ...m, clientActions: updatedActions };
            });
            return hasUpdated ? { ...c, messages: updatedMessages } : c;
          })
        );

        // Prompt Gemini to ask the citizen for the missing info (Requirement 2 & 4)
        const followUpPrompt = `[Portal Validation Alert] The demonstration portal reported that required field(s) are missing: ${event.missingFields.join(', ')}. Details: ${event.message}. Please ask the citizen to supply this missing information so their application can proceed.`;
        void handleSendMessageRef.current(followUpPrompt);
      },

      onSubmission: (payload) => {
        const appRef = String(payload.applicationNumber || '');
        const schemeTitle = String(payload.schemeTitle || 'Welfare Scheme');
        if (!appRef) return;

        // Update any active START_APPLICATION or OPEN_APPLICATION_PORTAL action card
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeConversation.id) return c;
            let hasUpdated = false;
            const updatedMessages = c.messages.map((m) => {
              if (!m.clientActions) return m;
              const updatedActions = m.clientActions.map((act) => {
                if (
                  (act.type === 'START_APPLICATION' || act.type === 'OPEN_APPLICATION_PORTAL') &&
                  (act.status === 'running' || act.status === 'awaiting_approval')
                ) {
                  hasUpdated = true;
                  return {
                    ...act,
                    status: 'completed' as const,
                    result: {
                      success: true,
                      message: `Official application submitted! Reference ID: ${appRef}`,
                      data: { applicationNumber: appRef }
                    }
                  };
                }
                return act;
              });
              return { ...m, clientActions: updatedActions };
            });
            return hasUpdated ? { ...c, messages: updatedMessages } : c;
          })
        );

        // Return submission result to Gemini so it explains what happened (Requirement 8)
        const followUpText = `I have completed the review and submitted my application for ${schemeTitle}. My application reference number is ${appRef}. What are the next steps?`;
        void handleSendMessageRef.current(followUpText);
      }
    });

    return cleanup;
  }, [activeConversation.id]);

  // Keep latest send message function reference ready for speech auto-submission
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  // Helper to format assistant response text with clean paragraphs and lists
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Bullet points
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-slate-800">
                <span className="text-amber-500 font-bold text-xs select-none">•</span>
                <span className="flex-1 font-normal">{trimmed.replace(/^[*•-]\s+/, '')}</span>
              </div>
            );
          }

          // Numbered list items: e.g. "1. ", "2. "
          const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numberedMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-slate-800">
                <span className="text-amber-600 font-semibold text-[11px] select-none">{numberedMatch[1]}.</span>
                <span className="flex-1 font-normal">{numberedMatch[2]}</span>
              </div>
            );
          }

          // Bold heading or category line
          return (
            <p key={idx} className="text-slate-800 font-normal">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  if (!isOpen && !isMinimized) return null;

  return (
    <aside 
      className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
        isMinimized ? 'translate-x-full pointer-events-none' : 'translate-x-0'
      }`}
      aria-label="JANSAATHI AI Assistant Panel"
      aria-hidden={isMinimized}
    >
      {/* Panel Header */}
      <div className="px-3 py-2.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 gap-1.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="shrink-0">
            <AssistantAvatar 
              state={isListening ? 'listening' : isLoading ? 'thinking' : isSpeaking ? 'speaking' : 'idle'} 
              size="sm" 
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">{t('assistant.title')}</h3>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                isListening 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : isLoading 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : isSpeaking
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {isListening ? 'Listening' : isLoading ? 'Thinking' : isSpeaking ? 'Speaking' : t('assistant.activeBadge')}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {activeConversation.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Voice Reply Setting Toggle */}
          <button
            type="button"
            id="voice-reply-toggle-btn"
            onClick={toggleVoiceReplies}
            title={voiceRepliesEnabled ? 'Voice Replies: ON (Click to disable)' : 'Voice Replies: OFF (Click to enable)'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              voiceRepliesEnabled 
                ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 hover:bg-emerald-900/60' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            aria-label={voiceRepliesEnabled ? 'Voice Replies ON' : 'Voice Replies OFF'}
          >
            {voiceRepliesEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Start New Conversation Button */}
          <button
            type="button"
            id="new-chat-btn"
            onClick={handleStartNewConversation}
            disabled={isLoading}
            title={t('assistant.newChat')}
            className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            aria-label={t('assistant.newChat')}
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Saved History Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen((prev) => !prev)}
            title={t('assistant.conversations')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
              isHistoryOpen 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            {conversations.length > 1 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {conversations.length}
              </span>
            )}
          </button>

          {/* Full Voice Avatar Modal Trigger */}
          <button
            type="button"
            id="panel-voice-modal-btn"
            onClick={onOpenVoiceModal}
            title={t('nav.voiceAssistant')}
            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Reset Current Conversation */}
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            title={t('assistant.resetChat')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Minimize Panel Button */}
          <button
            type="button"
            id="minimize-assistant-btn"
            onClick={onMinimize || onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Minimize Chatbot (−)"
            aria-label="Minimize JANSAATHI AI Chatbot"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Close Panel Button */}
          <button
            type="button"
            id="close-assistant-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={t('assistant.closePanel')}
            aria-label={t('assistant.closePanel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tricolor Ribbon Bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>

      {/* Saved Conversations Drawer / History Switcher */}
      {isHistoryOpen && (
        <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2 text-white animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300 pb-1 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('assistant.conversations')} ({conversations.length})</span>
            </div>
            <button
              type="button"
              onClick={handleStartNewConversation}
              className="flex items-center gap-1 text-[11px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{t('assistant.newChat')}</span>
            </button>
          </div>

          <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
            {conversations.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-2">{t('assistant.noConversations')}</p>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveId(conv.id);
                      setIsHistoryOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-slate-800 border border-amber-500/70 text-white shadow-xs' 
                        : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <div className="truncate">
                        <p className="truncate font-medium">{conv.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {conv.messages.length} messages
                        </p>
                      </div>
                    </div>
                    {conversations.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conv.id);
                        }}
                        title={t('assistant.deleteChat')}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Notice & Mode Banner */}
      <div className="px-3.5 py-1.5 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between text-[11px] text-amber-900">
        <div className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-medium truncate">{t('assistant.phaseNotice')}</span>
        </div>
        {!isAuthenticated && (
          <span className="px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900 text-[10px] font-bold shrink-0">
            {t('assistant.guestBadge')}
          </span>
        )}
      </div>

      {/* Chat Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] bg-slate-900 text-white p-3 rounded-2xl rounded-br-xs text-xs shadow-sm">
                  <p className="leading-relaxed">{msg.content}</p>
                  <span className="block text-[9px] text-slate-400 text-right mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          if (msg.sender === 'system') {
            return (
              <div 
                key={msg.id} 
                className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  msg.isError 
                    ? 'bg-rose-50/85 border-rose-200/80 text-rose-900' 
                    : 'bg-blue-50/85 border-blue-200/80 text-blue-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                  {msg.isError ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  ) : (
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                  <span>{msg.isError ? 'Service Notice' : 'System Notice'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{msg.content}</p>

                <div className="flex items-center gap-1 text-[9px] opacity-75 font-mono pt-1">
                  <Clock className="w-3 h-3" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex items-start gap-2.5">
              <AssistantAvatar state="idle" size="sm" />
              <div className="max-w-[85%] bg-white border border-slate-200/90 text-slate-800 p-3.5 rounded-2xl rounded-tl-xs text-xs shadow-sm space-y-1.5">
                {renderMessageContent(msg.content)}

                {/* Render interactive action cards if present */}
                {msg.clientActions && msg.clientActions.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.clientActions.map((action) => (
                      <ActionCard
                        key={action.id}
                        action={action}
                        onApprove={(act) => handleApproveAction(act, msg.id)}
                        onCancel={(act) => handleCancelAction(act, msg.id)}
                        onRetry={(act) => handleApproveAction(act, msg.id)}
                      />
                    ))}
                  </div>
                )}

                <span className="block text-[9px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Live Loading / Thinking Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
            <AssistantAvatar state="thinking" size="sm" />
            <div className="bg-white border border-slate-200/90 text-slate-700 p-3 rounded-2xl rounded-tl-xs text-xs shadow-sm flex items-center gap-2.5">
              <span className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.3s]"></span>
              </span>
              <span className="text-[11px] text-slate-600 font-medium">
                {t('assistant.thinkingStatus')}
              </span>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="pt-2">
          <p className="text-[11px] font-semibold text-slate-500 mb-2">{t('assistant.suggestedQueries')}</p>
          <div className="flex flex-col gap-1.5">
            {currentSuggestions.map((prompt, i) => (
              <button
                key={i}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(prompt)}
                className="text-left text-xs bg-white hover:bg-amber-50/60 disabled:opacity-50 disabled:hover:bg-white border border-slate-200/90 hover:border-amber-300 text-slate-700 hover:text-amber-950 p-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2">
        {/* Active Speech Recognition Banner */}
        {isListening && (
          <div id="chat-listening-banner" className="flex items-center justify-between px-3 py-1.5 bg-rose-50 border border-rose-300 text-rose-900 text-xs rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span className="font-bold">
                {language === 'Hindi' 
                  ? 'सुन रहे हैं (hi-IN)...' 
                  : language === 'Marathi' 
                  ? 'ऐकत आहोत (mr-IN)...' 
                  : 'Listening (en-IN)...'}
              </span>
              <span className="text-[11px] text-rose-700 hidden sm:inline">
                {language === 'Hindi' ? 'बोलना बंद करने पर स्वतः जमा होगा' : language === 'Marathi' ? 'बोलणे संपल्यावर आपोआप पाठवले जाईल' : 'Auto-submits when speech stops'}
              </span>
            </div>
            <button
              type="button"
              id="chat-stop-recording-button"
              onClick={stopListening}
              className="text-[11px] font-bold text-rose-800 bg-rose-200/80 hover:bg-rose-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
            >
              Stop Recording
            </button>
          </div>
        )}

        {/* Processing / Thinking Banner */}
        {isLoading && (
          <div id="chat-processing-banner" className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
            <span className="font-bold">
              {language === 'Hindi' 
                ? 'प्रसंस्करण हो रहा है (Gemini AI)...' 
                : language === 'Marathi' 
                ? 'प्रक्रिया सुरू आहे (Gemini AI)...' 
                : 'Processing response (Gemini AI)...'}
            </span>
          </div>
        )}

        {/* Active Speech Synthesis (Speaking) Banner */}
        {isSpeaking && (
          <div id="chat-speaking-banner" className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <span className="font-bold">
                {language === 'Hindi' 
                  ? 'बोल रहे हैं (hi-IN)...' 
                  : language === 'Marathi' 
                  ? 'बोलत आहोत (mr-IN)...' 
                  : 'Speaking reply (en-IN)...'}
              </span>
              <span className="text-[11px] text-emerald-700 hidden sm:inline">
                {language === 'Hindi' ? 'सुनने के लिए तैयार रहें' : language === 'Marathi' ? 'ऐकण्यासाठी तयार राहा' : 'Voice response in progress'}
              </span>
            </div>
            <button
              type="button"
              id="chat-stop-speaking-button"
              onClick={handleStopSpeaking}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-200/90 hover:bg-emerald-300 px-2.5 py-0.5 rounded cursor-pointer transition-colors shadow-2xs"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop Speaking</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Direct Speech-to-Text Microphone Button */}
          <button
            type="button"
            id="chat-mic-button"
            onClick={toggleVoiceInput}
            disabled={isLoading}
            title={isListening ? 'Stop voice input' : `Click to speak in ${language}`}
            className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 ring-2 ring-rose-300 animate-pulse'
                : 'bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-700 border-amber-200/80'
            }`}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              disabled={isLoading}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening to speech...' : isLoading ? t('assistant.thinkingStatus') : t('assistant.askPlaceholder')}
              className={`w-full text-xs border rounded-xl py-2.5 pl-3 pr-9 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all ${
                isListening ? 'bg-rose-50/40 border-rose-300' : 'bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 border-slate-300'
              }`}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>{t('assistant.pressEnter')}</span>
          <span className="flex items-center gap-1">
            <Bot className="w-3 h-3 text-emerald-600" />
            {t('assistant.readyBadge')}
          </span>
        </div>
      </div>
    </aside>
  );
};
