// src/app/api/auth/revoke-all/route.ts
export const dynamic = 'force-dynamic';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Sobreescribir activeSessionId con un sid nuevo: ninguna sesión existente
  // (incluida la del request actual) volverá a coincidir → todas quedan revocadas.
  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { activeSessionId: randomUUID(), sessionStartedAt: new Date() },
  });

  await audit({
    usuarioId: session.user.id,
    accion: 'REVOCAR_SESIONES',
    entidad: 'USUARIO',
    entidadId: session.user.id,
    ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
  });

  return NextResponse.json({ message: 'Sesiones revocadas. Vuelve a iniciar sesión.' });
}
