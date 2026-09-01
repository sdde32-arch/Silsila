import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'neutral';
  trend?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  variant = 'neutral',
  trend,
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-[#ECFDF5] border-[#10B981]/20 text-[#059669]',
    amber: 'bg-[#FEF7DA] border-[#F59E0B]/20 text-[#D97706]',
    rose: 'bg-[#FFF1F2] border-[#F43F5E]/20 text-[#E11D48]',
    indigo: 'bg-[#EEF2FF] border-[#6366F1]/20 text-[#4F46E5]',
    neutral: 'bg-[#FAF9F5] border-slate-100 text-slate-700',
  };

  const valueColors = {
    emerald: 'text-[#059669]',
    amber: 'text-[#D97706]',
    rose: 'text-[#E11D48]',
    indigo: 'text-[#4F46E5]',
    neutral: 'text-slate-900',
  };

  return (
    <div
      className={`p-4 rounded-2xl border text-center transition-all ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
          {label}
        </span>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-center gap-1">
        <span className={`text-2xl font-extrabold tracking-tight ${valueColors[variant]}`}>
          {value}
        </span>
        {unit && <span className="text-xs font-bold text-slate-400">{unit}</span>}
      </div>

      {trend && (
        <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
          {trend}
        </span>
      )}
    </div>
  );
};
