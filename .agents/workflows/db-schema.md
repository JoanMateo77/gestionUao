---
description: Diseñar o modificar el esquema de base de datos
---

# Workflow: Esquema de Base de Datos

## Pasos

1. **Leer el skill de modelado de BD**
   - Abrir `.agents/skills/database-modeling/SKILL.md` para ver reglas y convenciones

2. **Consultar el modelo existente**
   - Leer `docs/database-model.md` para ver el diagrama ER actual
   - Identificar si es un cambio nuevo o modificación

3. **Identificar los RF afectados**
   - Consultar `docs/requirements.md` para los requisitos funcionales
   - Verificar restricciones que impactan el esquema (R-02, R-03, R-06, etc.)

4. **Diseñar/modificar el esquema**
   - Usar diagrama ER en Mermaid
   - Definir tipos de datos apropiados
   - Definir constraints (PK, FK, UNIQUE, CHECK, NOT NULL)
   - Verificar contra el checklist del skill

5. **Validar integridad**
   - [ ] Todas las entidades tienen PK
   - [ ] Las FK referencian entidades existentes
   - [ ] No hay DELETE en RESERVA (solo UPDATE estado)
   - [ ] Franja horaria validada por CHECK
   - [ ] LOG_AUDITORIA cubre todas las acciones
   - [ ] Roles limitados a DOCENTE y SECRETARIA

6. **Actualizar documentación**
   - Actualizar `docs/database-model.md` con los cambios
   - Si hay migraciones, documentar en `docs/migrations/`
