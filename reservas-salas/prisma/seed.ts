// prisma/seed.ts — Datos reales UAO (Campus Valle del Lilí)
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

// Matriz de recursos por tipo de sala (sección 6 del brief UAO)
const MATRIZ_RECURSOS = {
  REUNIONES_ESTANDAR: [
    'Videoproyector', 'Pantalla de proyección', 'Computador', 'WiFi',
    'Cable HDMI', 'Cable VGA', 'Sistema de audio', 'Tablero acrílico', 'Aire acondicionado',
  ],
  ESTUDIO_CRAI: ['Televisor', 'WiFi', 'Cable HDMI', 'Cable VGA', 'Aire acondicionado'],
  CAPACITACION_CRAI: ['Videoproyector', 'Computador', 'WiFi', 'Sistema de audio', 'Tablero acrílico', 'Aire acondicionado'],
  JUNTAS_DECANATURA: [
    'Televisor', 'Computador', 'WiFi', 'Cable HDMI', 'Cámara web', 'Sistema de audio',
    'Micrófono', 'Tablero de vidrio', 'Aire acondicionado', 'Cortinas blackout',
  ],
  AUDITORIO: [
    'Videoproyector', 'Pantalla de proyección', 'Computador', 'WiFi', 'Cable HDMI', 'Cable VGA',
    'Sistema de audio', 'Micrófono', 'Aire acondicionado', 'Cortinas blackout', 'Acceso movilidad reducida',
  ],
  CELEE: ['Computador', 'WiFi', 'Tablero acrílico', 'Aire acondicionado'],
} as const;

// 4 edificios Aulas × 4 pisos × 6 salones (01–06). Se generan dinámicamente abajo.
// Más salas fijas del catálogo UAO.
const SALAS_FIJAS: SalaSeed[] = [
  // Ingeniería
  { nombre: 'Sala de Juntas Ingeniería', ubicacion: 'Ala Sur, Piso 3', capacidad: 12, facultad: FACULTADES[0], tipo: 'JUNTAS_DECANATURA' },
  { nombre: 'Salón Torreón 2-101', ubicacion: 'Torreón 2, Piso 1', capacidad: 30, facultad: FACULTADES[0], tipo: 'REUNIONES_ESTANDAR' },
  { nombre: 'Salón Torreón 1-102', ubicacion: 'Torreón 1, Piso 1', capacidad: 25, facultad: FACULTADES[0], tipo: 'REUNIONES_ESTANDAR' },
  { nombre: 'Salón Torreón 0-01', ubicacion: 'Torreón 0, Piso 1', capacidad: 18, facultad: FACULTADES[0], tipo: 'REUNIONES_ESTANDAR' },
  { nombre: 'Sala de Capacitación CRAI', ubicacion: 'CRAI, Piso 2', capacidad: 25, facultad: FACULTADES[0], tipo: 'CAPACITACION_CRAI' },
  { nombre: 'Sala de Estudio CRAI-P2-1', ubicacion: 'CRAI, Piso 2', capacidad: 8, facultad: FACULTADES[0], tipo: 'ESTUDIO_CRAI' },

  // Económicas y Administrativas
  { nombre: 'Sala Económicas B-301', ubicacion: 'Edificio Central, Piso 3', capacidad: 20, facultad: FACULTADES[1], tipo: 'REUNIONES_ESTANDAR' },
  { nombre: 'Sala de Juntas Económicas', ubicacion: 'Edificio Central, Piso 3', capacidad: 14, facultad: FACULTADES[1], tipo: 'JUNTAS_DECANATURA' },
  { nombre: 'Auditorio Menor', ubicacion: 'Edificio Central, Piso 1', capacidad: 80, facultad: FACULTADES[1], tipo: 'AUDITORIO' },

  // Comunicación y Ciencias Sociales
  { nombre: 'Sala de Juntas Comunicación', ubicacion: 'Ala Sur, Piso 2', capacidad: 10, facultad: FACULTADES[2], tipo: 'JUNTAS_DECANATURA' },
  { nombre: 'Sala de Estudio CRAI-P2-2', ubicacion: 'CRAI, Piso 2', capacidad: 6, facultad: FACULTADES[2], tipo: 'ESTUDIO_CRAI' },
  { nombre: 'Torreón 4-203', ubicacion: 'Torreón 4, Piso 2', capacidad: 35, facultad: FACULTADES[2], tipo: 'REUNIONES_ESTANDAR' },

  // Humanidades y Artes
  { nombre: 'Sala de Estudio CRAI-P3-1', ubicacion: 'CRAI, Piso 3', capacidad: 6, facultad: FACULTADES[3], tipo: 'ESTUDIO_CRAI' },
  { nombre: 'Sala CELEE', ubicacion: 'CRAI, Piso 2', capacidad: 8, facultad: FACULTADES[3], tipo: 'CELEE' },
  { nombre: 'Sala Domus Magister', ubicacion: 'CRAI, Piso 2', capacidad: 8, facultad: FACULTADES[3], tipo: 'CELEE' },

  // Instituto de Sostenibilidad
  { nombre: 'Sala Sostenibilidad', ubicacion: 'Ala Sur, Piso 4', capacidad: 15, facultad: FACULTADES[4], tipo: 'REUNIONES_ESTANDAR' },
  { nombre: 'Sala de Juntas Sostenibilidad', ubicacion: 'Ala Sur, Piso 4', capacidad: 10, facultad: FACULTADES[4], tipo: 'JUNTAS_DECANATURA' },
];

