// src/app/api/users/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    if (session.user.rol !== 'SECRETARIA') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const usuarios = await prisma.usuario.findMany({
      where: {
        facultadId: session.user.facultadId,
        rol: 'DOCENTE',
        activo: true,
      },
      select: { id: true, nombre: true, correoInstitucional: true },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
