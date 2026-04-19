// prisma/seed.ts — Datos reales UAO (Campus Valle del Lilí)
// Respeta la jerarquía documentada en informacionUAO.txt:
//   - Aulas 1-4: múltiples salones numerados por piso
//   - Torreones 0-4: un salón único por piso del campus (sin sub-salones)
//   - CRAI / Ala Sur / Central / Bienestar: salas con nombre propio descriptivo
import { PrismaClient, CategoriaRecurso } from '@prisma/client';

const prisma = new PrismaClient();

type RecursoSeed = {
  nombre: string;
  descripcion: string;
  categoria: CategoriaRecurso;
  icono: string;
};

type SalaSeed = {
  nombre: string;
  ubicacion: string;
  capacidad: number;
  facultad: string;
  tipo: keyof typeof MATRIZ_RECURSOS;
};

const FACULTADES = [
  'Facultad de Ingeniería y Ciencias Básicas',
  'Facultad de Ciencias Económicas y Administrativas',
  'Facultad de Comunicación y Ciencias Sociales',
  'Facultad de Humanidades y Artes',
  'Instituto de Estudios para la Sostenibilidad',
] as const;

const RECURSOS: RecursoSeed[] = [
  { nombre: 'Videoproyector', descripcion: 'Proyector de techo o portátil', categoria: 'PROYECCION', icono: 'Projector' },
  { nombre: 'Televisor', descripcion: 'Pantalla plana con soporte fijo o móvil', categoria: 'PROYECCION', icono: 'Tv' },
  { nombre: 'Pantalla de proyección', descripcion: 'Pantalla tensada o retráctil', categoria: 'PROYECCION', icono: 'Monitor' },
  { nombre: 'Computador', descripcion: 'PC de escritorio para cátedra', categoria: 'COMPUTO', icono: 'Computer' },
  { nombre: 'Cámara web', descripcion: 'Para sesiones híbridas', categoria: 'COMPUTO', icono: 'Webcam' },
  { nombre: 'WiFi', descripcion: 'Red institucional UAO', categoria: 'CONECTIVIDAD', icono: 'Wifi' },
  { nombre: 'Cable HDMI', descripcion: 'Para conectar portátiles', categoria: 'CONECTIVIDAD', icono: 'Cable' },
  { nombre: 'Cable VGA', descripcion: 'Compatibilidad con equipos antiguos', categoria: 'CONECTIVIDAD', icono: 'Cable' },
  { nombre: 'Sistema de audio', descripcion: 'Parlantes integrados o externos', categoria: 'AUDIO', icono: 'Volume2' },
  { nombre: 'Micrófono', descripcion: 'Inalámbrico o alámbrico', categoria: 'AUDIO', icono: 'Mic' },
  { nombre: 'Tablero acrílico', descripcion: 'Tablero blanco tradicional', categoria: 'ESCRITURA', icono: 'PenLine' },
  { nombre: 'Tablero de vidrio', descripcion: 'Tablero de vidrio borrable', categoria: 'ESCRITURA', icono: 'Square' },
  { nombre: 'Aire acondicionado', descripcion: 'Climatización', categoria: 'CONFORT', icono: 'Snowflake' },
  { nombre: 'Cortinas blackout', descripcion: 'Para proyecciones con luz reducida', categoria: 'CONFORT', icono: 'Blinds' },
  { nombre: 'Acceso movilidad reducida', descripcion: 'Rampa o acceso adaptado', categoria: 'ACCESIBILIDAD', icono: 'Accessibility' },
];

