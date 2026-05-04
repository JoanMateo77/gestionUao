// src/app/api/users/route.ts — lista de usuarios de la facultad (SECRETARIA)
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (session.user.rol !== 'SECRETARIA') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const usuarios = await prisma.usuario.findMany({
    where: { facultadId: session.user.facultadId, activo: true },
    select: { id: true, nombre: true, correoInstitucional: true, rol: true },
    orderBy: { nombre: 'asc' },
  });

  return NextResponse.json(usuarios);
}
