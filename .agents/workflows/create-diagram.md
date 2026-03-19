---
description: Generar diagramas UML (Casos de Uso, Secuencia, Clases) para el sistema
---

# Workflow: Crear Diagrama UML

## Pasos

1. **Leer el skill de diagramas UML**
   - Abrir `.agents/skills/uml-diagrams/SKILL.md` para ver plantillas y reglas

2. **Determinar el tipo de diagrama**
   - **Casos de Uso**: Para mapear funcionalidades a actores
   - **Secuencia**: Para detallar flujo de un proceso específico
   - **Clases**: Para modelar la estructura del sistema

3. **Recopilar contexto**
   - Leer `docs/requirements.md` para los RF y restricciones
   - Leer `docs/architecture.md` para la estructura del sistema
   - Leer `docs/database-model.md` si es un diagrama de clases

4. **Generar el diagrama en Mermaid**
   - Usar la plantilla correspondiente del skill
   - Asegurar que todos los RF relevantes están representados
   - Incluir solo los actores del sistema (Docente, Secretaria — NO admin)

5. **Validar el diagrama**
   - Verificar que renderiza correctamente en Mermaid
   - Verificar trazabilidad con RF
   - Verificar consistencia con diagramas existentes

6. **Guardar en docs/**
   - Casos de Uso: `docs/use-case-diagrams.md`
   - Secuencia: `docs/sequence-diagrams.md`
   - Clases: `docs/class-diagrams.md`