const MATRIZ_RECURSOS = {
  // Salón de Aulas o Torreón: clase magistral
  SALON_CLASE: [
    'Videoproyector', 'Computador', 'WiFi', 'Cable HDMI',
    'Tablero acrílico', 'Aire acondicionado',
  ],
  // Salas de estudio grupal del CRAI piso 2 (5-8 personas)
  ESTUDIO_CRAI: [
    'Televisor', 'WiFi', 'Cable HDMI', 'Cable VGA', 'Aire acondicionado',
  ],
  // Sala de capacitación CRAI piso 2 (25 personas)
  CAPACITACION_CRAI: [
    'Videoproyector', 'Computador', 'WiFi', 'Sistema de audio',
    'Tablero acrílico', 'Aire acondicionado',
  ],
  // Sala de juntas formal (Ala Sur)
  JUNTAS: [
    'Televisor', 'Computador', 'WiFi', 'Cable HDMI', 'Cámara web',
    'Sistema de audio', 'Micrófono', 'Tablero de vidrio', 'Aire acondicionado',
    'Cortinas blackout',
  ],
  // Auditorio Central
  AUDITORIO: [
    'Videoproyector', 'Pantalla de proyección', 'Computador', 'WiFi',
    'Cable HDMI', 'Cable VGA', 'Sistema de audio', 'Micrófono',
    'Aire acondicionado', 'Cortinas blackout', 'Acceso movilidad reducida',
  ],
  // Sala de asesoría escritura (CELEE/Domus Magister)
  ASESORIA: ['Computador', 'WiFi', 'Tablero acrílico', 'Aire acondicionado'],
  // Salones de arte/cultura (Bienestar)
  CULTURA: ['Sistema de audio', 'WiFi', 'Aire acondicionado'],
  // Sala de lectura silenciosa (CRAI piso 3)
  LECTURA: ['WiFi', 'Aire acondicionado'],
} as const;

/** Aulas 1–4, cada una con 4 pisos de 6 salones (01–06). */
function generarAulas(): SalaSeed[] {
  const salas: SalaSeed[] = [];
  const facultadPorEdificio: Record<number, string> = {
    1: FACULTADES[0], // Ingeniería
    2: FACULTADES[0],
    3: FACULTADES[1], // Económicas
    4: FACULTADES[3], // Humanidades
  };
  for (let edif = 1; edif <= 4; edif++) {
    for (let piso = 1; piso <= 4; piso++) {
      for (let sal = 1; sal <= 6; sal++) {
        const nn = sal.toString().padStart(2, '0');
        salas.push({
          nombre: `Aulas ${edif} - ${piso}${nn}`,
          ubicacion: `Aulas ${edif}, Piso ${piso}, Salón ${nn}`,
          capacidad: [30, 35, 30, 25][piso - 1],
          facultad: facultadPorEdificio[edif],
          tipo: 'SALON_CLASE',
        });
      }
    }
  }
  return salas;
}

/** 5 Torreones — un salón único por piso del campus. */
const TORREONES: SalaSeed[] = [
  { nombre: 'Torreón 0', ubicacion: 'Torreón 0, Piso 0', capacidad: 40, facultad: FACULTADES[0], tipo: 'SALON_CLASE' },
  { nombre: 'Torreón 1', ubicacion: 'Torreón 1, Piso 1', capacidad: 40, facultad: FACULTADES[0], tipo: 'SALON_CLASE' },
  { nombre: 'Torreón 2', ubicacion: 'Torreón 2, Piso 2', capacidad: 45, facultad: FACULTADES[0], tipo: 'SALON_CLASE' },
  { nombre: 'Torreón 3', ubicacion: 'Torreón 3, Piso 3', capacidad: 45, facultad: FACULTADES[2], tipo: 'SALON_CLASE' },
  { nombre: 'Torreón 4', ubicacion: 'Torreón 4, Piso 4', capacidad: 50, facultad: FACULTADES[2], tipo: 'SALON_CLASE' },
];

/** Salas específicas del CRAI. */
const SALAS_CRAI: SalaSeed[] = [
  // Piso 2 — 5 salas de estudio grupal
  ...[1, 2, 3, 4, 5].map<SalaSeed>((n) => ({
    nombre: `CRAI · Sala de Estudio ${n}`,
    ubicacion: 'CRAI, Piso 2',
    capacidad: 8,
    facultad: FACULTADES[0],
    tipo: 'ESTUDIO_CRAI',
  })),
  { nombre: 'CRAI · Sala de Capacitación', ubicacion: 'CRAI, Piso 2', capacidad: 25, facultad: FACULTADES[0], tipo: 'CAPACITACION_CRAI' },
  { nombre: 'CRAI · Sala CELEE', ubicacion: 'CRAI, Piso 2', capacidad: 8, facultad: FACULTADES[3], tipo: 'ASESORIA' },
  { nombre: 'CRAI · Sala Domus Magister', ubicacion: 'CRAI, Piso 2', capacidad: 8, facultad: FACULTADES[3], tipo: 'ASESORIA' },
  // Piso 3 — salas de lectura
  { nombre: 'CRAI · Sala de Lectura 1', ubicacion: 'CRAI, Piso 3', capacidad: 12, facultad: FACULTADES[3], tipo: 'LECTURA' },
  { nombre: 'CRAI · Sala de Lectura 2', ubicacion: 'CRAI, Piso 3', capacidad: 12, facultad: FACULTADES[2], tipo: 'LECTURA' },
];

