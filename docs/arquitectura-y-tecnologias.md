**FACULTAD DE INGENIERÍA Y CIENCIAS BÁSICAS**

**PROGRAMA DE INGENIERÍA INFORMÁTICA**

**INGENIERÍA DE SOFTWARE 1**

---

# Justificación de la Arquitectura del Sistema, Backend, Frontend y Tecnologías

### *Sistema Web de Reservas de Salas de Reuniones — UAO*

**Cali, abril de 2026**

---

## 1. Descripción General del Sistema

El Sistema Web de Reservas de Salas de Reuniones es una aplicación desarrollada para la Universidad Autónoma de Occidente (UAO), cuyo propósito es digitalizar y centralizar la gestión de espacios físicos destinados a reuniones académicas y administrativas dentro de las facultades.

El sistema atiende a dos perfiles de usuario: **docentes**, quienes pueden consultar disponibilidad y realizar reservas, y **secretarias de facultad**, quienes además administran las salas, sus recursos tecnológicos y generan reportes de uso. El acceso se realiza exclusivamente mediante correo institucional, con asignación automática de roles basada en una lista blanca institucional.

### 1.1 Funcionalidades Principales

- Autenticación con correo institucional y asignación automática de rol (docente / secretaria).
- Consulta de disponibilidad de salas en tiempo real mediante calendario visual interactivo.
- Administración de salas: creación, edición, cambio de estado y gestión de recursos tecnológicos.
- Gestión de reservas: creación, cancelación y ajuste, con validación de conflictos horarios y restricciones de franja (7:00 AM – 9:30 PM, máximo 2 horas por bloque).
- Historial y trazabilidad completa de reservas por usuario y por facultad.
- Generación de reportes de uso: por número de reservas, por horas reservadas y por usuario, con filtros de rango de fechas.
- Registro automático de auditoría para toda acción crítica del sistema.

### 1.2 Contexto de Uso

El sistema opera como aplicación web accesible desde cualquier navegador moderno, dentro del entorno institucional de la UAO. El volumen estimado de usuarios concurrentes es reducido (aproximadamente 100 usuarios simultáneos en horas pico), con un dominio funcional acotado a 16 historias de usuario, 2 roles y operaciones CRUD estándar con lógica de validación de conflictos. Este alcance determina que una arquitectura monolítica bien estructurada es suficiente para cumplir los atributos de calidad requeridos, sin incurrir en la complejidad operacional de los sistemas distribuidos.

---

## 2. Selección y Justificación de la Arquitectura

### 2.1 Arquitectura Global del Sistema

Se adopta el modelo de comunicación **cliente-servidor**, en el que el navegador del usuario (cliente) envía peticiones HTTP/REST al servidor, que procesa la lógica de negocio y devuelve respuestas en formato JSON. El modelo de despliegue es **monolítico**, manteniendo frontend y backend en un único proyecto desplegable, lo que simplifica el ciclo de desarrollo, despliegue y mantenimiento dentro del cronograma académico.

La aplicación se organiza internamente en **tres capas lógicas** claramente diferenciadas, siguiendo el principio de separación de responsabilidades (Garlan & Shaw, 1994):

```
┌─────────────────────────────────────────────────────────┐
│                  CAPA DE PRESENTACIÓN                   │
│   React Components  ·  Pages  ·  Tailwind CSS           │
│   Calendario Visual  ·  React Query (estado servidor)   │
├─────────────────────────────────────────────────────────┤
│               CAPA DE LÓGICA DE NEGOCIO                 │
│   API Routes (Controllers)  →  Services                 │
│   Validación (Zod)  ·  Auth (NextAuth.js)  ·  RBAC     │
│   Auditoría automática  ·  Reglas de dominio            │
├─────────────────────────────────────────────────────────┤
│               CAPA DE ACCESO A DATOS                    │
│   Repositories  →  Prisma ORM  →  PostgreSQL            │
│   Migraciones versionadas  ·  Constraints  ·  Índices   │
└─────────────────────────────────────────────────────────┘
```

