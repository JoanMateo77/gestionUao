'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Plus, Edit3, Power, PowerOff, Cpu,
  Users, MapPin, DoorOpen, CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';
import {
  SkeletonCard, EmptyState, Button, Input, Modal, Card,
  FilterBar, ResourceChip, EDIFICIOS_UAO,
  type RecursoUI, type RoomFilters,
} from '@/components/ui';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface SalaRecurso {
  id: number;
  recurso: { id: number; nombre: string; descripcion: string | null; categoria: string; icono: string };
}

interface Sala {
  id: number;
  nombre: string;
  ubicacion: string | null;
  capacidad: number;
  habilitada: boolean;
  salaRecursos: SalaRecurso[];
}

const FILTROS_INICIALES: RoomFilters = { q: '', edificio: '', capacidadMin: '', capacidadMax: '', recursos: [] };

/**
 * Compone nombre y ubicación siguiendo la nomenclatura UAO. Un "Edificio"
 * (Aulas, Torreón, CRAI, Ala Sur, Central, Bienestar) contiene varios salones
 * reservables; la sala creada es SIEMPRE un salón específico dentro de él.
 */
function componerNombre(edificio: string, piso: string, numero: string): string {
  const nn = numero.padStart(2, '0');
  if (edificio.startsWith('Aulas'))   return `${edificio} - A${piso}${nn}`;
  if (edificio.startsWith('Torreón')) return `${edificio}-${piso}${nn}`;
  if (edificio === 'CRAI')            return `CRAI P${piso}-${nn}`;
  if (edificio === 'Ala Sur')         return `Ala Sur P${piso}-${nn}`;
  if (edificio === 'Edificio Central') return `Central P${piso}-${nn}`;
  return `${edificio} P${piso}-${nn}`;
}

function componerUbicacion(edificio: string, piso: string, numero: string): string {
  return `${edificio}, Piso ${piso}, Salón ${numero.padStart(2, '0')}`;
}

