# IMPLEMENTATION.md — Guía Completa de Implementación

> Guía paso a paso para implementar el Sistema de Reservas de Salas de Reuniones.
> Objetivo: otro desarrollador o IA puede seguir este documento de cero a producción.

---

## CONTEXTO DEL PROYECTO

- **Sistema:** Reservas de salas de reuniones por facultad
- **Roles:** Solo `DOCENTE` y `SECRETARIA` (no existe admin)
- **Stack:** Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL + NextAuth v4
- **HUs en scope:** HU-01, HU-02, HU-04 al HU-10
- **Reglas críticas:** Ver `CLAUDE.md` sección "Reglas del Proyecto"

---

## PREREQUISITOS

```
Node.js >= 20 LTS
Docker Desktop (para PostgreSQL local)
Git
VS Code (recomendado)
```

Verificar instalaciones:
```bash
node -v        # debe ser >= 20
npm -v         # debe ser >= 10
docker -v      # cualquier versión reciente
```

---

## PASO 1 — ESTRUCTURA DEL PROYECTO

El código Next.js vive en `reservas-salas/`. Los docs del proyecto están en `docs/`.

```
GESTION_UNIVERISDAD/
├── docs/                    # Documentación del proyecto (no tocar)
├── reservas-salas/          # Aplicación Next.js (aquí trabajas)
│   ├── prisma/
│   ├── src/
│   │   ├── app/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── types/
│   ├── docker-compose.yml
│   ├── .env.local
│   └── package.json
└── IMPLEMENTATION.md        # Este archivo
```

---

## PASO 2 — CLONAR E INSTALAR DEPENDENCIAS

```bash
cd reservas-salas
npm install
```

Dependencias instaladas:
- `next@14` + `react@18` — framework
- `@prisma/client` + `prisma` — ORM
- `next-auth@4` — autenticación (NO usar v5, aún en beta)
- `bcryptjs` — hash de contraseñas
- `zod` — validación de esquemas
- `@tanstack/react-query@5` — cache y estado del servidor
- `sonner` — notificaciones toast
- `lucide-react` — iconos
- `date-fns` — manejo de fechas
- `tsx` — ejecutar TypeScript en Node (para seed)

---

## PASO 3 — CONFIGURAR VARIABLES DE ENTORNO

```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
DATABASE_URL="postgresql://reservas_user:reservas_pass@localhost:5432/reservas_db"
NEXTAUTH_SECRET="secreto-largo-aleatorio-minimo-32-chars-aqui"
NEXTAUTH_URL="http://localhost:3000"
INSTITUTIONAL_DOMAIN="uao.edu.co"
```

