// src/app/api/rooms/[id]/availability/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { reservationRepository } from '@/repositories/reservation.repository';
import { roomRepository } from '@/repositories/room.repository';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const salaId = Number(params.id);
    if (!Number.isFinite(salaId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const sala = await roomRepository.findById(salaId);
    if (!sala) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 });
    if (sala.facultadId !== session.user.facultadId) {
      return NextResponse.json({ error: 'Sin acceso a esta sala' }, { status: 403 });
    }

    const url = new URL(req.url);
    const fechaStr = url.searchParams.get('fecha');
    if (!fechaStr) {
      return NextResponse.json({ error: 'Falta parámetro fecha (YYYY-MM-DD)' }, { status: 400 });
    }
    const fecha = new Date(`${fechaStr}T00:00:00.000Z`);
    if (isNaN(fecha.getTime())) {
      return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 });
    }

    const reservas = await reservationRepository.findBySalaAndFecha(salaId, fecha);

    // Formatear HH:MM para consumo del frontend (timeline)
    const ocupados = reservas.map((r) => ({
      id: r.id,
      horaInicio: toHHMM(r.horaInicio),
      horaFin: toHHMM(r.horaFin),
      motivo: r.motivo ?? '',
      usuarioNombre: r.usuario?.nombre ?? '',
    }));

    return NextResponse.json({ salaId, fecha: fechaStr, ocupados });
  } catch (error) {
    console.error('Error en availability:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

function toHHMM(d: Date): string {
  // Prisma almacena Time como Date UTC 1970-01-01; extraer UTC.
  const h = d.getUTCHours().toString().padStart(2, '0');
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
