---
description: Planificar un sprint o iteración del proyecto
---

# Workflow: Planificación de Sprint

## Pasos

1. **Revisar el estado actual del proyecto**
   - Leer `docs/project-spec.md` sección Hitos para ver la fecha del entregable
   - Verificar qué HU están completadas y cuáles pendientes

2. **Identificar entregables del hito**
   | Semana | Entregables |
   |--------|-------------|
   | 6 | HU, Casos de Uso, prototipos UI, modelo BD, planeación |
   | 11 | Diagramas Secuencia/Clases, arquitectura, prototipo, pruebas backend |
   | 14-15 | Seguimiento + plan de pruebas |
   | 17 | Prototipo final + documentación completa |

3. **Seleccionar HU para el sprint**
   - Priorizar por dependencias (Épica 1 antes que 4)
   - Considerar capacidad del equipo (máx. 6 integrantes)
   - Asignar responsables

4. **Desglosar tareas por HU**
   - Para cada HU seleccionada, definir:
     - Tareas de diseño (diagramas, prototipos)
     - Tareas de implementación (backend, frontend)
     - Tareas de prueba (casos de prueba)

5. **Estimar esfuerzo**
   - Usar T-shirt sizing: S (1-2h), M (3-5h), L (6-10h), XL (>10h)
   - O puntos de historia: 1, 2, 3, 5, 8, 13

6. **Documentar el sprint**
   - Crear `docs/sprints/sprint-XX.md` con la planificación
   - Incluir: objetivo, HU, tareas, responsables, fechas