Para generar `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## PASO 4 — BASE DE DATOS LOCAL CON DOCKER

### 4.1 Iniciar PostgreSQL

```bash
cd reservas-salas
docker compose up -d
```

Verificar que está corriendo:
```bash
docker compose ps
# debe mostrar: reservas_db   Up   0.0.0.0:5432->5432/tcp
```

Conectarse manualmente (opcional):
```bash
docker exec -it reservas_db psql -U reservas_user -d reservas_db
```

### 4.2 Ejecutar Migraciones

```bash
npm run db:migrate
# Ingresa un nombre cuando lo pida, ej: "init"
```

Esto crea todas las tablas en PostgreSQL según `prisma/schema.prisma`.

Tablas creadas:
- `facultades` — catálogo de facultades
- `usuarios` — usuarios con rol DOCENTE/SECRETARIA
- `lista_blanca` — correos autorizados para rol SECRETARIA
- `salas` — salas de reuniones por facultad
- `recursos_tecnologicos` — catálogo de recursos
- `salas_recursos` — relación M:M sala-recurso
- `reservas` — reservas (NUNCA se eliminan, solo CANCELADA)
- `logs_auditoria` — trazabilidad de todas las acciones (RF-16)

### 4.3 Cargar Datos Iniciales (Seed)

```bash
npm run db:seed
```

El seed crea:
- 3 facultades de la UAO
- 1 correo de secretaria en lista blanca: `secretaria.ingenieria@uao.edu.co`
- 7 recursos tecnológicos comunes

Para ver los datos en interfaz visual:
```bash
npm run db:studio
# Abre http://localhost:5555
```

---

## PASO 5 — EJECUTAR EN DESARROLLO

```bash
npm run dev
# Abre http://localhost:3000
```

### 5.1 Flujo de prueba recomendado

**Registrar secretaria:**
1. Ir a `/register`
2. Usar correo: `secretaria.ingenieria@uao.edu.co`
3. El sistema asignará rol SECRETARIA automáticamente

**Registrar docente:**
1. Ir a `/register`
2. Usar cualquier correo `@uao.edu.co` (no en lista blanca)
3. El sistema asignará rol DOCENTE automáticamente

**Probar HU-04 (crear sala):**
1. Iniciar sesión como secretaria
2. Ir a `/salas`
3. Crear una sala con nombre, ubicación y capacidad 2-100

**Probar HU-09 (crear reserva):**
1. Iniciar sesión como docente o secretaria
2. Ir a `/reservas`
3. Crear reserva entre 7:00 y 21:30

---

## PASO 6 — VALIDACIONES DE NEGOCIO IMPLEMENTADAS

Verificar que cada regla está funcionando:

| Regla | Cómo probar |
|-------|-------------|
| R-02: Franja 7AM–9:30PM | Intentar reservar a las 6:00 AM → debe rechazar |
| R-03: Sin solapamiento | Crear 2 reservas en misma sala mismo horario → 2da debe fallar |
| R-06: No eliminar reservas | Solo existe botón "Cancelar", no "Eliminar" |
| R-07: Sin admin | No existe forma de asignar rol admin |
| R-08: DOCENTE por defecto | Registrarse con correo no en lista blanca |
| R-09: SECRETARIA por lista blanca | Registrarse con `secretaria.ingenieria@uao.edu.co` |

---

## PASO 7 — ESTRUCTURA DE ARCHIVOS DETALLADA

```
reservas-salas/src/
│
├── types/index.ts               ← Tipos TS + extensiones de NextAuth session
│
├── lib/
│   ├── prisma.ts                ← Singleton del cliente Prisma
│   ├── auth.ts                  ← Configuración NextAuth v4 (authOptions)
│   ├── audit.ts                 ← Logger de auditoría (RF-16)
│   └── validations/
│       ├── auth.schema.ts       ← Zod: registro y login
│       ├── room.schema.ts       ← Zod: crear/editar sala, capacidad 2-100
│       └── reservation.schema.ts ← Zod: reserva con validación de horario
│
├── repositories/                ← Acceso a datos (Patrón Repository)
│   ├── room.repository.ts       ← CRUD salas + check nombre único
│   ├── resource.repository.ts   ← CRUD recursos + check duplicados
│   └── reservation.repository.ts ← Reservas + check solapamiento
│
├── services/                    ← Lógica de negocio (Patrón Service Layer)
│   ├── room.service.ts          ← Reglas: nombre único x facultad, capacidad
│   ├── resource.service.ts      ← Reglas: sin duplicados, solo secretaria
│   └── reservation.service.ts   ← Reglas: R-02 franja, R-03 solapamiento
│
├── middleware.ts                 ← RBAC: protege rutas del dashboard
│
└── app/
    ├── layout.tsx               ← Root layout
    ├── globals.css              ← Estilos globales Tailwind
    ├── page.tsx                 ← Redirect a /login
    ├── providers.tsx            ← SessionProvider + QueryClientProvider
    │
    ├── (auth)/
    │   ├── login/page.tsx       ← HU-02: Inicio de sesión
    │   └── register/page.tsx    ← HU-01: Registro con correo institucional
    │
    ├── (dashboard)/
    │   ├── layout.tsx           ← Nav condicional por rol
    │   ├── page.tsx             ← Redirect por rol
    │   ├── salas/page.tsx       ← HU-04, HU-05, HU-06
    │   ├── salas/[id]/recursos/page.tsx ← HU-07, HU-08
    │   └── reservas/page.tsx    ← HU-09, HU-10
    │
    └── api/
        ├── auth/[...nextauth]/route.ts  ← NextAuth handler
        ├── auth/register/route.ts       ← POST: registro usuario
        ├── rooms/route.ts               ← GET: listar, POST: crear sala
        ├── rooms/[id]/route.ts          ← GET, PUT: editar sala
        ├── rooms/[id]/status/route.ts   ← PATCH: habilitar/deshabilitar
        ├── rooms/[id]/resources/route.ts      ← GET, POST: recursos
        ├── rooms/[id]/resources/[rid]/route.ts ← DELETE: retirar recurso
        ├── reservations/route.ts        ← GET: listar, POST: crear reserva
        └── reservations/[id]/cancel/route.ts  ← PATCH: cancelar reserva
```

---

## PASO 8 — API REST COMPLETA

### Autenticación

```
POST /api/auth/register
Body: { nombre, correo, password, facultadId }
Response 201: { id, nombre, correo, rol, facultadId }
Response 400: { error: "..." }
Response 409: { error: "Correo ya registrado" }

POST /api/auth/signin  (NextAuth — manejado automáticamente)
Body: { correo, password }
```

### Salas (solo SECRETARIA puede crear/editar)

```
GET  /api/rooms              → lista salas de la facultad del usuario
POST /api/rooms              → crear sala (SECRETARIA)
  Body: { nombre, ubicacion, capacidad }

PUT  /api/rooms/:id          → editar sala (SECRETARIA)
  Body: { nombre?, ubicacion?, capacidad? }

PATCH /api/rooms/:id/status  → cambiar estado (SECRETARIA)
  Body: { habilitada: boolean }
```

### Recursos (solo SECRETARIA)

```
GET    /api/rooms/:id/resources       → lista recursos de la sala
POST   /api/rooms/:id/resources       → agregar recurso
  Body: { recursoId }

