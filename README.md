# Sistema de Reservas de Salas — Universidad Autónoma de Occidente

Aplicación web para la gestión y reserva de salas de reuniones por facultad, con control de acceso basado en roles (docentes y secretarias).

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript 5 |
| Base de datos | PostgreSQL + Prisma ORM 5 |
| Autenticación | NextAuth.js 4 (Credentials) |
| UI | React 18 + Tailwind CSS 3 |
| Validación | Zod |
| Data fetching | TanStack React Query 5 |
| Despliegue | Vercel |

## Funcionalidades

### Docentes
- Registro e inicio de sesión con correo institucional
- Consultar salas disponibles con capacidad y recursos tecnológicos
- Crear, editar y cancelar reservas propias
- Ver historial de reservas

### Secretarias
- Todo lo anterior, más:
- Gestión completa de salas (crear, editar, habilitar/deshabilitar)
- Administrar recursos tecnológicos por sala
- Ver y modificar reservas de cualquier usuario
- Filtrar reservas por sala y rango de fechas
- Reportes de uso: por número de reservas, horas reservadas y por usuario

## Reglas de negocio
- No se permiten reservas en domingos
- Horario habilitado: 7:00 AM – 9:30 PM
- No se permiten reservas en fechas pasadas ni con traslapes
- El rol `SECRETARIA` se asigna mediante lista blanca en base de datos

## Estructura del proyecto

```
reservas-salas/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login y registro
│   │   ├── (dashboard)/     # Vistas protegidas (reservas, salas, reportes)
│   │   └── api/             # Endpoints REST
│   ├── repositories/        # Capa de acceso a datos
│   ├── services/            # Lógica de negocio
│   ├── lib/                 # Auth, Prisma, validaciones
│   └── types/               # Tipos TypeScript
└── prisma/
    ├── schema.prisma
    └── migrations/
```

## Variables de entorno

Crea un archivo `.env` en `reservas-salas/` basado en `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEXTAUTH_SECRET="genera-uno-con: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
INSTITUTIONAL_DOMAIN="uao.edu.co"
```

## Instalación local

```bash
cd reservas-salas
npm install

# Aplicar migraciones y poblar la base de datos
npx prisma migrate deploy
npx prisma db seed

# Iniciar en desarrollo
npm run dev
```

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run db:migrate   # Crear y aplicar migración
npm run db:seed      # Poblar base de datos
npm run db:studio    # Abrir Prisma Studio
```

## Despliegue en Vercel

1. Conecta el repositorio en Vercel y configura el **Root Directory** como `reservas-salas`
2. Agrega las variables de entorno en el panel de Vercel
3. El build ejecuta `prisma generate && next build` automáticamente

---

Universidad Autónoma de Occidente — Proyecto académico de gestión de espacios
