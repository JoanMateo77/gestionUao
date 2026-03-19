// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Facultades ──
  const facultades = await Promise.all([
    prisma.facultad.upsert({
      where: { nombre: 'Ingeniería y Ciencias Básicas' },
      update: {},
      create: { nombre: 'Ingeniería y Ciencias Básicas' },
    }),
    prisma.facultad.upsert({
      where: { nombre: 'Ciencias Administrativas y Contables' },
      update: {},
      create: { nombre: 'Ciencias Administrativas y Contables' },
    }),
    prisma.facultad.upsert({
      where: { nombre: 'Ciencias Sociales y Humanas' },
      update: {},
      create: { nombre: 'Ciencias Sociales y Humanas' },
    }),
  ]);

  console.log(`✔ ${facultades.length} facultades creadas`);

  // ── Lista blanca de secretarias ──
  const secretarias = await Promise.all([
    prisma.listaBlanca.upsert({
      where: { correoInstitucional: 'secretaria.ingenieria@uao.edu.co' },
      update: {},
      create: {
        correoInstitucional: 'secretaria.ingenieria@uao.edu.co',
        nombre: 'María García',
        tipoUsuario: 'SECRETARIA',
      },
    }),
  ]);

  console.log(`✔ ${secretarias.length} secretarias en lista blanca`);

  // ── Catálogo de recursos tecnológicos ──
  const recursos = await Promise.all([
    prisma.recursoTecnologico.upsert({
      where: { nombre: 'Proyector' },
      update: {},
      create: { nombre: 'Proyector', descripcion: 'Proyector Epson Full HD, HDMI + VGA' },
    }),
    prisma.recursoTecnologico.upsert({
      where: { nombre: 'Pantalla LED' },
      update: {},
      create: { nombre: 'Pantalla LED', descripcion: 'Pantalla LED 55" para presentaciones' },
    }),
    prisma.recursoTecnologico.upsert({
      where: { nombre: 'Videoconferencia' },
      update: {},
      create: { nombre: 'Videoconferencia', descripcion: 'Sistema de videoconferencia con cámara y micrófono' },
    }),
    prisma.recursoTecnologico.upsert({
      where: { nombre: 'Tablero Digital' },
      update: {},
      create: { nombre: 'Tablero Digital', descripcion: 'Tablero interactivo táctil' },
    }),
    prisma.recursoTecnologico.upsert({
      where: { nombre: 'Computador' },
      update: {},
      create: { nombre: 'Computador', descripcion: 'Computador de escritorio con acceso a red' },
    }),
    prisma.recursoTecnologico.upsert({
      where: { nombre: 'Sistema de Audio' },
      update: {},
      create: { nombre: 'Sistema de Audio', descripcion: 'Parlantes y micrófono ambiental' },
    }),
    prisma.recursoTecnologico.upsert({
      where: { nombre: 'Pizarra Acrílica' },
      update: {},
      create: { nombre: 'Pizarra Acrílica', descripcion: 'Pizarra blanca de 2x1.5m' },
    }),
  ]);

  console.log(`✔ ${recursos.length} recursos tecnológicos creados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
