'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import {
  ConfirmDialog, EmptyState, Breadcrumbs, Button, Card,
  ResourceIcon,
} from '@/components/ui';

interface Recurso {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  icono: string;
}
interface SalaRecurso { id: number; recurso: Recurso }
interface Sala { id: number; nombre: string; ubicacion: string | null }

const ORDEN_CATEGORIAS = [
  'PROYECCION', 'COMPUTO', 'CONECTIVIDAD', 'AUDIO',
  'ESCRITURA', 'CONFORT', 'ACCESIBILIDAD',
] as const;

const LABEL_CATEGORIA: Record<string, string> = {
  PROYECCION: 'Proyección',
  COMPUTO: 'Cómputo',
  CONECTIVIDAD: 'Conectividad',
  AUDIO: 'Audio',
  ESCRITURA: 'Escritura',
  CONFORT: 'Confort',
  ACCESIBILIDAD: 'Accesibilidad',
};

export default function RecursosPage() {
  const params = useParams();
  const salaId = Number(params.id);
  const [sala, setSala] = useState<Sala | null>(null);
  const [assigned, setAssigned] = useState<SalaRecurso[]>([]);
  const [allResources, setAllResources] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: number; nombre: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, r, a] = await Promise.all([
        fetch(`/api/rooms/${salaId}`),
        fetch(`/api/rooms/${salaId}/resources`),
        fetch('/api/resources'),
      ]);
      setSala(await s.json());
      setAssigned(await r.json());
      setAllResources(await a.json());
    } catch { toast.error('Error al cargar'); }
    finally { setLoading(false); }
  }, [salaId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const assignedIds = useMemo(() => new Set(assigned.map((a) => a.recurso.id)), [assigned]);
  const available = useMemo(() => allResources.filter((r) => !assignedIds.has(r.id)), [allResources, assignedIds]);

  const availablePorCategoria = useMemo(() => {
    const grupos: Record<string, Recurso[]> = {};
    for (const r of available) (grupos[r.categoria] ||= []).push(r);
    return grupos;
  }, [available]);

  const assignedPorCategoria = useMemo(() => {
    const grupos: Record<string, SalaRecurso[]> = {};
    for (const sr of assigned) (grupos[sr.recurso.categoria] ||= []).push(sr);
    return grupos;
  }, [assigned]);

  const handleAdd = async (recursoId: number) => {
    setAdding(recursoId);
    try {
      const res = await fetch(`/api/rooms/${salaId}/resources`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recursoId }),
      });
      if (!res.ok) { toast.error('Error al agregar'); return; }
      toast.success('Recurso agregado'); fetchData();
    } catch { toast.error('Error de conexión'); }
    finally { setAdding(null); }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/rooms/${salaId}/resources/${removeTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Error al retirar'); return; }
      toast.success('Recurso retirado'); fetchData();
      setRemoveTarget(null);
    } catch { toast.error('Error'); }
    finally { setRemoving(false); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <div className="spinner" />
      </div>
    );
  }

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

      <Link
        href="/salas"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '16px',
        }}
      >
        <ArrowLeft size={16} /> Volver a Salas
      </Link>

      <h1 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '4px' }}>
        Recursos — {sala?.nombre || 'Sala'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '24px' }}>
        Administra los recursos tecnológicos asignados a este espacio
      </p>

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-value">{assigned.length}</div>
          <div className="stat-label">Asignados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text-muted)' }}>{available.length}</div>
          <div className="stat-label">Disponibles</div>
        </div>
      </div>

      {/* Catálogo disponible */}
      {available.length > 0 && (
        <Card padding="lg" className="mb-6">
          <h3 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Agregar recursos
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Haz clic en un recurso para asignarlo a esta sala.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ORDEN_CATEGORIAS.map((cat) => {
              const items = availablePorCategoria[cat];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    {LABEL_CATEGORIA[cat].toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {items.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleAdd(r.id)}
                        disabled={adding === r.id}
                        title={r.descripcion ?? r.nombre}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px 12px', borderRadius: '999px',
                          background: 'var(--bg-input)', border: '1px dashed var(--border)',
                          color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                      >
                        <ResourceIcon icono={r.icono} size={14} />
                        {r.nombre}
                        {adding === r.id ? <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>…</span> : <Plus size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Asignados */}
      {assigned.length === 0 ? (
        <EmptyState
          icon={<Package size={40} />}
          title="No hay recursos asignados"
          description="Selecciona un recurso del catálogo superior para asignarlo a esta sala."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ORDEN_CATEGORIAS.map((cat) => {
            const items = assignedPorCategoria[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {LABEL_CATEGORIA[cat]}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                  {items.map((sr) => (
                    <Card key={sr.id} padding="md">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '36px', height: '36px', borderRadius: '10px',
                              background: 'var(--bg-input)', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}
                          >
                            <ResourceIcon icono={sr.recurso.icono} size={16} style={{ color: 'var(--text-primary)' }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sr.recurso.nombre}
                            </div>
                            {sr.recurso.descripcion && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sr.recurso.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setRemoveTarget({ id: sr.id, nombre: sr.recurso.nombre })}
                          title={`Retirar ${sr.recurso.nombre}`}
                          aria-label={`Retirar ${sr.recurso.nombre} de la sala`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
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