export default function SalasPage() {
  const { data: session } = useSession();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [recursos, setRecursos] = useState<RecursoUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RoomFilters>(FILTROS_INICIALES);
  const debouncedFilters = useDebounce(filters, 300);

  const [showModal, setShowModal] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [form, setForm] = useState({
    nombre: '', ubicacion: '', capacidad: 10,
    edificio: '', piso: '', numero: '',
  });
  const [saving, setSaving] = useState(false);

  const isSecretaria = session?.user?.rol === 'SECRETARIA';

  const fetchRecursos = useCallback(async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setRecursos(data);
    } catch { /* silencioso — filtros de recurso no estarán disponibles */ }
  }, []);

  const fetchSalas = useCallback(async (f: RoomFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.q) params.set('q', f.q);
      if (f.edificio) params.set('edificio', f.edificio);
      if (f.capacidadMin) params.set('capacidadMin', f.capacidadMin);
      if (f.capacidadMax) params.set('capacidadMax', f.capacidadMax);
      if (f.recursos.length > 0) params.set('recursos', f.recursos.join(','));

      const res = await fetch(`/api/rooms?${params.toString()}`);
      const data = await res.json();
      setSalas(Array.isArray(data) ? data : []);
    } catch { toast.error('Error al cargar salas'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecursos(); }, [fetchRecursos]);
  useEffect(() => { fetchSalas(debouncedFilters); }, [fetchSalas, debouncedFilters]);

  const handleCreate = () => {
    setEditingSala(null);
    setForm({ nombre: '', ubicacion: '', capacidad: 10, edificio: '', piso: '', numero: '' });
    setShowModal(true);
  };
  const handleEdit = (sala: Sala) => {
    setEditingSala(sala);
    setForm({
      nombre: sala.nombre,
      ubicacion: sala.ubicacion || '',
      capacidad: sala.capacidad,
      edificio: '', piso: '', numero: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // En creación, el nombre y ubicación se derivan de edificio+piso+salón
    let payload: { nombre: string; ubicacion: string; capacidad: number };
    if (editingSala) {
      payload = { nombre: form.nombre, ubicacion: form.ubicacion, capacidad: form.capacidad };
    } else {
      if (!form.edificio || !form.piso || !form.numero) {
        toast.error('Selecciona edificio, piso y número de salón');
        return;
      }
      payload = {
        nombre: componerNombre(form.edificio, form.piso, form.numero),
        ubicacion: componerUbicacion(form.edificio, form.piso, form.numero),
        capacidad: form.capacidad,
      };
    }

    setSaving(true);
    try {
      const url = editingSala ? `/api/rooms/${editingSala.id}` : '/api/rooms';
      const method = editingSala ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Error'); return; }
      toast.success(editingSala ? 'Sala actualizada' : 'Salón registrado correctamente');
      setShowModal(false); fetchSalas(debouncedFilters);
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
      fetchSalas(debouncedFilters);
    } catch { toast.error('Error de conexión'); }
  };

  const disponibles = useMemo(() => salas.filter((s) => s.habilitada).length, [salas]);

  const puedeGuardarCreacion = !!(form.edificio && form.piso && form.numero && form.capacidad >= 2);
  const nombrePreview = puedeGuardarCreacion ? componerNombre(form.edificio, form.piso, form.numero) : '';
  const ubicacionPreview = puedeGuardarCreacion ? componerUbicacion(form.edificio, form.piso, form.numero) : '';

  function renderFormCrear() {
    return (
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Registra un <strong>salón específico</strong> dentro de un edificio del Campus Valle del Lilí.
          El nombre y la ubicación se generan automáticamente siguiendo la nomenclatura UAO.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 80px 90px', gap: '10px', marginBottom: '14px' }}>
          <div>
            <label className="label">Edificio *</label>
            <select
              className="input-field"
              value={form.edificio}
              onChange={(e) => setForm({ ...form, edificio: e.target.value })}
              required
            >
              <option value="">Seleccione</option>
              {EDIFICIOS_UAO.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Piso *</label>
            <input
              className="input-field"
              type="number"
              min={0}
              max={10}
              placeholder="2"
              value={form.piso}
              onChange={(e) => setForm({ ...form, piso: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Salón *</label>
            <input
              className="input-field"
              type="text"
              placeholder="05"
              maxLength={3}
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value.replace(/\D/g, '') })}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label className="label">Capacidad (personas) *</label>
          <input
            className="input-field"
            type="number"
            min={2}
            max={100}
            value={form.capacidad}
            onChange={(e) => setForm({ ...form, capacidad: Number(e.target.value) })}
            required
          />
          <p className="helper-text">Entre 2 y 100 personas</p>
        </div>

        {/* Preview de lo que se creará */}
        <div
          style={{
            padding: '12px 14px', borderRadius: '10px', marginBottom: '16px',
            background: puedeGuardarCreacion ? 'var(--success-bg)' : 'var(--bg-input)',
            border: `1px solid ${puedeGuardarCreacion ? 'var(--success)' : 'var(--border)'}`,
            fontSize: '0.8rem',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.04em' }}>
            SE CREARÁ
          </div>
          {puedeGuardarCreacion ? (
            <>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{nombrePreview}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{ubicacionPreview}</div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Completa los campos para ver la vista previa</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="button" variant="secondary" onClick={() => setShowModal(false)} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving || !puedeGuardarCreacion} fullWidth>
            {saving ? 'Guardando...' : 'Registrar salón'}
          </Button>
        </div>
      </form>
    );
  }

  function renderFormEditar() {
    return (
      <form onSubmit={handleSubmit}>
        <Input
          label="Nombre de la sala"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
          wrapperClassName="mb-3"
          helperText="Único dentro de tu facultad"
        />
        <Input
          label="Ubicación"
          value={form.ubicacion}
          onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
          wrapperClassName="mb-3"
          helperText="Ej: Aulas 1, Piso 2, Salón 05"
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
          <Button type="submit" variant="primary" disabled={saving} fullWidth>
            {saving ? 'Guardando...' : 'Actualizar'}
          </Button>
        </div>
      </form>
    );
  }
  const deshabilitadas = salas.length - disponibles;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Catálogo de Salas</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
            Busca por edificio, capacidad o recursos y reserva desde aquí
          </p>
        </div>
        {isSecretaria && (
          <Button variant="primary" onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Nueva Sala
          </Button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div className="stat-card">
          <div className="stat-value">{salas.length}</div>
          <div className="stat-label">Salas encontradas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{disponibles}</div>
          <div className="stat-label">Disponibles</div>
        </div>
        {isSecretaria && (
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{deshabilitadas}</div>
            <div className="stat-label">Deshabilitadas</div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <FilterBar
        recursos={recursos}
        value={filters}
        onChange={setFilters}
        totalResultados={salas.length}
      />

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : salas.length === 0 ? (
        <EmptyState
          icon={<DoorOpen size={40} />}
          title="No se encontraron salas"
          description="Ajusta los filtros o limpia la búsqueda para ver más resultados."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {salas.map((sala) => (
            <Card key={sala.id} padding="lg">
              {/* Header card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.2 }}>{sala.nombre}</h3>
                  {sala.ubicacion && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {sala.ubicacion}
                    </div>
                  )}
                </div>
                <span className={`badge ${sala.habilitada ? 'badge-success' : 'badge-danger'}`}>
                  {sala.habilitada ? 'Disponible' : 'Deshabilitada'}
                </span>
              </div>

              {/* Capacidad */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                <Users size={12} /> Capacidad: <strong style={{ color: 'var(--text-primary)' }}>{sala.capacidad}</strong> personas
              </div>

              {/* Recursos con iconos */}
              {sala.salaRecursos.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                  {sala.salaRecursos.map((sr) => (
                    <ResourceChip
                      key={sr.id}
                      nombre={sr.recurso.nombre}
                      categoria={sr.recurso.categoria}
                      icono={sr.recurso.icono}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
                  Sin recursos asignados
                </div>
              )}

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                {isSecretaria ? (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(sala)} leftIcon={<Edit3 size={13} />} fullWidth>
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
                  sala.habilitada && (
                    <Link
                      href={`/reservas?salaId=${sala.id}&new=1`}
                      className="btn-primary"
                      style={{ width: '100%', padding: '9px 12px', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <CalendarCheck size={14} /> Reservar
                    </Link>
                  )
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal crear/editar — flujo estructurado UAO */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingSala ? 'Editar Sala' : 'Registrar Salón'}>
        {editingSala ? renderFormEditar() : renderFormCrear()}
      </Modal>
    </div>
  );
}
