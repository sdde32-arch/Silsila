import React from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-end justify-between gap-3 px-1 ${className}`}>
      <div className="space-y-0.5">
        {eyebrow && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            {eyebrow}
          </span>
        )}
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
