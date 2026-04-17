# Decisiones Arquitectónicas — Reservas de Salas

## Estilo Arquitectónico

**Arquitectura en Capas (N-Tier)** con separación cliente-servidor:

```mermaid
graph TD
    subgraph "Frontend (Browser)"
        A[UI Components] --> B[Estado / Store]
        B --> C[API Client]
    end

    subgraph "Backend (API REST)"
        D[Controllers / Routes] --> E[Services / Business Logic]
        E --> F[Data Access / Repository]
        F --> G[(Base de Datos)]
    end

    C -->|HTTP/REST| D
    E --> H[Middleware Auth]
    E --> I[Audit Logger]
```

### Justificación

| RNF | Cómo la arquitectura lo cumple |
|-----|-------------------------------|
| RNF-01 Rendimiento | Separación de capas permite optimizar cada nivel independientemente |
| RNF-02 Escalabilidad | Backend stateless permite escalar horizontalmente |
| RNF-03 Disponibilidad | SPA accesible desde cualquier navegador |
| RNF-04 Mantenibilidad | Capas bien definidas facilitan modificaciones |
| RNF-05 Seguridad | Middleware de autenticación centralizado + RBAC |
| RNF-06 Integridad | Validaciones en capa de servicio + constraints en BD |

## Patrones de Diseño

| Patrón | Uso en el sistema |
|--------|-------------------|
| **Repository** | Abstracción de acceso a datos (capa F) |
| **Service Layer** | Lógica de negocio encapsulada (validación de conflictos, reglas de reserva) |
| **Middleware** | Autenticación, autorización por rol, logging de auditoría |
| **Observer** | Registro automático de trazabilidad (LOG_AUDITORIA) en cada acción |
| **Strategy** | Generación de reportes con diferentes métricas (por reservas, por horas, por usuario) |

## Estructura de Componentes

```
├── frontend/
│   ├── pages/           # Vistas principales
│   │   ├── Login
│   │   ├── Register
│   │   ├── Dashboard
│   │   ├── Calendar     # Vista de disponibilidad (RF-04)
│   │   ├── Rooms        # CRUD de salas (RF-05 a RF-09)
│   │   ├── Reservations # Gestión de reservas (RF-10 a RF-13)
│   │   ├── History      # Historial (RF-14, RF-15)
│   │   └── Reports      # Reportes (RF-17 a RF-20)
│   ├── components/      # Componentes reutilizables
│   ├── services/        # Clientes API
│   └── utils/           # Helpers
│
├── backend/
│   ├── routes/          # Definición de endpoints REST
│   ├── controllers/     # Manejo de request/response
│   ├── services/        # Lógica de negocio
│   ├── repositories/    # Acceso a datos
│   ├── middleware/       # Auth, RBAC, Audit
│   ├── models/          # Entidades/esquemas
│   └── utils/           # Helpers
│
└── database/
    ├── migrations/      # Migraciones de esquema
    └── seeds/           # Datos iniciales (lista blanca, recursos)
```

