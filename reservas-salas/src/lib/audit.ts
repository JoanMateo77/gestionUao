// src/lib/audit.ts
import { prisma } from './prisma';

interface AuditParams {
  usuarioId: number;
  accion: string;
  entidad: string;
  entidadId: number;
  datosAnteriores?: Record<string, unknown> | null;
  datosNuevos?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Registra una acción en la tabla log_auditoria (RF-16, R-11).
 * Se llama después de cada operación que modifica datos.
 */
export async function audit(params: AuditParams): Promise<void> {
  try {
    await prisma.logAuditoria.create({
      data: {
        usuarioId: params.usuarioId,
        accion: params.accion,
        entidad: params.entidad,
        entidadId: params.entidadId,
        datosAnteriores: params.datosAnteriores
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (JSON.parse(JSON.stringify(params.datosAnteriores)) as any)
          : undefined,
        datosNuevos: params.datosNuevos
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (JSON.parse(JSON.stringify(params.datosNuevos)) as any)
          : undefined,
        ipAddress: params.ipAddress ?? 'unknown',
      },
    });
  } catch (error) {
    // Audit no debe romper la operación principal
    console.error('Error al registrar auditoría:', error);
  }
}
