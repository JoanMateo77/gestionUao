// src/lib/auth.ts
import { randomUUID } from 'crypto';
import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        correo: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.password) {
          throw new Error('Correo y contraseña son requeridos');
        }

        const usuario = await prisma.usuario.findUnique({
          where: { correoInstitucional: credentials.correo },
        });

        if (!usuario) {
          throw new Error('Credenciales inválidas');
        }

        if (!usuario.activo) {
          throw new Error('Usuario desactivado');
        }

        const passwordMatch = await bcrypt.compare(credentials.password, usuario.passwordHash);

        if (!passwordMatch) {
          throw new Error('Credenciales inválidas');
        }

        // Recalcular rol desde lista blanca en cada login (por si cambió tras el registro)
        const enListaBlanca = await prisma.listaBlanca.findUnique({
          where: { correoInstitucional: usuario.correoInstitucional },
        });
        const rolActual = enListaBlanca ? 'SECRETARIA' : 'DOCENTE';

        // Si el rol cambió, actualizar en DB
        if (rolActual !== usuario.rol) {
          await prisma.usuario.update({
            where: { id: usuario.id },
            data: { rol: rolActual },
          });
        }

        // Sesión única: generar sid nuevo. Esto invalida cualquier JWT
        // emitido previamente para este usuario (incluido el de otro dispositivo).
        const sid = randomUUID();
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { activeSessionId: sid, sessionStartedAt: new Date() },
        });

        return {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.correoInstitucional,
          correoInstitucional: usuario.correoInstitucional,
          rol: rolActual,
          facultadId: usuario.facultadId,
          sid,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.rol = user.rol;
        token.facultadId = user.facultadId;
        token.nombre = user.nombre;
        token.sid = user.sid;
      }
      return token;
    },
    async session({ session, token }) {
      // Verificación de sesión activa: el sid del JWT debe coincidir con el
      // activeSessionId persistido. Si no coincide (otro login lo sobreescribió
      // o hubo revocación manual), devolvemos sesión con expires en el pasado.
      // No tocamos session.user: si lo seteamos a undefined, cualquier consumidor
      // que acceda a session.user.* antes de detectar el cambio de status
      // crashea con TypeError.
      const usuarioDb = await prisma.usuario.findUnique({
        where: { id: Number(token.id) },
        select: { activeSessionId: true, activo: true },
      });

      if (!usuarioDb || !usuarioDb.activo || usuarioDb.activeSessionId !== token.sid) {
        return { ...session, expires: '1970-01-01T00:00:00.000Z' };
      }

      if (session.user) {
        session.user.id = token.id;
        session.user.rol = token.rol;
        session.user.facultadId = token.facultadId;
        session.user.nombre = token.nombre;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
};
