// src/app/api/rooms/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { roomService } from '@/services/room.service';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.rol !== 'SECRETARIA') {
      return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
    }

    const { habilitada } = await req.json();
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

    const sala = await roomService.updateStatus(
      Number(params.id),
      habilitada,
      session.user.facultadId,
      session.user.id,
      ip
    );

    return NextResponse.json(sala);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
