'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from './cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.18s_ease-out]"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={contentRef}
        className={cn(
          'w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-lg',
          'max-h-[90vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]',
          sizes[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-[var(--border)]">
            <div className="min-w-0">
              {title ? <h2 className="font-bold text-lg text-[var(--text-primary)]">{title}</h2> : null}
              {description ? (
                <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-input)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-5 sm:p-6">{children}</div>
        {footer ? (
          <div className="px-5 sm:px-6 py-4 border-t border-[var(--border)] flex gap-3 justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
