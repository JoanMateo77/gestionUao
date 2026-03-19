# Casos de Prueba — Sistema de Reservas de Salas de Reuniones

> **Aplicación:** http://localhost:3000
> **Base de datos:** Neon PostgreSQL
> **Fecha:** Marzo 2026

---

## Datos de Prueba Requeridos

Antes de ejecutar los casos, registrar los siguientes usuarios:

| Usuario | Correo | Contraseña | Rol Esperado |
|---------|--------|------------|--------------|
| Secretaria | `secretaria.ingenieria@uao.edu.co` | `test1234` | SECRETARIA |
| Docente 1 | `docente1@gmail.com` | `test1234` | DOCENTE |
| Docente 2 | `docente2@gmail.com` | `test1234` | DOCENTE |

> La secretaria obtiene su rol porque su correo está en la lista blanca del sistema.

---

## CP-01 — Registro de Usuario (HU-01)

### CP-01-01: Registro exitoso como Docente

| Campo | Valor |
|-------|-------|
| **Precondición** | Usuario no registrado |
| **Pasos** | 1. Ir a `/login` → pestaña "Registrarse" <br> 2. Ingresar nombre: `Docente Prueba` <br> 3. Correo: `docente1@gmail.com` <br> 4. Seleccionar facultad <br> 5. Contraseña: `test1234` / Confirmar: `test1234` <br> 6. Clic en "Crear Cuenta" |
| **Resultado Esperado** | Redirige a login con mensaje "Cuenta creada exitosamente" y el usuario queda con rol DOCENTE |
| **Estado** | ⬜ Pendiente |

---

### CP-01-02: Registro exitoso como Secretaria (lista blanca)

| Campo | Valor |
|-------|-------|
| **Precondición** | Correo `secretaria.ingenieria@uao.edu.co` en tabla `lista_blanca` |
| **Pasos** | 1. Registrarse con correo `secretaria.ingenieria@uao.edu.co` |
| **Resultado Esperado** | Cuenta creada con rol SECRETARIA |
| **Estado** | ⬜ Pendiente |

---

### CP-01-03: Correo ya registrado

| Campo | Valor |
|-------|-------|
| **Precondición** | `docente1@gmail.com` ya está registrado |
| **Pasos** | 1. Intentar registrar nuevamente con `docente1@gmail.com` |
| **Resultado Esperado** | Error: "Este correo ya está registrado" |
| **Estado** | ⬜ Pendiente |

---

### CP-01-04: Contraseñas no coinciden

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Ingresar contraseña `abc123` y confirmación `xyz999` |
| **Resultado Esperado** | Error: "Las contraseñas no coinciden" sin crear la cuenta |
| **Estado** | ⬜ Pendiente |

---

### CP-01-05: Campos obligatorios vacíos

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Dejar el campo nombre vacío y enviar el formulario |
| **Resultado Esperado** | El formulario no se envía, validación HTML/Zod activa |
| **Estado** | ⬜ Pendiente |

---

## CP-02 — Inicio de Sesión (HU-02)

### CP-02-01: Login exitoso como Docente

| Campo | Valor |
|-------|-------|
| **Precondición** | `docente1@gmail.com` registrado |
| **Pasos** | 1. Ir a `/login` <br> 2. Correo: `docente1@gmail.com` / Contraseña: `test1234` <br> 3. Clic "Iniciar Sesión" |
| **Resultado Esperado** | Redirige a `/reservas`. Menú muestra: Reservas, Historial. NO muestra: Gestión de Salas |
| **Estado** | ⬜ Pendiente |

---

### CP-02-02: Login exitoso como Secretaria

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Login con `secretaria.ingenieria@uao.edu.co` |
| **Resultado Esperado** | Redirige al dashboard. Menú muestra: Salas, Reservas, Historial |
| **Estado** | ⬜ Pendiente |

---

### CP-02-03: Credenciales incorrectas

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Correo válido + contraseña incorrecta |
| **Resultado Esperado** | Error: "Credenciales inválidas", sin revelar cuál campo falla |
| **Estado** | ⬜ Pendiente |

