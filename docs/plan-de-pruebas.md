# Plan de Pruebas — Sistema de Reservas de Salas UAO

> **Versión:** 1.0 | **Fecha:** 2026-04-13  
> Cubre las 16 Historias de Usuario definidas en `docs/user-stories.md`.  
> Cada prueba indica rol requerido, pasos, dato de entrada y resultado esperado.

---

## Configuración Previa

| Ítem | Valor |
|------|-------|
| URL de la app | `https://<proyecto>.vercel.app` o `http://localhost:3000` |
| Dominio válido | `@uao.edu.co` |
| Franja horaria permitida | 7:00 AM – 9:30 PM |
| Correo secretaria de prueba | `Carlos.gamez@uao.edu.co` |
| Correo docente de prueba | `docente.prueba@uao.edu.co` |

---

## Épica 1 — Gestión de Usuarios y Acceso

### HU-01: Registro de usuario

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 1.1 | Registro exitoso como DOCENTE | Ir a `/register` → completar formulario → confirmar | Correo: `docente.prueba@uao.edu.co`, contraseña válida, facultad seleccionada | Cuenta creada, redirige a `/login` con mensaje de confirmación. Rol asignado: **DOCENTE** |
| 1.2 | Registro exitoso como SECRETARIA | Mismo flujo | Correo: `Carlos.gamez@uao.edu.co` (en lista blanca) | Cuenta creada. Rol asignado: **SECRETARIA** |
| 1.3 | Correo no institucional | Intentar registrar | Correo: `usuario@gmail.com` | ❌ Error: *"Solo se permiten correos institucionales (@uao.edu.co)"* |
| 1.4 | Correo ya registrado | Intentar registrar con correo existente | Correo ya en BD | ❌ Error: *"Este correo ya está registrado"* |
| 1.5 | Campos vacíos | Enviar formulario sin llenar campos | Formulario vacío | ❌ Mensajes de validación en cada campo faltante |
| 1.6 | Auditoría del registro | Registrar usuario exitosamente | Cualquier correo válido | Log de auditoría creado en BD con acción `REGISTRO_USUARIO` |

---

### HU-02: Inicio de sesión

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 2.1 | Login exitoso como DOCENTE | Ir a `/login` → ingresar credenciales | Correo y contraseña correctos | Redirige a dashboard. Menú muestra: **Mis Salas**, **Mis Reservas** |
| 2.2 | Login exitoso como SECRETARIA | Mismo flujo | Correo de secretaria | Redirige a dashboard. Menú muestra: **Gestión de Salas**, **Reservas**, **Reportes** |
| 2.3 | Contraseña incorrecta | Ingresar contraseña errónea | Correo válido + contraseña incorrecta | ❌ Mensaje genérico: *"Correo o contraseña incorrectos"* (no revela cuál falló) |
| 2.4 | Campos vacíos | Enviar login sin datos | Formulario vacío | ❌ Mensajes de validación |
| 2.5 | DOCENTE no ve Reportes | Iniciar sesión como docente | — | El menú **no** muestra la opción Reportes |
| 2.6 | DOCENTE no accede a /reportes | Ingresar manualmente `<URL>/reportes` | — | Redirige a `/reservas` |

---

## Épica 2 — Consulta de Disponibilidad

### HU-03: Visualizar disponibilidad de salas

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 3.1 | Ver salas habilitadas | Ir a `/salas` como DOCENTE | — | Solo aparecen salas con estado **Disponible** en el selector de reservas |
| 3.2 | Sala deshabilitada oculta en reserva | Intentar crear reserva | — | El dropdown de salas **no** muestra salas deshabilitadas |
| 3.3 | Solo salas de la facultad | Iniciar sesión con usuario de Facultad A | — | Solo aparecen salas de esa facultad |

---

## Épica 3 — Gestión de Salas

