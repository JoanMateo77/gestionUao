
# Roles y Estructura del Equipo de Desarrollo

**Proyecto:** Sistema Web de Reservas de Salas de Reuniones  
**Líder del Proyecto:** Joan Mateo Cardona  
**Tamaño del Equipo:** 6 integrantes  
**Horas Totales del Proyecto:** 144 horas (24 horas por persona)  
**Equivalencia:** 1 Punto de Historia (PH) = 4 horas  
**Capacidad Total:** 36 PH

---

## Estructura del Equipo

```
                    ┌─────────────────────┐
                    │   Tech Lead (TL)    │
                    │ Joan Mateo Cardona  │
                    └────────┬────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌───────▼──────┐  ┌──────▼───────┐  ┌────▼──────────┐
    │   Backend    │  │   Frontend   │  │ Documentador  │
    │   Team (2)   │  │   Team (2)   │  │   / QA (1)    │
    └──────────────┘  └──────────────┘  └───────────────┘
```

---

## Estrategia de Distribución de Parejas

La asignación de tareas **no sigue parejas fijas** durante todo el proyecto. Se aplica una **rotación intencional** de las parejas Backend-Frontend entre sprints y dentro de cada sprint. Esto se hace por las siguientes razones:

1. **Colaboración cruzada:** Al rotar las parejas, todos los integrantes del equipo se conocen entre sí y aprenden a trabajar con diferentes estilos, fortaleciendo la comunicación y cohesión del grupo.
2. **Reducción de silos de conocimiento:** Ningún integrante es el único que conoce una parte del sistema. Si alguien falta, otro compañero ya trabajó en esa zona y puede cubrir.
3. **Visibilidad del Tech Lead:** El Tech Lead se empareja deliberadamente con diferentes integrantes en cada sprint para observar las dinámicas de trabajo, identificar fortalezas individuales y detectar dificultades técnicas a tiempo.

**Ejemplo de rotación aplicada en el proyecto:**

| Sprint | Tech Lead trabaja con | Pareja Back Jr 1 | Pareja Back Jr 2 |
| :---: | :--- | :--- | :--- |
| 1 | Frontend Jr 2 (HU-04) y Frontend Jr 1 (HU-09) | Frontend Jr 1 (HU-01, HU-02) | Frontend Jr 2 (HU-05, HU-06, HU-07) |
| 2 | Frontend Jr 2 (HU-11) | Frontend Jr 1 (HU-03, HU-13) | Frontend Jr 2 (HU-12) |
| 3 | Frontend Jr 1 (HU-17) | Frontend Jr 1 (HU-14) | Frontend Jr 2 (HU-15, HU-16) |

> De esta forma, el Tech Lead ha trabajado directamente con **todos los frontend** y ha podido evaluar la dinámica de cada pareja backend-frontend del equipo.

---

## Definición de Roles

### 1. Tech Lead / Arquitecto de Software — Joan Mateo Cardona

| Aspecto | Detalle |
| :--- | :--- |
| **Asignación** | 8 PH (32 horas) |
| **Rol principal** | Arquitecto de software, desarrollador principal, revisor de código y asignador de tareas |

**¿Qué hace?**

**Como Arquitecto:**
- **Diseña la arquitectura completa** del sistema: estructura de carpetas, capas (controlador → servicio → repositorio), patrones de diseño y estándares de código.
- **Define el stack tecnológico** del proyecto y toma las decisiones técnicas finales (frameworks, librerías, estructura de BD).
- **Crea el primer CRUD completo** (HU-04) como implementación de referencia que todo el equipo debe seguir como patrón.

**Como Líder Técnico:**
- **Asigna las tareas detalladas** a cada integrante del equipo, definiendo qué debe hacer cada uno en el backend y frontend de cada Historia de Usuario.
- **Revisa el código** (Code Review) de todos los Pull Requests antes de integrarlos a la rama principal.
- **Rota parejas** de trabajo intencionalmente para evaluar dinámicas, detectar fortalezas y mejorar la cohesión del equipo.
- **Desbloquea** al equipo cuando alguien se traba con un problema técnico complejo.

**Como Desarrollador Principal:**
- **Programa las funcionalidades más complejas** y de mayor riesgo del sistema (es quien más código produce en el equipo).
- **Se empareja con diferentes integrantes** en cada sprint para transferir conocimiento y observar de cerca las dinámicas de trabajo.

