'use client';

/**
 * Timeline horizontal 7:00–21:30 con bloques de reservas ocupadas y
 * rango seleccionado. Detecta conflicto visual antes de enviar el form.
 */

const START_MIN = 7 * 60;   // 07:00
const END_MIN = 21 * 60 + 30; // 21:30
const TOTAL_MIN = END_MIN - START_MIN;

type Ocupado = {
  id: number;
  horaInicio: string; // "HH:MM"
  horaFin: string;
  motivo?: string;
  usuarioNombre?: string;
};

function hhmmToMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function clampPct(min: number): number {
  const rel = ((min - START_MIN) / TOTAL_MIN) * 100;
  return Math.max(0, Math.min(100, rel));
}

interface Props {
  ocupados: Ocupado[];
  seleccion?: { horaInicio?: string; horaFin?: string };
  loading?: boolean;
}

export function AvailabilityTimeline({ ocupados, seleccion, loading }: Props) {
  const selMin = seleccion?.horaInicio && seleccion?.horaFin
    ? { ini: hhmmToMin(seleccion.horaInicio), fin: hhmmToMin(seleccion.horaFin) }
    : null;

  const conflicto = selMin
    ? ocupados.some((o) => {
        const oi = hhmmToMin(o.horaInicio);
        const of = hhmmToMin(o.horaFin);
        return oi < selMin.fin && of > selMin.ini;
      })
    : false;

  const horas = [7, 9, 11, 13, 15, 17, 19, 21];

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          position: 'relative',
          height: '44px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        aria-label="Línea de tiempo de disponibilidad de la sala"
        role="img"
      >
        {/* Marcas de hora */}
        {horas.map((h) => (
          <div
            key={h}
            style={{
              position: 'absolute',
              left: `${clampPct(h * 60)}%`,
              top: 0, bottom: 0,
              borderLeft: '1px dashed var(--border)',
              opacity: 0.6,
            }}
          />
        ))}

        {/* Bloques ocupados */}
        {!loading && ocupados.map((o) => {
          const ini = clampPct(hhmmToMin(o.horaInicio));
          const fin = clampPct(hhmmToMin(o.horaFin));
          const width = Math.max(1, fin - ini);
          return (
            <div
              key={o.id}
              title={`Ocupada ${o.horaInicio}–${o.horaFin}${o.motivo ? ' · ' + o.motivo : ''}`}
              style={{
                position: 'absolute',
                top: '6px', bottom: '6px',
                left: `${ini}%`,
                width: `${width}%`,
                background: 'var(--danger-bg)',
                borderLeft: '2px solid var(--danger)',
                borderRight: '2px solid var(--danger)',
                borderRadius: '4px',
              }}
            />
          );
        })}

        {/* Rango seleccionado */}
        {selMin && selMin.fin > selMin.ini && (
          <div
            style={{
              position: 'absolute',
              top: '2px', bottom: '2px',
              left: `${clampPct(selMin.ini)}%`,
              width: `${Math.max(1, clampPct(selMin.fin) - clampPct(selMin.ini))}%`,
              border: `2px solid ${conflicto ? 'var(--danger)' : 'var(--success)'}`,
              background: conflicto ? 'rgba(220,38,38,0.15)' : 'rgba(22,163,74,0.15)',
              borderRadius: '6px',
            }}
          />
        )}

        {loading && (
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', color: 'var(--text-muted)',
            }}
          >
            Cargando disponibilidad…
          </div>
        )}
      </div>

      {/* Escala */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        <span>07:00</span>
        <span>12:00</span>
        <span>17:00</span>
        <span>21:30</span>
      </div>

      {/* Leyenda / estado */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.7rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--danger-bg)', border: '1px solid var(--danger)' }} />
          Ocupado
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', border: `1px solid ${conflicto ? 'var(--danger)' : 'var(--success)'}`, background: conflicto ? 'rgba(220,38,38,0.15)' : 'rgba(22,163,74,0.15)' }} />
          Tu selección
        </span>
        {conflicto && (
          <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
            ⚠ Conflicto con reserva existente
          </span>
        )}
      </div>
    </div>
  );
}