### HU-04: Crear sala *(solo SECRETARIA)*

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 4.1 | Crear sala exitosamente | Gestión de Salas → Nueva Sala → completar → confirmar | Nombre: `Sala B-201`, Capacidad: `20` | Sala creada, aparece en listado, estado **Disponible** por defecto |
| 4.2 | Nombre duplicado | Crear sala con nombre ya existente en la facultad | Mismo nombre de sala existente | ❌ Error: *"Ya existe una sala con ese nombre en esta facultad"* |
| 4.3 | Capacidad fuera de rango | Ingresar capacidad inválida | Capacidad: `1` o `101` | ❌ Error: *"La capacidad debe estar entre 2 y 100"* |
| 4.4 | DOCENTE no puede crear | Iniciar sesión como docente → intentar POST `/api/rooms` | — | ❌ 403 Forbidden |

---

### HU-05: Editar sala *(solo SECRETARIA)*

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 5.1 | Editar exitosamente | Seleccionar sala → Editar → cambiar datos → guardar | Nuevo nombre o capacidad válidos | Sala actualizada, cambios reflejados en listado |
| 5.2 | Nombre duplicado al editar | Cambiar nombre por uno ya existente | Nombre de otra sala de la facultad | ❌ Error: *"Ya existe una sala con ese nombre"* |
| 5.3 | Capacidad inválida al editar | Cambiar capacidad a `0` | Capacidad: `0` | ❌ Error de validación |

---

### HU-06: Cambiar estado de sala *(solo SECRETARIA)*

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 6.1 | Deshabilitar sala sin reservas | Click en botón deshabilitar | Sala sin reservas futuras | Estado cambia a **Deshabilitada**. La sala desaparece del selector de reservas |
| 6.2 | Deshabilitar sala con reservas futuras | Deshabilitar sala que tiene reservas confirmadas a futuro | Sala con ≥1 reserva futura | Estado cambia a **Deshabilitada** + todas las reservas futuras pasan a **CANCELADA** automáticamente |
| 6.3 | Habilitar sala | Click en botón habilitar | Sala deshabilitada | Estado cambia a **Disponible**, vuelve a aparecer en el selector |

---

### HU-07: Agregar recursos tecnológicos *(solo SECRETARIA)*

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 7.1 | Agregar recurso | Sala → icono Recursos → seleccionar recurso → Agregar | Proyector | Recurso aparece en la lista de la sala |
| 7.2 | Recurso ya asignado | Intentar agregar mismo recurso dos veces | Mismo recurso | ❌ Error: *"Este recurso ya está asignado a esta sala"* (o no aparece en el dropdown) |

---

### HU-08: Retirar recursos tecnológicos *(solo SECRETARIA)*

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 8.1 | Confirmar antes de retirar | Click en eliminar recurso | — | Aparece diálogo: *"¿Retirar el recurso X de esta sala?"* |
| 8.2 | Retirar recurso | Confirmar el diálogo | — | Recurso desaparece de la lista de la sala |

---

## Épica 4 — Gestión de Reservas

### HU-09: Crear reserva

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 9.1 | Reserva exitosa | Nueva Reserva → completar → confirmar | Sala habilitada, fecha futura, 10:00–12:00 | Reserva creada con estado **CONFIRMADA** |
| 9.2 | Solapamiento total | Crear reserva en horario ya ocupado | Misma sala, misma fecha, 10:00–12:00 | ❌ Error: *"Ya existe una reserva confirmada en ese horario"* |
| 9.3 | Solapamiento parcial | Reserva que se cruza parcialmente | Misma sala, misma fecha, 11:00–13:00 | ❌ Error de conflicto de horario |
| 9.4 | Fuera de franja horaria | Hora inicio antes de 7:00 o fin después de 21:30 | Hora inicio: `06:00` | ❌ Error: *"La hora de inicio no puede ser antes de las 7:00 AM"* |
| 9.5 | Hora fin ≤ hora inicio | Invertir horario | Inicio: `14:00`, Fin: `10:00` | ❌ Error: *"La hora de inicio debe ser anterior a la hora de fin"* |
| 9.6 | Fecha pasada | Intentar reservar en el pasado | Fecha de ayer | ❌ Error: *"No se pueden crear reservas en fechas pasadas"* |
| 9.7 | Sala de otra facultad | Intentar via API con salaId de otra facultad | — | ❌ 400: *"No puede reservar salas de otra facultad"* |

