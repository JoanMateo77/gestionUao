# CLAUDE.md — Instrucciones para el Agente IA

> Este archivo configura el comportamiento de Claude y otros agentes IA al trabajar con este proyecto.

## 🎯 Proyecto

**Sistema Web de Reservas de Salas de Reuniones por Facultad**  
Proyecto académico — Ingeniería de Software 1  
**Fase actual:** Documentación (Historias de Usuario, Casos de Uso, Modelo BD, Prototipos UI)

## 📁 Estructura de Referencia — LEE ESTO PRIMERO

Antes de explorar el filesystem, consulta estos documentos:

| Documento | Qué contiene | Cuándo leerlo |
|-----------|-------------|---------------|
| `docs/project-spec.md` | Especificación del proyecto, roles, reglas de negocio, hitos | Contexto general |
| `docs/requirements.md` | RF, RNF, restricciones con tablas y trazabilidad | Requisitos específicos |
| `docs/database-model.md` | Diagrama ER en Mermaid, entidades, constraints | Trabajo con BD |
| `docs/architecture.md` | Arquitectura, patrones, endpoints REST | Decisiones técnicas |

> **REGLA DE ORO:** No hagas `list_dir` o `find_by_name` para descubrir la estructura si ya está documentada arriba. Ahorra tokens.

## 🔑 Reglas del Proyecto (No Negociables)

1. **Roles:** Solo `DOCENTE` y `SECRETARIA`. **NO existe admin.**
2. **Reservas nunca se eliminan**, solo se cancelan (R-06)
3. **Franja horaria:** 7:00 AM a 9:30 PM (R-02)
4. **No solapamiento** de reservas en la misma sala (R-03)
5. **Trazabilidad obligatoria** en todas las acciones (R-11)
6. **Salas solo para reuniones**, NO para clases (R-01)
7. **Sin rol admin** — roles se asignan automáticamente (R-07, R-08, R-09)

## ⚡ Optimización de Tokens

### Haz esto:
- **Responde en español** (idioma del proyecto)
- **Sé conciso**: No repitas contexto que ya conoces del docs/
- **Usa tablas** para estructurar información (HU, requisitos, etc.)
- **Referencia por ID**: Usa `RF-01`, `HU-03`, `R-05` en vez de repetir el texto completo
- **Usa Mermaid** para diagramas en vez de descripciones textuales largas
- **Lee docs/ antes de explorar** — toda la info base está ahí

### No hagas esto:
- ❌ No inventes nuevos requisitos ni funcionalidades
- ❌ No agregues roles que no existan (admin, superusuario, etc.)
- ❌ No propongas eliminar reservas (solo cancelar)
- ❌ No repitas la especificación completa en cada respuesta
- ❌ No explores archivos que ya están documentados en docs/

## 🛠️ Skills Disponibles

Usa las skills en `.agents/skills/` para tareas especializadas:

| Skill | Cuándo usarla |
|-------|---------------|
| `user-stories` | Crear o refinar historias de usuario con formato estándar |
| `uml-diagrams` | Generar diagramas de casos de uso, secuencia o clases |
| `database-modeling` | Diseñar o modificar el esquema de BD |
| `api-design` | Diseñar endpoints REST con validaciones |
| `testing` | Crear planes de prueba y casos de prueba |

## 📋 Workflows Disponibles

Usa los workflows en `.agents/workflows/` para procesos paso a paso:

- `/new-user-story` — Crear historias de usuario nuevas
- `/create-diagram` — Generar diagramas UML
- `/sprint-planning` — Planificar sprint/iteración
- `/db-schema` — Trabajar con el esquema de BD

## 🎓 Contexto Académico

- Este es un proyecto de **curso universitario**, no producción
- Prioriza **claridad y documentación** sobre performance extremo
- Los entregables deben seguir el formato académico (épicas → HU → trazabilidad)
- Las decisiones deben estar **justificadas** con referencia a los requisitos
- El equipo tiene máximo 6 integrantes con roles definidos
