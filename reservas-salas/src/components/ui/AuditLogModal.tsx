'use client';

import { useEffect, useState, useCallback } from 'react';
import { Modal } from './Modal';
import { History, User, Clock } from 'lucide-react';

interface LogEntry {
  id: number;
  accion: string;
  entidad: string;
  entidadId: number;
  datosAnteriores: Record<string, unknown> | null;
  datosNuevos: Record<string, unknown> | null;
  fecha: string;
  ipAddress: string | null;
  usuario: { id: number; nombre: string; correoInstitucional: string };
}

interface AuditLogResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  entidad: 'SALA' | 'RESERVA' | 'SALA_RECURSO';
  entidadId: number;
  titulo?: string;
}

const ACCION_LABELS: Record<string, string> = {
  CREAR_SALA: 'Sala creada',
  EDITAR_SALA: 'Sala editada',
  CAMBIAR_ESTADO_SALA: 'Cambio de estado',
  AJUSTAR_RESERVA: 'Reserva ajustada',
  CANCELAR_RESERVA: 'Reserva cancelada',
  CREAR_RESERVA: 'Reserva creada',
  AGREGAR_RECURSO: 'Recurso agregado',
  RETIRAR_RECURSO: 'Recurso retirado',
  ACTUALIZAR_CANTIDAD_RECURSO: 'Cantidad actualizada',
};

const PAGE_SIZE = 20;

export function AuditLogModal({ open, onClose, entidad, entidadId, titulo }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      const setBusy = append ? setLoadingMore : setLoading;
      setBusy(true);
      try {
        const res = await fetch(
          `/api/audit-log?entidad=${entidad}&entidadId=${entidadId}&page=${targetPage}&limit=${PAGE_SIZE}`,
        );
        if (!res.ok) {
          if (!append) setLogs([]);
          return;
        }
        const data: AuditLogResponse = await res.json();
        setLogs((prev) => (append ? [...prev, ...data.logs] : data.logs));
        setPage(data.page);
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch {
        if (!append) setLogs([]);
      } finally {
        setBusy(false);
      }
    },
    [entidad, entidadId],
  );

  // Carga inicial (o re-carga al cambiar de entidad). Reset de estado para
  // que al abrir el modal de otra sala no se queden datos viejos.
  useEffect(() => {
    if (!open) return;
    setLogs([]);
    setPage(1);
    setTotal(0);
    setHasMore(false);
    fetchPage(1, false);
  }, [open, entidad, entidadId, fetchPage]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchPage(page + 1, true);
  };

  return (
    <Modal open={open} onClose={onClose} title={titulo ?? `Historial de cambios`}>
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            Cargando historial...
          </div>
        )}
        {!loading && logs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            <History size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <p style={{ fontSize: '0.85rem' }}>No hay registros de auditoría para esta entidad</p>
          </div>
        )}
        {!loading && logs.length > 0 && (
          <>
            {/* Contador para que el usuario sepa cuanto historial existe */}
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              Mostrando <strong style={{ color: 'var(--text-primary)' }}>{logs.length}</strong> de{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> registros
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '12px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                      {ACCION_LABELS[log.accion] ?? log.accion}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} />
                      {new Date(log.fecha).toLocaleString('es-CO', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                    <User size={11} />
                    {log.usuario.nombre} <span style={{ color: 'var(--text-muted)' }}>({log.usuario.correoInstitucional})</span>
                  </div>
                  {(log.datosAnteriores || log.datosNuevos) && (
                    <div style={{ fontSize: '0.7rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                      {log.datosAnteriores && (
                        <div style={{ background: 'rgba(220, 38, 38, 0.06)', padding: '6px 8px', borderRadius: '4px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.65rem', textTransform: 'uppercase' }}>Antes</div>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {JSON.stringify(log.datosAnteriores, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.datosNuevos && (
                        <div style={{ background: 'rgba(34, 197, 94, 0.06)', padding: '6px 8px', borderRadius: '4px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.65rem', textTransform: 'uppercase' }}>Después</div>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {JSON.stringify(log.datosNuevos, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Cargar mas: solo aparece si hay registros pendientes */}
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  {loadingMore
                    ? 'Cargando...'
                    : `Cargar ${Math.min(PAGE_SIZE, total - logs.length)} más`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