---

### HU-10: Cancelar reserva

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 10.1 | DOCENTE cancela su reserva | Mis Reservas → seleccionar reserva CONFIRMADA → Cancelar | — | Diálogo de confirmación → al confirmar, estado pasa a **CANCELADA** |
| 10.2 | DOCENTE no puede cancelar reserva ajena | Intentar cancelar via API una reserva de otro usuario | reservaId de otro usuario | ❌ 400: *"Solo puede cancelar sus propias reservas"* |
| 10.3 | SECRETARIA cancela cualquier reserva | Reservas → seleccionar reserva ajena → Cancelar | — | Cancelación exitosa |
| 10.4 | Reserva ya cancelada | Verificar UI en reserva con estado CANCELADA | — | Botón **Cancelar** no aparece |

---

### HU-11: Ajustar reserva *(solo SECRETARIA)*

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 11.1 | Ajuste exitoso | Reservas → reserva CONFIRMADA → Ajustar → cambiar hora → guardar | Nueva hora sin conflicto | Reserva actualizada con los nuevos datos |
| 11.2 | Ajuste con conflicto | Cambiar horario a uno ya ocupado | Hora de otra reserva existente | ❌ Error: *"El nuevo horario se solapa con otra reserva confirmada"* |
| 11.3 | Ajustar fuera de franja | Cambiar hora fin a 22:00 | Fin: `22:00` | ❌ Error: *"La hora de fin no puede ser después de las 9:30 PM"* |
| 11.4 | Ajustar reserva cancelada | Intentar ajustar via API una reserva CANCELADA | — | ❌ 400: *"No se puede ajustar una reserva cancelada"* |
| 11.5 | DOCENTE no puede ajustar | Verificar UI como docente | — | Botón **Ajustar** no aparece |

---

## Épica 5 — Historial y Trazabilidad

### HU-12: Historial del docente

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 12.1 | Ver todas sus reservas | Mis Reservas (sin filtro) | — | Lista con reservas CONFIRMADAS y CANCELADAS propias ordenadas por fecha desc |
| 12.2 | Filtrar por estado | Click en tab "Activas" o "Historial" | — | Solo muestra reservas del estado seleccionado |
| 12.3 | No ve reservas ajenas | Verificar que no aparecen reservas de otros usuarios | — | Solo reservas del docente autenticado |

---

### HU-13: Historial completo de la facultad *(solo SECRETARIA)*

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 13.1 | Ver todas las reservas | Reservas como SECRETARIA (sin filtros) | — | Lista con reservas de todos los usuarios de la facultad |
| 13.2 | Filtrar por sala | Abrir panel Filtros → seleccionar sala | Sala específica | Solo reservas de esa sala |
| 13.3 | Filtrar por rango de fechas | Ingresar Desde / Hasta | Rango válido | Solo reservas dentro del rango |
| 13.4 | Limpiar filtros | Click en "Limpiar filtros" | — | Vuelve a mostrar todas las reservas |
| 13.5 | Solo su facultad | Verificar via API | — | No aparecen reservas de salas de otra facultad |

---

## Épica 6 — Reportes *(solo SECRETARIA)*

### HU-14: Reporte por número de reservas

| # | Escenario | Pasos | Dato de entrada | Resultado esperado |
|---|-----------|-------|-----------------|-------------------|
| 14.1 | Generar reporte sin filtro de fecha | Reportes → "Por N.º de Reservas" → Generar | Sin fechas | Tabla con todas las salas y su conteo de reservas (confirmadas + canceladas), ordenada de mayor a menor |
| 14.2 | Generar con rango de fechas | Mismo flujo + fechas | Desde: `2026-01-01`, Hasta: `2026-04-13` | Solo reservas dentro del rango |
| 14.3 | Fecha fin < fecha inicio | Ingresar rango inválido | Fin anterior a inicio | ❌ Error: *"La fecha de fin debe ser posterior a la fecha de inicio"* |
| 14.4 | Sin datos en el rango | Rango sin reservas | Fechas futuras sin reservas | Mensaje: *"No hay datos disponibles"* |