---

### CP-02-04: Campos vacíos en login

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Enviar formulario con correo o contraseña vacíos |
| **Resultado Esperado** | Validación HTML impide el envío |
| **Estado** | ⬜ Pendiente |

---

## CP-04 — Crear Sala (HU-04) — Solo Secretaria

### CP-04-01: Crear sala exitosamente

| Campo | Valor |
|-------|-------|
| **Precondición** | Sesión activa como SECRETARIA |
| **Pasos** | 1. Ir a `/salas` <br> 2. Clic en "Nueva Sala" <br> 3. Nombre: `Sala A101` / Ubicación: `Bloque A, Piso 1` / Capacidad: `20` <br> 4. Guardar |
| **Resultado Esperado** | Sala aparece en la lista con estado Habilitada |
| **Estado** | ⬜ Pendiente |

---

### CP-04-02: Capacidad fuera de rango (< 2)

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Crear sala con capacidad `1` |
| **Resultado Esperado** | Error: "La capacidad debe estar entre 2 y 100" |
| **Estado** | ⬜ Pendiente |

---

### CP-04-03: Capacidad fuera de rango (> 100)

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Crear sala con capacidad `101` |
| **Resultado Esperado** | Error: "La capacidad debe estar entre 2 y 100" |
| **Estado** | ⬜ Pendiente |

---

### CP-04-04: Nombre de sala duplicado en la misma facultad

| Campo | Valor |
|-------|-------|
| **Precondición** | Ya existe `Sala A101` en la facultad |
| **Pasos** | 1. Intentar crear otra sala con nombre `Sala A101` |
| **Resultado Esperado** | Error indicando que ya existe una sala con ese nombre |
| **Estado** | ⬜ Pendiente |

---

### CP-04-05: Docente no puede crear sala

| Campo | Valor |
|-------|-------|
| **Precondición** | Sesión activa como DOCENTE |
| **Pasos** | 1. Intentar acceder a `/salas` |
| **Resultado Esperado** | No ve la opción "Nueva Sala" o es redirigido |
| **Estado** | ⬜ Pendiente |

---

## CP-05 — Editar Sala (HU-05)

### CP-05-01: Editar sala exitosamente

| Campo | Valor |
|-------|-------|
| **Precondición** | `Sala A101` existe |
| **Pasos** | 1. Ir a `/salas` <br> 2. Clic en editar sobre `Sala A101` <br> 3. Cambiar capacidad a `30` <br> 4. Guardar |
| **Resultado Esperado** | Sala actualizada con capacidad 30 |
| **Estado** | ⬜ Pendiente |

---

### CP-05-02: Nombre duplicado al editar

| Campo | Valor |
|-------|-------|
| **Precondición** | Existen `Sala A101` y `Sala B202` |
| **Pasos** | 1. Editar `Sala B202` y cambiar nombre a `Sala A101` |
| **Resultado Esperado** | Error: nombre duplicado |
| **Estado** | ⬜ Pendiente |

---

## CP-06 — Cambiar Estado de Sala (HU-06)

### CP-06-01: Deshabilitar sala sin reservas activas

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Sala sin reservas futuras → toggle a Deshabilitada |
| **Resultado Esperado** | Sala pasa a estado Deshabilitada e invisible en calendario |
| **Estado** | ⬜ Pendiente |

---

### CP-06-02: Deshabilitar sala con reservas activas

| Campo | Valor |
|-------|-------|
| **Precondición** | `Sala A101` tiene una reserva confirmada a futuro |
| **Pasos** | 1. Intentar deshabilitar `Sala A101` |
| **Resultado Esperado** | Sistema muestra advertencia de reservas afectadas y pide confirmación |
| **Estado** | ⬜ Pendiente |

---

### CP-06-03: Habilitar sala deshabilitada

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Sala deshabilitada → toggle a Habilitada |
| **Resultado Esperado** | Sala vuelve a estado Habilitada y aparece en el calendario |
| **Estado** | ⬜ Pendiente |

---

## CP-07 — Agregar Recursos (HU-07)

