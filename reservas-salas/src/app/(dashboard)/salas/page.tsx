'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Plus, Edit3, Power, PowerOff, Cpu, Search,
  Users, MapPin, DoorOpen,
} from 'lucide-react';
import Link from 'next/link';
import { SkeletonCard, EmptyState, Button, Input, Modal, Card } from '@/components/ui';
import { useDebounce } from '@/lib/hooks/useDebounce';

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
  const debouncedSearch = useDebounce(search, 300);
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
    s.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    s.ubicacion?.toLowerCase().includes(debouncedSearch.toLowerCase())
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
          <Button variant="primary" onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Nueva Sala
          </Button>
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
          <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
          <Input
            className="pl-10"
            placeholder="Buscar por nombre o edificio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<DoorOpen size={40} />}
          title="No se encontraron salas"
          description={search ? 'Prueba con otro término de búsqueda.' : 'Aún no hay salas registradas.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sala) => (
            <Card key={sala.id} padding="lg">
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
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(sala)}
                      leftIcon={<Edit3 size={13} />}
                      fullWidth
                    >
                      Editar
                    </Button>
                    <Button
                      variant={sala.habilitada ? 'danger' : 'secondary'}
                      size="sm"
                      title={sala.habilitada ? 'Deshabilitar sala' : 'Habilitar sala'}
                      aria-label={sala.habilitada ? 'Deshabilitar sala' : 'Habilitar sala'}
                      onClick={() => handleToggleStatus(sala)}
                    >
                      {sala.habilitada ? <PowerOff size={13} /> : <Power size={13} />}
                    </Button>
                    <Link href={`/salas/${sala.id}/recursos`} className="btn-secondary"
                      title="Gestionar recursos"
                      aria-label="Gestionar recursos de la sala"
                      style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-primary)' }}>
                      <Cpu size={13} />
                    </Link>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" size="sm" fullWidth>
                      👁 Ver Detalles
                    </Button>
                    {sala.habilitada && (
                      <Link href={`/reservas?salaId=${sala.id}`} className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Reservar
                      </Link>
                    )}
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingSala ? 'Editar Sala' : 'Nueva Sala'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre de la sala"
            placeholder="Ej: Sala A-101"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            wrapperClassName="mb-4"
          />
          <Input
            label="Ubicación"
            placeholder="Ej: Edificio A, Piso 1"
            value={form.ubicacion}
            onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            wrapperClassName="mb-4"
          />
          <Input
            label="Capacidad (personas)"
            type="number"
            min={2}
            max={100}
            value={form.capacidad}
            onChange={(e) => setForm({ ...form, capacidad: Number(e.target.value) })}
            required
            wrapperClassName="mb-6"
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} fullWidth>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving} fullWidth>{saving ? 'Guardando...' : editingSala ? 'Actualizar' : 'Crear Sala'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
