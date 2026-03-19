---
name: user-stories
description: Genera historias de usuario con formato estándar, criterios de aceptación y trazabilidad a requisitos funcionales
---

# Skill: Historias de Usuario

## Cuándo usar este skill
- Cuando se necesite crear nuevas historias de usuario
- Cuando se necesite refinar o detallar HU existentes
- Cuando se pida documentar épicas con sus HU

## Formato Obligatorio de Historia de Usuario

```markdown
### HU-XX: [Título descriptivo]

**Épica:** [Nombre de la épica]  
**Trazabilidad:** [RF-XX, RF-YY]  
**Prioridad:** [Alta | Media | Baja]  
**Estimación:** [Puntos de historia o T-shirt: S/M/L/XL]

**Como** [rol: docente | secretaria],  
**quiero** [acción que desea realizar],  
**para** [beneficio o valor que obtiene].

#### Criterios de Aceptación

1. **Dado** [precondición],  
   **cuando** [acción del usuario],  
   **entonces** [resultado esperado].

2. **Dado** [precondición],  
   **cuando** [acción del usuario],  
   **entonces** [resultado esperado].

#### Notas
- [Restricciones aplicables: R-XX]
- [Dependencias con otras HU]
```

## Reglas para Generar HU

1. **Siempre** incluir trazabilidad a RF (obligatorio)
2. **Nunca** proponer funcionalidades fuera de los RF definidos en `docs/requirements.md`
3. **Siempre** verificar restricciones aplicables en `docs/requirements.md` sección Restricciones
4. **Un RF puede** mapearse a una o más HU
5. **Los criterios de aceptación** deben ser verificables y concretos
6. **Separar** HU por actor cuando el RF aplica a ambos roles
7. Respetar las **6 épicas** definidas en el proyecto

## Épicas del Proyecto

| Épica | Descripción | RFs |
|-------|-------------|-----|
| 1. Gestión de Usuarios y Acceso | Registro, login, asignación de roles | RF-01, RF-02, RF-03 |
| 2. Consulta de Disponibilidad | Calendario de disponibilidad | RF-04 |
| 3. Gestión de Salas | CRUD de salas y recursos | RF-05 a RF-09 |
| 4. Gestión de Reservas | Crear, cancelar, ajustar reservas | RF-10 a RF-13 |
| 5. Historial y Trazabilidad | Historial y auditoría | RF-14 a RF-16 |
| 6. Reportes | Reportes de uso | RF-17 a RF-20 |

## Ejemplo Completo

### HU-01: Registro de usuario con correo institucional

**Épica:** Gestión de Usuarios y Acceso  
**Trazabilidad:** RF-01, RF-03  
**Prioridad:** Alta  
**Estimación:** M

**Como** usuario de la universidad,  
**quiero** registrarme en el sistema usando mi correo institucional,  
**para** poder acceder a las funcionalidades de reserva de salas de mi facultad.

#### Criterios de Aceptación

1. **Dado** que soy un usuario no registrado,  
   **cuando** ingreso mi correo institucional, nombre y contraseña en el formulario de registro,  
   **entonces** el sistema crea mi cuenta y me asigna automáticamente el rol DOCENTE.

2. **Dado** que mi correo institucional está en la lista blanca de secretarias,  
   **cuando** completo el registro,  
   **entonces** el sistema me asigna automáticamente el rol SECRETARIA.

3. **Dado** que intento registrarme con un correo no institucional,  
   **cuando** envío el formulario,  
   **entonces** el sistema rechaza el registro y muestra un mensaje de error.

4. **Dado** que ya existe un usuario con mi correo,  
   **cuando** intento registrarme,  
   **entonces** el sistema indica que el correo ya está registrado.

#### Notas
- R-08: Rol docente como default
- R-09: Rol secretaria solo por lista blanca
- R-07: No se requiere rol administrador
