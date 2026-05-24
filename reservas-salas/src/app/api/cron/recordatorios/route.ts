// src/app/api/cron/recordatorios/route.ts
//
// Cron job (Vercel Cron) que envia recordatorio 24h antes de cada reserva
// confirmada. Vercel pega cada hora; la ventana es [now + 23h, now + 24h),
// asi cada reserva cae exactamente en una ventana y no se duplica.
// Defensa extra: antes de crear verificamos que no exista ya una notificacion
// GENERAL con metadata.kind === 'recordatorio-24h' para la misma reservaId.
//
// Seguridad: Vercel Cron envia `Authorization: Bearer ${CRON_SECRET}` si el
// env var existe. En local se puede invocar con curl pasando el mismo header.

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notificationService, buildEmailPayload } from '@/services/notification.service';

function combineDateTime(fecha: Date, hora: Date): Date {
  const out = new Date(fecha);
  out.setUTCHours(hora.getUTCHours(), hora.getUTCMinutes(), 0, 0);
  return out;
}

function fmtFecha(d: Date) {
  return d.toISOString().split('T')[0];
}
function fmtTime(d: Date) {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

export async function GET(req: Request) {
  // Auth: aceptamos si no hay CRON_SECRET configurado (entornos de dev sin gate)
  // o si el header Bearer coincide con el secreto. Negamos en cualquier otro caso.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  }

  const now = new Date();
  const ventanaInicio = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const ventanaFin = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Pre-filtro por fecha (campo Date @ 00:00 UTC). La ventana de 1h puede caer
  // en uno o dos dias UTC, asi que filtramos por rango de dia y refinamos en JS
  // con el datetime real (fecha + horaInicio).
  const fechaPivote = new Date(ventanaInicio);
  fechaPivote.setUTCHours(0, 0, 0, 0);
  const fechaSiguiente = new Date(fechaPivote);
  fechaSiguiente.setUTCDate(fechaSiguiente.getUTCDate() + 2);

  const reservas = await prisma.reserva.findMany({
    where: {
      estado: 'CONFIRMADA',
      fecha: { gte: fechaPivote, lt: fechaSiguiente },
    },
    include: {
      sala: { select: { id: true, nombre: true } },
      usuario: { select: { id: true, correoInstitucional: true } },
    },
  });

  let enviadas = 0;
  let yaNotificadas = 0;

  for (const r of reservas) {
    const inicioReserva = combineDateTime(r.fecha, r.horaInicio);
    if (inicioReserva < ventanaInicio || inicioReserva >= ventanaFin) continue;

    // Evitar duplicado: si ya existe una notif GENERAL marcada como
    // recordatorio-24h para esta reserva, saltamos. Esto permite re-ejecutar
    // el cron sin efectos secundarios.
    const yaExiste = await prisma.notificacion.findFirst({
      where: {
        usuarioId: r.usuarioId,
        tipo: 'GENERAL',
        AND: [
          { metadata: { path: ['kind'], equals: 'recordatorio-24h' } },
          { metadata: { path: ['reservaId'], equals: r.id } },
        ],
      },
      select: { id: true },
    });
    if (yaExiste) {
      yaNotificadas++;
      continue;
    }

    const fechaStr = fmtFecha(r.fecha);
    const inicioStr = fmtTime(r.horaInicio);
    const finStr = fmtTime(r.horaFin);
    const titulo = `Recordatorio: reserva mañana en ${r.sala.nombre}`;
    const mensaje =
      `Tienes una reserva mañana ${fechaStr} de ${inicioStr} a ${finStr} en ${r.sala.nombre}. ` +
      `Si ya no la necesitas, cancélala para liberar la sala.`;

    await notificationService.create({
      usuarioId: r.usuarioId,
      tipo: 'GENERAL',
      titulo,
      mensaje,
      metadata: {
        kind: 'recordatorio-24h',
        reservaId: r.id,
        salaId: r.sala.id,
        salaNombre: r.sala.nombre,
        fecha: fechaStr,
        horaInicio: inicioStr,
        horaFin: finStr,
      },
      email: buildEmailPayload(r.usuario.correoInstitucional, titulo, mensaje, {
        'Sala': r.sala.nombre,
        'Fecha': fechaStr,
        'Horario': `${inicioStr} – ${finStr}`,
      }),
    });
    enviadas++;
  }

  return NextResponse.json({
    ok: true,
    revisadas: reservas.length,
    enviadas,
    yaNotificadas,
    ventana: { inicio: ventanaInicio.toISOString(), fin: ventanaFin.toISOString() },
  });
}
