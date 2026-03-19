# Modelo Relacional de Datos — Base para Implementación

> **Asignatura:** Ingeniería de Software 1  
> **Facultad:** Ingeniería y Ciencias Básicas — Programa de Ingeniería Informática  
> **Creado:** Marzo 5, 2026  
> **Stack:** Next.js 14+ · TypeScript 5.x · Prisma 5.x · PostgreSQL 16

---

## 1. Propósito

Documento técnico que traduce el modelo lógico de base de datos a un **modelo relacional listo para implementar** con el stack seleccionado. Incluye el esquema Prisma (fuente de verdad), el DDL SQL equivalente generado, índices de rendimiento y tipos TypeScript derivados.

---


## 3. Esquema Prisma (Fuente de Verdad)

Este es el archivo `prisma/schema.prisma` que Prisma usará para generar las migraciones y el cliente tipado.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum Rol {
  DOCENTE
  SECRETARIA
}

enum TipoUsuario {
  SECRETARIA
}

enum EstadoReserva {
  CONFIRMADA
  CANCELADA
}

// ─────────────────────────────────────────────
// TABLAS
// ─────────────────────────────────────────────

model Facultad {
  id        Int      @id @default(autoincrement())
  nombre    String   @unique @db.VarChar(100)
  activa    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relaciones
  usuarios Usuario[]
  salas    Sala[]

  @@map("facultad")
}

model Usuario {
  id                   Int      @id @default(autoincrement())
  nombre               String   @db.VarChar(100)
  correoInstitucional  String   @unique @map("correo_institucional") @db.VarChar(100)
  passwordHash         String   @map("password_hash") @db.VarChar(255)
  rol                  Rol      @default(DOCENTE)
  activo               Boolean  @default(true)
  fechaRegistro        DateTime @default(now()) @map("fecha_registro")
  updatedAt            DateTime @updatedAt @map("updated_at")

  // FK
  facultadId Int      @map("facultad_id")
  facultad   Facultad @relation(fields: [facultadId], references: [id])

  // Relaciones inversas
  reservasCreadas    Reserva[]      @relation("ReservaCreador")
  reservasCanceladas Reserva[]      @relation("ReservaCancelador")
  logsAuditoria      LogAuditoria[]

  @@index([facultadId])
  @@index([rol])
  @@map("usuario")
}

model ListaBlanca {
  correoInstitucional String      @id @map("correo_institucional") @db.VarChar(100)
  nombre              String      @db.VarChar(100)
  tipoUsuario         TipoUsuario @default(SECRETARIA) @map("tipo_usuario")
  createdAt           DateTime    @default(now()) @map("created_at")

  @@map("lista_blanca")
}

model Sala {
  id         Int      @id @default(autoincrement())
  nombre     String   @db.VarChar(100)
  ubicacion  String?  @db.VarChar(200)
  capacidad  Int
  habilitada Boolean  @default(true)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  // FK
  facultadId Int      @map("facultad_id")
  facultad   Facultad @relation(fields: [facultadId], references: [id])

  // Relaciones inversas
  reservas     Reserva[]
  salaRecursos SalaRecurso[]

  @@index([facultadId])
  @@index([habilitada])
  @@map("sala")
}

model RecursoTecnologico {
  id          Int     @id @default(autoincrement())
  nombre      String  @unique @db.VarChar(100)
  descripcion String? @db.VarChar(255)

  // Relaciones inversas
  salaRecursos SalaRecurso[]

  @@map("recurso_tecnologico")
}

model SalaRecurso {
  id Int @id @default(autoincrement())

  // FKs
  salaId    Int                @map("sala_id")
  recursoId Int                @map("recurso_id")
  sala      Sala               @relation(fields: [salaId], references: [id], onDelete: Cascade)
  recurso   RecursoTecnologico @relation(fields: [recursoId], references: [id], onDelete: Cascade)

  @@unique([salaId, recursoId])
  @@map("sala_recurso")
}

