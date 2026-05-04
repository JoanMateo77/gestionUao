// src/services/notification.service.ts
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendEmail, type EmailPayload } from '@/lib/email';

export type TipoNotif =
  | 'RESERVA_CANCELADA_SALA_DESHABILITADA'
  | 'RESERVA_AJUSTADA'
  | 'RESERVA_CANCELADA_POR_SECRETARIA'
  | 'GENERAL';

interface CreateInput {
  usuarioId: number;
  tipo: TipoNotif;
  titulo: string;
  mensaje: string;
  metadata?: Record<string, unknown>;
  email?: { to: string; subject: string; html: string };
}

export const notificationService = {
  /** Crea una notificación in-app y opcionalmente envía email */
  async create(input: CreateInput) {
    const notif = await prisma.notificacion.create({
      data: {
        usuarioId: input.usuarioId,
        tipo: input.tipo,
        titulo: input.titulo,
        mensaje: input.mensaje,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    // Email opcional — no bloquea (fire-and-forget con catch)
    if (input.email) {
      sendEmail(input.email)
        .then(async (sent) => {
          if (sent) {
            await prisma.notificacion.update({
              where: { id: notif.id },
              data: { enviadaEmail: true },
            });
          }
        })
        .catch((err) => console.error('[notif] email failed:', err));
    }

    return notif;
  },

  /** Listar notificaciones del usuario, ordenadas por fecha desc */
  async listByUser(usuarioId: number, opts: { onlyUnread?: boolean; limit?: number } = {}) {
    return prisma.notificacion.findMany({
      where: { usuarioId, ...(opts.onlyUnread ? { leida: false } : {}) },
      orderBy: { fechaCreacion: 'desc' },
      take: opts.limit ?? 50,
    });
  },

  async unreadCount(usuarioId: number) {
    return prisma.notificacion.count({ where: { usuarioId, leida: false } });
  },

  async markRead(id: number, usuarioId: number) {
    const notif = await prisma.notificacion.findUnique({ where: { id } });
    if (!notif || notif.usuarioId !== usuarioId) throw new Error('Notificación no encontrada');
    return prisma.notificacion.update({
      where: { id },
      data: { leida: true, fechaLeida: new Date() },
    });
  },

  async markAllRead(usuarioId: number) {
    const result = await prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true, fechaLeida: new Date() },
    });
    return { count: result.count };
  },
};

/** Helper: construye el payload para email a partir de una notificación */
export function buildEmailPayload(
  to: string,
  notifTitulo: string,
  notifMensaje: string,
  metadata?: Record<string, unknown>,
): EmailPayload {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
      <h2 style="color:#1f4e78;margin:0 0 16px 0;font-size:20px">${notifTitulo}</h2>
      <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 16px 0">${notifMensaje}</p>
      ${metadata && Object.keys(metadata).length > 0 ? `
        <div style="background:#f9fafb;border-radius:6px;padding:12px;margin:16px 0;font-size:13px;color:#6b7280">
          ${Object.entries(metadata).map(([k, v]) => `<div><strong>${k}:</strong> ${String(v)}</div>`).join('')}
        </div>
      ` : ''}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="color:#9ca3af;font-size:12px;margin:0">Sistema de Reservas de Salas — Universidad Autónoma de Occidente</p>
    </div>
  `;
  return { to, subject: notifTitulo, html };
}
