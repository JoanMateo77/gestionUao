/**
 * Script para cargar/actualizar la lista blanca de secretarias (R-09, RF-03)
 *
 * Uso:
 *   npx ts-node prisma/seed-whitelist.ts
 *
 * Agrega entradas sin duplicar (upsert). Puedes correrlo cuantas veces quieras.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SECRETARIAS: { correoInstitucional: string; nombre: string }[] = [
  // ── Ingeniería y Ciencias Básicas ──
  {
    correoInstitucional: 'secretaria.ingenieria@uao.edu.co',
    nombre: 'María García',
  },
  // ── Ciencias Administrativas y Contables ──
  {
    correoInstitucional: 'secretaria.administrativas@uao.edu.co',
    nombre: 'Laura Martínez',
  },
  // ── Ciencias Sociales y Humanas ──
  {
    correoInstitucional: 'secretaria.sociales@uao.edu.co',
    nombre: 'Carolina Ríos',
  },
  // ── Secretarias adicionales ──
  {
    correoInstitucional: 'gamezruizc@gmail.com',
    nombre: 'Secretaria Gamez Ruiz',
  },
  {
    correoInstitucional: 'mateopro1098@gmail.com',
    nombre: 'Secretaria Mateo Pro',
  },
  {
    correoInstitucional: 'Carlos.gamez@uao.edu.co',
    nombre: 'Carlos Gámez',
  },
  {
    correoInstitucional: 'Maria_pau.hernandez@uao.edu.co',
    nombre: 'María Paula Hernández',
  },
];

async function main() {
  console.log('Cargando lista blanca de secretarias...\n');

  for (const s of SECRETARIAS) {
    await prisma.listaBlanca.upsert({
      where: { correoInstitucional: s.correoInstitucional },
      update: { nombre: s.nombre },
      create: {
        correoInstitucional: s.correoInstitucional,
        nombre: s.nombre,
        tipoUsuario: 'SECRETARIA',
      },
    });
    console.log(`  ✔ ${s.correoInstitucional} (${s.nombre})`);
  }

  const total = await prisma.listaBlanca.count();
  console.log(`\nTotal en lista blanca: ${total} secretaria(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
