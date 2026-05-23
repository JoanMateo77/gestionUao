// src/app/api/auth/revoke-all/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Conserva el sid del request actual: cualquier otro dispositivo con un sid
  // distinto queda revocado, pero el emisor sobrevive (no se autopatea).
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const currentSid = token?.sid as string | undefined;

  if (!currentSid) {
    return NextResponse.json({ error: 'Sesion invalida' }, { status: 401 });
  }

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { activeSessionId: currentSid, sessionStartedAt: new Date() },
  });

  await audit({
    usuarioId: session.user.id,
    accion: 'REVOCAR_OTRAS_SESIONES',
    entidad: 'USUARIO',
    entidadId: session.user.id,
    ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
  });

  return NextResponse.json({ message: 'Otras sesiones cerradas.' });
}