## Endpoints REST Principales

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/api/auth/register` | Registro con correo institucional | Público |
| POST | `/api/auth/login` | Inicio de sesión | Público |
| GET | `/api/rooms` | Listar salas de la facultad | Docente, Secretaria |
| POST | `/api/rooms` | Crear sala | Secretaria |
| PUT | `/api/rooms/:id` | Editar sala | Secretaria |
| PATCH | `/api/rooms/:id/status` | Habilitar/deshabilitar | Secretaria |
| POST | `/api/rooms/:id/resources` | Agregar recurso | Secretaria |
| DELETE | `/api/rooms/:id/resources/:rid` | Retirar recurso | Secretaria |
| GET | `/api/rooms/:id/availability` | Disponibilidad calendario | Docente, Secretaria |
| GET | `/api/reservations` | Listar reservas | Según rol |
| POST | `/api/reservations` | Crear reserva | Docente, Secretaria |
| PATCH | `/api/reservations/:id/cancel` | Cancelar reserva | Propietario, Secretaria |
| PATCH | `/api/reservations/:id` | Ajustar reserva | Secretaria |
| GET | `/api/reports/by-count` | Reporte por nº reservas | Secretaria |
| GET | `/api/reports/by-hours` | Reporte por horas | Secretaria |
| GET | `/api/reports/by-user` | Reporte por usuario | Secretaria |

### Trazabilidad Endpoints → RF → Servicio

| Endpoint | Método | Rol | RF | Servicio | Auditoría |
|----------|--------|-----|-----|----------|-----------|
| `/api/auth/register` | POST | Público | RF-01, RF-03 | directo | REGISTRO_USUARIO |
| `/api/auth/[...nextauth]` | GET/POST | Público | RF-02 | NextAuth | — |
| `/api/faculties` | GET | Público | — | Prisma directo | — |
| `/api/rooms` | GET | Auth | RF-04 | roomService.listByFacultad | — |
| `/api/rooms` | POST | Secretaria | RF-05 | roomService.create | CREAR_SALA |
| `/api/rooms/:id` | PUT | Secretaria | RF-06 | roomService.update | EDITAR_SALA |
| `/api/rooms/:id/status` | PATCH | Secretaria | RF-07 | roomService.updateStatus | CAMBIAR_ESTADO_SALA |
| `/api/rooms/:id/resources` | GET | Auth | RF-08 | resourceService.listBySala | — |
| `/api/rooms/:id/resources` | POST | Secretaria | RF-08 | resourceService.addToSala | AGREGAR_RECURSO |
| `/api/rooms/:id/resources/:rid` | DELETE | Secretaria | RF-09 | resourceService.removeFromSala | RETIRAR_RECURSO |
| `/api/reservations` | GET | Auth | RF-14, RF-15 | reservationService.list | — |
| `/api/reservations` | POST | Auth | RF-10, RF-11 | reservationService.create | CREAR_RESERVA |
| `/api/reservations/:id/cancel` | PATCH | Auth | RF-12 | reservationService.cancel | CANCELAR_RESERVA |

---

## Diagramas C4

### Nivel 1 — Contexto del Sistema

```mermaid
C4Context
    title Diagrama de Contexto — Sistema de Reservas de Salas

    Person(docente, "Docente", "Consulta disponibilidad, crea y cancela sus reservas")
    Person(secretaria, "Secretaria", "Gestiona salas, recursos, reservas y genera reportes")

    System(reservas, "Sistema de Reservas de Salas", "Permite gestionar reservas de salas de reunión por facultad con control de disponibilidad y auditoría")

    System_Ext(correo, "Correo Institucional", "Dominio @uao.edu.co para validación de registro")
    System_Ext(navegador, "Navegador Web", "Chrome, Firefox, Safari — único punto de acceso")

    Rel(docente, reservas, "Usa", "HTTPS")
    Rel(secretaria, reservas, "Administra", "HTTPS")
    Rel(reservas, correo, "Valida dominio al registrar")
    Rel(docente, navegador, "Accede vía")
    Rel(secretaria, navegador, "Accede vía")
```

### Nivel 2 — Contenedores

```mermaid
C4Container
    title Diagrama de Contenedores — Sistema de Reservas

    Person(usuario, "Usuario", "Docente o Secretaria")

    Container_Boundary(app, "Aplicación Next.js") {
        Container(frontend, "Frontend React", "Next.js 14, React 18, TailwindCSS", "SPA con SSR, componentes de UI, formularios y calendario")
        Container(api, "API Routes", "Next.js App Router, TypeScript", "Endpoints REST con validación Zod y middleware de sesión")
        Container(auth, "Módulo de Auth", "NextAuth.js v4, JWT", "Autenticación por credenciales, gestión de sesiones con cookies")
        Container(services, "Capa de Servicios", "TypeScript", "Lógica de negocio: validaciones, reglas, auditoría")
        Container(prismaLayer, "Capa de Datos", "Prisma ORM", "Repositories que abstraen acceso a PostgreSQL")
    }

    ContainerDb(db, "PostgreSQL", "Base de Datos", "Almacena usuarios, salas, reservas, recursos y logs de auditoría")

    Rel(usuario, frontend, "Interactúa", "HTTPS")
    Rel(frontend, api, "Consume", "fetch/HTTP")
    Rel(api, auth, "Verifica sesión")
    Rel(api, services, "Delega lógica")
    Rel(services, prismaLayer, "Consulta/Muta datos")
    Rel(prismaLayer, db, "SQL", "TCP/5432")
