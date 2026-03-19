# AGENTS.md — Reglas Generales para Agentes IA

> Reglas y convenciones estándar para agentes IA al interactuar con proyectos de desarrollo de software.

## Principios Generales

Antes de iniciar cualquier tarea de desarrollo o exploración exhaustiva, el agente debe:
1. **Comprender el contexto**: Leer los documentos principales del proyecto (como `docs/project-spec.md`, `docs/architecture.md`, etc.).
2. **Minimizar costos / optimizar tokens**: Evitar usar herramientas de listar directorios enteros si la estructura ya está documentada. 
3. **Respetar la arquitectura**: Adaptarse a los patrones de diseño y decisiones arquitectónicas estipuladas por el usuario.

## Reglas Obligatorias de Codificación

- **Idiomas y convenciones**:
  - Código y variables en el idioma y estándar definido en el proyecto (ej. `camelCase` para variables, `PascalCase` para clases).
  - Tablas de BD normalmente en `snake_case`.
  - Documentación externa en el idioma preferido del usuario.
- **Validaciones**: Siempre validar entradas a nivel de rutas o en una capa de servicios centralizada antes de operar con la base de datos.
- **Trazabilidad y Seguridad**: Todo sistema crítico debe considerar el registro de logs o auditoría, y validaciones precisas de roles antes de ejecutar acciones de escritura.
- **RESTful**: Usar verbos HTTP adecuados e idempotencia cuando corresponda (GET, POST, PUT, PATCH, DELETE).

## Formatos de Documentación

- **Historias de usuario**: `Como [rol], quiero [acción], para [beneficio]`
- **Diagramas**: Usar preferentemente **Mermaid**.
- **Criterios de aceptación**: Formato **Given/When/Then**.

## Optimización de Tokens

- Referenciar identificadores de requisitos en lugar de repetir descripciones largas.
- Dar respuestas directas, con listas y tablas para facilitar la lectura.
- No repetir reglas o contexto que ya fue provisto por el usuario.