- **Capa de Presentación:** Componentes React organizados en páginas y componentes reutilizables. Consume exclusivamente la API interna y no contiene lógica de negocio. La gestión de estado del servidor se delega a React Query, que mantiene caché y sincronización automática.
- **Capa de Lógica de Negocio:** API Routes que implementan el patrón Controller–Service. Aquí residen las reglas del dominio (validación de conflictos horarios, restricciones de franja, asignación de roles), la autenticación, la autorización por rol y el registro de auditoría.
- **Capa de Acceso a Datos:** Capa Repository implementada sobre Prisma ORM, que abstrae las consultas a PostgreSQL y garantiza tipado estático en todas las operaciones de persistencia. Las constraints de la base de datos actúan como última línea de defensa para la integridad referencial.

Esta separación permite que cada capa evolucione de forma independiente: un cambio en la interfaz de usuario no afecta las reglas de negocio, y una modificación en el esquema de base de datos se propaga de forma segura a través del ORM tipado. Bass, Clements y Kazman (2021) señalan que la arquitectura en capas provee los beneficios de modularidad y mantenibilidad sin el overhead operacional de los sistemas distribuidos, siendo la elección adecuada cuando la complejidad del dominio no justifica la fragmentación en microservicios.

### 2.2 Arquitectura del Backend

Internamente, el backend implementa el patrón en capas **Controller – Service – Repository**, adaptado a las convenciones del framework:

- **Routes / Controllers (API Routes):** Reciben la petición HTTP, extraen y validan la sesión del usuario, y delegan la operación al servicio correspondiente. Son la única capa que conoce los objetos `Request` y `Response`. Ejemplo: `/api/rooms`, `/api/reservations`, `/api/reports`.
- **Services (Lógica de Negocio):** Encapsulan las reglas del dominio de forma independiente al transporte HTTP. Ejecutan validaciones complejas como la detección de solapamientos horarios (RF-11), las restricciones de reserva (franja 7:00–21:30, máximo 2 horas), la verificación de pertenencia a facultad, y la generación de registros de auditoría (RF-16). Al no depender de objetos HTTP, los servicios son directamente testeables de forma unitaria.
- **Repositories (Acceso a Datos):** Abstraen las interacciones con la base de datos a través de Prisma Client, ofreciendo consultas tipadas y encapsulando la lógica de persistencia. Esta capa permite sustituir el ORM o el motor de base de datos sin afectar la lógica de negocio.
- **Middleware:** El archivo `middleware.ts` intercepta cada petición entrante a rutas protegidas para verificar la sesión activa (NextAuth.js) y aplicar control de acceso basado en roles (RBAC). Este middleware centralizado garantiza que ningún endpoint quede desprotegido por omisión, cumpliendo el principio de seguridad por defecto (RNF-05).

Esta separación de responsabilidades facilita la mantenibilidad (RNF-04): los desarrolladores pueden modificar una regla de negocio en el servicio sin tocar los controladores, o cambiar una consulta en el repositorio sin afectar la lógica del dominio.

### 2.3 Arquitectura del Frontend

El frontend sigue un enfoque **basado en componentes**, propio de React y estandarizado por el App Router de Next.js. La organización se estructura en tres categorías claramente delimitadas:

- **Vistas (Pages):** Páginas completas del sistema — login, registro, calendario, gestión de salas, reservas, historial y reportes — cada una correspondiente a un flujo funcional del backlog. El App Router organiza estas vistas mediante el sistema de archivos, donde cada carpeta dentro de `app/` representa una ruta.
- **Componentes Reutilizables:** Elementos de UI atómicos y compuestos (formularios, tablas, modales, tarjetas de sala, selectores de horario) utilizados transversalmente en múltiples vistas. Esta reutilización reduce la duplicación de código y garantiza consistencia visual.
- **Servicios de Consumo de API:** Funciones organizadas en `/lib` que encapsulan las llamadas a los API Routes internos, utilizando TanStack React Query para gestión de estado del servidor, caché automática, refetch en segundo plano y sincronización optimista de datos.

Esta separación garantiza **alta cohesión** dentro de cada categoría y **bajo acoplamiento** entre ellas: las vistas no conocen los detalles de las peticiones HTTP, los componentes no contienen lógica de negocio, y los servicios API no dependen de la estructura visual.

### 2.4 Cuadro Comparativo de Arquitecturas

Se evaluaron dos alternativas arquitectónicas para el sistema, considerando el alcance funcional (16 historias de usuario, 2 roles, CRUD con validaciones de conflicto), el volumen de usuarios (~100 concurrentes) y el cronograma académico (10 semanas de desarrollo efectivo):

