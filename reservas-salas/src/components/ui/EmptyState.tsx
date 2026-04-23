'use client';

import { ReactNode } from 'react';
import { cn } from './cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl',
        'border border-dashed border-[var(--border)] bg-[var(--bg-card)]',
        className,
      )}
      role="status"
    >
      {icon ? (
        <div className="text-[var(--text-muted)] mb-3 flex items-center justify-center">
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      {description ? (
        <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
