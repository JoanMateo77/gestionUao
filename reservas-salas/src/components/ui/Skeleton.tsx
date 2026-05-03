'use client';

import { cn } from './cn';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="space-y-2" aria-busy="true" aria-live="polite">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse rounded-md bg-[var(--bg-input)] h-4 w-full',
              i === lines - 1 && 'w-3/4',
              className,
            )}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn('animate-pulse rounded-md bg-[var(--bg-input)] h-4 w-full', className)}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-40 mb-2" />
      <Skeleton className="h-3 w-24 mb-4" />
      <div className="border-t border-[var(--border)] pt-3 flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
