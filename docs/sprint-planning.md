# Plan de Sprints y Backlog del Proyecto

**Proyecto:** Sistema Web de Reservas de Salas de Reuniones  
**Líder Técnico:** Jhon E. Masso Daza  
**Equipo:** 6 integrantes  
**Horas Totales:** 144 horas | **1 PH = 4 horas** | **Capacidad Total: 36 PH**

---

## Sprint 1 — Núcleo Operativo (MVP Funcional)

| Dato | Valor |
| :--- | :--- |
| **Duración** | 4 semanas (03/09 — 04/10) |
| **Capacidad** | 16 PH (64 horas) |
| **Asignado** | 16 PH |
| **Objetivo** | Construir el núcleo operativo del sistema: autenticación, gestión de salas y reservas básicas. |

### Épica 1: Gestión de Usuarios y Acceso al Sistema (4 PH)

| ¿Riesgo? | ID | Nombre de la Tarea | Responsable | PH | Duración | Estado | Prioridad | Comentarios |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| Sí | HU-01 | Registro de usuario con correo institucional | Backend Jr 1 | 2 | 7 días | No se ha iniciado | Alta | Configuración inicial de BD, validación de correo institucional y encriptación de contraseñas. |
| No | HU-02 | Inicio de sesión en el sistema | Backend Jr 1 | 2 | 7 días | No se ha iniciado | Media | Generación de tokens JWT y manejo de sesiones. |

### Épica 3: Gestión de Salas de Reuniones (8 PH)

| ¿Riesgo? | ID | Nombre de la Tarea | Responsable | PH | Duración | Estado | Prioridad | Comentarios |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| No | HU-04 | Crear sala de reuniones | **Tech Lead** | 2 | 5 días | No se ha iniciado | Alta | **El Tech Lead define aquí el patrón CRUD base** que el equipo replicará en las demás HU. |
| No | HU-05 | Editar sala de reuniones | Backend Jr 2 | 1 | 4 días | No se ha iniciado | Media | Reutiliza el patrón de HU-04. Valida nombre único por facultad. |
| No | HU-06 | Cambiar estado a la sala de reuniones | Backend Jr 2 | 1 | 4 días | No se ha iniciado | Alta | Toggle habilitado/deshabilitado. Notificación si hay reserva activa. |
| No | HU-07 | Agregar recursos tecnológicos | Frontend Jr 2 | 2 | 6 días | No se ha iniciado | Media | Formulario de asignación. Requiere tabla relacional recurso-sala en BD. |
| No | HU-08 | Retirar recursos tecnológicos | Backend Jr 2 | 1 | 4 días | No se ha iniciado | Baja | Borrado lógico o desasociación del recurso de la sala. |

### Épica 4: Gestión de Reservas de Salas (5 PH) *(Inicio)*

| ¿Riesgo? | ID | Nombre de la Tarea | Responsable | PH | Duración | Estado | Prioridad | Comentarios |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **Sí** | HU-09 | **Crear reserva de sala** | **Tech Lead** | **3** | **12 días** | No se ha iniciado | **Alta** | **La HU más crítica.** Lógica de validación de choques de horario, verificación de disponibilidad y asociación usuario-sala-fecha. |
| No | HU-10 | Cancelar una reserva | Frontend Jr 1 | 2 | 6 días | No se ha iniciado | Baja | Cambio de estado de la reserva + notificación al usuario afectado. |

---

## Sprint 2 — Experiencia Funcional y Trazabilidad

| Dato | Valor |
| :--- | :--- |
| **Duración** | 2 semanas (04/20 — 05/01) |
| **Capacidad** | 10 PH (40 horas) |
| **Asignado** | 10 PH |
| **Objetivo** | Completar la experiencia de consulta, ajuste de reservas e historial para docentes y secretaria. |

### Épica 2: Consulta de Disponibilidad de Salas (3 PH)

| ¿Riesgo? | ID | Nombre de la Tarea | Responsable | PH | Duración | Estado | Prioridad | Comentarios |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| Sí | HU-03 | Consultar disponibilidad de salas | Frontend Jr 1 | 3 | 8 días | No se ha iniciado | Alta | Filtros por fecha, hora, capacidad y facultad. Riesgo por complejidad de la UI del calendario. |

### Épica 4: Gestión de Reservas de Salas (2 PH) *(Continuación)*

