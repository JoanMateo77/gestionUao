# Sistema Web de Reservas de Salas de Reuniones por Facultad

> **Asignatura:** Ingeniería de Software 1  
> **Facultad:** Ingeniería y Ciencias Básicas — Programa de Ingeniería Informática  
> **Creado:** Enero 19, 2026 | **Modificado:** Enero 29, 2026

## Contexto

Las facultades universitarias cuentan con salas de reuniones exclusivas para actividades administrativas y académicas (consejos de facultad, comités curriculares, acreditación, etc.). **No se usan para clases.**

### Problema Actual
- Gestión manual vía Google Calendar por las secretarias
- Docentes sin acceso directo a disponibilidad ni creación de reservas
- Solicitudes por email, mensajes o comunicación verbal
- Sin registro estructurado ni auditoría

### Solución
Sistema web que reemplaza el calendario de Google, permitiendo consulta de disponibilidad en tiempo real, reservas directas y gestión automatizada sin intermediación manual.

---

## Roles del Sistema

| Rol | Asignación | Permisos Clave |
|-----|-----------|----------------|
| **Docente** | Automático al registrarse | Consultar disponibilidad, crear/cancelar reservas propias, ver historial propio |
| **Secretaria** | Automático si correo está en lista blanca | Todo lo del docente + CRUD salas, ajustar reservas, ver todas las reservas, generar reportes |

> ⚠️ **NO existe rol administrador.** Los roles se asignan automáticamente.

---

## Reglas de Negocio

1. Salas **solo para reuniones**, no para clases
2. Reservas solo entre **7:00 AM y 9:30 PM**
3. **No se permiten reservas simultáneas** de una misma sala
4. Disponibilidad se valida automáticamente al crear reserva
5. Reserva confirmada **bloquea la sala** para otros usuarios
6. Reservas **nunca se eliminan**, solo se cancelan (historial permanente)
7. **Todas las acciones** quedan registradas para auditoría

---

## Hitos del Proyecto

| Semana | Fecha | Entregable |
|--------|-------|------------|
| 6 | 02-05/03/2026 | HU, Casos de Uso, prototipos UI, modelo lógico BD, planeación |
| 11 | 13-16/04/2026 | Diagramas Secuencia/Clases, arquitectura, prototipo Backend+Frontend, pruebas backend |
| 14-15 | 07-11/05/2026 | Seguimiento + plan de pruebas inicial |
| 17 | 25-28/05/2026 | Prototipo final + documentación completa |
