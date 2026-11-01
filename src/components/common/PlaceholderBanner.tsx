import React from 'react';
import { Sparkles, Info } from 'lucide-react';

export interface PlaceholderBannerProps {
  title: string;
  description: string;
  phase?: string;
  actionText?: string;
  onActionClick?: () => void;
  variant?: 'info' | 'accent' | 'compact';
  className?: string;
}

export const PlaceholderBanner: React.FC<PlaceholderBannerProps> = ({
  title,
  description,
  phase = 'Phase 2 Architecture Integration',
  actionText,
  onActionClick,
  variant = 'info',
  className = ''
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between gap-3 px-3.5 py-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium">{title}</span>
          <span className="text-amber-700 hidden sm:inline">— {description}</span>
        </div>
        <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md shrink-0">
          {phase}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${variant === 'accent' ? 'bg-gradient-to-r from-amber-50/80 via-white to-emerald-50/80 border-slate-200' : 'bg-slate-50 border-slate-200'} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700 shadow-2xs shrink-0">
          <Info className="w-4 h-4 text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-sm">
              {phase}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {description}
          </p>
          {actionText && (
            <button
              type="button"
              onClick={onActionClick}
              className="mt-2 text-xs font-semibold text-slate-900 hover:text-amber-600 underline underline-offset-2 transition-colors cursor-pointer"
            >
              {actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