| Criterio | Monolito en Capas (Seleccionada) | Microservicios con API Gateway |
|:---|:---|:---|
| **Modelo de despliegue** | Un solo artefacto desplegable; frontend y backend en el mismo proyecto | Múltiples servicios independientes (auth, rooms, reservations, reports) con gateway de entrada |
| **Complejidad operacional** | Baja: un solo repositorio, un pipeline CI/CD, un entorno de ejecución | Alta: orquestación de contenedores, service discovery, monitoreo distribuido, gestión de red entre servicios |
| **Comunicación entre módulos** | Llamadas directas en memoria entre capas (Controller → Service → Repository) | Comunicación por red (HTTP/gRPC) entre servicios; latencia adicional y puntos de fallo |
| **Consistencia de datos** | Transacciones ACID nativas en una sola base de datos; integridad referencial garantizada por constraints | Consistencia eventual entre bases de datos de cada servicio; requiere patrones como Saga o eventos para mantener coherencia |
| **Escalabilidad** | Vertical y horizontal suficiente para ~100 usuarios concurrentes; serverless auto-scaling en Vercel | Escalado granular por servicio; ventajoso para miles de usuarios con cargas desiguales entre módulos |
| **Velocidad de desarrollo** | Alta: sin overhead de configuración inter-servicios; un equipo de 6 personas trabaja en un solo codebase | Baja para equipos pequeños: requiere definir contratos API entre servicios, versionamiento independiente y testing de integración distribuido |
| **Mantenibilidad** | Separación lógica por capas dentro del monolito; refactorización directa con tipado estático compartido | Separación física por servicio; cambios que cruzan servicios requieren coordinación y despliegue sincronizado |
| **Adecuación al alcance** | Ideal para el volumen y complejidad del proyecto académico | Sobredimensionada: el overhead operacional supera los beneficios para este alcance |
| **Tolerancia a fallos** | Un fallo afecta todo el sistema; mitigado por la simplicidad del dominio y el despliegue serverless con auto-restart | Fallo aislado por servicio; ventajoso en sistemas de misión crítica con dominios heterogéneos |

> **Decisión:** Se selecciona la **arquitectura monolítica en capas**. Fowler (2015) argumenta que comenzar con un monolito bien estructurado es la estrategia correcta cuando el equipo aún está descubriendo los límites del dominio, y que la migración a microservicios solo se justifica cuando la escala o la complejidad organizacional lo demandan. Bass, Clements y Kazman (2021) refuerzan que la separación en capas dentro de un monolito provee modularidad, testabilidad y mantenibilidad sin el overhead de la comunicación distribuida, los sistemas de mensajería y la complejidad de despliegue que los microservicios introducen. Para un sistema con 16 historias de usuario, un equipo de 6 personas y 10 semanas de desarrollo, el monolito en capas ofrece la mejor relación entre rigor arquitectónico y velocidad de entrega.

---

## 3. Selección de Tecnologías y Frameworks

Cada tecnología fue seleccionada en función de su adecuación al alcance del proyecto, su integración con la arquitectura monolítica en capas y su contribución al cumplimiento de los requisitos funcionales y no funcionales del sistema. Antes de detallar cada elección, se presenta el análisis comparativo entre dos alternativas de stack que fueron evaluadas por el equipo.

### 3.1 Cuadro Comparativo de Tecnologías y Frameworks

