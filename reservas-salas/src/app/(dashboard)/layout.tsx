'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LogOut, User, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui';

const navItems = {
  DOCENTE: [
    { href: '/salas', label: 'Mis Salas' },
    { href: '/reservas', label: 'Mis Reservas' },
  ],
  SECRETARIA: [
    { href: '/salas', label: 'Gestión de Salas' },
    { href: '/reservas', label: 'Reservas' },
    { href: '/reportes', label: 'Reportes' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', handle);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handle);
    };
  }, [drawerOpen]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    );
  }

  if (!session) return null;

  const items = navItems[session.user.rol] || navItems.DOCENTE;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header
        className="sticky top-0 z-30 border-b"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-3 md:gap-8 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-input)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <Menu size={20} />
            </button>

            <Link
              href="/reservas"
              className="flex items-center gap-2.5 no-underline min-w-0"
              style={{ color: 'var(--text-primary)' }}
            >
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: 'var(--primary)' }}
              >
                <BookOpen size={18} style={{ color: 'var(--primary-fg)' }} />
              </div>
              <div className="hidden sm:block min-w-0">
                <div className="font-bold text-sm leading-tight truncate">
                  Sistema de Gestión de Salas
                </div>
                <div className="text-[0.7rem] truncate" style={{ color: 'var(--text-muted)' }}>
                  Universidad - Administración de Espacios
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex gap-1" aria-label="Navegación principal">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className="px-4 py-2 rounded-lg text-[0.85rem] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    style={{
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: active ? 'var(--bg-input)' : 'transparent',
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2.5">
              <div
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              >
                <User size={16} color="var(--text-muted)" />
              </div>
              <div className="max-w-[180px]">
                <div className="text-xs font-semibold truncate">{session.user.nombre}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.65rem] truncate" style={{ color: 'var(--text-muted)' }}>
                    {session.user.email}
                  </span>
                  <span
                    className={`badge ${session.user.rol === 'SECRETARIA' ? 'badge-info' : 'badge-success'}`}
                    style={{ fontSize: '0.6rem', padding: '2px 6px' }}
                  >
                    {session.user.rol === 'SECRETARIA' ? 'Secretaria' : 'Docente'}
                  </span>
                </div>
              </div>
            </div>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              aria-label="Cerrar sesión"
              className="inline-flex items-center justify-center p-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              style={{
                background: 'transparent',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] shadow-xl transform transition-transform duration-200 ${
          drawerOpen ? 'translate-x-0 drawer-panel' : '-translate-x-full pointer-events-none'
        }`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ background: 'var(--primary)' }}
            >
              <BookOpen size={18} style={{ color: 'var(--primary-fg)' }} />
            </div>
            <div className="font-bold text-sm truncate">Menú</div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
            className="p-2 rounded-lg hover:bg-[var(--bg-input)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-3 flex flex-col gap-1" aria-label="Navegación móvil">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="px-4 py-3 rounded-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                style={{
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--bg-input)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t p-4 flex items-center gap-2.5" style={{ borderColor: 'var(--border)' }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
          >
            <User size={16} color="var(--text-muted)" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold truncate">{session.user.nombre}</div>
            <div className="text-[0.65rem] truncate" style={{ color: 'var(--text-muted)' }}>
              {session.user.email}
            </div>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">{children}</main>

      <footer
        className="text-center text-xs py-6 mt-10 border-t px-4"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
      >
        © 2026 Universidad Autónoma De Occidente - Sistema de Reservas de Salas
      </footer>
    </div>
  );
}