```

### Nivel 3 — Componentes (Backend)

```mermaid
C4Component
    title Diagrama de Componentes — Backend API

    Container_Boundary(api, "API Routes + Services") {
        Component(authRoutes, "Auth Routes", "/api/auth/*", "Registro, login NextAuth, sesión")
        Component(roomRoutes, "Room Routes", "/api/rooms/*", "CRUD salas, estado, recursos")
        Component(resRoutes, "Reservation Routes", "/api/reservations/*", "Crear, listar, cancelar reservas")
        Component(facRoutes, "Faculty Routes", "/api/faculties", "Listar facultades activas")

        Component(roomSvc, "RoomService", "room.service.ts", "Validación de nombres únicos, permisos por facultad")
        Component(resSvc, "ReservationService", "reservation.service.ts", "Anti-solapamiento, franja horaria, permisos por rol")
        Component(rsrcSvc, "ResourceService", "resource.service.ts", "Asignación/retiro de recursos a salas")

        Component(auditLib, "AuditLogger", "audit.ts", "Registra todas las acciones en log_auditoria")
        Component(zodSchemas, "Zod Schemas", "validations/*.schema.ts", "Validación de entrada con Zod")
        Component(repos, "Repositories", "repositories/*.ts", "Abstracción de Prisma queries")
    }

    ContainerDb(db, "PostgreSQL", "BD")

    Rel(roomRoutes, roomSvc, "Delega")
    Rel(resRoutes, resSvc, "Delega")
    Rel(roomSvc, repos, "Consulta")
    Rel(resSvc, repos, "Consulta")
    Rel(rsrcSvc, repos, "Consulta")
    Rel(roomSvc, auditLib, "Registra acciones")
    Rel(resSvc, auditLib, "Registra acciones")
    Rel(repos, db, "Prisma ORM")
```

---

## Flujo de Autorización RBAC

```mermaid
flowchart TD
    A[Request HTTP] --> B{¿Tiene cookie de sesión?}
    B -->|No| C[401 No autenticado]
    B -->|Sí| D[getServerSession - Decodificar JWT]
    D --> E{¿Endpoint requiere rol específico?}
    E -->|No| F[✅ Procesar request]
    E -->|Sí| G{¿session.user.rol === SECRETARIA?}
    G -->|Sí| H{¿Recurso pertenece a su facultad?}
    G -->|No| I[403 Sin permiso]
    H -->|Sí| F
    H -->|No| J[400 No tiene permiso sobre este recurso]

    style C fill:#ef4444,color:#fff
    style I fill:#ef4444,color:#fff
    style J fill:#f59e0b,color:#000
    style F fill:#22c55e,color:#fff
```

---

## Diagramas de Secuencia

### Registro de Usuario (RF-01, RF-03)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend
    participant API as POST /api/auth/register
    participant Zod as registerSchema
    participant DB as PostgreSQL
    participant LB as lista_blanca
    participant Audit as AuditLogger

    U->>FE: Llena formulario de registro
    FE->>API: POST {nombre, correo, password, facultadId}
    API->>Zod: Validar datos (correo @uao.edu.co, min 6 chars pwd)

    alt Datos inválidos
        Zod-->>API: ZodError
        API-->>FE: 400 {error: "Datos inválidos"}
    end

    API->>DB: SELECT usuario WHERE correo = ?
    alt Correo ya registrado
        DB-->>API: usuario existente
        API-->>FE: 409 {error: "Correo ya registrado"}
    end

    API->>LB: SELECT lista_blanca WHERE correo = ?
    alt Correo en lista blanca
        LB-->>API: registro encontrado
        Note over API: Rol = SECRETARIA
    else Correo NO en lista blanca
        LB-->>API: null
        Note over API: Rol = DOCENTE
    end

    API->>API: bcrypt.hash(password, 12)
    API->>DB: INSERT INTO usuario {...}
    API->>Audit: REGISTRO_USUARIO
    API-->>FE: 201 {id, nombre, correo, rol}
    FE-->>U: Registro exitoso, redirigir a login
```

