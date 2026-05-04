// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Rutas exclusivas de SECRETARIA — bloquear DOCENTE a nivel de middleware
    const secretariaOnly = ['/reportes'];
    if (secretariaOnly.some((r) => pathname === r || pathname.startsWith(r + '/')) && token?.rol !== 'SECRETARIA') {
      return NextResponse.redirect(new URL('/reservas', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/salas/:path*',
    '/reservas/:path*',
    '/disponibilidad/:path*',
    '/disponibilidad',
    '/historial/:path*',
    '/reportes',
    '/reportes/:path*',
    '/dashboard/:path*',
  ],
};
