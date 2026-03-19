'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Plus, Edit3, Power, PowerOff, Cpu, Search, X,
  Users, MapPin, DoorOpen,
} from 'lucide-react';
import Link from 'next/link';

interface SalaRecurso {
  id: number;
  recurso: { id: number; nombre: string; descripcion: string | null };
}

interface Sala {
  id: number;
  nombre: string;
  ubicacion: string | null;
  capacidad: number;
  habilitada: boolean;
  salaRecursos: SalaRecurso[];
}

export default function SalasPage() {
  const { data: session } = useSession();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [form, setForm] = useState({ nombre: '', ubicacion: '', capacidad: 10 });
  const [saving, setSaving] = useState(false);

  const isSecretaria = session?.user?.rol === 'SECRETARIA';

  const fetchSalas = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setSalas(data);
    } catch { toast.error('Error al cargar salas'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSalas(); }, [fetchSalas]);

  const handleCreate = () => { setEditingSala(null); setForm({ nombre: '', ubicacion: '', capacidad: 10 }); setShowModal(true); };
  const handleEdit = (sala: Sala) => { setEditingSala(sala); setForm({ nombre: sala.nombre, ubicacion: sala.ubicacion || '', capacidad: sala.capacidad }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = editingSala ? `/api/rooms/${editingSala.id}` : '/api/rooms';
      const method = editingSala ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Error'); return; }
      toast.success(editingSala ? 'Sala actualizada' : 'Sala creada');
      setShowModal(false); fetchSalas();
    } catch { toast.error('Error de conexión'); }
    finally { setSaving(false); }
  };

  const handleToggleStatus = async (sala: Sala) => {
    try {
      const res = await fetch(`/api/rooms/${sala.id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habilitada: !sala.habilitada }),
      });
      if (!res.ok) { toast.error('Error'); return; }
      toast.success(sala.habilitada ? 'Sala deshabilitada' : 'Sala habilitada');
      fetchSalas();
    } catch { toast.error('Error de conexión'); }
  };

  const filtered = salas.filter((s) =>
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    s.ubicacion?.toLowerCase().includes(search.toLowerCase())
  );

  const disponibles = salas.filter((s) => s.habilitada).length;
  const deshabilitadas = salas.length - disponibles;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            {isSecretaria ? 'Sistema de Gestión de Salas' : 'Salas Disponibles'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
            Universidad - Administración de Espacios
          </p>
        </div>
        {isSecretaria && (
          <button className="btn-primary" onClick={handleCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Nueva Sala
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-value">{salas.length}</div>
          <div className="stat-label">Total de Salas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{disponibles}</div>
          <div className="stat-label">Disponibles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{deshabilitadas}</div>
          <div className="stat-label">Deshabilitadas</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: '38px' }}
            placeholder="Buscar por nombre o edificio..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><DoorOpen size={40} /><p style={{ marginTop: '8px' }}>No se encontraron salas</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map((sala) => (
            <div key={sala.id} className="card" style={{ padding: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{sala.nombre}</h3>
                <span className={`badge ${sala.habilitada ? 'badge-success' : 'badge-danger'}`}>
                  {sala.habilitada ? '● Disponible' : '● Deshabilitada'}
                </span>
              </div>

              {/* Info */}
              {sala.ubicacion && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  {sala.ubicacion}
                </p>
              )}

              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={13} /> Capacidad: {sala.capacidad}
                </span>
                {sala.ubicacion && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} /> {sala.ubicacion.split(',')[0]}
                  </span>
                )}
              </div>

              {/* Resources */}
              {sala.salaRecursos.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Recursos Tecnológicos:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {sala.salaRecursos.map((sr) => (
                      <span key={sr.id} style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem',
                        background: 'var(--bg-input)', color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}>
                        {sr.recurso.nombre} (1)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                {isSecretaria ? (
                  <>
                    <button className="btn-secondary" onClick={() => handleEdit(sala)}
                      style={{ flex: 1, padding: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Edit3 size={13} /> Editar
                    </button>
                    <button className={sala.habilitada ? 'btn-danger' : 'btn-secondary'}
                      style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleToggleStatus(sala)}>
                      {sala.habilitada ? <><PowerOff size={13} /></> : <><Power size={13} /></>}
                    </button>
                    <Link href={`/salas/${sala.id}/recursos`} className="btn-secondary"
                      style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-primary)' }}>
                      <Cpu size={13} />
                    </Link>
                  </>
                ) : (
                  <>
                    <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}>
                      👁 Ver Detalles
                    </button>
                    {sala.habilitada && (
                      <Link href={`/reservas?salaId=${sala.id}`} className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Reservar
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{editingSala ? 'Editar Sala' : 'Nueva Sala'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label className="label">Nombre de la sala</label>
                <input className="input-field" placeholder="Ej: Sala A-101" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="label">Ubicación</label>
                <input className="input-field" placeholder="Ej: Edificio A, Piso 1" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="label">Capacidad (personas)</label>
                <input className="input-field" type="number" min={2} max={100} value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: Number(e.target.value) })} required />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Guardando...' : editingSala ? 'Actualizar' : 'Crear Sala'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
