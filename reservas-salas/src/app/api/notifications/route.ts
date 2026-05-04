// src/app/api/notifications/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notificationService } from '@/services/notification.service';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const onlyUnread = searchParams.get('unread') === 'true';
  const limit = Number(searchParams.get('limit')) || 50;

  const data = await notificationService.listByUser(session.user.id, { onlyUnread, limit });
  return NextResponse.json(data);
}
