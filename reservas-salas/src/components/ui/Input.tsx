'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';
import { cn } from './cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  /** Elemento (ej. icono) posicionado a la izquierda del input */
  leftIcon?: ReactNode;
  /** Elemento (ej. icono) posicionado a la derecha del input */
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className, id, wrapperClassName, leftIcon, rightIcon, ...rest },
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
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <span style={{
            position: 'absolute', left: '12px', display: 'flex', alignItems: 'center',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }}>
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full py-3 rounded-[10px] text-sm bg-[var(--bg-input)] text-[var(--text-primary)]',
            'border transition-all outline-none',
            leftIcon  ? 'pl-9  pr-4' : 'px-4',
            rightIcon ? 'pr-9' : '',
            error
              ? 'border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20'
              : 'border-[var(--border)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-black/5',
            'placeholder:text-[var(--text-muted)] disabled:opacity-60 disabled:cursor-not-allowed',
            className,
          )}
          {...rest}
        />
        {rightIcon && (
          <span style={{
            position: 'absolute', right: '12px', display: 'flex', alignItems: 'center',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }}>
            {rightIcon}
          </span>
        )}
      </div>
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

