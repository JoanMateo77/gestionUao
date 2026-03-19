'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Plus, CalendarDays, XCircle, Clock, MapPin, User, X,
} from 'lucide-react';
import Link from 'next/link';

interface Sala {
  id: number;
  nombre: string;
  ubicacion: string | null;
  habilitada?: boolean;
}

interface Reserva {
  id: number;
  motivo: string | null;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: 'CONFIRMADA' | 'CANCELADA';
  sala: Sala;
  usuario: { id: number; nombre: string; correoInstitucional: string };
}

interface ApiResponse {
  reservas: Reserva[];
  total: number;
  page: number;
  totalPages: number;
}

function formatTime(isoTime: string): string {
  try {
    const d = new Date(isoTime);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
  } catch { return isoTime; }
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'numeric', year: 'numeric' });
  } catch { return isoDate; }
}

export default function ReservasPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ salaId: 0, fecha: '', horaInicio: '', horaFin: '', motivo: '' });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const fetchReservas = useCallback(async () => {
    try {
      const q = new URLSearchParams({ page: String(page), limit: '20' });
      if (filter) q.set('estado', filter);
      const res = await fetch(`/api/reservations?${q}`);
      setData(await res.json());
    } catch { toast.error('Error al cargar'); }
    finally { setLoading(false); }
  }, [page, filter]);

  const fetchSalas = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      const rooms = await res.json();
      setSalas(rooms.filter((s: Sala & { habilitada: boolean }) => s.habilitada));
    } catch {}
  }, []);

  useEffect(() => { fetchReservas(); }, [fetchReservas]);
  useEffect(() => { fetchSalas(); }, [fetchSalas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error || 'Error'); return; }
      toast.success('Reserva creada'); setShowModal(false); fetchReservas();
    } catch { toast.error('Error de conexión'); }
    finally { setSaving(false); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'PATCH' });
      if (!res.ok) { toast.error('Error al cancelar'); return; }
      toast.success('Reserva cancelada'); fetchReservas();
    } catch { toast.error('Error'); }
  };

  const reservas = data?.reservas || [];
  const activas = reservas.filter((r) => r.estado === 'CONFIRMADA').length;
  const historial = reservas.filter((r) => r.estado === 'CANCELADA').length;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            {session?.user?.rol === 'SECRETARIA' ? 'Reservas' : 'Mis Reservas'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/salas" className="btn-secondary"
            style={{ textDecoration: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Explorar Salas
          </Link>
          <button className="btn-primary" onClick={() => { setForm({ salaId: 0, fecha: '', horaInicio: '', horaFin: '', motivo: '' }); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Nueva Reserva
          </button>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '20px' }}>
        Gestiona tus reservas de salas de estudio
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--info)' }}>{activas}</div>
          <div className="stat-label">Reservas Activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{historial}</div>
          <div className="stat-label">Historial</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--info)' }}>{data?.total || 0}</div>
          <div className="stat-label">Total de Reservas</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { value: '', label: 'Todas' },
          { value: 'CONFIRMADA', label: 'Activas' },
          { value: 'CANCELADA', label: 'Historial' },
        ].map((f) => (
          <button key={f.value}
            className={`btn-secondary ${filter === f.value ? 'active' : ''}`}
            style={{
              padding: '8px 16px', fontSize: '0.8rem',
              background: filter === f.value ? 'var(--primary)' : 'transparent',
              color: filter === f.value ? '#fff' : 'var(--text-secondary)',
              borderColor: filter === f.value ? 'var(--primary)' : 'var(--border)',
            }}
            onClick={() => { setFilter(f.value); setPage(1); }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Section Title */}
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
        {filter === 'CONFIRMADA' ? 'Reservas Activas' : filter === 'CANCELADA' ? 'Historial' : 'Todas las Reservas'}
      </h2>

      {/* Reservas */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><div className="spinner" /></div>
      ) : reservas.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={40} />
          <p style={{ marginTop: '8px' }}>No se encontraron reservas</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}
            style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Crear reserva
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {reservas.map((r) => (
            <div key={r.id} className="card" style={{ padding: '20px' }}>
              {/* Room name + status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.sala.nombre}</h3>
                  {r.sala.ubicacion && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} /> {r.sala.ubicacion}
                    </p>
                  )}
                </div>
                <span className={`badge ${r.estado === 'CONFIRMADA' ? 'badge-success' : 'badge-danger'}`}>
                  {r.estado === 'CONFIRMADA' ? 'Activa' : 'Cancelada'}
                </span>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <CalendarDays size={13} /> {formatDate(r.fecha.split('T')[0])}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={13} /> {formatTime(r.horaInicio)} - {formatTime(r.horaFin)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <User size={13} /> {r.usuario.nombre}
                </span>
              </div>

              {/* Motivo */}
              {r.motivo && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  <strong>Motivo:</strong> {r.motivo}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}>
                  Ver Sala
                </button>
                {r.estado === 'CONFIRMADA' && (
                  (session?.user?.rol === 'SECRETARIA' || r.usuario.id === session?.user?.id) && (
                    <button className="btn-danger" onClick={() => handleCancel(r.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                      <XCircle size={13} /> Cancelar
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Anterior</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Página {data.page} de {data.totalPages}</span>
          <button className="btn-secondary" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Siguiente</button>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Crear Reserva</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '20px' }}>
              Reserva de sala de estudio
            </p>

            {/* Policy box */}
            <div style={{
              padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
              background: 'var(--info-bg)', border: '1px solid rgba(37,99,235,0.15)',
              fontSize: '0.75rem', color: 'var(--info)',
            }}>
              <strong>📋 Política de Reservas</strong>
              <ul style={{ margin: '6px 0 0 16px', lineHeight: 1.7 }}>
                <li>Horario: 7:00 AM — 9:30 PM</li>
                <li>No se permiten reservas superpuestas</li>
                <li>Las reservas se cancelan, no se eliminan</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label className="label">Sala *</label>
                <select className="input-field" value={form.salaId}
                  onChange={(e) => setForm({ ...form, salaId: Number(e.target.value) })} required>
                  <option value={0}>Seleccione una sala</option>
                  {salas.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}{s.ubicacion ? ` — ${s.ubicacion}` : ''}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label">Fecha *</label>
                <input className="input-field" type="date" value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="label">Hora de Inicio *</label>
                  <input className="input-field" type="time" value={form.horaInicio}
                    min="07:00" max="21:00"
                    onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Hora de Fin *</label>
                  <input className="input-field" type="time" value={form.horaFin}
                    min="07:30" max="21:30"
                    onChange={(e) => setForm({ ...form, horaFin: e.target.value })} required />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label">Motivo de la Reserva *</label>
                <input className="input-field" placeholder="Describe brevemente el motivo de tu reserva"
                  value={form.motivo}
                  onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Creando...' : 'Confirmar Reserva'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
