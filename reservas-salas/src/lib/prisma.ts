// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Cachear en todos los entornos para evitar múltiples instancias
// en hot-reload (dev) y en funciones serverless reutilizadas (prod)
globalForPrisma.prisma = prisma;
