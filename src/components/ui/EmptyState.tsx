import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-3xl p-8 border border-slate-100/90 text-center flex flex-col items-center justify-center space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ${className}`}
    >
      <div className="w-16 h-16 rounded-3xl bg-[#FEF7DA] text-[#D97706] flex items-center justify-center shadow-xs border border-[#F59E0B]/20">
        {icon}
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
