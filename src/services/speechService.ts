/**
 * JANSAATHI AI — Web Speech API Recognition Service
 * 
 * Provides robust, cross-browser speech-to-text recognition supporting
 * Hindi (hi-IN), Marathi (mr-IN), and Indian English (en-IN).
 * Handles permissions, hardware detection, interim speech results, and localized error messages.
 */

import type { SupportedLanguage } from '../types';

export type SpeechLanguageCode = 'hi-IN' | 'mr-IN' | 'en-IN';

export interface SpeechRecognitionResultItem {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export type SpeechErrorCode = 
  | 'not-allowed'
  | 'audio-capture'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'not-supported'
  | 'service-not-allowed'
  | 'unknown';

export interface SpeechErrorDetail {
  code: SpeechErrorCode;
  message: string;
  actionableHint: string;
}

// Browser Web Speech API type definitions for TypeScript without using `any`
interface IWindowSpeech {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

export interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
}

/**
 * Maps application SupportedLanguage ('Hindi' | 'English' | 'Marathi') to BCP-47 language tag
 */
export function getSpeechLanguageCode(language: SupportedLanguage | string): SpeechLanguageCode {
  if (language === 'Hindi' || language === 'hi' || language === 'hi-IN') {
    return 'hi-IN';
  }
  if (language === 'Marathi' || language === 'mr' || language === 'mr-IN') {
    return 'mr-IN';
  }
  return 'en-IN';
}

/**
 * Checks if the Web Speech Recognition API is supported in the current browser
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindowSpeech;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Resolves the native SpeechRecognition constructor
 */
function getSpeechRecognitionConstructor(): (new () => ISpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as IWindowSpeech;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

/**
 * Maps standard speech recognition errors to clear, localized explanations and actionable hints
 */
export function getSpeechErrorDetail(errorCode: string, language: SupportedLanguage | string): SpeechErrorDetail {
  switch (errorCode) {
    case 'not-allowed':
    case 'permission-denied':
      return {
        code: 'not-allowed',
        message: language === 'Hindi'
          ? 'माइक्रोफ़ोन अनुमति अस्वीकृत (Permission Denied)'
          : language === 'Marathi'
          ? 'मायक्रोफोन परवानगी नाकारली (Permission Denied)'
          : 'Microphone permission was denied',
        actionableHint: language === 'Hindi'
          ? 'कृपया ब्राउज़र के एड्रेस बार में लॉक/माइक आइकन पर क्लिक करें और "Allow Microphone" चुनें।'
          : language === 'Marathi'
          ? 'कृपया ब्राउझर अॅड्रेस बारमधील माइक चिन्हावर क्लिक करा आणि मायक्रोफोन चालू करा.'
          : 'Please click the lock/microphone icon in the browser address bar and enable microphone access.'
      };

    case 'audio-capture':
      return {
        code: 'audio-capture',
        message: language === 'Hindi'
          ? 'माइक्रोफ़ोन डिवाइस उपलब्ध नहीं है (No Microphone Found)'
          : language === 'Marathi'
          ? 'मायक्रोफोन उपलब्ध नाही (No Microphone Found)'
          : 'No microphone input device detected',
        actionableHint: language === 'Hindi'
          ? 'जांचें कि आपका माइक्रोफ़ोन सही से जुड़ा हुआ है और किसी अन्य ऐप द्वारा उपयोग में नहीं है।'
          : language === 'Marathi'
          ? 'मायक्रोफोन व्यवस्थित जोडलेला असल्याची खात्री करा.'
          : 'Ensure an audio input device is connected and not muted or claimed exclusively by another application.'
      };

    case 'no-speech':
      return {
        code: 'no-speech',
        message: language === 'Hindi'
          ? 'कोई आवाज़ नहीं सुनी गई (No Speech Detected)'
          : language === 'Marathi'
          ? 'कोणताही आवाज ऐकू आला नाही (No Speech Detected)'
          : 'No speech was detected',
        actionableHint: language === 'Hindi'
          ? 'कृपया माइक के पास आकर स्पष्ट आवाज़ में बोलें और पुनः प्रयास करें।'
          : language === 'Marathi'
          ? 'कृपया मायक्रोफोनजवळ येऊन स्पष्ट बोला.'
          : 'Speak clearly into your microphone, or try adjusting your microphone input level.'
      };

    case 'network':
      return {
        code: 'network',
        message: language === 'Hindi'
          ? 'नेटवर्क समस्या (Speech Service Network Error)'
          : language === 'Marathi'
          ? 'नेटवर्क त्रुटी (Speech Service Network Error)'
          : 'Speech recognition network error',
        actionableHint: language === 'Hindi'
          ? 'ब्राउज़र स्पीच सेवा से कनेक्ट नहीं हो सका। कृपया इंटरनेट कनेक्शन जांचें।'
          : language === 'Marathi'
          ? 'कृपया इंटरनेट कनेक्शन तपासा.'
          : 'Web Speech API failed to connect to recognition server. Check network connection.'
      };

    case 'aborted':
      return {
        code: 'aborted',
        message: language === 'Hindi'
          ? 'वाक् इनपुट रोका गया'
          : language === 'Marathi'
          ? 'आवाज रेकॉर्डिंग थांबवले'
          : 'Voice input stopped',
        actionableHint: ''
      };

    case 'not-supported':
      return {
        code: 'not-supported',
        message: language === 'Hindi'
          ? 'ब्राउज़र में स्पीच पहचान समर्थित नहीं है'
          : language === 'Marathi'
          ? 'या ब्राउझरमध्ये व्हॉइस इनपुट समर्थित नाही'
          : 'Web Speech API is not supported in this browser',
        actionableHint: language === 'Hindi'
          ? 'कृपया Google Chrome या Microsoft Edge ब्राउज़र का उपयोग करें।'
          : language === 'Marathi'
          ? 'कृपया Google Chrome किंवा Microsoft Edge वापरा.'
          : 'Please use Google Chrome or Microsoft Edge for native Indian language speech recognition.'
      };

    default:
      return {
        code: 'unknown',
        message: language === 'Hindi'
          ? `वाक् इनपुट त्रुटि: ${errorCode}`
          : language === 'Marathi'
          ? `आवाज ओळख त्रुटी: ${errorCode}`
          : `Speech recognition error: ${errorCode}`,
        actionableHint: 'Try speaking again or type your message.'
      };
  }
}

export interface SpeechSessionController {
  stop: () => void;
  abort: () => void;
}

export interface StartSpeechRecognitionOptions {
  language: SupportedLanguage | string;
  continuous?: boolean;
  interimResults?: boolean;
  onStart?: () => void;
  onResult?: (item: SpeechRecognitionResultItem) => void;
  onError?: (error: SpeechErrorDetail) => void;
  onEnd?: () => void;
}

/**
 * Initiates speech recognition session with configured language and error handling
 */
export function startSpeechRecognition(options: StartSpeechRecognitionOptions): SpeechSessionController | null {
  if (!isSpeechRecognitionSupported()) {
    const errorDetail = getSpeechErrorDetail('not-supported', options.language);
    options.onError?.(errorDetail);
    return null;
  }

  const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();
  if (!SpeechRecognitionConstructor) {
    const errorDetail = getSpeechErrorDetail('not-supported', options.language);
    options.onError?.(errorDetail);
    return null;
  }

  try {
    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = getSpeechLanguageCode(options.language);
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = 1;

    let isManuallyStopped = false;

    recognition.onstart = () => {
      options.onStart?.();
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const activeText = (finalTranscript || interimTranscript).trim();
      if (activeText) {
        options.onResult?.({
          transcript: activeText,
          isFinal: Boolean(finalTranscript && !interimTranscript)
        });
      }
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      if (isManuallyStopped && (event.error === 'aborted' || event.error === 'no-speech')) {
        return;
      }
      const detail = getSpeechErrorDetail(event.error, options.language);
      options.onError?.(detail);
    };

    recognition.onend = () => {
      options.onEnd?.();
    };

    recognition.start();

    return {
      stop: () => {
        isManuallyStopped = true;
        try {
          recognition.stop();
        } catch {
          // Ignore state race condition
        }
      },
      abort: () => {
        isManuallyStopped = true;
        try {
          recognition.abort();
        } catch {
          // Ignore state race condition
        }
      }
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const detail = getSpeechErrorDetail(message, options.language);
    options.onError?.(detail);
    return null;
  }
}