**Tareas asignadas en el proyecto:**

| Sprint | HU Asignada | Razón |
| :---: | :--- | :--- |
| 1 | HU-04 Crear sala de reuniones | Define el patrón CRUD base que todo el equipo seguirá. |
| 1 | HU-09 Crear reserva de sala | La funcionalidad más compleja: validación de choques de horario. |
| 2 | HU-11 Ajustar una reserva (secretaria) | Extiende la lógica compleja de HU-09 con permisos adicionales. |
| 3 | HU-17 Filtrar reportes por rangos de fechas | Componente transversal que afecta los 3 reportes. |

**Distribución de su tiempo:**

| Actividad | % del tiempo |
| :--- | :---: |
| Programar (tareas complejas y de alto riesgo) | 45% |
| Revisar código del equipo (Code Review) | 20% |
| Definir arquitectura y asignar tareas detalladas | 20% |
| Desbloquear al equipo / mentoría / evaluar dinámicas | 15% |

---

### 2. Desarrollador Backend Junior 1 — Carlos Andrés Gámez Ruiz

| Aspecto | Detalle |
| :--- | :--- |
| **Asignación** | 6 PH (24 horas) |
| **Rol principal** | Base de datos, autenticación y consultas complejas |

**¿Qué hace?**
- **Diseña e implementa la base de datos** (tablas, relaciones, migraciones).
- **Configura la autenticación** del sistema (registro, login, tokens JWT).
- **Construye las consultas complejas** que requieren JOINs, agrupaciones y filtros avanzados.
- **Implementa la seguridad** del backend (validación de roles, permisos).

**Tareas asignadas en el proyecto:**

| Sprint | HU Asignada | PH |
| :---: | :--- | :---: |
| 1 | HU-01 Registro de usuario con correo institucional | 2 |
| 1 | HU-02 Inicio de sesión en el sistema | 2 |
| 2 | HU-13 Consultar historial de reservas de la facultad | 3 |
| 3 | HU-16 Generar reporte de uso por usuario | 2 |

> **Nota:** Este rol se enfoca en la infraestructura y seguridad del sistema. Es quien configura todo lo necesario para que los demás puedan trabajar.

---

### 3. Desarrollador Backend Junior 2 — Jaime Gil Londoño

| Aspecto | Detalle |
| :--- | :--- |
| **Asignación** | 6 PH (24 horas) |
| **Rol principal** | APIs REST, CRUDs y validaciones de negocio |

**¿Qué hace?**
- **Construye los endpoints** de la API siguiendo el patrón que define el Tech Lead.
- **Implementa las validaciones de negocio** (capacidad entre 2-100, nombre duplicado, etc.).
- **Maneja las excepciones** y los códigos de respuesta HTTP correctos.
- **Escribe pruebas unitarias** básicas del backend.

**Tareas asignadas en el proyecto:**

| Sprint | HU Asignada | PH |
| :---: | :--- | :---: |
| 1 | HU-05 Editar sala de reuniones | 1 |
| 1 | HU-06 Cambiar estado a la sala de reuniones | 1 |
| 1 | HU-08 Retirar recursos tecnológicos | 1 |
| 2 | HU-11 Ajustar una reserva *(apoyo al Tech Lead)* | — |
| 3 | HU-15 Generar reporte por horas reservadas | 2 |

> **Nota:** En sprints donde tiene menos carga, apoya al Backend Junior 1 o al Tech Lead en pruebas y debugging.

---

### 4. Desarrollador Frontend Junior 1 — Juan Camilo Castro

| Aspecto | Detalle |
| :--- | :--- |
| **Asignación** | 6 PH (24 horas) |
| **Rol principal** | Arquitectura UI, flujos complejos y conexión con APIs |

**¿Qué hace?**
- **Configura el proyecto frontend** (React/Angular/Vue, rutas, estado global).
- **Implementa los flujos de usuario más complejos** (calendario de reservas, filtros dinámicos).
- **Conecta las pantallas con el backend** consumiendo las APIs REST.
- **Implementa los gráficos** de reportes usando librerías como Chart.js o Recharts.

**Tareas asignadas en el proyecto:**

| Sprint | HU Asignada | PH |
| :---: | :--- | :---: |
| 1 | HU-10 Cancelar una reserva | 2 |
| 2 | HU-03 Consultar disponibilidad de salas | 3 |
| 3 | HU-14 Generar reporte por número de reservas | 3 |