| Criterio | Next.js + TypeScript (Seleccionado) | Spring Boot + React (Alternativa) |
|:---|:---|:---|
| **Lenguaje unificado** | TypeScript en todas las capas (frontend, backend, validación, ORM) — un solo ecosistema | Java en backend + TypeScript en frontend — dos ecosistemas, dos toolchains, configuración de CORS adicional |
| **Complejidad del sistema** | Ideal para CRUD + autenticación + calendario + reportes en alcance académico | Diseñado para sistemas empresariales con microservicios, alta concurrencia y múltiples integraciones |
| **Velocidad de desarrollo** | Alta: API Routes integradas, sin configuración de servidor separado, hot reload unificado | Media-baja: mayor boilerplate (DTOs, anotaciones, configuración de Spring Security, JPA) |
| **Curva de aprendizaje** | Un solo framework para todo el equipo de 6 personas | Requiere dominar Spring Security, JPA/Hibernate y la conexión con un frontend React separado |
| **Integración de calendario (RF-04)** | FullCalendar React: integración nativa dentro del mismo proyecto | Requiere un proyecto frontend separado con comunicación REST al API Java |
| **Tipado compartido** | Tipos TypeScript reutilizados entre frontend, validación (Zod) y ORM (Prisma) | Tipos Java en backend + tipos TypeScript en frontend — requiere mantener sincronización manual o usar generadores |
| **Despliegue** | Vercel: gratuito para proyectos académicos, CI/CD automático desde GitHub, serverless | Requiere servidor JVM (Railway, Heroku, VM propia); mayor costo y configuración de infraestructura |
| **Cronograma académico** | Compatible con entregas entre marzo y mayo: prototipo funcional rápido | Riesgo de no cumplir hitos por el tiempo de setup inicial (Spring Initializr, configuración de seguridad, JPA mappings) |
| **Pruebas** | Jest integrado, React Testing Library, misma herramienta para front y back | JUnit + Mockito (robusto) + Jest/RTL para frontend — dos frameworks de pruebas |
| **Rendimiento esperado** | Suficiente para ~100 usuarios concurrentes con SSR y serverless auto-scaling | Diseñado para alta concurrencia empresarial (miles de usuarios); sobredimensionado para este volumen |

> **Decisión:** Spring Boot es una tecnología robusta y madura, diseñada para sistemas empresariales de gran escala. Sin embargo, para un proyecto con 16 historias de usuario, 2 roles, un equipo de 6 personas y 10 semanas de desarrollo, Next.js con TypeScript ofrece una relación esfuerzo/resultado significativamente más favorable: un solo lenguaje, un solo repositorio, un solo despliegue, sin sacrificar la separación en capas ni las buenas prácticas arquitectónicas. Colom (2023) destaca que el stack full-stack TypeScript con Next.js y Prisma permite alcanzar la productividad de un framework todo-en-uno manteniendo la rigurosidad del patrón en capas.

### 3.2 Frontend

El frontend está implementado con **Next.js 14** (App Router) y **React 18**, usando **TypeScript 5.x** como lenguaje. Next.js provee Server-Side Rendering (SSR) y React Server Components, que reducen el tiempo de carga inicial y mejoran el rendimiento percibido por el usuario (RNF-01). La estructura basada en el App Router estandariza la organización de páginas y facilita la navegación protegida por rol.

- **Tailwind CSS 3.x:** Sistema de diseño utilitario que permite construir interfaces responsivas de forma eficiente sin escribir CSS personalizado, garantizando consistencia visual en todo el sistema.
- **FullCalendar React 6.x:** Biblioteca de calendario con vistas diaria, semanal y mensual, soporte para drag & drop y selección de rangos horarios, cubriendo el requisito RF-04 de consulta de disponibilidad de salas en tiempo real.
- **TanStack React Query 5.x:** Gestión de estado del servidor con caché automática, refetch en segundo plano y sincronización optimista, mejorando la experiencia de usuario sin la complejidad adicional de bibliotecas como Redux.
- **Zod 3.x (validación dual):** Esquemas de validación compartidos entre cliente y servidor, garantizando que las reglas de negocio (franja horaria, capacidad, formato de correo institucional) se apliquen de forma consistente en ambos extremos.

### 3.3 Backend

El backend se implementa mediante las **API Routes** integradas en Next.js, ejecutadas sobre **Node.js 20 LTS**. Este enfoque elimina la necesidad de un servidor separado, reduce la latencia de comunicación interna y simplifica el despliegue a un solo artefacto.

- **NextAuth.js 4.x:** Biblioteca de autenticación nativa para Next.js que gestiona el ciclo completo de login/logout con cookies httpOnly, protección CSRF integrada y soporte para sesiones JWT. Permite implementar la asignación automática de roles (RF-03) mediante callbacks personalizados que consultan la lista blanca institucional durante el flujo de autenticación.
- **bcryptjs 3.x:** Librería para hash seguro de contraseñas con salt automático antes de persistir en base de datos, cumpliendo el requisito de seguridad RNF-05 y las buenas prácticas de OWASP para almacenamiento de credenciales.
- **Middleware RBAC:** Implementado en `middleware.ts` de Next.js, intercepta todas las peticiones a rutas protegidas para verificar el rol del usuario antes de permitir el acceso al controlador. Este enfoque centralizado garantiza seguridad por defecto: toda ruta nueva queda protegida automáticamente.

