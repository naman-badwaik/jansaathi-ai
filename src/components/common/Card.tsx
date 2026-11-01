import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  accent?: 'none' | 'saffron' | 'green' | 'navy';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  accent = 'none'
}) => {
  const accentClasses = {
    none: '',
    saffron: 'border-t-4 border-t-amber-500',
    green: 'border-t-4 border-t-emerald-600',
    navy: 'border-t-4 border-t-slate-900'
  };

  const hoverClasses = hoverEffect 
    ? 'hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer' 
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden ${accentClasses[accent]} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => (
  <div className={`p-5 pb-4 flex items-start justify-between gap-4 border-b border-slate-100 ${className}`}>
    <div className="flex items-start gap-3">
      {icon && (
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 shrink-0">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-slate-900 text-base leading-snug">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-4 px-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 ${className}`}>
    {children}
  </div>
);
