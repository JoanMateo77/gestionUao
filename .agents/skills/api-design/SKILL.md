---
name: api-design
description: Diseña endpoints REST con validaciones, seguridad RBAC y trazabilidad para el sistema de reservas
---

# Skill: Diseño de API REST

## Cuándo usar este skill
- Diseñar nuevos endpoints
- Documentar contratos de API
- Definir validaciones y middleware

## Referencia

Ver endpoints base en `docs/architecture.md`, sección "Endpoints REST Principales"

## Formato de Documentación de Endpoint

```markdown
### [MÉTODO] /api/[recurso]

**RF:** RF-XX  
**Roles:** Docente | Secretaria  
**Autenticación:** Sí (JWT Bearer)

#### Request
| Param | Tipo | Ubicación | Obligatorio | Validación |
|-------|------|-----------|-------------|------------|
| campo | string | body | Sí | max 100 chars |

#### Response (200)
```json
{
  "id": 1,
  "campo": "valor"
}
```

#### Errores
| Código | Descripción |
|--------|-------------|
| 400 | Validación fallida |
| 401 | No autenticado |
| 403 | Rol no autorizado |
| 409 | Conflicto de horario |
```

## Convenciones REST

| Convención | Ejemplo |
|-----------|---------|
| Sustantivos en plural | `/api/rooms`, `/api/reservations` |
| Acciones como sub-recurso | `/api/reservations/:id/cancel` |
| Filtros como query params | `?from=2026-03-01&to=2026-03-31` |
| Paginación | `?page=1&limit=20` |
| Respuestas envolver en objeto | `{ data: [], meta: { total, page } }` |

## Middleware Pipeline

```
Request → Auth(JWT) → RBAC(rol) → Validate(schema) → Controller → Audit(log) → Response
```

### Middleware de Autorización por Ruta

| Ruta | Docente | Secretaria |
|------|---------|------------|
| GET /api/rooms | ✅ | ✅ |
| POST /api/rooms | ❌ | ✅ |
| PUT /api/rooms/:id | ❌ | ✅ |
| POST /api/reservations | ✅ | ✅ |
| PATCH /api/reservations/:id | ❌ | ✅ (ajustar) |
| PATCH /api/reservations/:id/cancel | ✅ (propias) | ✅ (todas) |
| GET /api/reports/* | ❌ | ✅ |

## Validaciones de Negocio Obligatorias

| Endpoint | Validación | Restricción |
|----------|-----------|-------------|
| POST /api/reservations | hora_inicio >= 07:00, hora_fin <= 21:30 | R-02 |
| POST /api/reservations | No solapamiento con reservas existentes | R-03, RF-11 |
| POST /api/reservations | Sala debe estar habilitada | RF-07 |
| POST /api/reservations | Sala pertenece a facultad del usuario | Dominio |
| PATCH /cancel | No se elimina, cambia estado a CANCELADA | R-06 |
| * | Log de auditoría en cada mutación | R-11 |