// Generar edificios Aulas: 4 edificios × 4 pisos × 6 salones (01–06).
// Distribuimos salas entre facultades según edificio/piso (Aulas 1-2 → Ingeniería; Aulas 3 → Económicas/Comunicación; Aulas 4 → Humanidades/Sostenibilidad).
function generarAulas(): SalaSeed[] {
  const salas: SalaSeed[] = [];
  const facultadPorEdificio: Record<number, string> = {
    1: FACULTADES[0], // Ingeniería
    2: FACULTADES[0], // Ingeniería
    3: FACULTADES[1], // Económicas
    4: FACULTADES[3], // Humanidades
  };
  for (let edif = 1; edif <= 4; edif++) {
    for (let piso = 1; piso <= 4; piso++) {
      for (let sal = 1; sal <= 6; sal++) {
        const numero = `${piso}${sal.toString().padStart(2, '0')}`;
        salas.push({
          nombre: `Aulas ${edif} - A${numero}`,
          ubicacion: `Aulas ${edif}, Piso ${piso}, Salón ${sal.toString().padStart(2, '0')}`,
          capacidad: piso === 1 ? 30 : piso === 2 ? 25 : piso === 3 ? 20 : 18,
          facultad: facultadPorEdificio[edif],
          tipo: 'REUNIONES_ESTANDAR',
        });
      }
    }
  }
  return salas;
}

const LISTA_BLANCA = [
  { correo: 'secretaria.ingenieria@uao.edu.co', nombre: 'Secretaría Ingeniería' },
  { correo: 'secretaria.economicas@uao.edu.co', nombre: 'Secretaría Económicas' },
  { correo: 'secretaria.comunicacion@uao.edu.co', nombre: 'Secretaría Comunicación' },
  { correo: 'secretaria.humanidades@uao.edu.co', nombre: 'Secretaría Humanidades' },
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

  // ── Salas ── (batch con createMany/updateMany y asignaciones con skipDuplicates)
  const salas = [...SALAS_FIJAS, ...generarAulas()];

  // Cargar existentes en un solo query
  const existentes = await prisma.sala.findMany({
    select: { id: true, nombre: true, facultadId: true },
  });
  const existentesKey = new Map<string, number>();
  for (const e of existentes) existentesKey.set(`${e.nombre}::${e.facultadId}`, e.id);

  const paraCrear: { nombre: string; ubicacion: string; capacidad: number; facultadId: number }[] = [];
  const paraActualizar: { id: number; ubicacion: string; capacidad: number }[] = [];

  for (const s of salas) {
    const facultadId = facultadMap.get(s.facultad);
    if (!facultadId) continue;
    const key = `${s.nombre}::${facultadId}`;
    const existeId = existentesKey.get(key);
    if (existeId) {
      paraActualizar.push({ id: existeId, ubicacion: s.ubicacion, capacidad: s.capacidad });
    } else {
      paraCrear.push({ nombre: s.nombre, ubicacion: s.ubicacion, capacidad: s.capacidad, facultadId });
    }
  }

  if (paraCrear.length > 0) {
    await prisma.sala.createMany({ data: paraCrear });
  }
  // updates siguen siendo individuales pero en paralelo controlado
  await Promise.all(
    paraActualizar.map((u) =>
      prisma.sala.update({ where: { id: u.id }, data: { ubicacion: u.ubicacion, capacidad: u.capacidad, habilitada: true } })
    )
  );

  // Releer todas las salas con id para asignar recursos
  const todasSalas = await prisma.sala.findMany({
    select: { id: true, nombre: true, facultadId: true },
  });
  const idPorKey = new Map<string, number>();
  for (const s of todasSalas) idPorKey.set(`${s.nombre}::${s.facultadId}`, s.id);

  // Construir asignaciones en memoria
  const asignaciones: { salaId: number; recursoId: number }[] = [];
  for (const s of salas) {
    const facultadId = facultadMap.get(s.facultad);
    if (!facultadId) continue;
    const salaId = idPorKey.get(`${s.nombre}::${facultadId}`);
    if (!salaId) continue;
    for (const nombreRec of MATRIZ_RECURSOS[s.tipo]) {
      const recursoId = recursoMap.get(nombreRec);
      if (!recursoId) continue;
      asignaciones.push({ salaId, recursoId });
    }
  }

  const res = await prisma.salaRecurso.createMany({
    data: asignaciones,
    skipDuplicates: true,
  });
  console.log(`✔ ${salas.length} salas · ${res.count} nuevas asignaciones sala-recurso (existentes omitidas)`);
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
