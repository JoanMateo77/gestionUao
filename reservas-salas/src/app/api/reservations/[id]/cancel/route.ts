// src/app/api/reservations/[id]/cancel/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { reservationService } from '@/services/reservation.service';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

    const reserva = await reservationService.cancel(
      Number(params.id),
      session.user.id,
      session.user.rol,
      session.user.facultadId,
      ip
    );

    return NextResponse.json(reserva);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('no encontrada')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
