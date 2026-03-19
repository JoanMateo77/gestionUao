# Documentación Técnica Completa — Sistema de Reservas de Salas UAO

> Arquitectura, diagramas, decisiones tecnológicas y flujos del sistema.

---

## 1. Diagramas C4

### 1.1 Nivel 1 — Contexto del Sistema

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

### 1.2 Nivel 2 — Contenedores

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

### 1.3 Nivel 3 — Componentes (Backend)

```mermaid
C4Component
    title Diagrama de Componentes — Backend API

    Container_Boundary(api, "API Routes + Services") {
        Component(authRoutes, "Auth Routes", "/api/auth/*", "Registro, login NextAuth, sesión")
        Component(roomRoutes, "Room Routes", "/api/rooms/*", "CRUD salas, estado, recursos")
        Component(resRoutes, "Reservation Routes", "/api/reservations/*", "Crear, listar, cancelar reservas")
        Component(facRoutes, "Faculty Routes", "/api/faculties", "Listar facultades activas")
        Component(resrcRoutes, "Resource Routes", "/api/resources", "Listar recursos tecnológicos")

        Component(roomSvc, "RoomService", "room.service.ts", "Validación de nombres únicos, permisos por facultad")
        Component(resSvc, "ReservationService", "reservation.service.ts", "Anti-solapamiento, franja horaria, permisos por rol")
        Component(rsrcSvc, "ResourceService", "resource.service.ts", "Asignación/retiro de recursos a salas")

        Component(auditLib, "AuditLogger", "audit.ts", "Registra todas las acciones en log_auditoria")
        Component(zodSchemas, "Zod Schemas", "validations/*.schema.ts", "Validación de entrada con Zod")
        Component(repos, "Repositories", "repositories/*.ts", "Abstracción de Prisma queries")
    }

    ContainerDb(db, "PostgreSQL", "BD")

    Rel(authRoutes, zodSchemas, "Valida input")
    Rel(roomRoutes, roomSvc, "Delega")
    Rel(resRoutes, resSvc, "Delega")
    Rel(resrcRoutes, rsrcSvc, "Delega")
    Rel(roomSvc, repos, "Consulta")
    Rel(resSvc, repos, "Consulta")
    Rel(rsrcSvc, repos, "Consulta")
    Rel(roomSvc, auditLib, "Registra acciones")
    Rel(resSvc, auditLib, "Registra acciones")
    Rel(rsrcSvc, auditLib, "Registra acciones")
    Rel(repos, db, "Prisma ORM")
```

---

## 2. Diagrama de Arquitectura en Capas

```mermaid
graph TB
    subgraph "Capa de Presentación"
        UI["React Components<br/>(pages, forms, calendar)"]
        TQ["TanStack React Query<br/>(cache, mutations)"]
    end

    subgraph "Capa de API (App Router)"
        Routes["API Routes<br/>(/api/auth, /api/rooms, /api/reservations)"]
        MW["Middleware<br/>(NextAuth session check)"]
        RBAC["RBAC Check<br/>(session.user.rol)"]
    end

    subgraph "Capa de Servicios"
        RoomSvc["RoomService"]
        ResSvc["ReservationService"]
        RsrcSvc["ResourceService"]
        Audit["AuditLogger"]
        Zod["Zod Schemas<br/>(validación de entrada)"]
    end

    subgraph "Capa de Datos"
        Repos["Repositories<br/>(room, reservation, resource)"]
        Prisma["Prisma Client"]
    end

    subgraph "Base de Datos"
        PG["PostgreSQL"]
    end

    UI --> TQ --> Routes
    Routes --> MW --> RBAC
    RBAC --> RoomSvc & ResSvc & RsrcSvc
    RoomSvc & ResSvc & RsrcSvc --> Zod
    RoomSvc & ResSvc & RsrcSvc --> Audit
    RoomSvc & ResSvc & RsrcSvc --> Repos
    Repos --> Prisma --> PG

    style UI fill:#3b82f6,color:#fff
    style TQ fill:#6366f1,color:#fff
    style Routes fill:#10b981,color:#fff
    style MW fill:#f59e0b,color:#000
    style RBAC fill:#f59e0b,color:#000
    style RoomSvc fill:#8b5cf6,color:#fff
    style ResSvc fill:#8b5cf6,color:#fff
    style RsrcSvc fill:#8b5cf6,color:#fff
    style Audit fill:#ef4444,color:#fff
    style Zod fill:#ec4899,color:#fff
    style Repos fill:#06b6d4,color:#fff
    style Prisma fill:#06b6d4,color:#fff
    style PG fill:#1e3a5f,color:#fff
```

