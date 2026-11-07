import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'lime';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#142522] text-[#EAF0EC] hover:bg-[#1C2928] border border-[#2C3936] dark:bg-[#C8F169] dark:text-[#142522] dark:hover:bg-[#B8E159] dark:border-transparent',
      secondary:
        'bg-[#1C2928] text-[#EAF0EC] hover:bg-[#253635] border border-[#2C3936]',
      outline:
        'border border-[#2C3936] bg-transparent text-[#EAF0EC] hover:bg-[#1C2928]',
      ghost:
        'bg-transparent text-[#A0ADA7] hover:text-[#EAF0EC] hover:bg-[#1C2928]',
      danger:
        'bg-[#D45252] text-white hover:bg-[#C44242]',
      lime:
        'bg-[#C8F169] text-[#142522] font-semibold hover:bg-[#B8E159] shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

