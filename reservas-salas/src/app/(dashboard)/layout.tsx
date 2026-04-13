'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LogOut, User } from 'lucide-react';

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

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {children}
      </main>

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