---

## 3. Diagramas de Secuencia

### 3.1 Registro de Usuario (RF-01, RF-03)

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

    API->>DB: SELECT facultad WHERE id = ?
    alt Facultad no existe
        DB-->>API: null
        API-->>FE: 400 {error: "Facultad no encontrada"}
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
    DB-->>API: usuario creado
    API->>Audit: REGISTRO_USUARIO
    API-->>FE: 201 {id, nombre, correo, rol}
    FE-->>U: Registro exitoso, redirigir a login
```

### 3.2 Login (RF-02)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend
    participant NA as NextAuth /api/auth/callback/credentials
    participant Auth as CredentialsProvider.authorize()
    participant DB as PostgreSQL
    participant JWT as JWT Callback

    U->>FE: Ingresa correo y contraseña
    FE->>NA: POST (csrfToken, correo, password) [urlencoded]
    NA->>Auth: authorize(credentials)
    Auth->>DB: SELECT usuario WHERE correo = ?

    alt Usuario no encontrado
        DB-->>Auth: null
        Auth-->>NA: Error "Credenciales inválidas"
        NA-->>FE: Redirect a /login?error
    end

    alt Usuario desactivado
        DB-->>Auth: {activo: false}
        Auth-->>NA: Error "Usuario desactivado"
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

### 3.3 Crear Reserva (RF-10, RF-11, R-02, R-03)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend
    participant API as POST /api/reservations
    participant Session as getServerSession()
    participant Zod as createReservationSchema
    participant Svc as ReservationService
    participant RoomRepo as RoomRepository
    participant ResRepo as ReservationRepository
    participant Audit as AuditLogger

    U->>FE: Selecciona sala, fecha, hora inicio/fin
    FE->>API: POST {salaId, fecha, horaInicio, horaFin, motivo}

    API->>Session: Verificar sesión
    alt No autenticado
        Session-->>API: null
        API-->>FE: 401 {error: "No autenticado"}
    end

    API->>Svc: create(body, userId, facultadId, ip)
    Svc->>Zod: Validar datos

    Note over Zod: R-02: horaInicio >= 07:00<br/>R-02: horaFin <= 21:30<br/>horaInicio < horaFin

    alt Fuera de franja horaria
        Zod-->>Svc: ZodError (R-02)
        Svc-->>API: throw Error
        API-->>FE: 400 {error: "Fuera de horario"}
    end

    Svc->>RoomRepo: findById(salaId)
    
    alt Sala no encontrada / deshabilitada / otra facultad
        RoomRepo-->>Svc: null / habilitada=false
        Svc-->>API: throw Error
        API-->>FE: 400 {error: "Sala no válida"}
    end

    Svc->>ResRepo: checkOverlap(salaId, fecha, horaInicio, horaFin)
    
    alt Solapamiento detectado (R-03)
        ResRepo-->>Svc: true
        Svc-->>API: throw Error "solapamiento (R-03)"
        API-->>FE: 409 {error: "Solapamiento"}
    end

    ResRepo-->>Svc: false (sin conflicto)
    Svc->>ResRepo: INSERT reserva (estado=CONFIRMADA)
    ResRepo-->>Svc: reserva creada
    Svc->>Audit: CREAR_RESERVA
    Svc-->>API: reserva
    API-->>FE: 201 {reserva}
    FE-->>U: "Reserva creada exitosamente"
```

