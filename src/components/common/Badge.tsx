import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'navy' | 'saffron' | 'green' | 'blue' | 'amber' | 'slate' | 'purple' | 'red';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  icon,
  className = ''
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium'
  };

  const variantStyles = {
    navy: 'bg-slate-900/10 text-slate-900 border border-slate-900/15',
    saffron: 'bg-amber-50 text-amber-900 border border-amber-200/80',
    green: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    blue: 'bg-blue-50 text-blue-800 border border-blue-200/80',
    amber: 'bg-amber-50 text-amber-800 border border-amber-300',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    purple: 'bg-purple-50 text-purple-800 border border-purple-200',
    red: 'bg-rose-50 text-rose-800 border border-rose-200'
  };

  return (
    <span className={`inline-flex items-center rounded-full tracking-wide transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
