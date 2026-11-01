import { useState, useRef, useCallback, useEffect } from 'react';
import type { SupportedLanguage } from '../types';
import { 
  startSpeechRecognition, 
  isSpeechRecognitionSupported,
  type SpeechErrorDetail, 
  type SpeechSessionController 
} from './speechService';

export interface UseSpeechInputOptions {
  language: SupportedLanguage | string;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onFinalTranscript?: (finalTranscript: string) => void;
  onShowToast?: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export interface UseSpeechInputReturn {
  isListening: boolean;
  transcript: string;
  error: SpeechErrorDetail | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  abortListening: () => void;
  toggleListening: () => void;
  clearTranscript: () => void;
}

export function useSpeechInput({
  language,
  onTranscript,
  onFinalTranscript,
  onShowToast
}: UseSpeechInputOptions): UseSpeechInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<SpeechErrorDetail | null>(null);

  const controllerRef = useRef<SpeechSessionController | null>(null);
  const hasSubmittedRef = useRef(false);
  const lastFinalTranscriptRef = useRef('');
  const latestTranscriptRef = useRef('');

  const isSupported = isSpeechRecognitionSupported();

  // Abort and stop listening cleanly when component unmounts
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, []);

  // Explicit cancellation without submission (e.g. panel close or reset)
  const abortListening = useCallback(() => {
    hasSubmittedRef.current = true;
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setIsListening(false);
  }, []);

  // When citizen clicks Stop Recording: immediately finalize and submit transcript
  const stopListening = useCallback(() => {
    const clean = (lastFinalTranscriptRef.current || latestTranscriptRef.current).trim();

    if (controllerRef.current) {
      controllerRef.current.stop();
      controllerRef.current = null;
    }
    setIsListening(false);

    // Automatically submit finalized transcript (only once per session, never empty)
    if (clean && !hasSubmittedRef.current && onFinalTranscript) {
      hasSubmittedRef.current = true;
      lastFinalTranscriptRef.current = '';
      latestTranscriptRef.current = '';
      onFinalTranscript(clean);
    }
  }, [onFinalTranscript]);

  const startListening = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    setError(null);
    hasSubmittedRef.current = false;
    lastFinalTranscriptRef.current = '';
    latestTranscriptRef.current = '';
    setTranscript('');

    const controller = startSpeechRecognition({
      language,
      continuous: false,
      interimResults: true,
      onStart: () => {
        setIsListening(true);
        const langLabel = language === 'Hindi' ? 'हिंदी' : language === 'Marathi' ? 'मराठी' : 'English';
        onShowToast?.(
          'Microphone Active',
          `Listening for voice input in ${langLabel} (${language === 'Hindi' ? 'hi-IN' : language === 'Marathi' ? 'mr-IN' : 'en-IN'}). Speak now...`,
          'info'
        );
      },
      onResult: (result) => {
        latestTranscriptRef.current = result.transcript;
        setTranscript(result.transcript);
        onTranscript?.(result.transcript, result.isFinal);

        if (result.isFinal) {
          lastFinalTranscriptRef.current = result.transcript;
          setIsListening(false);

          // Automatic submission of final transcript if not already submitted
          const clean = result.transcript.trim();
          if (clean && !hasSubmittedRef.current && onFinalTranscript) {
            hasSubmittedRef.current = true;
            onFinalTranscript(clean);
          }
        }
      },
      onError: (errDetail) => {
        hasSubmittedRef.current = true; // Guard against error-triggered submission
        setIsListening(false);
        controllerRef.current = null;
        if (errDetail.code !== 'aborted') {
          setError(errDetail);
          onShowToast?.(
            errDetail.message,
            errDetail.actionableHint || 'Please check your microphone and try again.',
            'warning'
          );
        }
      },
      onEnd: () => {
        setIsListening(false);
        controllerRef.current = null;

        // Fallback: if recognition ended naturally or on silence with captured speech
        const clean = (lastFinalTranscriptRef.current || latestTranscriptRef.current).trim();
        if (clean && !hasSubmittedRef.current && onFinalTranscript) {
          hasSubmittedRef.current = true;
          lastFinalTranscriptRef.current = '';
          latestTranscriptRef.current = '';
          onFinalTranscript(clean);
        }
      }
    });

    if (controller) {
      controllerRef.current = controller;
    }
  }, [language, onTranscript, onFinalTranscript, onShowToast]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, stopListening, startListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    lastFinalTranscriptRef.current = '';
    latestTranscriptRef.current = '';
    hasSubmittedRef.current = false;
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    abortListening,
    toggleListening,
    clearTranscript
  };
}