### 3.4 Cancelar Reserva (RF-12, R-06)

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

    API->>API: Verificar sesión (getServerSession)
    API->>Svc: cancel(5, userId, rol, facultadId, ip)
    Svc->>ResRepo: findById(5)

    alt Reserva no encontrada
        ResRepo-->>Svc: null
        Svc-->>API: 404 "Reserva no encontrada"
    end

    alt DOCENTE intenta cancelar reserva ajena
        Note over Svc: reserva.usuarioId !== userId
        Svc-->>API: 400 "Solo puede cancelar sus propias reservas"
    end

    alt Ya está cancelada
        Note over Svc: reserva.estado === CANCELADA
        Svc-->>API: 400 "La reserva ya está cancelada"
    end

    Svc->>ResRepo: UPDATE estado=CANCELADA, canceladoPor=userId, fechaCancelacion=now()
    Note over ResRepo: R-06: NUNCA se elimina, solo se cambia estado
    ResRepo-->>Svc: reserva actualizada
    Svc->>Audit: CANCELAR_RESERVA (datos anteriores y nuevos)
    Svc-->>API: reserva
    API-->>FE: 200 {estado: "CANCELADA"}
    FE-->>U: "Reserva cancelada"
```

### 3.5 Crear Sala (RF-05, Secretaria)

```mermaid
sequenceDiagram
    actor S as Secretaria
    participant FE as Frontend
    participant API as POST /api/rooms
    participant Session as getServerSession()
    participant Svc as RoomService
    participant Zod as createRoomSchema
    participant Repo as RoomRepository
    participant Audit as AuditLogger

    S->>FE: Llena formulario (nombre, ubicación, capacidad)
    FE->>API: POST {nombre, ubicacion, capacidad}

    API->>Session: Verificar sesión
    API->>API: Verificar rol === SECRETARIA
    
    alt Rol no es SECRETARIA
        API-->>FE: 403 {error: "Sin permiso"}
    end

    API->>Svc: create(body, facultadId, userId, ip)
    Svc->>Zod: Validar (nombre 2-100, capacidad 2-100)
    Svc->>Repo: existsByNombreAndFacultad(nombre, facultadId)

    alt Nombre duplicado en la facultad
        Repo-->>Svc: true
        Svc-->>API: 409 "Ya existe una sala con ese nombre"
    end

    Svc->>Repo: INSERT sala
    Repo-->>Svc: sala creada
    Svc->>Audit: CREAR_SALA
    Svc-->>API: sala
    API-->>FE: 201 {sala}