### Login (RF-02)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend
    participant NA as NextAuth /api/auth/callback/credentials
    participant Auth as CredentialsProvider.authorize()
    participant DB as PostgreSQL
    participant JWT as JWT Callback

    U->>FE: Ingresa correo y contraseña
    FE->>NA: POST (csrfToken, correo, password)
    NA->>Auth: authorize(credentials)
    Auth->>DB: SELECT usuario WHERE correo = ?

    alt Usuario no encontrado o desactivado
        DB-->>Auth: null / {activo: false}
        Auth-->>NA: Error "Credenciales inválidas"
        NA-->>FE: Redirect a /login?error
    end

    Auth->>Auth: bcrypt.compare(password, passwordHash)

    alt Contraseña incorrecta
        Auth-->>NA: Error "Credenciales inválidas"
    end

    Auth-->>NA: {id, nombre, email, rol, facultadId}
    NA->>JWT: jwt callback (guardar id, rol, facultadId en token)
    JWT-->>NA: token JWT firmado
    NA-->>FE: Set-Cookie: next-auth.session-token=JWT (HttpOnly, 24h)
    FE-->>U: Redirigir a Dashboard
```

### Crear Reserva (RF-10, RF-11, R-02, R-03)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend
    participant API as POST /api/reservations
    participant Svc as ReservationService
    participant RoomRepo as RoomRepository
    participant ResRepo as ReservationRepository
    participant Audit as AuditLogger

    U->>FE: Selecciona sala, fecha, hora inicio/fin
    FE->>API: POST {salaId, fecha, horaInicio, horaFin, motivo}

    API->>API: Verificar sesión (getServerSession)
    alt No autenticado
        API-->>FE: 401 {error: "No autenticado"}
    end

    API->>Svc: create(body, userId, facultadId, ip)
    Note over Svc: R-02: horaInicio >= 07:00, horaFin <= 21:30

    alt Fuera de franja horaria
        Svc-->>API: throw Error
        API-->>FE: 400 {error: "Fuera de horario"}
    end

    Svc->>RoomRepo: findById(salaId)
    alt Sala no válida o deshabilitada
        RoomRepo-->>Svc: null / habilitada=false
        Svc-->>API: throw Error
        API-->>FE: 400 {error: "Sala no válida"}
    end

    Svc->>ResRepo: checkOverlap(salaId, fecha, horaInicio, horaFin)
    alt Solapamiento detectado (R-03)
        ResRepo-->>Svc: true
        Svc-->>API: throw Error "solapamiento"
        API-->>FE: 409 {error: "Solapamiento"}
    end

    Svc->>ResRepo: INSERT reserva (estado=CONFIRMADA)
    Svc->>Audit: CREAR_RESERVA
    Svc-->>API: reserva
    API-->>FE: 201 {reserva}
    FE-->>U: "Reserva creada exitosamente"
```

### Cancelar Reserva (RF-12, R-06)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend
    participant API as PATCH /api/reservations/:id/cancel
    participant Svc as ReservationService
    participant ResRepo as ReservationRepository
    participant Audit as AuditLogger

    U->>FE: Click "Cancelar Reserva"
    FE->>API: PATCH /api/reservations/5/cancel

    API->>Svc: cancel(5, userId, rol, facultadId, ip)
    Svc->>ResRepo: findById(5)

    alt Reserva no encontrada
        ResRepo-->>Svc: null
        Svc-->>API: 404 "Reserva no encontrada"
    end

    alt DOCENTE intenta cancelar reserva ajena
        Svc-->>API: 400 "Solo puede cancelar sus propias reservas"
    end

    alt Ya está cancelada
        Svc-->>API: 400 "La reserva ya está cancelada"
    end

    Svc->>ResRepo: UPDATE estado=CANCELADA, canceladoPor=userId
    Note over ResRepo: R-06: NUNCA se elimina, solo se cambia estado
    Svc->>Audit: CANCELAR_RESERVA
    Svc-->>API: reserva
    API-->>FE: 200 {estado: "CANCELADA"}
    FE-->>U: "Reserva cancelada"
```
