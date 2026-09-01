import React from 'react';

export const LoadingSkeleton: React.FC<{ className?: string; count?: number }> = ({
  className = '',
  count = 1,
}) => {
  return (
    <div className={`space-y-3 w-full animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-200/70 rounded-2xl h-16 w-full"
        />
      ))}
    </div>
  );
};
