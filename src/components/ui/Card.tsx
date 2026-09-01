import React from 'react';

export type CardVariant =
  | 'default'
  | 'elevated'
  | 'subtle'
  | 'interactive'
  | 'selected'
  | 'completed'
  | 'accentWarm'
  | 'accentIndigo'
  | 'accentEmerald';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-3xl transition-all duration-200';

  const paddingStyles: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles: Record<CardVariant, string> = {
    default:
      'bg-white dark:bg-[#0E121B] border border-slate-100/90 dark:border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)]',
    elevated:
      'bg-white dark:bg-[#141A26] border border-slate-100 dark:border-zinc-700/80 shadow-[0_12px_36px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.7)]',
    subtle:
      'bg-[#FAF9F5] dark:bg-[#0E121B]/70 border border-slate-100/80 dark:border-zinc-800/60',
    interactive:
      'bg-white dark:bg-[#0E121B] border border-slate-100/90 dark:border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:border-slate-300 dark:hover:border-zinc-600 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer',
    selected:
      'bg-[#EEF2FF] dark:bg-indigo-950/50 border-2 border-[#6366F1] dark:border-indigo-500 shadow-[0_8px_30px_rgba(99,102,241,0.08)] dark:shadow-[0_8px_24px_rgba(99,102,241,0.2)]',
    completed:
      'bg-[#ECFDF5] dark:bg-emerald-950/40 border border-[#10B981]/30 dark:border-emerald-500/50 shadow-xs',
    accentWarm:
      'bg-gradient-to-b from-[#FEF7DA] via-[#FEF9E7] to-[#FFFFFF] dark:from-amber-950/40 dark:via-[#0E121B] dark:to-[#0E121B] border border-[#F59E0B]/20 dark:border-amber-500/30 shadow-[0_8px_30px_rgba(245,158,11,0.05)]',
    accentIndigo:
      'bg-gradient-to-b from-[#EEF2FF] via-[#F5F7FF] to-[#FFFFFF] dark:from-indigo-950/40 dark:via-[#0E121B] dark:to-[#0E121B] border border-[#6366F1]/20 dark:border-indigo-500/30 shadow-[0_8px_30px_rgba(99,102,241,0.05)]',
    accentEmerald:
      'bg-gradient-to-b from-[#ECFDF5] via-[#F2FCF8] to-[#FFFFFF] dark:from-emerald-950/40 dark:via-[#0E121B] dark:to-[#0E121B] border border-[#10B981]/20 dark:border-emerald-500/30 shadow-[0_8px_30px_rgba(16,185,129,0.05)]',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:shadow-md active:scale-[0.99]'
    : '';

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
