// src/app/api/faculties/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const facultades = await prisma.facultad.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    });
    return NextResponse.json(facultades);
  } catch (error) {
    console.error('Error al listar facultades:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
