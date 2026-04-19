'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Plus, CalendarDays, XCircle, Clock, MapPin, User, X, Edit3, Filter,
} from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog, SkeletonCard, EmptyState } from '@/components/ui';

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

function isoToTimeInput(isoTime: string): string {
  try {
    const d = new Date(isoTime);
    const h = d.getUTCHours().toString().padStart(2, '0');
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  } catch { return ''; }
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'numeric', year: 'numeric' });
  } catch { return isoDate; }
}

function isoToDateInput(isoDate: string): string {
  return isoDate.split('T')[0];
}

export default function ReservasPage() {
  const { data: session } = useSession();
  const isSecretaria = session?.user?.rol === 'SECRETARIA';

  const [data, setData] = useState<ApiResponse | null>(null);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [todasSalas, setTodasSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Filtros SECRETARIA (HU-13)
  const [filtroSalaId, setFiltroSalaId] = useState<string>('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal crear reserva
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ salaId: 0, fecha: '', horaInicio: '', horaFin: '', motivo: '' });
  const [saving, setSaving] = useState(false);

  // Modal ajustar reserva (HU-11)
  const [adjusting, setAdjusting] = useState<Reserva | null>(null);
  const [adjustForm, setAdjustForm] = useState({ salaId: 0, fecha: '', horaInicio: '', horaFin: '', motivo: '' });
  const [savingAdjust, setSavingAdjust] = useState(false);

  // Confirmación de cancelación
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const buildQuery = useCallback(() => {
    const q = new URLSearchParams({ page: String(page), limit: '20' });
    if (filter) q.set('estado', filter);
    if (isSecretaria && filtroSalaId) q.set('salaId', filtroSalaId);
    if (isSecretaria && filtroFechaInicio) q.set('fechaInicio', filtroFechaInicio);
    if (isSecretaria && filtroFechaFin) q.set('fechaFin', filtroFechaFin);
    return q;
  }, [page, filter, isSecretaria, filtroSalaId, filtroFechaInicio, filtroFechaFin]);

  const fetchReservas = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservations?${buildQuery()}`);
      setData(await res.json());
    } catch { toast.error('Error al cargar'); }
    finally { setLoading(false); }
  }, [buildQuery]);

  const fetchSalas = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      const rooms: (Sala & { habilitada: boolean })[] = await res.json();
      setTodasSalas(rooms);
      setSalas(rooms.filter((s) => s.habilitada));
    } catch {}
  }, []);

  useEffect(() => { fetchReservas(); }, [fetchReservas]);
  useEffect(() => { fetchSalas(); }, [fetchSalas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (form.fecha) {
        const day = new Date(form.fecha + 'T00:00:00.000Z').getUTCDay();
        if (day === 0) { toast.error('No se pueden hacer reservas los domingos'); setSaving(false); return; }
      }
      const res = await fetch('/api/reservations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, salaId: Number(form.salaId) }),
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error || 'Error'); return; }
      toast.success('Reserva creada'); setShowModal(false); fetchReservas();
    } catch { toast.error('Error de conexión'); }
    finally { setSaving(false); }
  };

  const handleCancel = (id: number) => setCancelId(id);

  const confirmCancel = async () => {
    if (cancelId == null) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/reservations/${cancelId}/cancel`, { method: 'PATCH' });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error || 'Error al cancelar'); return; }
      toast.success('Reserva cancelada'); fetchReservas();
      setCancelId(null);
    } catch { toast.error('Error'); }
    finally { setCancelLoading(false); }
  };

  const openAdjust = (r: Reserva) => {
    setAdjustForm({
      salaId: r.sala.id,
      fecha: isoToDateInput(r.fecha),
      horaInicio: isoToTimeInput(r.horaInicio),
      horaFin: isoToTimeInput(r.horaFin),
      motivo: r.motivo ?? '',
    });
    setAdjusting(r);
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjusting) return;
    if (adjustForm.fecha) {
      const day = new Date(adjustForm.fecha + 'T00:00:00.000Z').getUTCDay();
      if (day === 0) { toast.error('No se pueden hacer reservas los domingos'); return; }
    }
    setSavingAdjust(true);
    try {
      const res = await fetch(`/api/reservations/${adjusting.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...adjustForm, salaId: Number(adjustForm.salaId) }),
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error || 'Error al ajustar'); return; }
      toast.success('Reserva ajustada'); setAdjusting(null); fetchReservas();
    } catch { toast.error('Error de conexión'); }
    finally { setSavingAdjust(false); }
  };

  const clearFilters = () => {
    setFiltroSalaId(''); setFiltroFechaInicio(''); setFiltroFechaFin(''); setPage(1);
  };

  const reservas = data?.reservas || [];
  const activas = reservas.filter((r) => r.estado === 'CONFIRMADA').length;
  const historial = reservas.filter((r) => r.estado === 'CANCELADA').length;
  const hasActiveFilters = filtroSalaId || filtroFechaInicio || filtroFechaFin;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            {isSecretaria ? 'Reservas' : 'Mis Reservas'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {isSecretaria && (
            <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
              <Filter size={15} /> Filtros
              {hasActiveFilters && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: 'var(--primary)', fontSize: '0.6rem', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>!</span>
              )}
            </button>
          )}
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

      {/* Panel de filtros SECRETARIA (HU-13) */}
      {isSecretaria && showFilters && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div>
              <label className="label" style={{ fontSize: '0.75rem' }}>Sala</label>
              <select className="input-field" value={filtroSalaId} onChange={(e) => { setFiltroSalaId(e.target.value); setPage(1); }}>
                <option value="">Todas las salas</option>
                {todasSalas.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" style={{ fontSize: '0.75rem' }}>Desde</label>
              <input className="input-field" type="date" value={filtroFechaInicio}
                onChange={(e) => { setFiltroFechaInicio(e.target.value); setPage(1); }} />
            </div>
            <div>
              <label className="label" style={{ fontSize: '0.75rem' }}>Hasta</label>
              <input className="input-field" type="date" value={filtroFechaFin}
                onChange={(e) => { setFiltroFechaFin(e.target.value); setPage(1); }} />
            </div>
            {hasActiveFilters && (
              <button className="btn-secondary" onClick={clearFilters} style={{ fontSize: '0.8rem' }}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '20px' }}>
        {isSecretaria ? 'Gestiona todas las reservas de la facultad' : 'Gestiona tus reservas de salas'}
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--info)' }}>{activas}</div>
          <div className="stat-label">Reservas Activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{historial}</div>
          <div className="stat-label">Canceladas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--info)' }}>{data?.total || 0}</div>
          <div className="stat-label">Total</div>
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

      {/* Reservas */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : reservas.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={40} />}
          title="No se encontraron reservas"
          description="Crea una nueva reserva para comenzar a gestionar tus salas."
          action={
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Crear reserva
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservas.map((r) => (
            <div key={r.id} className="card" style={{ padding: '20px' }}>
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

              {r.motivo && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  <strong>Motivo:</strong> {r.motivo}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                {r.estado === 'CONFIRMADA' && isSecretaria && (
                  <button className="btn-secondary" onClick={() => openAdjust(r)}
                    style={{ flex: 1, padding: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Edit3 size={13} /> Ajustar
                  </button>
                )}
                {r.estado === 'CONFIRMADA' &&
                  (isSecretaria || r.usuario.id === session?.user?.id) && (
                    <button className="btn-danger" onClick={() => handleCancel(r.id)}
                      style={{ flex: isSecretaria ? 'unset' : 1, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                      <XCircle size={13} /> Cancelar
                    </button>
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

      {/* ─── Modal: Crear Reserva ─── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Crear Reserva</h2>
              <button type="button" onClick={() => setShowModal(false)} title="Cerrar" aria-label="Cerrar" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '20px' }}>
              Reserva de sala de estudio
            </p>

            <div style={{
              padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
              background: 'var(--info-bg)', border: '1px solid rgba(37,99,235,0.15)',
              fontSize: '0.75rem', color: 'var(--info)',
            }}>
              <strong>📋 Política de Reservas</strong>
              <ul style={{ margin: '6px 0 0 16px', lineHeight: 1.7 }}>
                <li>Horario: 7:00 AM — 9:30 PM</li>
                <li>No se permiten reservas superpuestas</li>
                <li>No se permiten reservas en fechas pasadas</li>
                <li>No se permiten reservas los domingos</li>
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
                  min={new Date().toISOString().split('T')[0]}
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
                <label className="label">Motivo</label>
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

      {/* ─── Modal: Ajustar Reserva (HU-11, solo SECRETARIA) ─── */}
      {adjusting && (
        <div className="modal-overlay" onClick={() => setAdjusting(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Ajustar Reserva</h2>
              <button type="button" onClick={() => setAdjusting(null)} title="Cerrar" aria-label="Cerrar" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
              Reserva de <strong>{adjusting.usuario.nombre}</strong> — original: {formatDate(adjusting.fecha.split('T')[0])} · {formatTime(adjusting.horaInicio)}–{formatTime(adjusting.horaFin)}
            </p>

            <form onSubmit={handleAdjust}>
              <div style={{ marginBottom: '14px' }}>
                <label className="label">Sala *</label>
                <select className="input-field" value={adjustForm.salaId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, salaId: Number(e.target.value) })} required>
                  {salas.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}{s.ubicacion ? ` — ${s.ubicacion}` : ''}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label">Fecha *</label>
                <input className="input-field" type="date" value={adjustForm.fecha}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setAdjustForm({ ...adjustForm, fecha: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="label">Hora de Inicio *</label>
                  <input className="input-field" type="time" value={adjustForm.horaInicio}
                    min="07:00" max="21:00"
                    onChange={(e) => setAdjustForm({ ...adjustForm, horaInicio: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Hora de Fin *</label>
                  <input className="input-field" type="time" value={adjustForm.horaFin}
                    min="07:30" max="21:30"
                    onChange={(e) => setAdjustForm({ ...adjustForm, horaFin: e.target.value })} required />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label">Motivo</label>
                <input className="input-field" value={adjustForm.motivo}
                  onChange={(e) => setAdjustForm({ ...adjustForm, motivo: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setAdjusting(null)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={savingAdjust} style={{ flex: 1 }}>{savingAdjust ? 'Guardando...' : 'Guardar Ajuste'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={cancelId !== null}
        onClose={() => (cancelLoading ? null : setCancelId(null))}
        onConfirm={confirmCancel}
        title="Cancelar reserva"
        description="Esta acción no se puede deshacer. La reserva quedará marcada como cancelada."
        confirmText="Sí, cancelar"
        cancelText="Volver"
        variant="danger"
        loading={cancelLoading}
      />
    </div>
  );
}
