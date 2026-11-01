/**
 * JANSAATHI AI — Speech Synthesis (Text-to-Speech) Service
 * 
 * Synthesizes AI assistant responses into audible spoken voice using browser SpeechSynthesis API.
 * Supports Hindi (hi-IN), Marathi (mr-IN), and Indian English (en-IN).
 * 
 * Key Chrome & Windows SAPI Optimizations:
 * 1. User activation unlock: primed synchronously on user clicks (mic, send, toggle) to bypass Chrome autoplay restrictions.
 * 2. Voice resolution & fallback: finds matching regional voice or gracefully falls back to available voice with aligned lang.
 * 3. Garbage collection protection: keeps active utterances in memory to prevent V8 from prematurely terminating speech.
 * 4. Sentence chunking: breaks long responses into natural speech chunks under 180 characters to prevent Windows SAPI stalling.
 * 5. Chrome keepalive timer: prevents Chromium's 15-second speech silence timeout.
 * 6. Explicit start/end event sequencing: Speaking state only appears when audio playback actually starts.
 */

import type { SupportedLanguage } from '../types';
import { getSpeechLanguageCode, type SpeechLanguageCode } from './speechService';

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
  rate?: number;
  pitch?: number;
}

export interface SpeechPlaybackController {
  stop: () => void;
}

// Module-level strong reference anchor to prevent Chromium V8 garbage collection during speech
const activeUtterances = new Set<SpeechSynthesisUtterance>();

// Keepalive timer for Chromium 15-second pause bug
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

// Controller for currently active playback session
let currentController: SpeechPlaybackController | null = null;

function startKeepAlive(): void {
  stopKeepAlive();
  if (typeof window === 'undefined') return;
  keepAliveTimer = setInterval(() => {
    try {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        stopKeepAlive();
      }
    } catch {
      stopKeepAlive();
    }
  }, 10000);
}

function stopKeepAlive(): void {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

/**
 * Checks if SpeechSynthesis API is supported in current browser
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Unlocks Chrome speech synthesis by priming the audio context inside a direct user gesture (click/touch).
 * Call this in mic click, send button, or voice reply toggle handlers.
 */
export function unlockSpeechSynthesis(): void {
  if (!isSpeechSynthesisSupported()) return;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    // Speak a micro-silent utterance within user activation to unlock Chrome audio
    const unlockUtterance = new SpeechSynthesisUtterance('');
    unlockUtterance.volume = 0;
    unlockUtterance.rate = 10;
    window.speechSynthesis.speak(unlockUtterance);
    console.debug('[JANSAATHI TTS] Audio context primed via user activation.');
  } catch (err) {
    console.debug('[JANSAATHI TTS] Speech unlock notice:', err);
  }
}

/**
 * Cleans markdown formatting, links, and code blocks for smooth natural speech synthesis
 */
export function cleanTextForSpeech(markdown: string): string {
  if (!markdown) return '';

  return markdown
    // Remove markdown code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove headers #, ##, ###
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italics **text** or *text* or __text__
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove list bullets -, *, +
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // Remove blockquotes >
    .replace(/^>\s+/gm, '')
    // Remove multiple newlines with single space/period
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    // Collapse redundant spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Splits text into natural sentence chunks under maxChunkLength characters
 * Prevents Chrome / Windows SAPI from stalling on large multi-paragraph responses
 */
export function splitTextIntoSpeechChunks(text: string, maxChunkLength = 160): string[] {
  if (!text) return [];

  // Match sentences ending in '.', '!', '?', Indic danda '।', or line breaks
  const rawSentences = text.match(/[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g) || [text];
  const chunks: string[] = [];

  for (const raw of rawSentences) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxChunkLength) {
      chunks.push(trimmed);
    } else {
      // Split on punctuation or spaces if sentence exceeds maxChunkLength
      const words = trimmed.split(' ');
      let current = '';
      for (const word of words) {
        if ((current + ' ' + word).trim().length <= maxChunkLength) {
          current = (current + ' ' + word).trim();
        } else {
          if (current) chunks.push(current);
          current = word;
        }
      }
      if (current) chunks.push(current);
    }
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Resolves the best available speech synthesis voice for the requested language.
 * Ensures the selected voice exists, with graceful fallback to available voices.
 * Aligns the utterance language with the chosen voice to prevent synthesizer silence.
 */
export function resolveVoiceAndLanguage(language: SupportedLanguage | string): {
  voice: SpeechSynthesisVoice | null;
  lang: string;
} {
  if (!isSpeechSynthesisSupported()) {
    return { voice: null, lang: 'en-US' };
  }

  const targetLang: SpeechLanguageCode = getSpeechLanguageCode(language); // 'hi-IN' | 'mr-IN' | 'en-IN'
  const langPrefix = targetLang.split('-')[0].toLowerCase(); // 'hi' | 'mr' | 'en'

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    return { voice: null, lang: targetLang };
  }

  const norm = (code: string) => code.replace('_', '-').toLowerCase();

  // 1. Exact BCP-47 match (e.g. hi-IN, mr-IN, en-IN)
  let matchedVoice = voices.find((v) => norm(v.lang) === norm(targetLang));

  // 2. Language prefix match (e.g. 'hi' for 'hi-IN')
  if (!matchedVoice) {
    matchedVoice = voices.find((v) => norm(v.lang).startsWith(langPrefix));
  }

  // 3. Name-based match (e.g. voices named "Hindi", "Marathi", "India")
  if (!matchedVoice) {
    matchedVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      if (langPrefix === 'hi') return name.includes('hindi') || name.includes('हिन्दी') || name.includes('india');
      if (langPrefix === 'mr') return name.includes('marathi') || name.includes('मराठी') || name.includes('hindi') || name.includes('india');
      if (langPrefix === 'en') return name.includes('india') || name.includes('indian') || name.includes('en-in');
      return false;
    });
  }

  // 4. Indic regional fallback (any Indian voice)
  if (!matchedVoice && (langPrefix === 'hi' || langPrefix === 'mr')) {
    matchedVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const l = norm(v.lang);
      return l.endsWith('-in') || name.includes('india');
    });
  }

  // 5. Fallback to default voice or first available voice in Chrome
  if (!matchedVoice) {
    matchedVoice = voices.find((v) => v.default) || voices[0] || null;
  }

  // Align language code: if a voice is assigned, use its language code so Windows SAPI doesn't mute
  const effectiveLang = matchedVoice ? matchedVoice.lang : targetLang;

  return { voice: matchedVoice, lang: effectiveLang };
}

