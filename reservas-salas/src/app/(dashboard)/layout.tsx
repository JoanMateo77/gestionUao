'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
<<<<<<< HEAD
import { BookOpen, LogOut, User } from 'lucide-react';
=======
import { LogOut, User, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui';
>>>>>>> 973fdce (se reemplazó la imagen inicial de login y navbar por el logo de la universidad el cual es UAO-LOGO-NUEVO_Mesa-de-trabajo-1-1-1-1.png)

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

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    );
  }

  if (!session) return null;

  const items = navItems[session.user.rol] || navItems.DOCENTE;

  return (
<<<<<<< HEAD
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* TOP NAVBAR */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}>
          {/* Left: Logo + Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {/* Logo */}
            <Link href="/reservas" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text-primary)' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'var(--primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
=======
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
              <Image
                src="/UAO-LOGO-NUEVO_Mesa-de-trabajo-1-1-1-1.png"
                alt="Logo UAO"
                width={80}
                height={32}
                priority
                style={{ objectFit: 'contain' }}
              />
              <div className="hidden sm:block min-w-0">
                <div className="font-bold text-sm leading-tight truncate">
>>>>>>> 973fdce (se reemplazó la imagen inicial de login y navbar por el logo de la universidad el cual es UAO-LOGO-NUEVO_Mesa-de-trabajo-1-1-1-1.png)
                  Sistema de Gestión de Salas
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Universidad - Administración de Espacios
                </div>
              </div>
            </Link>

            {/* Nav links */}
            <nav style={{ display: 'flex', gap: '4px' }}>
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href} style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--bg-input)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={16} color="var(--text-muted)" />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{session.user.nombre}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {session.user.email}
                  </span>
                  <span className={`badge ${session.user.rol === 'SECRETARIA' ? 'badge-info' : 'badge-success'}`}
                    style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                    {session.user.rol === 'SECRETARIA' ? 'Secretaria' : 'Docente'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                color: 'var(--text-muted)', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center',
              }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

<<<<<<< HEAD
      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {children}
      </main>
=======
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
            <Image
              src="/UAO-LOGO-NUEVO_Mesa-de-trabajo-1-1-1-1.png"
              alt="Logo UAO"
              width={72}
              height={28}
              style={{ objectFit: 'contain' }}
            />
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
>>>>>>> 973fdce (se reemplazó la imagen inicial de login y navbar por el logo de la universidad el cual es UAO-LOGO-NUEVO_Mesa-de-trabajo-1-1-1-1.png)

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '24px',
        fontSize: '0.75rem', color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
        marginTop: '40px',
      }}>
        © 2026 Universidad Autónoma De Occidente - Sistema de Reservas de Salas
      </footer>
    </div>
  );
}
