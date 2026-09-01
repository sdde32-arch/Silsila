import React from 'react';

export const IslamicPattern: React.FC<{ className?: string; size?: number; opacity?: number }> = ({
  className = '',
  size = 120,
  opacity = 0.12,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
    >
      {/* 8-Point Rub el Hizb Geometric Star */}
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        rx="6"
        stroke="currentColor"
        strokeWidth="2.5"
        transform="rotate(0 50 50)"
      />
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        rx="6"
        stroke="currentColor"
        strokeWidth="2.5"
        transform="rotate(45 50 50)"
      />
      <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </svg>
  );
};
