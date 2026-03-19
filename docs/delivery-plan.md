# Plan de Entregas y Estimaciones — Sistema de Reservas de Salas

Este documento define la planificación de las iteraciones (Sprints) para alcanzar los hitos del proyecto, las asignaciones del equipo de desarrollo y las estimaciones en Puntos de Historia (Story Points - SP).

> **Métrica de Estimación:** 1 Story Point (SP) = 3 horas de trabajo efectivo.  
> **Estrategia:** El equipo tiene alta capacidad técnica, por lo que las estimaciones son agresivas y orientadas a un desarrollo ágil y rápido.

---

## 1. Equipo de Desarrollo (6 Integrantes)

Se definen 6 roles clave para balancear la carga de trabajo entre Frontend, Backend y Calidad:

| Integrante | Rol | Responsabilidades Principales |
|------------|-----|-------------------------------|
| **Dev 1** | Líder Técnico / Arquitecto | Planeación, revisión de PRs, diseño de BD, apoyo transversal, endpoints complejos (validación de reservas). |
| **Dev 2** | Backend Developer | APIs de Salas, autenticación, middlewares de seguridad y roles. |
| **Dev 3** | Backend Developer | APIs de Reportes, historial, lógica de auditoría (RF-16). |
| **Dev 4** | Frontend Developer (UX/UI) | Estructura base de la aplicación (SPA), componentes compartidos, diseño UI. |
| **Dev 5** | Frontend Developer | Integración con APIs, vistas de formularios, calendario interactivo. |
| **Dev 6** | QA / Fullstack | Diseño y ejecución de plan de pruebas, solución de bugs críticos, QA testing. |

---

## 2. Estimación de Historias de Usuario

*El proyecto suma un total de **27 Puntos de Historia (81 horas de desarrollo puro)**.*

| Épica | HU | Título | Estimación (SP) | Horas (1 SP=3h) | Asignado a |
|-------|----|--------|-----------------|-----------------|------------|
| **1. Usuarios** | HU-01 | Registro de usuario | 2 SP | 6 h | Dev 2 / Dev 4 |
| | HU-02 | Inicio de sesión | 1 SP | 3 h | Dev 2 / Dev 4 |
| **2. Disponibilidad**| HU-03 | Visualizar calendario | 3 SP | 9 h | Dev 1 / Dev 5 |
| **3. Salas** | HU-04 | Crear sala de reuniones | 2 SP | 6 h | Dev 2 / Dev 4 |
| | HU-05 | Editar sala de reuniones | 1 SP | 3 h | Dev 2 / Dev 5 |
| | HU-06 | Cambiar estado de sala | 1 SP | 3 h | Dev 2 / Dev 5 |
| | HU-07 | Agregar recurso | 1 SP | 3 h | Dev 3 / Dev 4 |
| | HU-08 | Retirar recurso | 1 SP | 3 h | Dev 3 / Dev 4 |
| **4. Reservas** | HU-09 | Crear reserva (con validaciones) | 3 SP | 9 h | Dev 1 / Dev 5 |
| | HU-10 | Cancelar reserva | 2 SP | 6 h | Dev 1 / Dev 4 |
| | HU-11 | Ajustar reserva | 2 SP | 6 h | Dev 1 / Dev 5 |
| **5. Historial** | HU-12 | Historial propio | 1 SP | 3 h | Dev 3 / Dev 4 |
| | HU-13 | Historial completo de facultad | 1 SP | 3 h | Dev 3 / Dev 5 |
| **6. Reportes** | HU-14 | Reporte por cantidad de reservas | 2 SP | 6 h | Dev 3 / Dev 4 |
| | HU-15 | Reporte por horas reservadas | 2 SP | 6 h | Dev 3 / Dev 5 |
| | HU-16 | Reporte por usuario | 2 SP | 6 h | Dev 3 / Dev 5 |
| **Transversal** | - | Pruebas y QA | - | Continúo | Dev 6 + Todos |

