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

  // Paginacion: page y limit con defaults razonables. limit cap a 100 para
  // evitar abuso del endpoint o consultas accidentales muy grandes.
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
  const skip = (page - 1) * limit;

  const where = { entidad, ...(entidadId ? { entidadId } : {}) };

  // count + findMany en paralelo para reducir round-trip
  const [total, logs] = await Promise.all([
    prisma.logAuditoria.count({ where }),
    prisma.logAuditoria.findMany({
      where,
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
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return NextResponse.json({
    logs,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  });
}