/** Ala Sur — salas de juntas por facultad en pisos 2-4. */
const SALAS_ALA_SUR: SalaSeed[] = [
  { nombre: 'Ala Sur · Sala de Juntas Ingeniería',    ubicacion: 'Ala Sur, Piso 3', capacidad: 14, facultad: FACULTADES[0], tipo: 'JUNTAS' },
  { nombre: 'Ala Sur · Sala de Juntas Económicas',    ubicacion: 'Ala Sur, Piso 2', capacidad: 14, facultad: FACULTADES[1], tipo: 'JUNTAS' },
  { nombre: 'Ala Sur · Sala de Juntas Comunicación',  ubicacion: 'Ala Sur, Piso 2', capacidad: 12, facultad: FACULTADES[2], tipo: 'JUNTAS' },
  { nombre: 'Ala Sur · Sala de Juntas Humanidades',   ubicacion: 'Ala Sur, Piso 3', capacidad: 12, facultad: FACULTADES[3], tipo: 'JUNTAS' },
  { nombre: 'Ala Sur · Sala de Juntas Sostenibilidad', ubicacion: 'Ala Sur, Piso 4', capacidad: 10, facultad: FACULTADES[4], tipo: 'JUNTAS' },
];

/** Edificio Central — auditorios. */
const SALAS_CENTRAL: SalaSeed[] = [
  { nombre: 'Central · Auditorio Menor', ubicacion: 'Edificio Central, Piso 1', capacidad: 80, facultad: FACULTADES[1], tipo: 'AUDITORIO' },
];

/** Bienestar — salones de arte y cultura (piso 2). */
const SALAS_BIENESTAR: SalaSeed[] = [
  { nombre: 'Bienestar · Salón de Danza',  ubicacion: 'Edificio de Bienestar, Piso 2', capacidad: 30, facultad: FACULTADES[3], tipo: 'CULTURA' },
  { nombre: 'Bienestar · Salón de Música', ubicacion: 'Edificio de Bienestar, Piso 2', capacidad: 20, facultad: FACULTADES[3], tipo: 'CULTURA' },
  { nombre: 'Bienestar · Salón de Teatro', ubicacion: 'Edificio de Bienestar, Piso 2', capacidad: 40, facultad: FACULTADES[3], tipo: 'CULTURA' },
];

const LISTA_BLANCA = [
  { correo: 'secretaria.ingenieria@uao.edu.co',    nombre: 'Secretaría Ingeniería' },
  { correo: 'secretaria.economicas@uao.edu.co',    nombre: 'Secretaría Económicas' },
  { correo: 'secretaria.comunicacion@uao.edu.co',  nombre: 'Secretaría Comunicación' },
  { correo: 'secretaria.humanidades@uao.edu.co',   nombre: 'Secretaría Humanidades' },
  { correo: 'secretaria.sostenibilidad@uao.edu.co', nombre: 'Secretaría Sostenibilidad' },
];

