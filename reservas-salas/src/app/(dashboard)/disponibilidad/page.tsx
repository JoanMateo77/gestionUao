'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Users } from 'lucide-react';

/* ─── Tipos ─── */
interface Sala {
  id: number;
  nombre: string;
  ubicacion: string | null;
  capacidad: number;
}

interface ReservaSlot {
  id: number;
  salaId: number;
  fecha: string;       // "YYYY-MM-DD"
  horaInicio: string;  // "HH:MM"
  horaFin: string;     // "HH:MM"
  motivo: string | null;
  usuario: { nombre: string };
}

/* ─── Constantes ─── */
const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio',
  'agosto','septiembre','octubre','noviembre','diciembre'];

/** Franjas de 30 min: 07:00 … 21:00 (la última reservable es hasta 21:30) */
function generarFranjas(): string[] {
  const slots: string[] = [];
  for (let h = 7; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 21) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots; // "07:00" … "21:00"
}
const FRANJAS = generarFranjas();

/* ─── Utilidades de fecha ─── */
function getLunes(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function getDiasSemana(lunes: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(lunes);
    d.setUTCDate(lunes.getUTCDate() + i);
    return d;
  });
}

function toYMD(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** "HH:MM" → minutos desde medianoche */
function hhmm(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** ¿La franja `slot` ("HH:MM") está cubierta por la reserva? */
function franjaOcupada(slot: string, r: ReservaSlot): boolean {
  const s = hhmm(slot);
  return s >= hhmm(r.horaInicio) && s < hhmm(r.horaFin);
}

function add30Mins(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + 30;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/* ─── Componente ─── */
export default function DisponibilidadPage() {
  const { status } = useSession({ required: true });

  const hoy = new Date();
  const [lunes, setLunes] = useState<Date>(() => getLunes(hoy));
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date>(() => {
    const dow = hoy.getUTCDay();
    return (dow === 0 || dow === 6) ? getLunes(hoy) : hoy;
  });

  const [salas, setSalas] = useState<Sala[]>([]);
  const [reservas, setReservas] = useState<ReservaSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState<{ reserva: ReservaSlot; x: number; y: number } | null>(null);
  
  // Booking modal
  const [bookingModal, setBookingModal] = useState<{ salaId: number; salaNombre: string; slot: string } | null>(null);
  const [bookingForm, setBookingForm] = useState({ horaInicio: '', horaFin: '', motivo: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const dias = getDiasSemana(lunes);

  /* ─── Fetch ─── */
  const fetchData = useCallback(async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/availability?fecha=${toYMD(lunes)}`);
      if (!res.ok) {
        setError('No se pudo cargar la disponibilidad');
        return;
      }
      const json = await res.json();
      setSalas(json.salas ?? []);
      setReservas(json.reservas ?? []);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [lunes, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDateChangeStr = (val: string) => {
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    const newDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    setDiaSeleccionado(newDate);
    
    const newLunes = getLunes(newDate);
    if (toYMD(newLunes) !== toYMD(lunes)) {
      setLunes(newLunes);
    }
  };

  /* ─── Helpers ─── */
  const getReserva = (salaId: number, fecha: Date, slot: string) =>
    reservas.find((r) => r.salaId === salaId && r.fecha === toYMD(fecha) && franjaOcupada(slot, r));

  const diaSelStr = toYMD(diaSeleccionado);

  if (status === 'loading') {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;
  }

  return (
    <div className="fade-in" style={{ position: 'relative' }} onClick={() => setTooltip(null)}>

      {/* Header Estético con Datepicker */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        background: 'var(--bg-secondary)', padding: '20px 24px',
        borderRadius: '16px', border: '1px solid var(--border)',
        marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'var(--primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
          }}>
            <CalendarDays size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px 0' }}>Explorar Disponibilidad</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, textTransform: 'capitalize' }}>
              {diaSeleccionado.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => handleDateChangeStr(toYMD(hoy))} style={{ padding: '10px 18px', fontWeight: 600 }}>
            Ir a Hoy
          </button>
          <input 
            type="date" 
            className="input-field" 
            value={toYMD(diaSeleccionado)}
            onChange={(e) => handleDateChangeStr(e.target.value)}
            style={{ padding: '10px 16px', cursor: 'pointer', minWidth: '160px', fontWeight: 600, margin: 0 }}
          />
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '3px', background: 'repeating-linear-gradient(-45deg, #22c55e, #22c55e 6px, #16a34a 6px, #16a34a 12px)', display: 'inline-block' }} />
          Disponible
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '3px', background: '#ef4444', display: 'inline-block' }} />
          No disponible
        </span>
      </div>

      {/* Contenido */}
      {error ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--danger)' }}>
          {error}
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : salas.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={40} />
          <p style={{ marginTop: '8px' }}>No hay salas habilitadas en tu facultad</p>
        </div>
      ) : (
        /* Grid Horizontal tipo Gantt */
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          {/* Panel Izquierdo Fijo: Salas */}
          <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid var(--border)', background: '#fff', zIndex: 10, boxShadow: '2px 0 8px rgba(0,0,0,0.05)' }}>
            <div style={{ height: '44px', padding: '0 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', background: '#fafafa' }}>
              Espacio
            </div>
            {salas.map((sala) => (
              <div key={sala.id} style={{ height: '54px', padding: '0 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '0.9rem', color: '#2563eb', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sala.nombre}
                </div>
              </div>
            ))}
          </div>

          {/* Panel Derecho Scrolleable: Tiempo */}
          <div style={{ flex: 1, overflowX: 'auto', background: '#fff' }}>
             <div style={{ display: 'inline-flex', flexDirection: 'column', minWidth: '100%' }}>
               {/* Encabezado: Horas */}
               <div style={{ height: '44px', display: 'flex', borderBottom: '1px solid var(--border)', background: '#fafafa' }}>
                 {FRANJAS.map((slot) => {
                   const isHour = slot.endsWith(':00');
                   return (
                     <div key={slot} style={{ 
                       width: '45px', flexShrink: 0, borderRight: '1px dashed #e5e7eb', 
                       position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '4px' 
                     }}>
                       {isHour && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', position: 'absolute', left: '4px' }}>{slot}</span>}
                     </div>
                   );
                 })}
               </div>

               {/* Filas: Disponibilidad por Sala */}
               {salas.map((sala) => (
                 <div key={sala.id} style={{ height: '54px', display: 'flex', borderBottom: '1px solid var(--border)' }}>
                   {FRANJAS.map((slot) => {
                     const reserva = getReserva(sala.id, diaSeleccionado, slot);
                     const ocupada = !!reserva;
                     
                     const bg = ocupada 
                       ? '#dc2626' // Rojo sólido
                       : 'repeating-linear-gradient(-45deg, #22c55e, #22c55e 8px, #16a34a 8px, #16a34a 16px)'; // Verde rayado
                     
                     return (
                       <div key={slot} 
                            onClick={(e) => {
                              if(ocupada) {
                                e.stopPropagation();
                                setTooltip({ reserva, x: e.clientX, y: e.clientY });
                              } else {
                                setBookingModal({ salaId: sala.id, salaNombre: sala.nombre, slot });
                                setBookingForm({ horaInicio: slot, horaFin: add30Mins(slot), motivo: '' });
                                setBookingError('');
                              }
                            }}
                            style={{ 
                              width: '45px', flexShrink: 0, 
                              borderRight: '1px dashed #e5e7eb',
                              padding: '6px 1px',
                              cursor: 'pointer',
                            }}>
                         <div style={{
                           width: '100%', height: '100%', 
                           background: bg,
                           borderRadius: '2px',
                           transition: 'opacity 0.2s',
                           opacity: ocupada ? 0.95 : 1,
                         }} />
                       </div>
                     );
                   })}
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: Math.min(tooltip.x + 12, typeof window !== 'undefined' ? window.innerWidth - 260 : 800),
            top: Math.min(tooltip.y + 12, typeof window !== 'undefined' ? window.innerHeight - 150 : 600),
            zIndex: 9999,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            minWidth: '210px',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔴 Sala ocupada
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <div><strong>Reservado por:</strong> {tooltip.reserva.usuario.nombre}</div>
            {tooltip.reserva.motivo && <div><strong>Motivo:</strong> {tooltip.reserva.motivo}</div>}
            <div><strong>Horario:</strong> {tooltip.reserva.horaInicio} – {tooltip.reserva.horaFin}</div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card fade-in" style={{ padding: '24px', width: '100%', maxWidth: '440px', background: '#fff', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700 }}>Reservar: {bookingModal.salaNombre}</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Fecha: <span style={{ fontWeight: 600 }}>{diaSeleccionado.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
            </p>
            
            {bookingError && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px', border: '1px solid #fecaca' }}>{bookingError}</div>}
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setBookingLoading(true);
              setBookingError('');
              try {
                const res = await fetch('/api/reservations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    salaId: bookingModal.salaId,
                    fecha: toYMD(diaSeleccionado),
                    horaInicio: bookingForm.horaInicio,
                    horaFin: bookingForm.horaFin,
                    motivo: bookingForm.motivo
                  })
                });
                const data = await res.json();
                if (!res.ok) {
                  setBookingError(data.error || 'Error al reservar la sala');
                } else {
                  setBookingModal(null);
                  fetchData(); // reload availability
                }
              } catch(err) {
                setBookingError('Error de conexión al servidor');
              } finally {
                setBookingLoading(false);
              }
            }}>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Hora Inicio</label>
                  <select className="input-field" value={bookingForm.horaInicio} onChange={e => setBookingForm({...bookingForm, horaInicio: e.target.value})} required>
                    {FRANJAS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Hora Fin</label>
                  <select className="input-field" value={bookingForm.horaFin} onChange={e => setBookingForm({...bookingForm, horaFin: e.target.value})} required>
                    {FRANJAS.map(f => <option key={f} value={f}>{f}</option>)}
                    <option value="21:30">21:30</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="label">Motivo de reserva (Opcional)</label>
                <input type="text" className="input-field" placeholder="Ej. Estudio en grupo, Clase..." value={bookingForm.motivo} onChange={e => setBookingForm({...bookingForm, motivo: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setBookingModal(null)} disabled={bookingLoading}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={bookingLoading}>
                  {bookingLoading ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
