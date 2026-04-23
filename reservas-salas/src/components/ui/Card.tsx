import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padding = 'md', hoverable = true, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-sm transition-shadow',
        hoverable && 'hover:shadow-md',
        paddings[padding],
        className,
      )}
      {...rest}
    />
  );
});