### 3.4 Base de Datos

Se utiliza **PostgreSQL 16** como motor de base de datos relacional, gestionado a través de **Prisma ORM 5.x**.

- **PostgreSQL 16:** Motor relacional con soporte completo para transacciones ACID, constraints (`UNIQUE`, `CHECK`, `FOREIGN KEY`), índices compuestos y tipos de datos avanzados (`Date`, `Time`). Garantiza la integridad referencial entre las 7 entidades del sistema: Usuario, Facultad, Sala, RecursoTecnológico, SalaRecurso, Reserva y LogAuditoria (RNF-06).
- **Prisma ORM 5.x:** ORM que genera un cliente TypeScript completamente tipado a partir del archivo `schema.prisma`, eliminando la posibilidad de errores de tipado en las consultas. Las migraciones automáticas (`prisma migrate`) garantizan que el esquema de base de datos esté siempre versionado y sincronizado con el código fuente. Prisma Studio provee una interfaz visual para inspección de datos en desarrollo.
- **date-fns 4.x:** Biblioteca utilizada en la capa de servicios para el manejo preciso de rangos horarios, cálculo de solapamientos y formateo de fechas en la lógica de validación de reservas.

### 3.5 Tabla Resumen del Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|:---|:---|:---:|:---|
| **Lenguaje** | TypeScript | 5.x | Tipado estático compartido en todas las capas; detecta errores en compilación |
| **Framework** | Next.js (App Router) | 14.2 | Full-stack unificado: SSR, API Routes, despliegue serverless en Vercel |
| **Runtime** | Node.js | 20 LTS | Entorno de ejecución estable con soporte de largo plazo |
| **Estilos** | Tailwind CSS | 3.4 | Sistema utilitario responsivo; alta productividad sin CSS personalizado |
| **Calendario** | FullCalendar React | 6.x | RF-04: vistas diaria/semanal/mensual, drag & drop, selección de rangos |
| **Estado servidor** | TanStack React Query | 5.x | Caché, refetch y sincronización automática sin complejidad de Redux |
| **Autenticación** | NextAuth.js | 4.x | RF-01/02/03: sesiones seguras, CSRF, asignación automática de roles |
| **Validación** | Zod | 3.x | Esquemas reutilizables cliente-servidor para reglas de negocio |
| **Hash contraseñas** | bcryptjs | 3.x | RNF-05: hash seguro con salt antes de persistir credenciales |
| **ORM** | Prisma | 5.22 | Cliente TypeScript tipado, migraciones versionadas, Prisma Studio |
| **Base de datos** | PostgreSQL | 16 | Transacciones ACID, constraints, integridad referencial (RNF-06) |
| **Fechas** | date-fns | 4.x | Manejo preciso de rangos horarios y validación de solapamientos |
| **Despliegue** | Vercel | — | CI/CD desde GitHub, serverless auto-scaling, gratuito para uso académico |

---

## 4. Referencias

Bass, L., Clements, P., & Kazman, R. (2021). *Software Architecture in Practice* (4th ed.). Addison-Wesley Professional.

Colom, T. (2023). *Full-Stack TypeScript Development with Next.js and Prisma*. Packt Publishing.

Fowler, M. (2015, June 3). MonolithFirst. *Martin Fowler's Blog*. https://martinfowler.com/bliki/MonolithFirst.html

Garlan, D., & Shaw, M. (1994). An introduction to software architecture. *Advances in Software Engineering and Knowledge Engineering*, 1, 1–40.

Next.js by Vercel. (2024). *Next.js Documentation — App Router*. https://nextjs.org/docs

Prisma. (2024). *Prisma ORM Documentation*. https://www.prisma.io/docs

NextAuth.js. (2024). *NextAuth.js Documentation (Auth.js)*. https://next-auth.js.org/getting-started/introduction

PostgreSQL Global Development Group. (2024). *PostgreSQL 16 Documentation*. https://www.postgresql.org/docs/16/

Richards, M., & Ford, N. (2020). *Fundamentals of Software Architecture: An Engineering Approach*. O'Reilly Media.
