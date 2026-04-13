'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BarChart3, Clock, User, Search } from 'lucide-react';

type TipoReporte = 'reservas' | 'horas' | 'usuario';

interface FilaReservas { sala: string; ubicacion: string | null; total: number; confirmadas: number; canceladas: number; }
interface FilaHoras { sala: string; ubicacion: string | null; horas: number; }
interface FilaUsuario { nombre: string; correo: string; rol: string; total: number; confirmadas: number; canceladas: number; }

const TIPOS = [
  { key: 'reservas' as TipoReporte, label: 'Por N.º de Reservas', icon: BarChart3, desc: 'Total de reservas por sala' },
  { key: 'horas' as TipoReporte, label: 'Por Horas Reservadas', icon: Clock, desc: 'Horas de uso por sala (solo confirmadas)' },
  { key: 'usuario' as TipoReporte, label: 'Por Usuario', icon: User, desc: 'Reservas por docente o secretaria' },
];

export default function ReportesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tipo, setTipo] = useState<TipoReporte>('reservas');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState<FilaReservas[] | FilaHoras[] | FilaUsuario[] | null>(null);

  // Redirigir si no es SECRETARIA
  if (status === 'authenticated' && session?.user?.rol !== 'SECRETARIA') {
    router.replace('/reservas');
    return null;
  }

  const generarReporte = useCallback(async () => {
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }
    setLoading(true); setDatos(null);
    try {
      const q = new URLSearchParams({ tipo });
      if (fechaInicio) q.set('fechaInicio', fechaInicio);
      if (fechaFin) q.set('fechaFin', fechaFin);
      const res = await fetch(`/api/reports?${q}`);
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Error'); return; }
      setDatos(json.datos);
      if (json.datos.length === 0) toast.info('No hay datos para el rango seleccionado');
    } catch { toast.error('Error de conexión'); }
    finally { setLoading(false); }
  }, [tipo, fechaInicio, fechaFin]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Reportes de Uso</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
          Analiza el uso de las salas de reuniones de tu facultad
        </p>
      </div>

      {/* Selector de tipo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {TIPOS.map(({ key, label, icon: Icon, desc }) => (
          <button key={key} onClick={() => { setTipo(key); setDatos(null); }}
            style={{
              padding: '16px', borderRadius: '12px', border: `2px solid ${tipo === key ? 'var(--primary)' : 'var(--border)'}`,
              background: tipo === key ? 'var(--info-bg)' : 'var(--bg-secondary)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
            }}>
            <Icon size={20} color={tipo === key ? 'var(--primary)' : 'var(--text-muted)'} />
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '8px', color: tipo === key ? 'var(--primary)' : 'var(--text-primary)' }}>{label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{desc}</div>
          </button>
        ))}
      </div>

      {/* Filtros de fecha */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px' }}>Rango de fechas (opcional)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label className="label" style={{ fontSize: '0.75rem' }}>Desde</label>
            <input className="input-field" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div>
            <label className="label" style={{ fontSize: '0.75rem' }}>Hasta</label>
            <input className="input-field" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={generarReporte} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Generando...</>
              : <><Search size={16} /> Generar Reporte</>}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {datos !== null && datos.length === 0 && (
        <div className="empty-state">
          <BarChart3 size={40} />
          <p style={{ marginTop: '8px' }}>No hay datos disponibles para el rango seleccionado</p>
        </div>
      )}

      {datos !== null && datos.length > 0 && tipo === 'reservas' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
            Uso por número de reservas — {(datos as FilaReservas[]).reduce((s, r) => s + r.total, 0)} reservas totales
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-input)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Sala</th>
                  <th style={thStyle}>Ubicación</th>
                  <th style={{ ...thStyle, color: 'var(--success)' }}>Confirmadas</th>
                  <th style={{ ...thStyle, color: 'var(--danger)' }}>Canceladas</th>
                  <th style={thStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(datos as FilaReservas[]).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{row.sala}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{row.ubicacion ?? '—'}</td>
                    <td style={{ ...tdStyle, color: 'var(--success)' }}>{row.confirmadas}</td>
                    <td style={{ ...tdStyle, color: 'var(--danger)' }}>{row.canceladas}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {datos !== null && datos.length > 0 && tipo === 'horas' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
            Horas reservadas por sala — {(datos as FilaHoras[]).reduce((s, r) => s + r.horas, 0).toFixed(2)} h totales
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-input)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Sala</th>
                  <th style={thStyle}>Ubicación</th>
                  <th style={thStyle}>Horas reservadas</th>
                </tr>
              </thead>
              <tbody>
                {(datos as FilaHoras[]).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{row.sala}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{row.ubicacion ?? '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{row.horas} h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {datos !== null && datos.length > 0 && tipo === 'usuario' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
            Reservas por usuario — {(datos as FilaUsuario[]).length} usuarios activos
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-input)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Correo</th>
                  <th style={thStyle}>Rol</th>
                  <th style={{ ...thStyle, color: 'var(--success)' }}>Confirmadas</th>
                  <th style={{ ...thStyle, color: 'var(--danger)' }}>Canceladas</th>
                  <th style={thStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(datos as FilaUsuario[]).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{row.nombre}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{row.correo}</td>
                    <td style={tdStyle}>
                      <span className={`badge ${row.rol === 'SECRETARIA' ? 'badge-info' : 'badge-success'}`}
                        style={{ fontSize: '0.65rem' }}>
                        {row.rol === 'SECRETARIA' ? 'Secretaria' : 'Docente'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--success)' }}>{row.confirmadas}</td>
                    <td style={{ ...tdStyle, color: 'var(--danger)' }}>{row.canceladas}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontWeight: 600,
  color: 'var(--text-secondary)', fontSize: '0.75rem', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 16px', verticalAlign: 'middle',
};
