// src/app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { reservationService } from '@/services/reservation.service';
import type { EstadoReserva } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const estado = searchParams.get('estado') as EstadoReserva | undefined;

    const result = await reservationService.list({
      facultadId: session.user.facultadId,
      usuarioId: session.user.id,
      rol: session.user.rol,
      estado: estado || undefined,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al listar reservas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

    const reserva = await reservationService.create(
      body,
      session.user.id,
      session.user.facultadId,
      ip
    );

    return NextResponse.json(reserva, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('solapamiento') || error.message.includes('R-03')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Datos inválidos', details: error }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
