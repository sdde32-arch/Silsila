import React from 'react';

export type BadgeVariant =
  | 'brand'
  | 'accent'
  | 'warm'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-bold uppercase tracking-wider rounded-full select-none whitespace-nowrap gap-1';

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-2.5 py-1 text-[10px]',
  };

  const variantStyles: Record<BadgeVariant, string> = {
    brand: 'bg-[#0F172A] text-white',
    accent: 'bg-[#EEF2FF] text-[#4F46E5] border border-[#6366F1]/20',
    warm: 'bg-[#FEF7DA] text-[#D97706] border border-[#F59E0B]/20',
    success: 'bg-[#ECFDF5] text-[#059669] border border-[#10B981]/20',
    warning: 'bg-[#FEF7DA] text-[#D97706] border border-[#F59E0B]/20',
    error: 'bg-[#FFF1F2] text-[#E11D48] border border-[#F43F5E]/20',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/50',
    outline: 'bg-white text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