| ¿Riesgo? | ID | Nombre de la Tarea | Responsable | PH | Duración | Estado | Prioridad | Comentarios |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| No | HU-11 | Ajustar una reserva (secretaria) | **Tech Lead** | 2 | 6 días | No se ha iniciado | Media | Reutiliza la lógica de HU-09 con permisos de secretaria para modificar fecha/hora. |

### Épica 5: Historial y Trazabilidad (5 PH)

| ¿Riesgo? | ID | Nombre de la Tarea | Responsable | PH | Duración | Estado | Prioridad | Comentarios |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| No | HU-12 | Consultar historial de reservas del docente | Frontend Jr 2 | 2 | 6 días | No se ha iniciado | Alta | Tabla paginada con filtros por fecha. Consume API de historial. |
| No | HU-13 | Consultar historial de reservas de la facultad | Backend Jr 1 | 3 | 8 días | No se ha iniciado | Media | Consultas con JOINs complejos agrupados por sala, docente y fecha. |

---

## Sprint 3 — Inteligencia Administrativa y Reporting

| Dato | Valor |
| :--- | :--- |
| **Duración** | 2 semanas (05/05 — 05/16) |
| **Capacidad** | 10 PH (40 horas) |
| **Asignado** | 10 PH |
| **Objetivo** | Construir los reportes de uso y dashboards administrativos para la toma de decisiones. |

### Épica 6: Reportes de Uso de Salas (10 PH)

| ¿Riesgo? | ID | Nombre de la Tarea | Responsable | PH | Duración | Estado | Prioridad | Comentarios |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| No | HU-14 | Generar reporte de uso por número de reservas | Frontend Jr 1 | 3 | 8 días | No se ha iniciado | Media | Gráficos de barras/pastel con Chart.js o Recharts. |
| No | HU-15 | Generar reporte de uso por horas reservadas | Backend Jr 2 | 2 | 7 días | No se ha iniciado | Baja | Consulta SQL con SUM() y GROUP BY por sala. |
| No | HU-16 | Generar reporte de uso por usuario | Backend Jr 1 | 2 | 6 días | No se ha iniciado | Baja | Endpoint de consulta filtrada por ID de usuario. |
| **Sí** | HU-17 | **Filtrar reportes por rangos de fechas** | **Tech Lead** | **3** | **10 días** | No se ha iniciado | **Alta** | **Componente transversal** que modifica dinámicamente los 3 reportes anteriores. Requiere visión global del sistema. |

---

## Resumen General del Proyecto

| Sprint | Duración | Capacidad (PH) | PH Asignados | Horas Asignadas | Objetivo Principal |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | 4 semanas | 16 | 16 | 64 hrs | Núcleo operativo del sistema (MVP funcional) |
| **2** | 2 semanas | 10 | 10 | 40 hrs | Experiencia funcional y trazabilidad |
| **3** | 2 semanas | 10 | 10 | 40 hrs | Inteligencia administrativa y reporting |
| **TOTAL** | **8 semanas** | **36** | **36** | **144 hrs** | |

---

## Distribución de Carga por Integrante

| Rol | Sprint 1 | Sprint 2 | Sprint 3 | Total PH | Total Hrs |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Tech Lead** | 5 PH (HU-04, HU-09) | 2 PH (HU-11) | 3 PH (HU-17) | **8 PH** | **32 hrs** |
| Backend Jr 1 | 4 PH (HU-01, HU-02) | 3 PH (HU-13) | 2 PH (HU-16) | **6 PH** | **24 hrs** |
| Backend Jr 2 | 3 PH (HU-05, HU-06, HU-08) | — (apoyo) | 2 PH (HU-15) | **5 PH** | **20 hrs** |
| Frontend Jr 1 | 2 PH (HU-10) | 3 PH (HU-03) | 3 PH (HU-14) | **6 PH** | **24 hrs** |
| Frontend Jr 2 | 2 PH (HU-07) | 2 PH (HU-12) | — (apoyo) | **5 PH** | **20 hrs** |
| Documentador / QA | Transversal | Transversal | Transversal | **6 PH** | **24 hrs** |
| **TOTAL** | **16 PH** | **10 PH** | **10 PH** | **36 PH** | **144 hrs** |

> **Nota:** Los sprints marcados con "—" (apoyo) significan que el integrante dedica su tiempo a apoyar en pruebas, debugging o code review junto al Tech Lead o el Documentador/QA. Esto es práctica estándar en equipos ágiles reales.