---

## 3. Plan de Sprints (Iteraciones)

Considerando los hitos institucionales de la **Semana 11 (Prototipo Inicial)** y **Semana 17 (Prototipo Final)**, dividiremos el desarrollo en 3 Sprints principales.

### Sprint 1: Base, Usuarios y Salas (Semanas 7–8)
**Objetivo:** Tener el sistema funcional (esqueleto), esquema de BD productivo, login y el CRUD completo mecánico de salas.
- **Backend:** Auth middleware, endpoints de registro/login, endpoints de salas.
- **Frontend:** Formularios de login/registro, dashboard admin, tabla y formularios de salas.
- **Carga Total:** 9 SP (27 horas).
- **Entregables:** HU-01, HU-02, HU-04, HU-05, HU-06, HU-07, HU-08.
- **Participación principal:** Dev 2, Dev 3, Dev 4.

### Sprint 2: Core del Negocio y Reservas (Semanas 9–10)
**Objetivo:** Lograr las funcionalidades "Must-Have" más complejas antes de la presentación del **Hito 2 (Semana 11)**.
- **Backend:** Lógica de validación de conflictos (franja horaria, cruces), endpoints de reservas, calendario temporal para API.
- **Frontend:** Integración de librería de calendario, vistas de reserva de usuario y cancelación.
- **Carga Total:** 10 SP (30 horas).
- **Entregables:** HU-03, HU-09, HU-10, HU-11.
- **Participación principal:** Líder (Dev 1) para las validaciones críticas, y Dev 5 para la interfaz compleja del calendario.

> 📍 **Hito Universitario Semana 11:** Prototipo inicial funcional Backend + Frontend (Sprints 1 y 2 terminados). Prueba exitosa de la creación de una reserva y visualización en el calendario.

### Sprint 3: Auditoría, Historial y Reportes (Semanas 12–14)
**Objetivo:** Completar funcionalidades para roles administrativos y asegurar la completitud de los datos.
- **Backend:** Consultas complejas SQL para los reportes agregados, filtros por rangos de fechas (RF-20).
- **Frontend:** Gráficos o tablas de datos con exportación básica para los reportes de secretaria.
- **Carga Total:** 8 SP (24 horas).
- **Entregables:** HU-12, HU-13, HU-14, HU-15, HU-16.
- **Participación principal:** Dev 3 (Back de reportes) y Dev 4/5.

### Sprint 4: Estabilización y QA (Semanas 15–16)
**Objetivo:** Pulir UX, arreglar bugs encontrados por QA, y preparar la entrega final.
- **Tareas QA:** Dev 6 lidera la ejecución exhaustiva de los Casos de Prueba mapeados a los RF.
- **Carga Total:** Sin estimación en SP funcional, enfoque en estabilización.
- **Entregables:** Correcciones sobre los solapamientos de horas, validaciones de seguridad (que un docente no borre cosas de secretaria).

> 📍 **Hito Universitario Semana 17:** Prototipo final completado + Código validado. Sustentación exitosa y sin bugs.

---

## 4. Notas del Líder Técnico para el Equipo

1. **Eficiencia:** Las estimaciones (1, 2, 3) asumen que **no reinventaremos la rueda**. Usaremos componentes UI pre-hechos (Tailwind/shadcn) para los formularios y una librería establecida para visualizar el calendario (ej. FullCalendar o React Big Calendar).
2. **Prioridad Paralela:** Mientras Dev 2 levanta la API de usuarios en Sprint 1, Dev 4 ya puede estar maquetando los componentes en el Frontend de las historias correspondientes usando mocks simulados.
3. **Auditoría Transversal:** La inserción de logs (HU-16 trazabilidad) no tiene puntos porque la abstraeremos en un middleware global y eventos del sistema gestionados por Dev 1 y Dev 2 desde el Sprint 1. Así evitamos código repetido.