> **Nota:** Es quien configura la estructura base del frontend para que el otro developer de frontend pueda trabajar sobre esa base.

---

### 5. Desarrollador Frontend Junior 2 — María Paula Hernández

| Aspecto | Detalle |
| :--- | :--- |
| **Asignación** | 5 PH (20 horas) |
| **Rol principal** | Maquetación UI/UX, formularios, estilos y pantallas |

**¿Qué hace?**
- **Diseña y maqueta las pantallas** del sistema (Login, Listado de Salas, Formularios).
- **Implementa las validaciones visuales** en los formularios (campos requeridos, rangos, mensajes de error).
- **Aplica estilos y diseño responsive** para que se vea profesional en cualquier dispositivo.
- **Consume APIs simples** para mostrar listados y tablas de datos.

**Tareas asignadas en el proyecto:**

| Sprint | HU Asignada | PH |
| :---: | :--- | :---: |
| 1 | HU-07 Agregar recursos tecnológicos | 2 |
| 2 | HU-12 Consultar historial de reservas del docente | 2 |
| 3 | *(Apoya a Frontend Jr 1 en reportes y pruebas)* | — |

> **Nota:** En sprints con menos carga, apoya al Documentador/QA probando las pantallas visualmente.

---

### 6. Documentador Técnico / QA — Daniel Valoyes

| Aspecto | Detalle |
| :--- | :--- |
| **Asignación** | 5 PH (20 horas) |
| **Rol principal** | Documentación, pruebas funcionales y control de calidad |

**¿Qué hace?**
- **Prueba cada Historia de Usuario** contra los Criterios de Aceptación (Given/When/Then).
- **Documenta la API** (endpoints, parámetros, respuestas esperadas).
- **Mantiene actualizados los diagramas** UML (Casos de uso, Secuencia, Clases).
- **Escribe el manual de usuario** del sistema.
- **Reporta bugs** encontrados y los asigna al desarrollador correspondiente.
- **Gestiona el tablero del proyecto** (Trello/Jira) asegurando que las tareas estén al día.

**Plan de trabajo por Sprint:**

| Sprint | Actividad Principal |
| :---: | :--- |
| 1 | Documentar HU-01 a HU-10. Diseñar casos de prueba. Validar los primeros CRUDs. |
| 2 | Probar los flujos completos del Sprint 1. Documentar APIs del Sprint 2. Escribir sección 1 del manual de usuario. |
| 3 | Pruebas de regresión completas. Documentar reportes. Finalizar manual de usuario. Preparar entrega final. |

---

## Resumen de Asignación

| Rol | Miembro | PH | Horas | Sprint 1 | Sprint 2 | Sprint 3 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| Tech Lead | Joan Mateo Cardona | 8 | 32 | 5 PH | 2 PH | 3 PH |
| Backend Jr 1 | Carlos Andrés Gámez Ruiz | 6 | 24 | 4 PH | 3 PH | 2 PH |
| Backend Jr 2 | Jaime Gil Londoño | 6 | 24 | 3 PH | 0 PH* | 2 PH |
| Frontend Jr 1 | Juan Camilo Castro | 6 | 24 | 2 PH | 3 PH | 3 PH |
| Frontend Jr 2 | María Paula Hernández | 5 | 20 | 2 PH | 2 PH | 0 PH* |
| Documentador / QA | Daniel Valoyes | 5 | 20 | Transversal | Transversal | Transversal |
| **TOTAL** | | **36** | **144** | **16** | **10** | **10** |

> *Los sprints con 0 PH asignados significan que el integrante apoya a otros roles (testing, debugging, code review).*

---

## Ceremonias Ágiles del Equipo

| Ceremonia | Frecuencia | Duración | Responsable |
| :--- | :--- | :--- | :--- |
| **Sprint Planning** | Inicio de cada Sprint | 1 hora | Tech Lead + Documentador/QA |
| **Daily Standup** | Diaria | 15 min | Todo el equipo |
| **Code Review** | Continuo (por cada PR) | 15-30 min | Tech Lead |
| **Sprint Review** | Fin de cada Sprint | 30 min | Todo el equipo |
| **Sprint Retrospective** | Fin de cada Sprint | 30 min | Documentador/QA (facilita) |
