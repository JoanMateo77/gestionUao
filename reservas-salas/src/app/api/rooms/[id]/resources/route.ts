// src/app/api/rooms/[id]/resources/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { resourceService } from '@/services/resource.service';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const recursos = await resourceService.listBySala(Number(params.id));
    return NextResponse.json(recursos);
  } catch (error) {
    console.error('Error al listar recursos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(
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

    const { recursoId } = await req.json();
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

    const assignment = await resourceService.addToSala(
      Number(params.id),
      recursoId,
      session.user.facultadId,
      session.user.id,
      ip
    );

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ya está asignado')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
