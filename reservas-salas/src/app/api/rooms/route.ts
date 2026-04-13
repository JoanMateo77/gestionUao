// src/app/api/rooms/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { roomService } from '@/services/room.service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const salas = await roomService.listByFacultad(session.user.facultadId);
    return NextResponse.json(salas);
  } catch (error) {
    console.error('Error al listar salas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo SECRETARIA puede crear salas (RBAC)
    if (session.user.rol !== 'SECRETARIA') {
      return NextResponse.json({ error: 'Sin permiso. Solo secretarias pueden crear salas' }, { status: 403 });
    }

    const body = await req.json();
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

    const sala = await roomService.create(body, session.user.facultadId, session.user.id, ip);
    return NextResponse.json(sala, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Ya existe')) {
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
