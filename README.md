# Sistema de Reservas de Salas — UAO

Aplicación web para reservar y administrar salas de reuniones por facultad en la Universidad Autónoma de Occidente. Resuelve los choques de horario, la opacidad sobre qué espacios están libres y la fricción de coordinar reservas por correo o WhatsApp, centralizándolo en una sola herramienta con dos roles: **docentes** que reservan y consultan sus propios espacios, y **secretarias** que gestionan el catálogo de salas, recursos, reportes y reservas de toda la facultad.

> Desplegado en: <https://gestion-uao.vercel.app>

---

## Vistas principales

### Mis Reservas — vista del docente
Resumen del estado de sus reservas, con filtros por activas/historial y acción rápida para cancelar.

![Mis Reservas](docs/screenshots/mis-reservas.png)

### Catálogo de Salas
Búsqueda y filtrado por edificio, capacidad y recursos. Las salas se agrupan en secciones colapsables por edificio para no abrumar cuando hay muchas.

![Catálogo de Salas](docs/screenshots/catalogo-salas.png)

### Disponibilidad — vista tipo Gantt
Mapa horario por sala y franjas de 30 minutos. Verde = libre, rojo = reservada, gris rayado = sala deshabilitada. Un click sobre una franja libre abre el modal de reserva.

![Disponibilidad](docs/screenshots/disponibilidad-gantt.png)

### Notificaciones
Cuando una secretaria ajusta o cancela una reserva, el docente recibe una notificación con el antes/después y el motivo.

![Notificaciones](docs/screenshots/notificaciones.png)

### Modo oscuro
Toda la interfaz soporta modo oscuro con persistencia por usuario.

![Modo oscuro — escritorio](docs/screenshots/dark-mode-desktop.png)

### Responsive — versión móvil
La aplicación se adapta a pantallas pequeñas con un drawer lateral para la navegación.

<img src="docs/screenshots/dark-mode-mobile.png" alt="Versión móvil en modo oscuro" width="320" />

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript 5 |
| Base de datos | PostgreSQL 16 (Neon) |
| ORM | Prisma 5 |
| Autenticación | NextAuth.js 4 (Credentials + JWT) |
| UI | React 18 + Tailwind CSS 3 |
| Validación | Zod |
| Data fetching | TanStack React Query 5 |
| Iconos | lucide-react |
| Toasts | sonner |
| Despliegue | Vercel (CI/CD desde `master`) |

---

## Funcionalidades por rol

### Docente
- Registro e inicio de sesión con correo institucional `@uao.edu.co`.
- Explorar el catálogo de salas con filtros por edificio, capacidad y recursos.
- Ver disponibilidad por día en un mapa horario tipo Gantt.
- Crear, editar y cancelar reservas propias.
- Recibir notificaciones cuando una secretaria modifica una de sus reservas.
- Historial paginado de reservas pasadas y canceladas.

### Secretaria
Todo lo del docente, más:
- Gestión del catálogo de salas (crear, editar, habilitar/deshabilitar).
- Administración de recursos por sala (proyector, HDMI, accesibilidad, etc.) con cantidades.
- Ver y ajustar reservas de cualquier usuario de su facultad, registrando el motivo del cambio.
- Filtrar reservas por sala, usuario y rango de fechas.
- Reportes de uso: por número de reservas, horas reservadas y por usuario.
- Historial de auditoría por sala y por reserva.

---

## Reglas de negocio relevantes

- No se permiten reservas en domingos.
- Horario habilitado: 7:00 – 21:30.
- No se permiten reservas en fechas pasadas ni con traslapes contra reservas activas.
- El rol `SECRETARIA` se asigna mediante lista blanca de correos en base de datos; cualquier otro correo institucional registra al usuario como `DOCENTE`.
- Sesión única por usuario: iniciar sesión en un dispositivo invalida la sesión activa en cualquier otro.
- Las reservas se eliminan con *soft-delete* para conservar el historial y la trazabilidad de cambios.

---

## Estructura del proyecto

```
gestionUao/
├── reservas-salas/              # Aplicación Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/          # Login y registro
│   │   │   ├── (dashboard)/     # Vistas protegidas
│   │   │   └── api/             # Endpoints REST
│   │   ├── components/          # Componentes UI reutilizables
│   │   ├── repositories/        # Acceso a datos vía Prisma
│   │   ├── services/            # Lógica de negocio
│   │   ├── lib/                 # Auth, Prisma, validaciones
│   │   └── types/               # Tipos TypeScript compartidos
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
└── docs/                        # Documentación, diagramas, capturas
```

---

## Variables de entorno

Crea un archivo `.env` en `reservas-salas/` basado en `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEXTAUTH_SECRET="genera-uno-con: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
INSTITUTIONAL_DOMAIN="uao.edu.co"
```

---

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

La aplicación queda disponible en <http://localhost:3000>.

### Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (incluye `prisma generate`) |
| `npm run lint` | Linter |
| `npm run db:migrate` | Crear y aplicar migración |
| `npm run db:seed` | Poblar base de datos con datos de ejemplo |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:deploy` | Aplicar migraciones sin generar nuevas (producción) |