### CP-07-01: Agregar recurso a sala

| Campo | Valor |
|-------|-------|
| **Precondición** | `Sala A101` existe, sesión como SECRETARIA |
| **Pasos** | 1. Ir a recursos de `Sala A101` <br> 2. Agregar "Proyector" |
| **Resultado Esperado** | Proyector aparece en la lista de recursos de la sala |
| **Estado** | ⬜ Pendiente |

---

### CP-07-02: Agregar recurso duplicado

| Campo | Valor |
|-------|-------|
| **Precondición** | `Sala A101` ya tiene "Proyector" |
| **Pasos** | 1. Intentar agregar "Proyector" nuevamente |
| **Resultado Esperado** | Error: "Este recurso ya está asignado a la sala" |
| **Estado** | ⬜ Pendiente |

---

## CP-08 — Retirar Recursos (HU-08)

### CP-08-01: Retirar recurso con confirmación

| Campo | Valor |
|-------|-------|
| **Precondición** | `Sala A101` tiene "Proyector" |
| **Pasos** | 1. Clic en retirar "Proyector" <br> 2. Confirmar la acción |
| **Resultado Esperado** | Proyector eliminado de la lista de la sala |
| **Estado** | ⬜ Pendiente |

---

## CP-09 — Crear Reserva (HU-09)

### CP-09-01: Reserva exitosa

| Campo | Valor |
|-------|-------|
| **Precondición** | `Sala A101` habilitada, sesión como DOCENTE |
| **Pasos** | 1. Ir a `/reservas` <br> 2. Crear reserva: Sala A101, mañana, 9:00 – 11:00, motivo "Reunión de equipo" |
| **Resultado Esperado** | Reserva creada con estado CONFIRMADA y aparece en la lista |
| **Estado** | ⬜ Pendiente |

---

### CP-09-02: Reserva fuera de franja horaria — antes de las 7:00

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Intentar reservar de 6:00 a 8:00 |
| **Resultado Esperado** | Error: "La hora de inicio no puede ser antes de las 07:00" |
| **Estado** | ⬜ Pendiente |

---

### CP-09-03: Reserva fuera de franja horaria — después de las 21:30

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Intentar reservar de 20:00 a 22:00 |
| **Resultado Esperado** | Error: "La hora de fin no puede ser después de las 21:30" |
| **Estado** | ⬜ Pendiente |

---

### CP-09-04: Solapamiento total de horario (R-03)

| Campo | Valor |
|-------|-------|
| **Precondición** | Existe reserva confirmada en Sala A101 de 9:00 a 11:00 |
| **Pasos** | 1. Intentar reservar Sala A101 de 9:00 a 11:00 el mismo día |
| **Resultado Esperado** | Error: "Ya existe una reserva confirmada en ese horario" |
| **Estado** | ⬜ Pendiente |

---

### CP-09-05: Solapamiento parcial de horario

| Campo | Valor |
|-------|-------|
| **Precondición** | Existe reserva de 9:00 a 11:00 |
| **Pasos** | 1. Intentar reservar de 10:00 a 12:00 en la misma sala |
| **Resultado Esperado** | Error de conflicto de horario |
| **Estado** | ⬜ Pendiente |

---

### CP-09-06: Hora fin menor o igual a hora inicio

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Hora inicio: 11:00 / Hora fin: 09:00 |
| **Resultado Esperado** | Error: "La hora de fin debe ser posterior a la hora de inicio" |
| **Estado** | ⬜ Pendiente |

---

### CP-09-07: Reservas en salas de otras facultades

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. DOCENTE intenta reservar sala de otra facultad vía API |
| **Resultado Esperado** | Error 403: "No puede reservar salas de otra facultad" |
| **Estado** | ⬜ Pendiente |

---

## CP-10 — Cancelar Reserva (HU-10)

### CP-10-01: Docente cancela su propia reserva

