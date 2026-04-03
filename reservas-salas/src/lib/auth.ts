// src/lib/auth.ts
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

        return {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.correoInstitucional,
          correoInstitucional: usuario.correoInstitucional,
          rol: rolActual,
          facultadId: usuario.facultadId,
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
      }
      return token;
    },
    async session({ session, token }) {
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