DELETE /api/rooms/:id/resources/:rid  → retirar recurso
```

### Reservas

```
GET  /api/reservations               → lista reservas (rol-dependiente)
  Query: ?page=1&limit=20&estado=CONFIRMADA

POST /api/reservations               → crear reserva (DOCENTE + SECRETARIA)
  Body: { salaId, fecha, horaInicio, horaFin, motivo }

PATCH /api/reservations/:id/cancel   → cancelar reserva
  (DOCENTE solo las propias, SECRETARIA todas las de su facultad)
```

### Respuestas de error estándar

```json
{ "error": "Descripción del error", "code": "CODIGO_OPCIONAL" }
```

Códigos HTTP usados:
- `200` — OK
- `201` — Creado
- `400` — Validación fallida (Zod)
- `401` — No autenticado
- `403` — Sin permiso (RBAC)
- `404` — No encontrado
- `409` — Conflicto (nombre duplicado, solapamiento)
- `500` — Error interno

---

## PASO 9 — PATRÓN DE TRAZABILIDAD (RF-16)

Toda acción que modifica datos llama a `audit()` de `src/lib/audit.ts`:

```typescript
await audit({
  usuarioId: session.user.id,
  accion: 'CREAR_SALA',       // verbo en mayúsculas
  entidad: 'SALA',            // tabla afectada
  entidadId: sala.id,
  datosAnteriores: null,      // para CREATE
  datosNuevos: { nombre, ubicacion, capacidad },
  ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
})
```

Acciones auditadas:
- `REGISTRO_USUARIO` — HU-01
- `CREAR_SALA`, `EDITAR_SALA`, `CAMBIAR_ESTADO_SALA` — HU-04, HU-05, HU-06
- `AGREGAR_RECURSO`, `RETIRAR_RECURSO` — HU-07, HU-08
- `CREAR_RESERVA`, `CANCELAR_RESERVA` — HU-09, HU-10

---

## PASO 10 — DEPLOY A VERCEL (AMBIENTE REMOTO)

### 10.1 Preparar base de datos remota

Opciones gratuitas para PostgreSQL en producción:
1. **Neon** (recomendado) — https://neon.tech — 0.5 GB gratis
2. **Supabase** — https://supabase.com — 500 MB gratis
3. **Railway** — https://railway.app — $5/mes trial

Pasos con Neon:
1. Crear cuenta en https://neon.tech
2. Crear proyecto "reservas-salas"
3. Copiar la `DATABASE_URL` del dashboard (formato: `postgresql://...@...neon.tech/...`)

### 10.2 Deploy en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desde dentro de reservas-salas/
vercel

# Seguir el wizard:
# - Link to existing project? No
# - Project name: reservas-salas
# - Directory: ./
# - Override settings? No
```

### 10.3 Variables de entorno en Vercel

En Vercel Dashboard → Project → Settings → Environment Variables:

```
DATABASE_URL        = [URL de Neon/Supabase]
NEXTAUTH_SECRET     = [mismo secreto que en local, o generar uno nuevo]
NEXTAUTH_URL        = https://tu-proyecto.vercel.app
INSTITUTIONAL_DOMAIN = uao.edu.co
```

### 10.4 Ejecutar migraciones en producción

```bash
# Usando la DATABASE_URL de producción temporalmente
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
```

O configurar en package.json:
```json
"db:deploy": "prisma migrate deploy"
```

Y ejecutar en Vercel Build Command: `prisma migrate deploy && next build`

---

## SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: "Connection refused" en PostgreSQL
```bash
docker compose ps          # verificar que está corriendo
docker compose restart     # reiniciar si es necesario
```

### Error: "NEXTAUTH_SECRET is not set"
Verificar que `.env.local` existe y tiene `NEXTAUTH_SECRET` definido.

### Seed falla con "unique constraint"
El seed usa `upsert`, es seguro ejecutarlo múltiples veces. Si falla, revisar la conexión a la BD.

### "Prisma Client is not generated"
```bash
npx prisma generate
```

---

## CHECKLIST FINAL ANTES DE DEMO

- [ ] `docker compose up -d` — PostgreSQL corriendo
- [ ] `npm run db:migrate` — tablas creadas
- [ ] `npm run db:seed` — datos iniciales cargados
- [ ] `npm run dev` — servidor en http://localhost:3000
- [ ] Registro con `secretaria.ingenieria@uao.edu.co` → rol SECRETARIA
- [ ] Registro con cualquier otro `@uao.edu.co` → rol DOCENTE
- [ ] Secretaria puede crear sala en `/salas`
- [ ] Docente puede crear reserva en `/reservas`
- [ ] No se puede reservar fuera de 7AM–9:30PM
- [ ] No se pueden solapar reservas en la misma sala
- [ ] Al cancelar, la reserva queda en historial con estado CANCELADA
- [ ] Logs de auditoría visibles en Prisma Studio (`npm run db:studio`)