| Campo | Valor |
|-------|-------|
| **Precondición** | DOCENTE tiene reserva con estado CONFIRMADA |
| **Pasos** | 1. Ir a `/reservas` <br> 2. Clic en "Cancelar" sobre su reserva <br> 3. Confirmar |
| **Resultado Esperado** | Reserva pasa a estado CANCELADA y permanece en el historial (no se elimina) |
| **Estado** | ⬜ Pendiente |

---

### CP-10-02: Docente no puede cancelar reserva de otro usuario

| Campo | Valor |
|-------|-------|
| **Precondición** | DOCENTE 2 tiene una reserva confirmada |
| **Pasos** | 1. DOCENTE 1 intenta cancelar reserva de DOCENTE 2 vía API |
| **Resultado Esperado** | Error 403: "Solo puede cancelar sus propias reservas" |
| **Estado** | ⬜ Pendiente |

---

### CP-10-03: Secretaria cancela reserva de cualquier usuario de la facultad

| Campo | Valor |
|-------|-------|
| **Precondición** | DOCENTE 1 tiene reserva confirmada |
| **Pasos** | 1. SECRETARIA cancela la reserva de DOCENTE 1 |
| **Resultado Esperado** | Reserva cancelada exitosamente |
| **Estado** | ⬜ Pendiente |

---

### CP-10-04: Cancelar reserva ya cancelada

| Campo | Valor |
|-------|-------|
| **Precondición** | Reserva ya tiene estado CANCELADA |
| **Pasos** | 1. Intentar cancelar nuevamente |
| **Resultado Esperado** | Error: "La reserva ya está cancelada" |
| **Estado** | ⬜ Pendiente |

---

## CP-RF16 — Trazabilidad / Auditoría (RF-16)

### CP-RF16-01: Verificar log de registro

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Registrar un usuario nuevo <br> 2. Abrir Prisma Studio (`npm run db:studio`) <br> 3. Revisar tabla `log_auditoria` |
| **Resultado Esperado** | Existe un registro con `accion = REGISTRO_USUARIO` para el usuario creado |
| **Estado** | ⬜ Pendiente |

---

### CP-RF16-02: Verificar log de creación de sala

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Crear sala como SECRETARIA <br> 2. Revisar `log_auditoria` |
| **Resultado Esperado** | Registro con `accion = CREAR_SALA` y `datos_nuevos` con info de la sala |
| **Estado** | ⬜ Pendiente |

---

### CP-RF16-03: Verificar log de reserva

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Crear reserva <br> 2. Revisar `log_auditoria` |
| **Resultado Esperado** | Registro con `accion = CREAR_RESERVA` |
| **Estado** | ⬜ Pendiente |

---

### CP-RF16-04: Verificar log de cancelación

| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Cancelar reserva <br> 2. Revisar `log_auditoria` |
| **Resultado Esperado** | Registro con `accion = CANCELAR_RESERVA`, `datos_anteriores = CONFIRMADA`, `datos_nuevos = CANCELADA` |
| **Estado** | ⬜ Pendiente |

---

## Resumen de Cobertura

| HU | Casos de Prueba | CPs |
|----|----------------|-----|
| HU-01 Registro | 5 | CP-01-01 al CP-01-05 |
| HU-02 Login | 4 | CP-02-01 al CP-02-04 |
| HU-04 Crear sala | 5 | CP-04-01 al CP-04-05 |
| HU-05 Editar sala | 2 | CP-05-01 al CP-05-02 |
| HU-06 Estado sala | 3 | CP-06-01 al CP-06-03 |
| HU-07 Agregar recurso | 2 | CP-07-01 al CP-07-02 |
| HU-08 Retirar recurso | 1 | CP-08-01 |
| HU-09 Crear reserva | 7 | CP-09-01 al CP-09-07 |
| HU-10 Cancelar reserva | 4 | CP-10-01 al CP-10-04 |
| RF-16 Auditoría | 4 | CP-RF16-01 al CP-RF16-04 |
| **Total** | **37** | |

---

## Leyenda de Estados

| Símbolo | Significado |
|---------|-------------|
| ⬜ | Pendiente de ejecutar |
| ✅ | Pasó exitosamente |
| ❌ | Falló |
| ⚠️ | Comportamiento parcial |
