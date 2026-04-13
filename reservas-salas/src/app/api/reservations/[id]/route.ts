// src/app/api/reservations/[id]/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { reservationService } from '@/services/reservation.service';

/** PUT /api/reservations/[id] — ajustar reserva (solo SECRETARIA, HU-11) */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.rol !== 'SECRETARIA') {
      return NextResponse.json({ error: 'Solo la secretaria puede ajustar reservas' }, { status: 403 });
    }

    const body = await req.json();
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

    const reserva = await reservationService.adjust(
      Number(params.id),
      body,
      session.user.id,
      session.user.facultadId,
      ip
    );

    return NextResponse.json(reserva);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('no encontrada')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('R-03') || error.message.includes('solapa')) {
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
