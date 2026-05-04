'use client';

import { forwardRef, InputHTMLAttributes, useId } from 'react';
import { cn } from './cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className, id, wrapperClassName, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id || `input-${reactId}`;
  const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label ? (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full px-4 py-3 rounded-[10px] text-sm bg-[var(--bg-input)] text-[var(--text-primary)]',
          'border transition-all outline-none',
          error
            ? 'border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20'
            : 'border-[var(--border)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-black/5',
          'placeholder:text-[var(--text-muted)] disabled:opacity-60 disabled:cursor-not-allowed',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-[var(--danger)]">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="mt-1 text-xs text-[var(--text-muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
