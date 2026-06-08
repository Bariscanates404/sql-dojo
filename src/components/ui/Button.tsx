import { type ButtonHTMLAttributes } from 'react';

import { cn } from '@utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90 active:opacity-80',
  secondary: 'border border-border bg-surface hover:border-foreground/40 active:bg-foreground/5',
  ghost: 'hover:bg-foreground/5 active:bg-foreground/10',
  danger: 'bg-danger text-white hover:opacity-90 active:opacity-80',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3 text-sm rounded-lg',
  md: 'min-h-[42px] px-4 text-base rounded-xl',
  lg: 'min-h-[50px] px-6 text-lg rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all select-none',
        'disabled:opacity-40 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