model Reserva {
  id               Int            @id @default(autoincrement())
  motivo           String?        @db.VarChar(255)
  fecha            DateTime       @db.Date
  horaInicio       DateTime       @map("hora_inicio") @db.Time()
  horaFin          DateTime       @map("hora_fin") @db.Time()
  estado           EstadoReserva  @default(CONFIRMADA)
  fechaCreacion    DateTime       @default(now()) @map("fecha_creacion")
  fechaCancelacion DateTime?      @map("fecha_cancelacion")

  // FKs
  salaId       Int  @map("sala_id")
  usuarioId    Int  @map("usuario_id")
  canceladoPor Int? @map("cancelado_por")

  sala     Sala    @relation(fields: [salaId], references: [id])
  usuario  Usuario @relation("ReservaCreador", fields: [usuarioId], references: [id])
  cancelador Usuario? @relation("ReservaCancelador", fields: [canceladoPor], references: [id])

  @@index([salaId, fecha, estado])
  @@index([usuarioId])
  @@index([fecha])
  @@map("reserva")
}

model LogAuditoria {
  id              Int      @id @default(autoincrement())
  accion          String   @db.VarChar(50)
  entidad         String   @db.VarChar(50)
  entidadId       Int      @map("entidad_id")
  datosAnteriores Json?    @map("datos_anteriores")
  datosNuevos     Json?    @map("datos_nuevos")
  fecha           DateTime @default(now())
  ipAddress       String?  @map("ip_address") @db.VarChar(45)

  // FK
  usuarioId Int     @map("usuario_id")
  usuario   Usuario @relation(fields: [usuarioId], references: [id])

  @@index([entidad, entidadId])
  @@index([usuarioId])
  @@index([fecha])
  @@map("log_auditoria")
}
```

---

## 4. DDL SQL Equivalente (PostgreSQL 16)

SQL generado por `npx prisma migrate dev`. Se documenta aquí como referencia.

```sql
-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────

CREATE TYPE "Rol" AS ENUM ('DOCENTE', 'SECRETARIA');
CREATE TYPE "TipoUsuario" AS ENUM ('SECRETARIA');
CREATE TYPE "EstadoReserva" AS ENUM ('CONFIRMADA', 'CANCELADA');

-- ─────────────────────────────────────────────
-- TABLAS
-- ─────────────────────────────────────────────

CREATE TABLE facultad (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    activa      BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL
);

CREATE TABLE usuario (
    id                    SERIAL       PRIMARY KEY,
    nombre                VARCHAR(100) NOT NULL,
    correo_institucional  VARCHAR(100) NOT NULL UNIQUE,
    password_hash         VARCHAR(255) NOT NULL,
    rol                   "Rol"        NOT NULL DEFAULT 'DOCENTE',
    activo                BOOLEAN      NOT NULL DEFAULT true,
    fecha_registro        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP    NOT NULL,
    facultad_id           INTEGER      NOT NULL REFERENCES facultad(id)
);

