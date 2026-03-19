# AGENTS.md — Reglas para Agentes IA

> Reglas y convenciones que deben seguir todos los agentes IA que trabajen en este repositorio.

## Proyecto

**Sistema Web de Reservas de Salas de Reuniones por Facultad**  
Asignatura: Ingeniería de Software 1 | Universidad

## Documentación de Referencia

Antes de cualquier exploración del filesystem, lee:
1. `docs/project-spec.md` → Contexto, roles, reglas, hitos
2. `docs/requirements.md` → RF, RNF, restricciones
3. `docs/architecture.md` → Arquitectura, patrones, endpoints
4. `docs/database-model.md` → Modelo ER, entidades

## Reglas Obligatorias

### Dominio del Negocio
- Solo existen 2 roles: **DOCENTE** y **SECRETARIA** (sin admin)
- Las reservas **nunca se eliminan**, solo se cancelan
- Horario permitido: **7:00 AM – 9:30 PM**
- Una sala no puede tener **reservas superpuestas**
- **Todas las acciones** generan registro de auditoría
- Las salas son **exclusivas para reuniones** (no clases)

### Formato de Documentación
- Idioma: **Español**
- Historias de usuario: Formato `Como [rol], quiero [acción], para [beneficio]`
- IDs de HU: `HU-XX` con trazabilidad a `RF-XX`
- Diagramas: Usar **Mermaid** cuando sea posible
- Criterios de aceptación: Formato **Given/When/Then** adaptado al español

### Convenciones de Código (cuando se implemente)
- Arquitectura en capas: `routes → controllers → services → repositories`
- Nombres de variables y funciones en **camelCase** (código)
- Nombres de tablas en **snake_case** (BD)
- Endpoints REST: sustantivos en plural, verbos HTTP estándar
- Validaciones de negocio en la capa de **servicios**, no en controladores
- Middleware para: autenticación, autorización (RBAC), auditoría

### Optimización de Tokens
- Usar IDs de requisitos (`RF-01`, `R-05`) en vez de texto completo
- Referenciar docs/ en vez de repetir información
- Respuestas concisas con tablas y listas
- No repetir contexto ya conocido

## Skills y Workflows

- Skills disponibles en `.agents/skills/` (leer `SKILL.md` de cada uno)
- Workflows disponibles en `.agents/workflows/` (usar con `/comando`)
- Siempre usar Context7 MCP cuando se necesite documentación de librerías

## Fase Actual del Proyecto

**Semana 6 (02-05/03/2026):** Documentación
- ✅ Especificación del proyecto
- ✅ Requisitos documentados
- ✅ Modelo lógico de BD
- 🔄 Historias de usuario
- 🔄 Diagramas de casos de uso
- 🔄 Prototipos de interfaces
- 🔄 Planeación del desarrollo
