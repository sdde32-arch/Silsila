import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  color?: 'emerald' | 'amber' | 'indigo' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  showPercent = false,
  color = 'gradient',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const colorStyles = {
    emerald: 'bg-[#10B981]',
    amber: 'bg-[#F59E0B]',
    indigo: 'bg-[#6366F1]',
    gradient: 'bg-gradient-to-r from-[#F59E0B] via-[#6366F1] to-[#10B981]',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || sublabel || showPercent) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            {label && <span className="text-slate-800 font-bold">{label}</span>}
            {sublabel && <span className="text-slate-400 font-normal">{sublabel}</span>}
          </div>
          {showPercent && (
            <span className="text-slate-700 font-bold">{percentage}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-slate-100/90 rounded-full overflow-hidden ${sizeStyles[size]}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-400 ease-out ${colorStyles[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
