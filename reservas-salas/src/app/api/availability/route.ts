// src/app/api/availability/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    // fechaParam: YYYY-MM-DD (lunes de la semana)
    const fechaParam = searchParams.get('fecha') ?? new Date().toISOString().split('T')[0];

    // Generar los 5 días de la semana (lun-vie) como strings YYYY-MM-DD
    const lunes = new Date(fechaParam + 'T12:00:00.000Z');
    const fechas: string[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(lunes);
      d.setUTCDate(lunes.getUTCDate() + i);
      fechas.push(d.toISOString().split('T')[0]);
    }

    // Rango de fechas para el filtro (fecha es @db.Date → se compara como Date)
    const fechaInicio = new Date(fechas[0] + 'T00:00:00.000Z');
    const fechaFin = new Date(fechas[fechas.length - 1] + 'T23:59:59.999Z');

    const [salas, reservasRaw] = await Promise.all([
      // CP-003 E4: incluir TAMBIÉN salas deshabilitadas para mostrarlas como "no disponible"
      // (no las filtramos por habilitada para que el usuario vea que existen pero no puede reservar)
      prisma.sala.findMany({
        where: { facultadId: session.user.facultadId },
        select: { id: true, nombre: true, ubicacion: true, capacidad: true, habilitada: true },
        orderBy: [{ habilitada: 'desc' }, { nombre: 'asc' }],
      }),
      prisma.reserva.findMany({
        where: {
          sala: { facultadId: session.user.facultadId },
          estado: 'CONFIRMADA',
          fecha: { gte: fechaInicio, lte: fechaFin },
        },
        select: {
          id: true,
          salaId: true,
          fecha: true,
          horaInicio: true,
          horaFin: true,
          motivo: true,
          usuario: { select: { nombre: true } },
        },
      }),
    ]);

    // Serializar: fecha → YYYY-MM-DD, horaInicio/horaFin → "HH:MM"
    const reservas = reservasRaw.map((r) => ({
      id: r.id,
      salaId: r.salaId,
      fecha: r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : String(r.fecha),
      // horaInicio y horaFin son @db.Time() → Prisma los devuelve como Date con fecha 1970-01-01
      horaInicio: r.horaInicio instanceof Date
        ? `${String(r.horaInicio.getUTCHours()).padStart(2, '0')}:${String(r.horaInicio.getUTCMinutes()).padStart(2, '0')}`
        : String(r.horaInicio),
      horaFin: r.horaFin instanceof Date
        ? `${String(r.horaFin.getUTCHours()).padStart(2, '0')}:${String(r.horaFin.getUTCMinutes()).padStart(2, '0')}`
        : String(r.horaFin),
      motivo: r.motivo,
      usuario: r.usuario,
    }));

    return NextResponse.json({ salas, reservas, fechas });
  } catch (error) {
    console.error('Error availability:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