/**
 * Backward compatibility alias for resolveVoiceAndLanguage
 */
export function getBestVoiceForLanguage(language: SupportedLanguage | string): SpeechSynthesisVoice | null {
  return resolveVoiceAndLanguage(language).voice;
}

/**
 * Cancels any active speech synthesis playback immediately
 */
export function stopSpeech(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    stopKeepAlive();
    activeUtterances.clear();
    if (currentController) {
      currentController.stop();
      currentController = null;
    }
    window.speechSynthesis.cancel();
    console.debug('[JANSAATHI TTS] Speech playback stopped and cancelled.');
  } catch (err) {
    console.warn('[JANSAATHI TTS] SpeechSynthesis cancel notice:', err);
  }
}

/**
 * Speaks the given text aloud using Chrome-optimized sentence chunking and event sequencing.
 * - Does not trigger onStart until the first audio chunk actually starts speaking.
 * - Chains sentence chunks sequentially to guarantee reliable speech without timeout.
 */
export function speakText(
  text: string,
  language: SupportedLanguage | string,
  options?: SpeakOptions
): SpeechPlaybackController | null {
  if (!isSpeechSynthesisSupported()) {
    console.warn('[JANSAATHI TTS] SpeechSynthesis not supported in this browser environment.');
    options?.onError?.(new Error('SpeechSynthesis not supported'));
    return null;
  }

  // Cancel any prior speech first
  stopSpeech();

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) {
    options?.onEnd?.();
    return null;
  }

  // Break clean text into manageable chunks
  const chunks = splitTextIntoSpeechChunks(cleanText, 160);
  if (chunks.length === 0) {
    options?.onEnd?.();
    return null;
  }

  const { voice, lang } = resolveVoiceAndLanguage(language);

  console.info('[JANSAATHI TTS] speakText initiated:', {
    language,
    assignedLang: lang,
    voiceName: voice?.name || 'Default Browser Voice',
    chunksCount: chunks.length,
    totalLength: cleanText.length
  });

  let isTerminated = false;
  let currentChunkIdx = 0;
  let hasTriggeredStart = false;

  const playbackController: SpeechPlaybackController = {
    stop: () => {
      if (isTerminated) return;
      isTerminated = true;
      stopKeepAlive();
      activeUtterances.clear();
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel errors
      }
      options?.onEnd?.();
    }
  };

  currentController = playbackController;

  const playChunk = (index: number) => {
    if (isTerminated || index >= chunks.length) {
      isTerminated = true;
      stopKeepAlive();
      activeUtterances.clear();
      currentController = null;
      options?.onEnd?.();
      return;
    }

    try {
      const chunkText = chunks[index];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = lang;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = options?.pitch ?? 1.0;

      // Keep strong reference in Set to prevent V8 garbage collection
      activeUtterances.add(utterance);

      utterance.onstart = () => {
        if (isTerminated) return;
        if (!hasTriggeredStart) {
          hasTriggeredStart = true;
          startKeepAlive();
          console.info('[JANSAATHI TTS] Audio playback started for chunk 0.');
          options?.onStart?.();
        }
      };

      utterance.onend = () => {
        activeUtterances.delete(utterance);
        if (isTerminated) return;
        console.debug(`[JANSAATHI TTS] Chunk ${index + 1}/${chunks.length} completed.`);
        currentChunkIdx += 1;
        playChunk(currentChunkIdx);
      };

      utterance.onerror = (e) => {
        activeUtterances.delete(utterance);
        console.warn(`[JANSAATHI TTS] Utterance error on chunk ${index}:`, e.error);
        if (isTerminated) return;

        // Ignore natural cancellations and interruptions
        if (e.error === 'interrupted' || e.error === 'canceled') {
          isTerminated = true;
          stopKeepAlive();
          options?.onEnd?.();
        } else {
          // If error on chunk, try proceeding to next chunk or finish gracefully
          currentChunkIdx += 1;
          if (currentChunkIdx < chunks.length) {
            playChunk(currentChunkIdx);
          } else {
            isTerminated = true;
            stopKeepAlive();
            options?.onError?.(e);
            options?.onEnd?.();
          }
        }
      };

      // Ensure Chrome speech synthesis is not in paused state
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('[JANSAATHI TTS] playChunk invocation error:', err);
      isTerminated = true;
      stopKeepAlive();
      activeUtterances.clear();
      options?.onError?.(err);
      options?.onEnd?.();
    }
  };

  // Start with chunk 0
  playChunk(0);

  return playbackController;
}
