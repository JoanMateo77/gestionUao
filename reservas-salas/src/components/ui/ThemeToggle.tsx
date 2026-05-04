'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Activar modo claro' : 'Activar modo oscuro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={
        'inline-flex items-center justify-center p-2 rounded-lg border transition-colors ' +
        'bg-transparent border-[var(--border)] text-[var(--text-muted)] ' +
        'hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] ' +
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ' +
        (className ?? '')
      }
    >
      {mounted && isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
