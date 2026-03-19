// src/app/api/rooms/[id]/resources/[rid]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { resourceService } from '@/services/resource.service';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; rid: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.rol !== 'SECRETARIA') {
      return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
    }

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

    await resourceService.removeFromSala(
      Number(params.rid),
      session.user.facultadId,
      session.user.id,
      ip
    );

    return NextResponse.json({ message: 'Recurso retirado exitosamente' });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