---

### HU-15: Reporte por horas reservadas

| # | Escenario | Pasos | Resultado esperado |
|---|-----------|-------|--------------------|
| 15.1 | Generar reporte | Reportes → "Por Horas Reservadas" → Generar | Tabla con sala y total de horas (solo CONFIRMADAS), ordenada de mayor a menor |
| 15.2 | Cálculo correcto | Reserva de 2 h en Sala A | Sala A muestra `2.00 h` |

---

### HU-16: Reporte por usuario

| # | Escenario | Pasos | Resultado esperado |
|---|-----------|-------|--------------------|
| 16.1 | Generar reporte | Reportes → "Por Usuario" → Generar | Tabla con nombre, correo, rol, confirmadas, canceladas y total por usuario |
| 16.2 | Solo su facultad | Verificar datos | No aparecen usuarios de otras facultades |

---

## Pruebas de Seguridad Transversales

| # | Prueba | Pasos | Resultado esperado |
|---|--------|-------|--------------------|
| S1 | Acceso sin autenticación | Navegar a `/reservas` sin sesión activa | Redirige a `/login` |
| S2 | DOCENTE accede a `/reportes` | Ingresar la URL manualmente | Redirige a `/reservas` |
| S3 | DOCENTE llama API de crear sala | `POST /api/rooms` como docente | ❌ 403 Forbidden |
| S4 | DOCENTE llama API de ajustar reserva | `PUT /api/reservations/1` como docente | ❌ 403 Forbidden |
| S5 | Usuario accede a sala de otra facultad | `PUT /api/rooms/X` con salaId de otra facultad | ❌ 400 o 403 |

---

## Prueba de Auditoría (RF-16 transversal)

Después de realizar cualquiera de las acciones de la siguiente tabla, verificar en la BD (`log_auditoria`) que existe el registro correspondiente:

| Acción | Acción esperada en log |
|--------|----------------------|
| Registro de usuario | `REGISTRO_USUARIO` |
| Crear sala | `CREAR_SALA` |
| Editar sala | `EDITAR_SALA` |
| Cambiar estado de sala | `CAMBIAR_ESTADO_SALA` |
| Agregar recurso | `AGREGAR_RECURSO` |
| Retirar recurso | `RETIRAR_RECURSO` |
| Crear reserva | `CREAR_RESERVA` |
| Cancelar reserva | `CANCELAR_RESERVA` |
| Ajustar reserva | `AJUSTAR_RESERVA` |

---

## Checklist de Entrega

```
[ ] HU-01  Registro con dominio @uao.edu.co y asignación automática de rol
[ ] HU-02  Login con interfaz diferenciada por rol
[ ] HU-03  Salas deshabilitadas no aparecen en calendario/reserva
[ ] HU-04  Crear sala con validaciones (nombre único, capacidad 2-100)
[ ] HU-05  Editar sala con validaciones
[ ] HU-06  Deshabilitar sala cancela reservas futuras automáticamente
[ ] HU-07  Agregar recurso sin duplicados
[ ] HU-08  Retirar recurso con confirmación previa
[ ] HU-09  Crear reserva: validar franja, solapamiento, fecha pasada, facultad
[ ] HU-10  Cancelar reserva: permisos por rol, conservar en historial
[ ] HU-11  Ajustar reserva: solo SECRETARIA, validar conflictos y franja
[ ] HU-12  Historial docente: solo sus reservas, filtros por estado
[ ] HU-13  Historial secretaria: todas las de la facultad, filtros por sala y fecha
[ ] HU-14  Reporte por número de reservas con filtro de fechas
[ ] HU-15  Reporte por horas reservadas con filtro de fechas
[ ] HU-16  Reporte por usuario con filtro de fechas
[ ] RF-16  Auditoría presente en todas las acciones mutantes
[ ] S1-S5  Pruebas de seguridad y control de acceso por rol
```
