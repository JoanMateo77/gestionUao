'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Cpu, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog, EmptyState, Breadcrumbs, Button, Card } from '@/components/ui';

interface Recurso { id: number; nombre: string; descripcion: string | null; }
interface SalaRecurso { id: number; recurso: Recurso; }
interface Sala { id: number; nombre: string; ubicacion: string | null; }

export default function RecursosPage() {
  const params = useParams();
  const salaId = Number(params.id);
  const [sala, setSala] = useState<Sala | null>(null);
  const [assigned, setAssigned] = useState<SalaRecurso[]>([]);
  const [allResources, setAllResources] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecurso, setSelectedRecurso] = useState(0);
  const [adding, setAdding] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ id: number; nombre: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, r, a] = await Promise.all([
        fetch(`/api/rooms/${salaId}`), fetch(`/api/rooms/${salaId}/resources`), fetch('/api/resources'),
      ]);
      setSala(await s.json()); setAssigned(await r.json()); setAllResources(await a.json());
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  }, [salaId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const assignedIds = new Set(assigned.map((a) => a.recurso.id));
  const available = allResources.filter((r) => !assignedIds.has(r.id));

  const handleAdd = async () => {
    if (!selectedRecurso) return; setAdding(true);
    try {
      const res = await fetch(`/api/rooms/${salaId}/resources`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recursoId: selectedRecurso }),
      });
      if (!res.ok) { toast.error('Error'); return; }
      toast.success('Recurso agregado'); setSelectedRecurso(0); fetchData();
    } catch { toast.error('Error'); }
    finally { setAdding(false); }
  };

  const handleRemove = (id: number, nombre: string) => {
    setRemoveTarget({ id, nombre });
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/rooms/${salaId}/resources/${removeTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Error'); return; }
      toast.success('Recurso retirado'); fetchData();
      setRemoveTarget(null);
    } catch { toast.error('Error'); }
    finally { setRemoving(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Salas', href: '/salas' },
          { label: sala?.nombre || 'Sala' },
          { label: 'Recursos' },
        ]}
      />

      <Link href="/salas" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '16px',
      }}>
        <ArrowLeft size={16} /> Volver a Salas
      </Link>

      <h1 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '4px' }}>
        Recursos — {sala?.nombre || 'Sala'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '24px' }}>
        Administra los recursos tecnológicos asignados a esta sala
      </p>

      {/* Add */}
      {available.length > 0 && (
        <Card padding="lg" className="mb-6">
          <h3 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Agregar Recurso
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select className="input-field" style={{ flex: 1, minWidth: '200px' }} value={selectedRecurso}
              onChange={(e) => setSelectedRecurso(Number(e.target.value))}>
              <option value={0}>Seleccione un recurso...</option>
              {available.map((r) => (<option key={r.id} value={r.id}>{r.nombre} — {r.descripcion || ''}</option>))}
            </select>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={!selectedRecurso || adding}
              leftIcon={<Plus size={16} />}
            >
              {adding ? 'Agregando...' : 'Agregar'}
            </Button>
          </div>
        </Card>
      )}

      {/* Assigned */}
      {assigned.length === 0 ? (
        <EmptyState
          icon={<Package size={40} />}
          title="No hay recursos asignados"
          description="Selecciona un recurso del listado superior para asignarlo a esta sala."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {assigned.map((sr) => (
            <Card key={sr.id} className="flex items-center justify-between" padding="md">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={18} color="var(--text-muted)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sr.recurso.nombre}</div>
                  {sr.recurso.descripcion && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sr.recurso.descripcion}</div>}
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemove(sr.id, sr.recurso.nombre)}
                title={`Retirar ${sr.recurso.nombre}`}
                aria-label={`Retirar ${sr.recurso.nombre} de la sala`}
              >
                <Trash2 size={14} />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        onClose={() => (removing ? null : setRemoveTarget(null))}
        onConfirm={confirmRemove}
        title="Retirar recurso"
        description={removeTarget ? `¿Retirar el recurso "${removeTarget.nombre}" de esta sala?` : ''}
        confirmText="Retirar"
        cancelText="Cancelar"
        variant="danger"
        loading={removing}
      />
    </div>
  );
}
