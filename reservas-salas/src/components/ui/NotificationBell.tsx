'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck } from 'lucide-react';

interface Notif {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  metadata?: Record<string, unknown>;
}

function tiempoRelativo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'hace un momento';
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString('es-CO');
}

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Polling del contador cada 30 s
  useEffect(() => {
    let alive = true;
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count');
        if (!res.ok) return;
        const { count } = await res.json();
        if (alive) setCount(count);
      } catch { /* ignore */ }
    };
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const cargarLista = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=10');
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) await cargarLista();
  };

  const marcarLeida = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setItems((p) => p.map((x) => x.id === id ? { ...x, leida: true } : x));
    setCount((c) => Math.max(0, c - 1));
  };

  const marcarTodas = async () => {
    await fetch('/api/notifications/read-all', { method: 'PATCH' });
    setItems((p) => p.map((x) => ({ ...x, leida: true })));
    setCount(0);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notificaciones"
        className="relative inline-flex items-center justify-center p-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        style={{
          background: 'transparent',
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <Bell size={16} />
        {count > 0 && (
          <span
            className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full"
            style={{ background: '#ef4444', color: 'white', padding: '0 4px' }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[360px] z-50 rounded-lg shadow-xl border overflow-hidden"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="font-bold text-sm">Notificaciones</span>
            {count > 0 && (
              <button
                type="button"
                onClick={marcarTodas}
                className="text-xs inline-flex items-center gap-1 hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                <CheckCheck size={12} /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && (
              <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Cargando...
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                No tienes notificaciones
              </div>
            )}
            {!loading && items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.leida && marcarLeida(n.id)}
                className="w-full text-left px-4 py-3 border-b hover:bg-[var(--bg-input)] transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  background: n.leida ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                  cursor: n.leida ? 'default' : 'pointer',
                }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!n.leida && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#3b82f6' }} />}
                      <span className="text-xs font-bold truncate">{n.titulo}</span>
                    </div>
                    <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                      {n.mensaje}
                    </p>
                    <span className="text-[10px] mt-1 block" style={{ color: 'var(--text-muted)' }}>
                      {tiempoRelativo(n.fechaCreacion)}
                    </span>
                  </div>
                  {n.leida && <Check size={12} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </button>
            ))}
          </div>

          <Link
            href="/notificaciones"
            onClick={() => setOpen(false)}
            className="block text-center px-4 py-2.5 text-xs font-semibold border-t no-underline hover:bg-[var(--bg-input)] transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
          >
            Ver todas las notificaciones
          </Link>
        </div>
      )}
    </div>
  );
}
