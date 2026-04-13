// src/app/api/resources/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { resourceService } from '@/services/resource.service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const recursos = await resourceService.listAll();
    return NextResponse.json(recursos);
  } catch (error) {
    console.error('Error al listar recursos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
