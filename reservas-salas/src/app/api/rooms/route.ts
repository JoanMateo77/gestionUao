// src/app/api/rooms/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { roomService } from '@/services/room.service';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const q = new URL(req.url).searchParams;

    const toInt = (v: string | null): number | undefined => {
      if (!v) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const toIntList = (v: string | null): number[] | undefined => {
      if (!v) return undefined;
      const list = v.split(',').map((s) => Number(s.trim())).filter(Number.isFinite);
      return list.length > 0 ? list : undefined;
    };

    const salas = await roomService.listByFacultad(session.user.facultadId, {
      capacidadMin: toInt(q.get('capacidadMin')),
      capacidadMax: toInt(q.get('capacidadMax')),
      edificio: q.get('edificio') || undefined,
      recursos: toIntList(q.get('recursos')),
      search: q.get('q') || undefined,
      soloHabilitadas: q.get('soloHabilitadas') === 'true',
    });
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
