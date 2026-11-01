import React from 'react';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'dark',
  showTagline = false
}) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Emblem Emblematic Chakra / Modern Shield */}
      <div 
        className={`${iconSizes[size]} relative rounded-xl bg-slate-900 border border-slate-700/80 shadow-md flex items-center justify-center overflow-hidden shrink-0 group`}
      >
        {/* Subtle Tricolor Ribbon Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>
        
        {/* Modern Stylized Chakra Motif */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-5 h-5 text-amber-500 group-hover:rotate-45 transition-transform duration-500" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" className="text-white" />
          <circle cx="12" cy="12" r="3" fill="#ea580c" stroke="none" />
          <path d="M12 3v6M12 15v6M3 12h6M15 12h6" stroke="#f97316" strokeWidth="1.2" />
          <path d="M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2" stroke="#16a34a" strokeWidth="1.2" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-black tracking-tight ${titleSizes[size]} ${isDark ? 'text-slate-900' : 'text-white'}`}>
            JANSAATHI
          </span>
          <span className="font-extrabold text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-600 to-orange-600 text-white tracking-widest shadow-2xs">
            AI
          </span>
          <span className={`text-[11px] font-medium hidden sm:inline ml-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            जनसाथी
          </span>
        </div>
        {showTagline && (
          <span className={`text-[11px] font-medium tracking-tight ${isDark ? 'text-slate-500' : 'text-slate-300'}`}>
            Government services, made simpler for everyone.
          </span>
        )}
      </div>
    </div>
  );
};
