// src/app/api/audit-log/route.ts
// Devuelve el historial de auditoría de una entidad específica
// Solo SECRETARIA — para HU-006 E3 (historial sala) y HU-011 E5 (historial reserva)
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (session.user.rol !== 'SECRETARIA') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const entidad = searchParams.get('entidad'); // 'SALA' | 'RESERVA' | 'SALA_RECURSO'
  const entidadIdStr = searchParams.get('entidadId');

  if (!entidad) {
    return NextResponse.json({ error: 'Falta parámetro entidad' }, { status: 400 });
  }
  const entidadId = entidadIdStr ? Number(entidadIdStr) : undefined;
  if (entidadIdStr && (!entidadId || !Number.isInteger(entidadId))) {
    return NextResponse.json({ error: 'entidadId debe ser un entero' }, { status: 400 });
  }

  const logs = await prisma.logAuditoria.findMany({
    where: {
      entidad,
      ...(entidadId ? { entidadId } : {}),
    },
    select: {
      id: true,
      accion: true,
      entidad: true,
      entidadId: true,
      datosAnteriores: true,
      datosNuevos: true,
      fecha: true,
      ipAddress: true,
      usuario: { select: { id: true, nombre: true, correoInstitucional: true } },
    },
    orderBy: { fecha: 'desc' },
    take: 100,
  });

  return NextResponse.json(logs);
}