CREATE TABLE lista_blanca (
    correo_institucional  VARCHAR(100)    PRIMARY KEY,
    nombre                VARCHAR(100)    NOT NULL,
    tipo_usuario          "TipoUsuario"   NOT NULL DEFAULT 'SECRETARIA',
    created_at            TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE sala (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    ubicacion   VARCHAR(200),
    capacidad   INTEGER      NOT NULL,
    habilitada  BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL,
    facultad_id INTEGER      NOT NULL REFERENCES facultad(id),
    CONSTRAINT chk_capacidad CHECK (capacidad >= 1)
);

CREATE TABLE recurso_tecnologico (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE sala_recurso (
    id         SERIAL  PRIMARY KEY,
    sala_id    INTEGER NOT NULL REFERENCES sala(id) ON DELETE CASCADE,
    recurso_id INTEGER NOT NULL REFERENCES recurso_tecnologico(id) ON DELETE CASCADE,
    UNIQUE (sala_id, recurso_id)
);

CREATE TABLE reserva (
    id                SERIAL          PRIMARY KEY,
    motivo            VARCHAR(255),
    fecha             DATE            NOT NULL,
    hora_inicio       TIME            NOT NULL,
    hora_fin          TIME            NOT NULL,
    estado            "EstadoReserva" NOT NULL DEFAULT 'CONFIRMADA',
    fecha_creacion    TIMESTAMP       NOT NULL DEFAULT NOW(),
    fecha_cancelacion TIMESTAMP,
    sala_id           INTEGER         NOT NULL REFERENCES sala(id),
    usuario_id        INTEGER         NOT NULL REFERENCES usuario(id),
    cancelado_por     INTEGER         REFERENCES usuario(id),
    CONSTRAINT chk_franja_horaria CHECK (hora_inicio >= '07:00' AND hora_fin <= '21:30'),
    CONSTRAINT chk_orden_horas    CHECK (hora_inicio < hora_fin)
);

CREATE TABLE log_auditoria (
    id               SERIAL      PRIMARY KEY,
    accion           VARCHAR(50) NOT NULL,
    entidad          VARCHAR(50) NOT NULL,
    entidad_id       INTEGER     NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    fecha            TIMESTAMP   NOT NULL DEFAULT NOW(),
    ip_address       VARCHAR(45),
    usuario_id       INTEGER     NOT NULL REFERENCES usuario(id)
);

-- ─────────────────────────────────────────────
-- ÍNDICES DE RENDIMIENTO
-- ─────────────────────────────────────────────

-- Búsqueda de reservas por sala + fecha (consulta de disponibilidad RF-04, validación RF-11)
CREATE INDEX idx_reserva_sala_fecha ON reserva (sala_id, fecha, estado);

-- Historial por usuario (RF-14, RF-19)
CREATE INDEX idx_reserva_usuario ON reserva (usuario_id);

-- Filtros por rango de fechas en reportes (RF-20)
CREATE INDEX idx_reserva_fecha ON reserva (fecha);

-- Salas por facultad (segmentación por facultad)
CREATE INDEX idx_sala_facultad ON sala (facultad_id);

-- Salas habilitadas (filtro frecuente)
CREATE INDEX idx_sala_habilitada ON sala (habilitada);

-- Usuarios por facultad y rol
CREATE INDEX idx_usuario_facultad ON usuario (facultad_id);
CREATE INDEX idx_usuario_rol ON usuario (rol);

-- Auditoría por entidad (consultas de trazabilidad RF-16)
CREATE INDEX idx_log_entidad ON log_auditoria (entidad, entidad_id);
CREATE INDEX idx_log_usuario ON log_auditoria (usuario_id);
CREATE INDEX idx_log_fecha ON log_auditoria (fecha);
```

---

## 5. Constraint de No Solapamiento (PostgreSQL)

Prisma no soporta exclusion constraints nativamente. Este constraint se agrega en una migración manual:

```sql
-- Archivo: prisma/migrations/XXXX_add_exclusion_constraint/migration.sql
-- Requiere extensión btree_gist

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reserva
ADD CONSTRAINT no_solapamiento_reservas
EXCLUDE USING gist (
    sala_id WITH =,
    fecha   WITH =,
    tsrange(
        ('2000-01-01'::date + hora_inicio)::timestamp,
        ('2000-01-01'::date + hora_fin)::timestamp
    ) WITH &&
)
WHERE (estado = 'CONFIRMADA');
```

> **Nota:** Este constraint garantiza a nivel de base de datos que no existan dos reservas `CONFIRMADA` para la misma sala en la misma fecha con horarios superpuestos (R-03, RF-11). Es una segunda línea de defensa después de la validación en la capa de aplicación.

---

## 6. Tipos TypeScript Generados

Prisma Client genera estos tipos automáticamente. Se documentan aquí como referencia para el equipo de frontend y backend.

```typescript
// Estos tipos son generados por Prisma Client (npx prisma generate)
// Se importan desde: import { ... } from '@prisma/client'

// Enums
type Rol = 'DOCENTE' | 'SECRETARIA';
type TipoUsuario = 'SECRETARIA';
type EstadoReserva = 'CONFIRMADA' | 'CANCELADA';

// Modelos
interface Facultad {
  id:        number;
  nombre:    string;
  activa:    boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Usuario {
  id:                  number;
  nombre:              string;
  correoInstitucional: string;
  passwordHash:        string;
  rol:                 Rol;
  activo:              boolean;
  fechaRegistro:       Date;
  updatedAt:           Date;
  facultadId:          number;
}

interface ListaBlanca {
  correoInstitucional: string;
  nombre:              string;
  tipoUsuario:         TipoUsuario;
  createdAt:           Date;
}

interface Sala {
  id:         number;
  nombre:     string;
  ubicacion:  string | null;
  capacidad:  number;
  habilitada: boolean;
  createdAt:  Date;
  updatedAt:  Date;
  facultadId: number;
}

interface RecursoTecnologico {
  id:          number;
  nombre:      string;
  descripcion: string | null;
}

interface SalaRecurso {
  id:        number;
  salaId:    number;
  recursoId: number;
}

interface Reserva {
  id:               number;
  motivo:           string | null;
  fecha:            Date;
  horaInicio:       Date;
  horaFin:          Date;
  estado:           EstadoReserva;
  fechaCreacion:    Date;
  fechaCancelacion: Date | null;
  salaId:           number;
  usuarioId:        number;
  canceladoPor:     number | null;
}

interface LogAuditoria {
  id:              number;
  accion:          string;
  entidad:         string;
  entidadId:       number;
  datosAnteriores: Record<string, unknown> | null;
  datosNuevos:     Record<string, unknown> | null;
  fecha:           Date;
  ipAddress:       string | null;
  usuarioId:       number;
}
```

---

## 7. Datos Semilla Iniciales

Archivo `prisma/seed.ts` para inicializar el sistema con datos necesarios.

```typescript
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
      where: { correoInstitucional: 'secretaria.ingenieria@universidad.edu.co' },
      update: {},
      create: {
        correoInstitucional: 'secretaria.ingenieria@universidad.edu.co',
        nombre: 'María García',
        tipoUsuario: 'SECRETARIA',
      },
    }),
    prisma.listaBlanca.upsert({
      where: { correoInstitucional: 'secretaria.admin@universidad.edu.co' },
      update: {},
      create: {
        correoInstitucional: 'secretaria.admin@universidad.edu.co',
        nombre: 'Laura Rodríguez',
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
```

---

## 8. Comandos de Implementación

```bash
# 1. Configurar variable de entorno
echo DATABASE_URL="postgresql://user:password@localhost:5432/reservas_salas" > .env

# 2. Generar migración inicial
npx prisma migrate dev --name init

# 3. Aplicar constraint de no solapamiento (migración manual)
npx prisma migrate dev --name add_exclusion_constraint --create-only
# → Pegar el SQL de la sección 5 en el archivo generado, luego:
npx prisma migrate dev

# 4. Generar Prisma Client (tipos TypeScript)
npx prisma generate

# 5. Ejecutar datos semilla
npx prisma db seed

# 6. Explorar datos visualmente
npx prisma studio
```

---

## 9. Resumen de Tablas

| Tabla | Registros Esperados | Operaciones Principales | Índices Clave |
|-------|--------------------|-----------------------|---------------|
| `facultad` | ~5 – 10 | Lectura | `nombre` (UNIQUE) |
| `usuario` | ~50 – 200 | CRUD, login | `correo_institucional` (UNIQUE), `facultad_id`, `rol` |
| `lista_blanca` | ~5 – 20 | Lectura en registro | PK (`correo_institucional`) |
| `sala` | ~10 – 30 | CRUD (secretaria) | `facultad_id`, `habilitada` |
| `recurso_tecnologico` | ~5 – 15 | Catálogo | `nombre` (UNIQUE) |
| `sala_recurso` | ~20 – 60 | Asignar/retirar | `(sala_id, recurso_id)` UNIQUE |
| `reserva` | ~500 – 5,000/semestre | Crear, cancelar, consultar | `(sala_id, fecha, estado)`, `usuario_id`, `fecha` |
| `log_auditoria` | ~1,000 – 10,000/semestre | Solo INSERT | `(entidad, entidad_id)`, `usuario_id`, `fecha` |
