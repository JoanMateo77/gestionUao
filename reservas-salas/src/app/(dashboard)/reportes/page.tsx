'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BarChart3, Clock, User, Search, FileDown, FileSpreadsheet } from 'lucide-react';
import { EmptyState, Button, Input, Card, Table } from '@/components/ui';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type TipoReporte = 'reservas' | 'horas' | 'usuario';

interface FilaReservas { sala: string; ubicacion: string | null; total: number; confirmadas: number; canceladas: number; }
interface FilaHoras { sala: string; ubicacion: string | null; horas: number; }
interface ReservaDetalle { id: number; fecha: string; horaInicio: string; horaFin: string; sala: string; ubicacion: string | null; estado: string; }
interface FilaUsuario { nombre: string; correo: string; rol: string; total: number; confirmadas: number; canceladas: number; reservas: ReservaDetalle[]; }

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
  const [busquedaUsuario, setBusquedaUsuario] = useState('');

  const datosUsuarioFiltrados: FilaUsuario[] = (
    tipo === 'usuario' && datos
      ? (datos as FilaUsuario[]).filter((u) =>
          u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
          u.correo.toLowerCase().includes(busquedaUsuario.toLowerCase())
        )
      : []
  );

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.rol !== 'SECRETARIA') {
      router.replace('/reservas');
    }
  }, [status, session, router]);

  const generarReporte = useCallback(async () => {
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }
    if (fechaInicio && fechaFin && fechaInicio === fechaFin) {
      const dia = new Date(fechaInicio + 'T12:00:00').getDay();
      if (dia === 0) {
        toast.error('Los domingos no tienen reservas. Por favor selecciona otro día.');
        return;
      }
    }
    setLoading(true); setDatos(null); setBusquedaUsuario('');
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

  const getTituloReporte = () => {
    const labels: Record<TipoReporte, string> = {
      reservas: 'Reporte por Nº de Reservas',
      horas: 'Reporte por Horas Reservadas',
      usuario: 'Reporte por Usuario',
    };
    return labels[tipo];
  };

  const getColumnas = (): string[] => {
    if (tipo === 'reservas') return ['#', 'Sala', 'Ubicación', 'Confirmadas', 'Canceladas', 'Total'];
    if (tipo === 'horas')    return ['#', 'Sala', 'Ubicación', 'Horas reservadas'];
    return ['#', 'Nombre', 'Correo', 'Rol', 'Fecha', 'Hora inicio', 'Hora fin', 'Sala', 'Ubicación', 'Estado'];
  };

  const getFilas = (): (string | number)[][] => {
    if (!datos) return [];
    if (tipo === 'reservas')
      return (datos as FilaReservas[]).map((r, i) => [i + 1, r.sala, r.ubicacion ?? '—', r.confirmadas, r.canceladas, r.total]);
    if (tipo === 'horas')
      return (datos as FilaHoras[]).map((r, i) => [i + 1, r.sala, r.ubicacion ?? '—', `${r.horas} h`]);
    const filas: (string | number)[][] = [];
    let idx = 1;
    for (const u of datosUsuarioFiltrados) {
      const rol = u.rol === 'SECRETARIA' ? 'Secretaria' : 'Docente';
      if (u.reservas && u.reservas.length > 0) {
        for (const rv of u.reservas) {
          filas.push([idx++, u.nombre, u.correo, rol, rv.fecha, rv.horaInicio, rv.horaFin, rv.sala, rv.ubicacion ?? '—', rv.estado]);
        }
      } else {
        filas.push([idx++, u.nombre, u.correo, rol, '—', '—', '—', '—', '—', '—']);
      }
    }
    return filas;
  };

  const descargarExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([getColumnas(), ...getFilas()]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    const rango = fechaInicio && fechaFin ? `_${fechaInicio}_al_${fechaFin}` : '';
    XLSX.writeFile(wb, `reporte_${tipo}${rango}.xlsx`);
    toast.success('Excel descargado correctamente');
  };

  const descargarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const subtitulo = fechaInicio && fechaFin ? `Período: ${fechaInicio} — ${fechaFin}` : 'Sin filtro de fechas';
    doc.setFontSize(16); doc.setTextColor(40, 40, 40);
    doc.text(getTituloReporte(), 14, 18);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(subtitulo, 14, 26);
    autoTable(doc, {
      startY: 32,
      head: [getColumnas()],
      body: getFilas(),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 255] },
    });
    const rango = fechaInicio && fechaFin ? `_${fechaInicio}_al_${fechaFin}` : '';
    doc.save(`reporte_${tipo}${rango}.pdf`);
    toast.success('PDF descargado correctamente');
  };

  if (status === 'loading' || (status === 'authenticated' && session?.user?.rol !== 'SECRETARIA')) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><div className="spinner" style={{ width: '36px', height: '36px' }} /></div>;
  }

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
          <button key={key} onClick={() => { setTipo(key); setDatos(null); setBusquedaUsuario(''); }}
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
      <Card padding="lg" className="mb-6">
        <h3 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px' }}>Rango de fechas (opcional)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <Input label="Desde" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          <Input label="Hasta" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          <Button variant="primary" onClick={generarReporte} disabled={loading}
            leftIcon={loading ? <div className="spinner" style={{ width: '14px', height: '14px' }} /> : <Search size={16} />}>
            {loading ? 'Generando...' : 'Generar Reporte'}
          </Button>
        </div>
      </Card>

      {/* Buscador de usuario */}
      {datos !== null && datos.length > 0 && tipo === 'usuario' && (
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="Buscar por nombre o correo..."
            value={busquedaUsuario}
            onChange={(e) => setBusquedaUsuario(e.target.value)}
            leftIcon={<Search size={15} />}
          />
          {busquedaUsuario && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {datosUsuarioFiltrados.length} usuario(s) encontrado(s)
            </p>
          )}
        </div>
      )}

      {/* Botones de descarga */}
      {datos !== null && datos.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Button variant="secondary" onClick={descargarExcel} leftIcon={<FileSpreadsheet size={16} />}>
            Exportar Excel
          </Button>
          <Button variant="secondary" onClick={descargarPDF} leftIcon={<FileDown size={16} />}>
            Exportar PDF
          </Button>
        </div>
      )}

      {/* Sin resultados */}
      {datos !== null && datos.length === 0 && (
        <EmptyState
          icon={<BarChart3 size={40} />}
          title="No hay datos disponibles"
          description="No se encontraron reservas para el rango de fechas seleccionado."
        />
      )}

      {/* Tabla: reservas por sala */}
      {datos !== null && datos.length > 0 && tipo === 'reservas' && (
        <Card padding="none" className="overflow-hidden">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
            Uso por número de reservas — {(datos as FilaReservas[]).reduce((s, r) => s + r.total, 0)} reservas totales
          </div>
          <Table className="rounded-none border-0" tableClassName="min-w-[560px]">
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
          </Table>
        </Card>
      )}

      {/* Tabla: horas por sala */}
      {datos !== null && datos.length > 0 && tipo === 'horas' && (
        <Card padding="none" className="overflow-hidden">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
            Horas reservadas por sala — {(datos as FilaHoras[]).reduce((s, r) => s + r.horas, 0).toFixed(2)} h totales
          </div>
          <Table className="rounded-none border-0" tableClassName="min-w-[560px]">
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
          </Table>
        </Card>
      )}

      {/* Tabla: reservas por usuario con detalle */}
      {datos !== null && datos.length > 0 && tipo === 'usuario' && (
        <Card padding="none" className="overflow-hidden">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
            Reservas por usuario — {datosUsuarioFiltrados.length} usuario(s)
            {busquedaUsuario && ` (filtrado de ${(datos as FilaUsuario[]).length})`}
            {' · '}
            {datosUsuarioFiltrados.reduce((s, u) => s + u.total, 0)} reservas
          </div>
          {datosUsuarioFiltrados.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No se encontraron usuarios con &ldquo;{busquedaUsuario}&rdquo;
            </div>
          ) : datosUsuarioFiltrados.map((usuario, ui) => (
            <div key={ui} style={{ borderBottom: '2px solid var(--border)' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                padding: '12px 20px', background: 'var(--bg-input)',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{usuario.nombre}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{usuario.correo}</span>
                <span className={`badge ${usuario.rol === 'SECRETARIA' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                  {usuario.rol === 'SECRETARIA' ? 'Secretaria' : 'Docente'}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>{usuario.confirmadas} conf.</span>
                  {' · '}
                  <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{usuario.canceladas} canc.</span>
                  {' · '}
                  <span style={{ fontWeight: 700 }}>{usuario.total} total</span>
                </span>
              </div>
              {usuario.reservas && usuario.reservas.length > 0 ? (
                <Table className="rounded-none border-0" tableClassName="min-w-[700px]">
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      <th style={thStyle}>Fecha</th>
                      <th style={thStyle}>Hora inicio</th>
                      <th style={thStyle}>Hora fin</th>
                      <th style={thStyle}>Sala</th>
                      <th style={thStyle}>Ubicación</th>
                      <th style={thStyle}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuario.reservas.map((rv) => (
                      <tr key={rv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdStyle}>{rv.fecha}</td>
                        <td style={tdStyle}>{rv.horaInicio}</td>
                        <td style={tdStyle}>{rv.horaFin}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{rv.sala}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{rv.ubicacion ?? '—'}</td>
                        <td style={tdStyle}>
                          <span className={`badge ${
                            rv.estado === 'CONFIRMADA' ? 'badge-success'
                            : rv.estado === 'CANCELADA' ? 'badge-danger'
                            : 'badge-warning'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {rv.estado === 'CONFIRMADA' ? 'Confirmada' : rv.estado === 'CANCELADA' ? 'Cancelada' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin reservas en el período</div>
              )}
            </div>
          ))}
        </Card>
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
