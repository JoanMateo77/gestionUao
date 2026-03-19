// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Rutas que requieren rol SECRETARIA
    const secretariaRoutes = ['/salas'];

    // Si la ruta requiere SECRETARIA y el usuario es DOCENTE
    if (
      secretariaRoutes.some((route) => pathname.startsWith(route)) &&
      token?.rol === 'DOCENTE'
    ) {
      // DOCENTE puede ver salas pero no crear/editar (eso se valida en API)
      // Permitir acceso de lectura, las restricciones se aplican en la UI y API
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
    '/historial/:path*',
    '/reportes/:path*',
    '/dashboard/:path*',
  ],
};
