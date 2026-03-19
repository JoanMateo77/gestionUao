---
description: Crear una nueva historia de usuario con formato estándar y trazabilidad
---

# Workflow: Nueva Historia de Usuario

## Pasos

1. **Leer el skill de historias de usuario**
   - Abrir `.agents/skills/user-stories/SKILL.md` para ver el formato y reglas

2. **Identificar la épica**
   - Consultar `docs/requirements.md` para ver las 6 épicas y sus RF
   - Determinar a qué épica pertenece la nueva HU

3. **Identificar los RF aplicables**
   - Buscar en `docs/requirements.md` los requisitos funcionales que cubre
   - Verificar restricciones aplicables (sección Restricciones)

4. **Redactar la HU con el formato estándar**
   ```
   HU-XX: [Título]
   Épica: [Nombre]
   Trazabilidad: RF-XX, RF-YY
   Como [rol], quiero [acción], para [beneficio].
   ```

5. **Definir criterios de aceptación**
   - Formato Given/When/Then en español
   - Mínimo 2 criterios por HU
   - Incluir escenario positivo y negativo

6. **Verificar trazabilidad**
   - Confirmar que cada RF mencionado existe en `docs/requirements.md`
   - Confirmar que no se inventa ningún requisito nuevo

7. **Agregar al documento de historias de usuario**
   - Crear o actualizar `docs/user-stories.md`
   - Mantener numeración consecutiva
