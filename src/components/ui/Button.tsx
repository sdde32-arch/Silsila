import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'warm'
  | 'subtle'
  | 'outline'
  | 'destructive'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles: accessible touch target (min 44px on mobile), smooth transition, focus rings
  const baseStyles =
    'inline-flex items-center justify-center font-bold select-none transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  // Sizing tokens ensuring >= 48dp touch targets on mobile
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'min-h-[48px] px-4 py-2 text-xs rounded-full gap-2 min-w-[48px]',
    md: 'min-h-[48px] h-12 px-5 text-xs uppercase tracking-wider rounded-full gap-2 min-w-[48px]',
    lg: 'min-h-[52px] h-13 px-7 text-sm uppercase tracking-wider rounded-full gap-2.5 min-w-[48px]',
    icon: 'h-12 w-12 rounded-full p-0 flex items-center justify-center min-w-[48px] min-h-[48px]',
  };

  // Semantic variant tokens adhering to Silsila Color Tokens
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#0F172A] hover:bg-slate-800 text-white shadow-sm hover:shadow-md focus:ring-slate-900',
    secondary:
      'bg-[#FAF9F5] hover:bg-slate-100 text-slate-800 border border-slate-200/80 hover:border-slate-300 focus:ring-slate-400',
    accent:
      'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm hover:shadow-md focus:ring-[#6366F1]',
    warm:
      'bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-sm hover:shadow-md focus:ring-[#F59E0B]',
    subtle:
      'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-300',
    outline:
      'bg-transparent hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 focus:ring-slate-400',
    destructive:
      'bg-[#F43F5E] hover:bg-[#E11D48] text-white shadow-sm focus:ring-[#F43F5E]',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 focus:ring-slate-300',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
