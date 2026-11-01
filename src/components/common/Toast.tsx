import React, { useEffect } from 'react';
import { Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  message: string;
}

export interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const icons = {
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
  };

  const bgStyles = {
    info: 'border-blue-200 bg-white/95 text-slate-800 shadow-xl',
    success: 'border-emerald-200 bg-white/95 text-slate-800 shadow-xl',
    warning: 'border-amber-200 bg-white/95 text-slate-800 shadow-xl'
  };

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-5 duration-200 px-4 sm:px-0 pointer-events-none">
      <div className={`p-4 rounded-xl border backdrop-blur-md flex items-start gap-3 shadow-lg pointer-events-auto ${bgStyles[toast.type]}`}>
        {icons[toast.type]}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-900">{toast.title}</p>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
