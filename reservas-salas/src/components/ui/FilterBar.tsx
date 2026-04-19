'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ResourceChip } from './ResourceChip';

export type Recurso = {
  id: number;
  nombre: string;
  categoria: string;
  icono: string;
};

export type Filters = {
  q: string;
  edificio: string;
  capacidadMin: string;
  capacidadMax: string;
  recursos: number[];
};

export const EDIFICIOS_UAO = [
  'Aulas 1', 'Aulas 2', 'Aulas 3', 'Aulas 4',
  'Torreón 0', 'Torreón 1', 'Torreón 2', 'Torreón 3', 'Torreón 4',
  'CRAI', 'Ala Sur', 'Edificio Central', 'Bienestar',
];

interface Props {
  recursos: Recurso[];
  value: Filters;
  onChange: (f: Filters) => void;
  totalResultados?: number;
}

export function FilterBar({ recursos, value, onChange, totalResultados }: Props) {
  const [expandido, setExpandido] = useState(false);

  const toggleRecurso = (id: number) => {
    const activos = value.recursos.includes(id)
      ? value.recursos.filter((x) => x !== id)
      : [...value.recursos, id];
    onChange({ ...value, recursos: activos });
  };

  const limpiar = () =>
    onChange({ q: '', edificio: '', capacidadMin: '', capacidadMax: '', recursos: [] });

  const hayActivos =
    value.q || value.edificio || value.capacidadMin || value.capacidadMax || value.recursos.length > 0;

  // Agrupar recursos por categoría
  const porCategoria = recursos.reduce<Record<string, Recurso[]>>((acc, r) => {
    (acc[r.categoria] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div
      className="card"
      style={{ padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      {/* Fila principal: búsqueda + toggle filtros */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o ubicación…"
            value={value.q}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            className="input-field"
            style={{ paddingLeft: '36px' }}
            aria-label="Buscar salas"
          />
        </div>

        <select
          className="input-field"
          value={value.edificio}
          onChange={(e) => onChange({ ...value, edificio: e.target.value })}
          style={{ flex: '0 1 200px', minWidth: '160px' }}
          aria-label="Filtrar por edificio"
        >
          <option value="">Todos los edificios</option>
          {EDIFICIOS_UAO.map((ed) => (
            <option key={ed} value={ed}>{ed}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="btn-secondary"
          style={{ padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          aria-expanded={expandido}
          aria-controls="filtros-avanzados"
        >
          <SlidersHorizontal size={14} />
          Filtros
          {value.recursos.length > 0 && (
            <span
              style={{
                background: 'var(--primary)', color: 'var(--primary-fg)',
                fontSize: '0.65rem', padding: '2px 6px', borderRadius: '999px', fontWeight: 700,
              }}
            >
              {value.recursos.length}
            </span>
          )}
        </button>

        {hayActivos && (
          <button
            type="button"
            onClick={limpiar}
            className="btn-danger"
            style={{ padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <X size={14} /> Limpiar
          </button>
        )}

        {typeof totalResultados === 'number' && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {totalResultados} {totalResultados === 1 ? 'sala' : 'salas'}
          </span>
        )}
      </div>

      {/* Filtros avanzados */}
      {expandido && (
        <div
          id="filtros-avanzados"
          style={{
            display: 'flex', flexDirection: 'column', gap: '12px',
            borderTop: '1px solid var(--border)', paddingTop: '12px',
          }}
        >
          {/* Capacidad */}
          <div>
            <div className="label">Capacidad</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                min={2}
                max={100}
                placeholder="Mín"
                className="input-field"
                style={{ maxWidth: '100px' }}
                value={value.capacidadMin}
                onChange={(e) => onChange({ ...value, capacidadMin: e.target.value })}
                aria-label="Capacidad mínima"
              />
              <span style={{ color: 'var(--text-muted)' }}>—</span>
              <input
                type="number"
                min={2}
                max={100}
                placeholder="Máx"
                className="input-field"
                style={{ maxWidth: '100px' }}
                value={value.capacidadMax}
                onChange={(e) => onChange({ ...value, capacidadMax: e.target.value })}
                aria-label="Capacidad máxima"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>personas</span>
            </div>
          </div>

          {/* Recursos por categoría */}
          <div>
            <div className="label">Recursos requeridos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(porCategoria).map(([cat, items]) => (
                <div key={cat} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '100px' }}>
                    {cat}
                  </span>
                  {items.map((r) => (
                    <ResourceChip
                      key={r.id}
                      nombre={r.nombre}
                      categoria={r.categoria}
                      icono={r.icono}
                      onClick={() => toggleRecurso(r.id)}
                      active={value.recursos.includes(r.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
