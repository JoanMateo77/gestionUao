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

        return {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.correoInstitucional,
          correoInstitucional: usuario.correoInstitucional,
          rol: usuario.rol,
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