async function main() {
  console.log('🌱 Seed UAO iniciando...');

  // ── Facultades ──
  const facultadMap = new Map<string, number>();
  for (const nombre of FACULTADES) {
    const f = await prisma.facultad.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    facultadMap.set(nombre, f.id);
  }
  console.log(`✔ ${facultadMap.size} facultades`);

  // ── Lista blanca ──
  for (const s of LISTA_BLANCA) {
    await prisma.listaBlanca.upsert({
      where: { correoInstitucional: s.correo },
      update: { nombre: s.nombre },
      create: { correoInstitucional: s.correo, nombre: s.nombre, tipoUsuario: 'SECRETARIA' },
    });
  }
  console.log(`✔ ${LISTA_BLANCA.length} correos en lista_blanca`);

  // ── Recursos ──
  const recursoMap = new Map<string, number>();
  for (const r of RECURSOS) {
    const rec = await prisma.recursoTecnologico.upsert({
      where: { nombre: r.nombre },
      update: { descripcion: r.descripcion, categoria: r.categoria, icono: r.icono },
      create: r,
    });
    recursoMap.set(r.nombre, rec.id);
  }
  console.log(`✔ ${recursoMap.size} recursos`);

  // ── Salas ── (batch con createMany + skipDuplicates en asignaciones)
  const salas: SalaSeed[] = [
    ...generarAulas(),
    ...TORREONES,
    ...SALAS_CRAI,
    ...SALAS_ALA_SUR,
    ...SALAS_CENTRAL,
    ...SALAS_BIENESTAR,
  ];

  // ── Cleanup de salas con nomenclatura obsoleta (sin reservas vigentes) ──
  const nombresValidos = new Set(salas.map((s) => s.nombre));
  const salasEnBd = await prisma.sala.findMany({
    select: { id: true, nombre: true, _count: { select: { reservas: true } } },
  });
  const aEliminar = salasEnBd.filter((s) => !nombresValidos.has(s.nombre) && s._count.reservas === 0);
  if (aEliminar.length > 0) {
    const ids = aEliminar.map((s) => s.id);
    await prisma.salaRecurso.deleteMany({ where: { salaId: { in: ids } } });
    await prisma.sala.deleteMany({ where: { id: { in: ids } } });
    console.log(`✔ ${aEliminar.length} salas obsoletas eliminadas`);
  }

  // Cargar existentes para distinguir create vs update sin múltiples roundtrips
  const existentes = await prisma.sala.findMany({
    select: { id: true, nombre: true, facultadId: true },
  });
  const idPorKey = new Map<string, number>();
  for (const e of existentes) idPorKey.set(`${e.nombre}::${e.facultadId}`, e.id);

  const aCrear: { nombre: string; ubicacion: string; capacidad: number; facultadId: number }[] = [];
  const aActualizar: { id: number; ubicacion: string; capacidad: number }[] = [];

  for (const s of salas) {
    const facultadId = facultadMap.get(s.facultad);
    if (!facultadId) continue;
    const key = `${s.nombre}::${facultadId}`;
    const existeId = idPorKey.get(key);
    if (existeId) {
      aActualizar.push({ id: existeId, ubicacion: s.ubicacion, capacidad: s.capacidad });
    } else {
      aCrear.push({ nombre: s.nombre, ubicacion: s.ubicacion, capacidad: s.capacidad, facultadId });
    }
  }

  if (aCrear.length > 0) await prisma.sala.createMany({ data: aCrear });
  await Promise.all(
    aActualizar.map((u) =>
      prisma.sala.update({
        where: { id: u.id },
        data: { ubicacion: u.ubicacion, capacidad: u.capacidad, habilitada: true },
      }),
    ),
  );

  // Releer con IDs para armar las asignaciones
  const todasSalas = await prisma.sala.findMany({ select: { id: true, nombre: true, facultadId: true } });
  const idPorKey2 = new Map<string, number>();
  for (const s of todasSalas) idPorKey2.set(`${s.nombre}::${s.facultadId}`, s.id);

  const asignaciones: { salaId: number; recursoId: number }[] = [];
  for (const s of salas) {
    const facultadId = facultadMap.get(s.facultad);
    if (!facultadId) continue;
    const salaId = idPorKey2.get(`${s.nombre}::${facultadId}`);
    if (!salaId) continue;
    for (const nombreRec of MATRIZ_RECURSOS[s.tipo]) {
      const recursoId = recursoMap.get(nombreRec);
      if (!recursoId) continue;
      asignaciones.push({ salaId, recursoId });
    }
  }

  const res = await prisma.salaRecurso.createMany({ data: asignaciones, skipDuplicates: true });
  console.log(`✔ ${salas.length} salas (${aCrear.length} creadas, ${aActualizar.length} actualizadas) · ${res.count} nuevas asignaciones`);
  console.log('✅ Seed UAO completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
