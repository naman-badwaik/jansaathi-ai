import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';

const STORAGE_KEY = 'jansaathi_language';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (keyPath: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to access nested object properties via dot-notation: e.g. "landing.heroTitlePrefix"
function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const parts = path.split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'Hindi' || saved === 'English' || saved === 'Marathi') {
        return saved;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return 'English';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage errors
    }
  };

  // Sync state if localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (e.newValue === 'Hindi' || e.newValue === 'English' || e.newValue === 'Marathi') {
          setLanguageState(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = (keyPath: string, fallback?: string): string => {
    const activeDict = translations[language];
    const englishDict = translations['English'];

    const translated = getNestedValue(activeDict, keyPath);
    if (translated !== undefined) {
      return translated;
    }

    // Fallback to English dictionary
    const fallbackEnglish = getNestedValue(englishDict, keyPath);
    if (fallbackEnglish !== undefined) {
      return fallbackEnglish;
    }

    // Final fallback to provided default or keyPath
    return fallback || keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