```

---

## 4. Diagrama Entidad-Relación

```mermaid
erDiagram
    FACULTAD ||--o{ USUARIO : "tiene"
    FACULTAD ||--o{ SALA : "tiene"
    USUARIO ||--o{ RESERVA : "crea"
    USUARIO ||--o{ RESERVA : "cancela"
    USUARIO ||--o{ LOG_AUDITORIA : "genera"
    SALA ||--o{ RESERVA : "recibe"
    SALA ||--o{ SALA_RECURSO : "tiene"
    RECURSO_TECNOLOGICO ||--o{ SALA_RECURSO : "asignado a"

    FACULTAD {
        int id PK
        varchar nombre UK
        boolean activa
    }

    USUARIO {
        int id PK
        varchar nombre
        varchar correo_institucional UK
        varchar password_hash
        enum rol "DOCENTE | SECRETARIA"
        boolean activo
        int facultad_id FK
    }

    LISTA_BLANCA {
        varchar correo_institucional PK
        varchar nombre
        enum tipo_usuario "SECRETARIA"
    }

    SALA {
        int id PK
        varchar nombre
        varchar ubicacion
        int capacidad
        boolean habilitada
        int facultad_id FK
    }

    RECURSO_TECNOLOGICO {
        int id PK
        varchar nombre UK
        varchar descripcion
    }

    SALA_RECURSO {
        int id PK
        int sala_id FK
        int recurso_id FK
    }

    RESERVA {
        int id PK
        varchar motivo
        date fecha
        time hora_inicio
        time hora_fin
        enum estado "CONFIRMADA | CANCELADA"
        int sala_id FK
        int usuario_id FK
        int cancelado_por FK
    }

    LOG_AUDITORIA {
        int id PK
        varchar accion
        varchar entidad
        int entidad_id
        json datos_anteriores
        json datos_nuevos
        varchar ip_address
        int usuario_id FK
    }
```

---

## 5. Decisiones Tecnológicas — El Porqué

### 5.1 Stack Principal

| Tecnología | Versión | ¿Por qué se eligió? |
|-----------|---------|-------------------| 
| **Next.js** | 14.2 | Framework fullstack que unifica frontend y backend en un solo proyecto. El App Router permite colocar las API Routes junto al frontend, eliminando la necesidad de un servidor backend separado. **Reduce la complejidad operativa** para un proyecto universitario. SSR mejora SEO y rendimiento inicial. |
| **React** | 18 | Estándar de la industria para interfaces interactivas. El modelo de componentes facilita construir el calendario de disponibilidad y los formularios CRUD. Amplio ecosistema de librerías compatibles. |
| **TypeScript** | 5 | Previene errores comunes en tiempo de desarrollo. Los tipos fuertes **garantizan consistencia** entre frontend, API y base de datos. Crucial para un sistema donde errores (doble reserva, permisos incorrectos) tienen impacto directo. |
| **PostgreSQL** | - | Base de datos relacional robusta, ideal para datos transaccionales con integridad referencial. Las reservas, usuarios y salas tienen **relaciones claras** que se modelan naturalmente en SQL. Soporte nativo de tipos `DATE`, `TIME` y `JSON` para auditoría. |

### 5.2 Autenticación y Seguridad

| Tecnología | ¿Por qué? |
|-----------|----------|
| **NextAuth.js v4** | Se integra nativamente con Next.js. El CredentialsProvider permite autenticación con correo/contraseña sin depender de OAuth externo (los usuarios tienen correo institucional @uao.edu.co, no Google/GitHub). **Simplifica la gestión de sesiones** con JWT almacenado en cookies HttpOnly. |
| **bcryptjs** | Estándar de la industria para hash de contraseñas. Factor de costo 12 provee **seguridad suficiente** sin afectar rendimiento. No almacena contraseñas en texto plano (cumple RNF-05). |
| **JWT (estrategia de sesión)** | Las sesiones JWT son **stateless**: el servidor no necesita almacenar sesiones en memoria ni en BD. Esto permite escalar horizontalmente sin sincronizar estado entre instancias (cumple RNF-02). Expiración de 24h como balance entre seguridad y comodidad. |
| **RBAC en capa de API** | Cada route verifica `session.user.rol` directamente. Sin middleware genérico para mantener **visibilidad explícita** de qué rol necesita cada endpoint. Previene errores de configuración en un sistema con solo 2 roles. |

### 5.3 Validación y Datos

| Tecnología | ¿Por qué? |
|-----------|----------|
| **Zod** | Validación en tiempo de ejecución con inferencia de tipos TypeScript. Los schemas definen **una única fuente de verdad** para la estructura de datos (se usa en frontend y backend). Mejor integración con TypeScript que Joi. Validaciones complejas (franja horaria R-02) se expresan como `refine()`. |
| **Prisma ORM** | Genera un cliente tipado desde el schema, lo que proporciona **autocompletado perfecto** y previene errores de SQL. Las migraciones versionadas aseguran que el esquema de BD sea reproducible. El patrón Repository se implementa naturalmente sobre Prisma. |

### 5.4 Frontend

| Tecnología | ¿Por qué? |
|-----------|----------|
| **TailwindCSS** | Estilos utilitarios que aceleran desarrollo de UI sin escribir CSS personalizado. **Consistencia visual** con la misma paleta de colores en todo el sistema. Elimina problemas de naming de clases CSS. |
| **TanStack React Query** | Gestiona cache de datos del servidor, **eliminando estados de carga manuales**. Las mutations invalidan el cache automáticamente, manteniendo la UI sincronizada sin lógica adicional. Perfecto para las listas de salas y reservas que se consultan frecuentemente. |
| **Lucide React** | Iconos SVG ligeros y consistentes. Reemplazo moderno de FontAwesome con **mejor tree-shaking** (solo se importan los íconos usados). |
| **Sonner** | Toasts/notificaciones elegantes con animaciones. Informan al usuario de acciones exitosas o errores sin modales intrusivos. |
| **date-fns** | Manipulación de fechas sin la pesadez de Moment.js. Funciones puras e immutables que **no mutan objetos Date**. Crucial para manejar correctamente las fechas de reservas y franjas horarias. |

### 5.5 Decisiones Arquitectónicas Clave

#### ¿Por qué arquitectura en capas (Routes → Services → Repositories)?

```
ALTERNATIVAS CONSIDERADAS:
├── Opción A: Todo en las API Routes (monolítico)
│   ❌ Código duplicado, difícil de testear, alta acoplamiento
│
├── Opción B: Microservicios
│   ❌ Excesivo para un proyecto universitario, complejidad operativa alta
│
└── Opción C: Capas bien separadas ✅
    ✅ Cada capa tiene una responsabilidad clara
    ✅ Los servicios son testeables sin HTTP
    ✅ Los repositories se pueden cambiar sin tocar lógica
    ✅ Complejidad adecuada para el equipo y proyecto
```

#### ¿Por qué reservas nunca se eliminan (R-06)?

- **Trazabilidad**: La tabla `log_auditoria` referencia `entidad_id` de reservas. Si se eliminan, los logs quedan huérfanos.
- **Auditoría**: Es requisito ver quién canceló, cuándo y por qué.
- **Integridad**: `DELETE` puede causar cascadas no deseadas. `CANCELADA` es un estado final seguro.
- **Reportes**: Los reportes (RF-17 a RF-20) necesitan datos históricos completos.

#### ¿Por qué auto-asignación de roles vía lista_blanca (R-07, R-08, R-09)?

- **Sin administrador**: El sistema es self-service. No hay persona que asigne roles manualmente.
- **Seguridad**: Solo correos pre-aprobados obtienen rol SECRETARIA.
- **Simplicidad**: Un solo endpoint de registro maneja ambos roles. La tabla `lista_blanca` se gestiona directamente en BD por el DBA.

#### ¿Por qué auditoría con patrón Observer?

```typescript
// Después de CADA operación que modifica datos:
await audit({
  accion: 'CREAR_RESERVA',
  entidad: 'RESERVA',
  datosAnteriores: null,
  datosNuevos: { ... },
});
```

- **R-11 obliga** a registrar todas las acciones.
- Se implementa como función llamada explícitamente (no middleware) para tener **control total** de qué datos guardar antes/después.
- `try/catch` interno: la auditoría **nunca bloquea** la operación principal.

---

## 6. Diagrama de Flujo de Autorización (RBAC)

```mermaid
flowchart TD
    A[Request HTTP] --> B{¿Tiene cookie de sesión?}
    B -->|No| C[401 No autenticado]
    B -->|Sí| D[getServerSession - Decodificar JWT]
    D --> E{¿Endpoint requiere rol específico?}
    E -->|No| F[✅ Procesar request]
    E -->|Sí| G{¿session.user.rol === 'SECRETARIA'?}
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

## 7. Mapa de Endpoints con Trazabilidad

| Endpoint | Método | Rol | RF | R | Servicio | Auditoría |
|----------|--------|-----|-----|---|----------|-----------|
| `/api/auth/register` | POST | Público | RF-01, RF-03 | R-08, R-09 | directo | REGISTRO_USUARIO |
| `/api/auth/[...nextauth]` | GET/POST | Público | RF-02 | — | NextAuth | — |
| `/api/faculties` | GET | Público | — | — | Prisma directo | — |
| `/api/rooms` | GET | Auth | RF-04 | — | roomService.listByFacultad | — |
| `/api/rooms` | POST | Secretaria | RF-05 | — | roomService.create | CREAR_SALA |
| `/api/rooms/:id` | GET | Auth | — | — | roomService.getById | — |
| `/api/rooms/:id` | PUT | Secretaria | RF-06 | — | roomService.update | EDITAR_SALA |
| `/api/rooms/:id/status` | PATCH | Secretaria | RF-07 | — | roomService.updateStatus | CAMBIAR_ESTADO_SALA |
| `/api/rooms/:id/resources` | GET | Auth | RF-08 | — | resourceService.listBySala | — |
| `/api/rooms/:id/resources` | POST | Secretaria | RF-08 | — | resourceService.addToSala | AGREGAR_RECURSO |
| `/api/rooms/:id/resources/:rid` | DELETE | Secretaria | RF-09 | — | resourceService.removeFromSala | RETIRAR_RECURSO |
| `/api/resources` | GET | Auth | — | — | resourceService.listAll | — |
| `/api/reservations` | GET | Auth | RF-14, RF-15 | — | reservationService.list | — |
| `/api/reservations` | POST | Auth | RF-10, RF-11 | R-02, R-03 | reservationService.create | CREAR_RESERVA |
| `/api/reservations/:id/cancel` | PATCH | Auth | RF-12 | R-06 | reservationService.cancel | CANCELAR_RESERVA |
