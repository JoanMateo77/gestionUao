'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Filter } from 'lucide-react';

interface Notif {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  fechaLeida: string | null;
  metadata?: Record<string, unknown>;
}

type FilterMode = 'all' | 'unread' | 'read';

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

export default function NotificacionesPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>('all');

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=200');
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const marcarLeida = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setItems((p) => p.map((x) => x.id === id ? { ...x, leida: true, fechaLeida: new Date().toISOString() } : x));
  };

  const marcarTodas = async () => {
    await fetch('/api/notifications/read-all', { method: 'PATCH' });
    setItems((p) => p.map((x) => ({ ...x, leida: true, fechaLeida: x.fechaLeida ?? new Date().toISOString() })));
  };

  const filtradas = items.filter((n) => filter === 'all' ? true : filter === 'unread' ? !n.leida : n.leida);
  const totalUnread = items.filter((n) => !n.leida).length;

  return (
    <div className="fade-in" style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <Bell size={22} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold m-0">Notificaciones</h1>
          <p className="text-sm m-0" style={{ color: 'var(--text-muted)' }}>
            {totalUnread > 0 ? `Tienes ${totalUnread} sin leer` : 'No tienes notificaciones sin leer'}
          </p>
        </div>
        {totalUnread > 0 && (
          <button
            type="button"
            onClick={marcarTodas}
            className="btn-secondary inline-flex items-center gap-2"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <CheckCheck size={14} /> Marcar todas
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        {(['all', 'unread', 'read'] as FilterMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setFilter(m)}
            className="px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{
              background: filter === m ? 'var(--primary)' : 'var(--bg-input)',
              color: filter === m ? '#fff' : 'var(--text-secondary)',
              fontWeight: filter === m ? 600 : 400,
            }}
          >
            {m === 'all' ? 'Todas' : m === 'unread' ? 'No leídas' : 'Leídas'}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          Cargando notificaciones...
        </div>
      )}

      {!loading && filtradas.length === 0 && (
        <div className="text-center py-16 rounded-xl border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p className="text-sm">
            {filter === 'unread' ? 'No tienes notificaciones sin leer' :
             filter === 'read' ? 'No tienes notificaciones leídas' :
             'No tienes notificaciones'}
          </p>
        </div>
      )}

      {!loading && filtradas.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtradas.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border px-5 py-4 transition-all"
              style={{
                borderColor: n.leida ? 'var(--border)' : 'var(--primary)',
                background: n.leida ? 'var(--bg-secondary)' : 'rgba(59, 130, 246, 0.05)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {!n.leida && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--primary)' }} />}
                    <h3 className="text-sm font-bold m-0">{n.titulo}</h3>
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {n.mensaje}
                  </p>
                  {n.metadata && Object.keys(n.metadata).length > 0 && (
                    <div className="text-[11px] grid gap-0.5" style={{ color: 'var(--text-muted)' }}>
                      {Object.entries(n.metadata)
                        .filter(([, v]) => typeof v === 'string' || typeof v === 'number')
                        .slice(0, 4)
                        .map(([k, v]) => (
                          <div key={k}><strong>{k}:</strong> {String(v)}</div>
                        ))}
                    </div>
                  )}
                  <span className="text-[11px] mt-2 block" style={{ color: 'var(--text-muted)' }}>
                    {tiempoRelativo(n.fechaCreacion)}
                  </span>
                </div>
                {!n.leida && (
                  <button
                    type="button"
                    onClick={() => marcarLeida(n.id)}
                    className="text-xs inline-flex items-center gap-1 hover:underline shrink-0"
                    style={{ color: 'var(--primary)' }}
                  >
                    <Check size={12} /> Marcar leída
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
