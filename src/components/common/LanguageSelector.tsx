import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import type { SupportedLanguage } from '../../types';

export interface LanguageSelectorProps {
  className?: string;
  onLanguageChangeNotification?: (lang: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '',
  onLanguageChangeNotification
}) => {
  const { language, setLanguage } = useTranslation();

  const languages: { key: SupportedLanguage; label: string; native: string; short: string }[] = [
    { key: 'Hindi', label: 'Hindi', native: 'हिंदी', short: 'हि' },
    { key: 'English', label: 'English', native: 'English', short: 'EN' },
    { key: 'Marathi', label: 'Marathi', native: 'मराठी', short: 'म' }
  ];

  const handleSelect = (langKey: SupportedLanguage) => {
    setLanguage(langKey);
    if (onLanguageChangeNotification) {
      onLanguageChangeNotification(langKey);
    }
  };

  return (
    <div 
      className={`inline-flex items-center gap-1 p-1 bg-slate-100/90 hover:bg-slate-100 rounded-xl border border-slate-200/90 shadow-2xs transition-colors ${className}`}
      role="group"
      aria-label="Select Interface Language"
    >
      <div className="flex items-center gap-1 pl-1.5 pr-1 text-slate-500 hidden sm:flex shrink-0">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <div className="flex items-center gap-0.5">
        {languages.map((lang) => {
          const isActive = language === lang.key;
          return (
            <button
              key={lang.key}
              type="button"
              onClick={() => handleSelect(lang.key)}
              aria-pressed={isActive}
              title={`${lang.label} (${lang.native})`}
              className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-150 select-none cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <span className="sm:hidden">{lang.short}</span>
              <span className="hidden sm:inline">
                {lang.key === 'English' ? 'English' : lang.native}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
