# Historias de Usuario — Sistema de Reservas de Salas de Reuniones

> **Principio de diseño UI:** Las funcionalidades que un rol no puede usar se **ocultan** de la interfaz.  
> No se muestran mensajes de "acceso restringido"; el menú y las vistas solo presentan las opciones permitidas para cada rol.

> **RF-16 (Trazabilidad)** es un requisito transversal. Se implementa como escenario de criterio de aceptación en cada HU que modifica datos del sistema.

---

## Matriz de Trazabilidad Resumida

| HU | Título | RF | Restricciones |
|----|--------|----|---------------|
| HU-01 | Registro de usuario | RF-01, RF-03 | R-07, R-08, R-09 |
| HU-02 | Inicio de sesión | RF-02 | R-10 |
| HU-03 | Visualizar disponibilidad | RF-04 | R-01 |
| HU-04 | Crear sala | RF-05, RF-16 | R-01 |
| HU-05 | Editar sala | RF-06, RF-16 | — |
| HU-06 | Cambiar estado de sala | RF-07, RF-16 | R-05 |
| HU-07 | Agregar recursos tecnológicos | RF-08, RF-16 | — |
| HU-08 | Retirar recursos tecnológicos | RF-09, RF-16 | — |
| HU-09 | Crear reserva | RF-10, RF-11, RF-16 | R-02, R-03, R-04, R-05 |
| HU-10 | Cancelar reserva | RF-12, RF-16 | R-06 |
| HU-11 | Ajustar reserva | RF-13, RF-16 | R-02, R-03, R-06 |
| HU-12 | Historial de reservas del docente | RF-14 | — |
| HU-13 | Historial completo de la facultad | RF-15 | — |
| HU-14 | Reporte por número de reservas | RF-17, RF-20 | — |
| HU-15 | Reporte por horas reservadas | RF-18, RF-20 | — |
| HU-16 | Reporte por usuario | RF-19, RF-20 | — |

---

# Épica 1: Gestión de Usuarios y Acceso al Sistema

**Título:** Gestión de Usuarios y Acceso al Sistema

**Usuario(s):** Docente, Secretaria de Facultad

**Descripción:** Permitir a los usuarios de la universidad registrarse e ingresar al sistema mediante correo institucional, con asignación automática de roles, para garantizar un acceso controlado y sin gestión administrativa manual.

| HU Relacionadas | |
|---|---|
| HU-01 | Registro de usuario con correo institucional |
| HU-02 | Inicio de sesión en el sistema |

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-01 |
| **Título** | Registro de usuario con correo institucional |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Moderado |
| **Estimación** | 5 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como usuario de la universidad, quiero registrarme en el sistema usando mi correo institucional e indicando mi facultad, para poder acceder a las funcionalidades de consulta y reservas de salas de reuniones.

### Criterios de Aceptación

**Escenario 1: Registro exitoso con rol docente**  
**Given** que un usuario no registrado accede a la pantalla de registro  
**When** ingresa su nombre completo, correo institucional, contraseña y selecciona su facultad, y confirma el registro  
**Then** el sistema crea la cuenta, le asigna automáticamente el rol DOCENTE y lo redirige a la pantalla de inicio de sesión con un mensaje de confirmación.

**Escenario 2: Registro exitoso con rol secretaria (lista blanca)**  
**Given** que un usuario no registrado accede a la pantalla de registro y su correo institucional se encuentra en la lista blanca de secretarias autorizadas  
**When** completa el formulario de registro con datos válidos y confirma  
**Then** el sistema crea la cuenta y le asigna automáticamente el rol SECRETARIA, con acceso a las funcionalidades de gestión de salas y reportes.

**Escenario 3: Correo no institucional**  
**Given** que un usuario ingresa un correo electrónico que no pertenece al dominio institucional  
**When** intenta enviar el formulario de registro  
**Then** el sistema rechaza el registro y muestra un mensaje indicando que solo se permiten correos institucionales.

**Escenario 4: Correo ya registrado**  
**Given** que ya existe una cuenta registrada con un correo institucional específico  
**When** otro usuario intenta registrarse con ese mismo correo  
**Then** el sistema rechaza el registro y muestra un mensaje indicando que el correo ya se encuentra registrado en el sistema.

**Escenario 5: Datos incompletos**  
**Given** que el usuario deja campos obligatorios vacíos (nombre, correo, contraseña o facultad)  
**When** intenta enviar el formulario de registro  
**Then** el sistema muestra mensajes de validación en los campos faltantes y no permite completar el registro.

**Escenario 6: Trazabilidad del registro**  
**Given** que un usuario completa el registro exitosamente  
**When** el sistema finaliza el proceso de creación de cuenta  
**Then** se registra en el log de auditoría la acción de registro, el correo del usuario, el rol asignado, la fecha y la hora (RF-16).

**Escenario 7: Cumplimiento de atributos de calidad**  
**Given** que un usuario interactúa con la pantalla de registro  
**When** realiza cualquier acción (ingresar datos o confirmar registro)  
**Then** el sistema responde en un tiempo razonable sin degradar el desempeño (rendimiento), muestra mensajes de error claros ante validaciones fallidas (usabilidad), protege la contraseña mediante hash seguro (seguridad) y garantiza que el usuario quede correctamente asociado a su facultad y rol (integridad de datos).

**Trazabilidad:**  
• HU-01 → RF-01, RF-03, RF-16  
• RF-01: Registrar usuarios con correo institucional  
• RF-03: Asignar automáticamente el rol según correo  
• RF-16: Registro de trazabilidad  
• R-07: No existe rol administrador  
• R-08: Rol docente por defecto  
• R-09: Rol secretaria solo por lista blanca

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-02 |
| **Título** | Inicio de sesión en el sistema |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Bajo |
| **Estimación** | 3 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como usuario registrado, quiero iniciar sesión en el sistema con mi correo institucional y contraseña, para acceder a las funcionalidades correspondientes a mi rol.

### Criterios de Aceptación

**Escenario 1: Inicio de sesión exitoso**  
**Given** que un usuario registrado accede a la pantalla de inicio de sesión  
**When** ingresa su correo institucional y contraseña correctos y confirma  
**Then** el sistema autentica al usuario y lo redirige a la pantalla principal (dashboard), mostrando únicamente las opciones de menú correspondientes a su rol (docente o secretaria).

**Escenario 2: Credenciales incorrectas**  
**Given** que un usuario ingresa un correo o contraseña incorrectos  
**When** intenta iniciar sesión  
**Then** el sistema rechaza el acceso y muestra un mensaje genérico de "Correo o contraseña incorrectos" sin revelar cuál dato es el erróneo.

**Escenario 3: Campos vacíos**  
**Given** que el usuario deja el campo de correo o contraseña vacío  
**When** intenta enviar el formulario de login  
**Then** el sistema muestra mensajes de validación en los campos faltantes.

**Escenario 4: Interfaz diferenciada según rol**  
**Given** que un usuario inicia sesión exitosamente  
**When** el sistema carga la pantalla principal  
**Then** si es **docente**, ve: calendario de disponibilidad, mis reservas, historial; si es **secretaria**, ve además: gestión de salas, reportes y todas las reservas de la facultad.

**Escenario 5: Cumplimiento de atributos de calidad**  
**Given** que un usuario interactúa con la pantalla de inicio de sesión  
**When** realiza cualquier acción  
**Then** el sistema responde en un tiempo razonable (rendimiento), utiliza conexión segura y protege las credenciales en tránsito (seguridad), y muestra mensajes claros ante errores (usabilidad).

**Trazabilidad:**  
• HU-02 → RF-02  
• RF-02: Autenticar usuarios registrados  
• R-10: Acceso vía navegador web

---

# Épica 2: Consulta de Disponibilidad de Salas

**Título:** Consulta de Disponibilidad de Salas

**Usuario(s):** Docente, Secretaria de Facultad

**Descripción:** Permitir a los docentes y secretarias consultar la disponibilidad de las salas de reuniones de su facultad en tiempo real, mediante un calendario visual, para facilitar la planeación eficiente de reuniones académicas y administrativas.

| HU Relacionadas | |
|---|---|
| HU-03 | Visualizar disponibilidad de salas en calendario |

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-03 |
| **Título** | Visualizar disponibilidad de salas en calendario |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Alto |
| **Estimación** | 5 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como docente o secretaria de facultad, quiero visualizar la disponibilidad de las salas de reuniones de mi facultad mediante un calendario, para identificar los horarios libres antes de realizar una reserva.

### Criterios de Aceptación

**Escenario 1: Calendario con reservas existentes**  
**Given** que el usuario accede a la pantalla de calendario de disponibilidad  
**When** selecciona una sala de su facultad y una fecha  
**Then** el sistema muestra los bloques de tiempo reservados (ocupados) y los bloques disponibles dentro de la franja horaria institucional (7:00 AM a 9:30 PM).

**Escenario 2: Navegación entre fechas**  
**Given** que el usuario está visualizando el calendario de una sala  
**When** navega hacia otro día o semana  
**Then** el sistema actualiza la vista mostrando las reservas y disponibilidad para la nueva fecha seleccionada.

**Escenario 3: Sala sin reservas**  
**Given** que una sala habilitada no tiene reservas para la fecha seleccionada  
**When** el usuario consulta la disponibilidad  
**Then** el sistema muestra todos los bloques dentro de la franja horaria (7:00 AM – 9:30 PM) como disponibles.

**Escenario 4: Salas deshabilitadas**  
**Given** que una sala está deshabilitada por la secretaria  
**When** el usuario consulta el listado de salas  
**Then** la sala deshabilitada no aparece como opción disponible en el calendario.

**Escenario 5: Solo salas de la facultad del usuario**  
**Given** que el usuario pertenece a una facultad específica  
**When** accede al calendario de disponibilidad  
**Then** el sistema solo muestra las salas de reuniones asociadas a su facultad.

**Escenario 6: Cumplimiento de atributos de calidad**  
**Given** que el usuario interactúa con la pantalla del calendario  
**When** consulta disponibilidad o navega entre fechas  
**Then** el sistema responde de forma ágil y carga la información sin demoras perceptibles (rendimiento), muestra una vista clara y comprensible de los bloques ocupados y disponibles (usabilidad), y garantiza que la información de disponibilidad esté actualizada en tiempo real (integridad de datos).

**Trazabilidad:**  
• HU-03 → RF-04  
• RF-04: Visualización de disponibilidad de salas mediante calendario  
• R-01: Salas solo para reuniones  
• R-02: Franja horaria 7:00 AM – 9:30 PM

---

# Épica 3: Gestión de Salas de Reuniones

**Título:** Gestión de Salas de Reuniones

**Usuario(s):** Secretaria de Facultad

**Descripción:** Permitir a las secretarias de facultad administrar las salas de reuniones y sus recursos tecnológicos de su facultad, para mantener actualizada la información de los espacios institucionales disponibles para reservas.

> **Nota de diseño UI:** Este módulo completo solo es visible para el rol SECRETARIA. Los docentes no ven la opción "Gestión de Salas" en su menú de navegación.

| HU Relacionadas | |
|---|---|
| HU-04 | Crear sala de reuniones |
| HU-05 | Editar sala de reuniones |
| HU-06 | Cambiar estado de sala de reuniones |
| HU-07 | Agregar recursos tecnológicos |
| HU-08 | Retirar recursos tecnológicos |

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-04 |
| **Título** | Crear sala de reuniones |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Moderado |
| **Estimación** | 3 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como secretaria de facultad, quiero crear salas de reuniones asociadas a mi facultad registrando su nombre, ubicación y capacidad, para registrar nuevos espacios disponibles para reuniones.

### Criterios de Aceptación

**Escenario 1: Sala creada exitosamente**  
**Given** que la secretaria accede a la pantalla de gestión de salas  
**When** ingresa un nombre, ubicación y capacidad válidos para una nueva sala y confirma la creación  
**Then** el sistema registra la sala asociándola automáticamente a la facultad de la secretaria, la habilita por defecto (disponible) y muestra confirmación con los datos de la sala creada.

**Escenario 2: Nombre de sala duplicado en la misma facultad**  
**Given** que ya existe una sala con el mismo nombre en la facultad de la secretaria  
**When** intenta crear una nueva sala con ese mismo nombre  
**Then** el sistema rechaza la creación y muestra un mensaje indicando que ya existe una sala con ese nombre en la facultad.

**Escenario 3: Capacidad fuera de rango permitido**  
**Given** que la secretaria ingresa una capacidad menor a 2 o mayor a 100 personas  
**When** intenta confirmar la creación de la sala  
**Then** el sistema impide guardar y muestra un mensaje indicando que la capacidad debe estar entre 2 y 100.

**Escenario 4: Trazabilidad de la creación**  
**Given** que una sala ha sido creada exitosamente  
**When** el sistema finaliza el proceso de creación  
**Then** se registra la acción en el log de auditoría con el usuario que creó la sala, la fecha, la hora y la acción realizada (RF-16).

**Escenario 5: Cumplimiento de atributos de calidad**  
**Given** que la secretaria interactúa con la pantalla de creación de salas  
**When** realiza cualquier acción (ingresar datos o confirmar creación)  
**Then** el sistema responde en un tiempo razonable sin degradar el desempeño (rendimiento), muestra mensajes de error claros y comprensibles ante validaciones fallidas (usabilidad), garantiza que solo la secretaria autenticada pueda crear salas (seguridad) y asegura que la sala quede correctamente asociada a su facultad (integridad de datos).

**Trazabilidad:**  
• HU-04 → RF-05, RF-16  
• RF-05: Crear sala de reuniones asociada a la facultad  
• RF-16: Registro de trazabilidad del sistema

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-05 |
| **Título** | Editar sala de reuniones |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Moderado |
| **Estimación** | 2 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como secretaria de facultad, quiero editar la información de una sala de reuniones de mi facultad, para mantener actualizados los datos de nombre, ubicación o capacidad de los espacios.

### Criterios de Aceptación

**Escenario 1: Edición exitosa de sala**  
**Given** que la secretaria accede a la pantalla de gestión de salas y selecciona una sala de su facultad  
**When** modifica el nombre, ubicación o capacidad con datos válidos y confirma la edición  
**Then** el sistema actualiza la información de la sala y muestra confirmación con los datos modificados.

**Escenario 2: Nombre duplicado tras edición**  
**Given** que la secretaria modifica el nombre de una sala y ya existe otra sala con ese mismo nombre en su facultad  
**When** intenta confirmar la edición  
**Then** el sistema rechaza el cambio y muestra un mensaje indicando que ya existe una sala con ese nombre en la facultad.

**Escenario 3: Capacidad fuera de rango permitido**  
**Given** que la secretaria modifica la capacidad a un valor menor a 2 o mayor a 100  
**When** intenta confirmar la edición  
**Then** el sistema impide guardar y muestra un mensaje indicando que la capacidad debe estar entre 2 y 100.

**Escenario 4: Trazabilidad de la edición**  
**Given** que una sala ha sido editada exitosamente  
**When** el sistema finaliza el proceso de edición  
**Then** se registran en el log de auditoría los datos anteriores, los datos nuevos, el usuario que realizó la edición, la fecha y la hora (RF-16).

**Escenario 5: Cumplimiento de atributos de calidad**  
**Given** que la secretaria interactúa con la pantalla de edición de salas  
**When** realiza cualquier acción (modificar datos o confirmar edición)  
**Then** el sistema responde en un tiempo razonable sin degradar el desempeño (rendimiento), muestra los datos actuales de la sala para evitar errores (usabilidad), garantiza que solo la secretaria autenticada pueda editar salas de su facultad (seguridad) y asegura la consistencia de los datos tras la modificación (integridad de datos).

**Trazabilidad:**  
• HU-05 → RF-06, RF-16  
• RF-06: Editar información de sala de reuniones  
• RF-16: Registro de trazabilidad del sistema

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-06 |
| **Título** | Cambiar estado de sala de reuniones |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Moderado |
| **Estimación** | 3 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como secretaria de facultad, quiero habilitar o deshabilitar una sala de reuniones de mi facultad, para controlar su disponibilidad según necesidades institucionales.

### Criterios de Aceptación

**Escenario 1: Habilitar sala correctamente**  
**Given** que la secretaria accede al listado de salas de su facultad en la pantalla de gestión de salas  
**When** selecciona una sala deshabilitada y cambia su estado a habilitada  
**Then** el sistema actualiza el estado y la sala queda visible y disponible para nuevas reservas en el calendario.

**Escenario 2: Deshabilitar sala sin reservas activas**  
**Given** que la secretaria accede a una sala habilitada que no tiene reservas confirmadas a futuro  
**When** cambia su estado a deshabilitada  
**Then** el sistema actualiza el estado y la sala deja de aparecer como disponible para nuevas reservas en el calendario.

**Escenario 3: Deshabilitar sala con reservas activas**  
**Given** que la secretaria accede a una sala habilitada que tiene reservas confirmadas a futuro  
**When** cambia su estado a deshabilitada  
**Then** el sistema muestra la lista de reservas afectadas al usuario, solicita confirmación, y al confirmar: actualiza el estado de la sala, cancela las reservas futuras existentes, notifica a los usuarios que tenían reservas en esa sala, y la sala deja de aparecer como disponible.

**Escenario 4: Persistencia del estado actualizado**  
**Given** que el estado de una sala fue modificado correctamente  
**When** cualquier usuario consulta la disponibilidad de salas  
**Then** el sistema refleja el estado actualizado de la sala de forma inmediata.

**Escenario 5: Trazabilidad del cambio de estado**  
**Given** que la secretaria cambia el estado de una sala  
**When** el sistema confirma la acción  
**Then** se registra en el log de auditoría el usuario, la fecha, la hora, el estado anterior y el nuevo estado de la sala (RF-16).

**Escenario 6: Cumplimiento de atributos de calidad**  
**Given** que la secretaria interactúa con el módulo de cambio de estado  
**When** realiza cualquier acción  
**Then** el sistema responde en un tiempo razonable (rendimiento), muestra claramente el estado actual de cada sala y solicita confirmación antes de cambios (usabilidad), garantiza que solo la secretaria pueda cambiar estados (seguridad) y asegura la consistencia entre el estado de la sala y las reservas existentes (integridad de datos).

**Trazabilidad:**  
• HU-06 → RF-07, RF-16  
• RF-07: Habilitar o deshabilitar sala de reuniones  
• RF-16: Registro de trazabilidad del sistema  
• R-05: Reserva confirmada bloquea la sala

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-07 |
| **Título** | Agregar recursos tecnológicos a sala |
| **Prioridad en Negocio** | Should-Have (Es recomendable) |
| **Riesgo en desarrollo** | Bajo |
| **Estimación** | 2 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como secretaria de facultad, quiero agregar recursos tecnológicos a una sala de reuniones de mi facultad, para mantener actualizada la información de los equipos disponibles en cada espacio.

### Criterios de Aceptación

**Escenario 1: Agregar recurso tecnológico correctamente**  
**Given** que la secretaria accede a la pantalla de gestión de una sala de su facultad  
**When** selecciona la opción de agregar recurso, elige un recurso del catálogo y confirma  
**Then** el sistema registra el recurso y lo asocia a la sala correctamente.

**Escenario 2: Recurso ya asignado a la sala**  
**Given** que un recurso tecnológico ya está asociado a la sala  
**When** la secretaria intenta agregar el mismo recurso nuevamente  
**Then** el sistema muestra un mensaje indicando que el recurso ya está asignado a esta sala y no duplica la asignación.

**Escenario 3: Datos obligatorios incompletos**  
**Given** que la secretaria accede al formulario de agregar recurso  
**When** intenta guardar sin seleccionar un recurso  
**Then** el sistema muestra un mensaje de validación y no registra la asignación.

**Escenario 4: Trazabilidad del recurso agregado**  
**Given** que un recurso tecnológico fue agregado correctamente a la sala  
**When** el sistema finaliza el proceso  
**Then** se registra en el log de auditoría el recurso agregado, la sala, el usuario, la fecha y la hora (RF-16).

**Escenario 5: Cumplimiento de atributos de calidad**  
**Given** que la secretaria interactúa con la pantalla de gestión de recursos de una sala  
**When** realiza cualquier acción  
**Then** el sistema responde en un tiempo razonable (rendimiento), muestra la lista de recursos ya asignados para evitar duplicados (usabilidad), garantiza que solo la secretaria pueda gestionar recursos (seguridad) y asegura la correcta asociación recurso-sala (integridad de datos).

**Trazabilidad:**  
• HU-07 → RF-08, RF-16  
• RF-08: Agregar recursos tecnológicos a una sala  
• RF-16: Registro de trazabilidad del sistema

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-08 |
| **Título** | Retirar recursos tecnológicos de sala |
| **Prioridad en Negocio** | Should-Have (Es recomendable) |
| **Riesgo en desarrollo** | Bajo |
| **Estimación** | 2 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como secretaria de facultad, quiero retirar recursos tecnológicos de una sala de reuniones de mi facultad, para reflejar correctamente los equipos que ya no están disponibles en ese espacio.

### Criterios de Aceptación

**Escenario 1: Retirar recurso correctamente**  
**Given** que la secretaria accede a la pantalla de gestión de una sala que tiene recursos asignados  
**When** selecciona un recurso de la lista y confirma su retiro  
**Then** el sistema desasocia el recurso de la sala y actualiza la lista de recursos de la sala.

**Escenario 2: Confirmación antes de retirar**  
**Given** que la secretaria selecciona un recurso para retirar  
**When** ejecuta la acción de retiro  
**Then** el sistema solicita confirmación antes de completar la operación para evitar retiros accidentales.

**Escenario 3: Trazabilidad del retiro**  
**Given** que un recurso tecnológico fue retirado correctamente de la sala  
**When** el sistema finaliza el proceso  
**Then** se registra en el log de auditoría el recurso retirado, la sala, el usuario, la fecha y la hora (RF-16).

**Escenario 4: Cumplimiento de atributos de calidad**  
**Given** que la secretaria interactúa con la funcionalidad de retiro de recursos  
**When** realiza cualquier acción  
**Then** el sistema responde en un tiempo razonable (rendimiento), solicita confirmación antes de retirar (usabilidad), garantiza que solo la secretaria pueda retirar recursos (seguridad) y asegura la correcta desasociación recurso-sala (integridad de datos).

**Trazabilidad:**  
• HU-08 → RF-09, RF-16  
• RF-09: Retirar recursos tecnológicos de una sala  
• RF-16: Registro de trazabilidad del sistema

---

# Épica 4: Gestión de Reservas de Salas

**Título:** Gestión de Reservas de Salas

**Usuario(s):** Docente, Secretaria de Facultad

**Descripción:** Permitir a los docentes y secretarias crear, cancelar y ajustar reservas de salas de reuniones, para organizar reuniones sin conflictos de horario y respetando las reglas institucionales.

> **Nota:** Las reservas nunca se eliminan del sistema, solo se cancelan conservando el historial (R-06). La funcionalidad de ajustar reservas (HU-11) solo es visible para la secretaria.

| HU Relacionadas | |
|---|---|
| HU-09 | Crear reserva de sala |
| HU-10 | Cancelar reserva |
| HU-11 | Ajustar reserva (solo secretaria) |

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-09 |
| **Título** | Crear reserva de sala |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Alto |
| **Estimación** | 5 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como docente o secretaria de facultad, quiero crear una reserva de una sala de reuniones de mi facultad seleccionando la fecha, hora de inicio y hora de fin, para asegurar el uso del espacio en el horario que necesito.

### Criterios de Aceptación

**Escenario 1: Reserva creada exitosamente**  
**Given** que el usuario accede a la pantalla de creación de reserva desde el calendario de disponibilidad  
**When** selecciona una sala habilitada, una fecha, hora de inicio y hora de fin dentro de la franja permitida (7:00 AM – 9:30 PM), ingresa el motivo de la reunión y confirma  
**Then** el sistema valida que no existe conflicto de horario, registra la reserva con estado CONFIRMADA y bloquea la sala para otros usuarios en ese rango horario.

**Escenario 2: Conflicto de horario — solapamiento total**  
**Given** que ya existe una reserva confirmada para la misma sala en la misma fecha y rango horario  
**When** el usuario intenta crear una nueva reserva que se solapa completamente con la existente  
**Then** el sistema rechaza la reserva y muestra un mensaje indicando el conflicto con la reserva existente.

**Escenario 3: Conflicto de horario — solapamiento parcial**  
**Given** que existe una reserva confirmada de 10:00 AM a 12:00 PM en una sala  
**When** el usuario intenta reservar la misma sala de 11:00 AM a 1:00 PM (solapamiento parcial)  
**Then** el sistema rechaza la reserva e indica el horario en conflicto.

**Escenario 4: Reserva fuera de franja horaria**  
**Given** que el usuario intenta crear una reserva con hora de inicio antes de las 7:00 AM o hora de fin después de las 9:30 PM  
**When** intenta confirmar la reserva  
**Then** el sistema rechaza la reserva y muestra un mensaje indicando que las reservas solo están permitidas entre 7:00 AM y 9:30 PM.

**Escenario 5: Hora de fin anterior o igual a hora de inicio**  
**Given** que el usuario ingresa una hora de fin igual o anterior a la hora de inicio  
**When** intenta confirmar la reserva  
**Then** el sistema rechaza la reserva e indica que la hora de fin debe ser posterior a la hora de inicio.

**Escenario 6: Sala deshabilitada**  
**Given** que la sala seleccionada está deshabilitada  
**When** el usuario intenta crear una reserva  
**Then** la sala no aparece como opción disponible en el calendario (está oculta).

**Escenario 7: Trazabilidad de la reserva**  
**Given** que una reserva ha sido creada exitosamente  
**When** el sistema finaliza el proceso  
**Then** se registra en el log de auditoría la acción de creación, el usuario, la sala, la fecha, el rango horario y la fecha/hora del registro (RF-16).

**Escenario 8: Cumplimiento de atributos de calidad**  
**Given** que el usuario interactúa con la pantalla de creación de reservas  
**When** realiza cualquier acción  
**Then** el sistema responde en un tiempo razonable (rendimiento), muestra claramente los horarios disponibles y ocupados antes de crear la reserva (usabilidad), garantiza que solo usuarios autenticados puedan reservar salas de su facultad (seguridad) y asegura consistencia entre la reserva y la disponibilidad real de la sala (integridad de datos).

**Trazabilidad:**  
• HU-09 → RF-10, RF-11, RF-16  
• RF-10: Crear reserva respetando disponibilidad  
• RF-11: Validación automática de conflictos de horario  
• RF-16: Registro de trazabilidad  
• R-02: Franja horaria 7:00 AM – 9:30 PM  
• R-03: No superposición de reservas  
• R-04: Validación obligatoria de disponibilidad  
• R-05: Bloqueo automático del recurso

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-10 |
| **Título** | Cancelar reserva |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Moderado |
| **Estimación** | 3 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como docente, quiero cancelar mis propias reservas cuando ya no las necesite, para liberar la sala y permitir que otros usuarios puedan utilizarla. Como secretaria, quiero poder cancelar cualquier reserva de mi facultad en situaciones excepcionales.

### Criterios de Aceptación

**Escenario 1: Docente cancela su propia reserva**  
**Given** que el docente accede a la pantalla de "Mis Reservas" y tiene una reserva con estado CONFIRMADA  
**When** selecciona la reserva y confirma la cancelación  
**Then** el sistema cambia el estado de la reserva a CANCELADA, libera el horario de la sala y la reserva se conserva en el historial con su nuevo estado.

**Escenario 2: Secretaria cancela reserva de la facultad**  
**Given** que la secretaria accede a la pantalla de "Todas las Reservas" de su facultad  
**When** selecciona una reserva confirmada de cualquier usuario y confirma la cancelación  
**Then** el sistema cambia el estado a CANCELADA, libera el horario y conserva la reserva en el historial.

**Escenario 3: Confirmación antes de cancelar**  
**Given** que el usuario selecciona una reserva para cancelar  
**When** ejecuta la acción de cancelación  
**Then** el sistema solicita confirmación mostrando los datos de la reserva (sala, fecha, horario) antes de proceder.

**Escenario 4: Reserva ya cancelada**  
**Given** que el usuario accede a una reserva que ya tiene estado CANCELADA  
**When** intenta visualizar las acciones disponibles  
**Then** la opción de cancelar no está disponible para reservas ya canceladas.

**Escenario 5: Trazabilidad de la cancelación**  
**Given** que una reserva ha sido cancelada exitosamente  
**When** el sistema finaliza el proceso  
**Then** se registra en el log de auditoría la acción de cancelación, el usuario que canceló, la reserva afectada, la fecha y la hora (RF-16).

**Escenario 6: Cumplimiento de atributos de calidad**  
**Given** que el usuario interactúa con la funcionalidad de cancelación  
**When** realiza cualquier acción  
**Then** el sistema responde en un tiempo razonable (rendimiento), solicita confirmación clara antes de cancelar (usabilidad), garantiza que el docente solo pueda cancelar sus propias reservas (seguridad) y asegura que la cancelación libere correctamente la disponibilidad de la sala (integridad de datos).

**Trazabilidad:**  
• HU-10 → RF-12, RF-16  
• RF-12: Cancelar reservas conservando historial  
• RF-16: Registro de trazabilidad  
• R-06: Las reservas no se eliminan, solo se cancelan

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-11 |
| **Título** | Ajustar reserva (excepcional) |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Alto |
| **Estimación** | 3 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como secretaria de facultad, quiero ajustar o corregir una reserva existente de manera excepcional, modificando la fecha, hora o sala, para resolver situaciones que requieran cambios posteriores a la creación de la reserva.

> **Nota de diseño UI:** Esta funcionalidad solo es visible para el rol SECRETARIA. Los docentes no ven la opción de ajustar reservas.

### Criterios de Aceptación

**Escenario 1: Ajuste exitoso de reserva**  
**Given** que la secretaria accede a la pantalla de "Todas las Reservas" y selecciona una reserva confirmada  
**When** modifica la fecha, hora de inicio, hora de fin o sala con datos válidos y confirma el ajuste  
**Then** el sistema valida que no existe conflicto de horario con el nuevo rango, actualiza la reserva conservando los datos anteriores en el historial y muestra confirmación.

**Escenario 2: Conflicto de horario al ajustar**  
**Given** que la secretaria modifica el horario de una reserva  
**When** el nuevo horario se solapa con otra reserva confirmada en la misma sala  
**Then** el sistema rechaza el ajuste y muestra un mensaje indicando el conflicto de horario.

**Escenario 3: Ajuste fuera de franja horaria**  
**Given** que la secretaria modifica el horario a un rango fuera de 7:00 AM – 9:30 PM  
**When** intenta confirmar el ajuste  
**Then** el sistema rechaza el cambio e indica que las reservas solo están permitidas dentro de la franja institucional.

**Escenario 4: Ajuste de reserva cancelada**  
**Given** que la secretaria intenta ajustar una reserva con estado CANCELADA  
**When** accede a las acciones de la reserva  
**Then** la opción de ajustar no está disponible para reservas canceladas.

**Escenario 5: Trazabilidad del ajuste**  
**Given** que una reserva ha sido ajustada exitosamente  
**When** el sistema finaliza el proceso  
**Then** se registran en el log de auditoría los datos anteriores de la reserva, los datos nuevos, el usuario que realizó el ajuste, la fecha y la hora (RF-16).

**Escenario 6: Cumplimiento de atributos de calidad**  
**Given** que la secretaria interactúa con la funcionalidad de ajuste de reservas  
**When** realiza cualquier acción  
**Then** el sistema responde en un tiempo razonable (rendimiento), muestra los datos actuales de la reserva antes de editarlos (usabilidad), garantiza que solo la secretaria pueda ajustar reservas (seguridad) y asegura la consistencia entre la reserva ajustada y la disponibilidad de la sala (integridad de datos).

**Trazabilidad:**  
• HU-11 → RF-13, RF-16  
• RF-13: Ajustar reserva de manera excepcional (solo secretaria)  
• RF-16: Registro de trazabilidad  
• R-02: Franja horaria 7:00 AM – 9:30 PM  
• R-03: No superposición de reservas  
• R-06: Las reservas no se eliminan

---

# Épica 5: Historial y Trazabilidad

**Título:** Historial y Trazabilidad

**Usuario(s):** Docente, Secretaria de Facultad

**Descripción:** Permitir a los usuarios consultar el historial de reservas y al sistema registrar todas las acciones realizadas, para garantizar trazabilidad y auditoría del uso de las salas.

> **Nota:** RF-16 (Registro de trazabilidad) es un requisito transversal implementado como escenario de criterio de aceptación en cada HU que modifica datos. No genera una HU propia, pero su cobertura se verifica en: HU-01, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09, HU-10, HU-11.

| HU Relacionadas | |
|---|---|
| HU-12 | Consultar historial de reservas propias (docente) |
| HU-13 | Consultar historial completo de la facultad (secretaria) |

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-12 |
| **Título** | Consultar historial de reservas propias |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Bajo |
| **Estimación** | 2 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como docente, quiero consultar el historial de todas mis reservas realizadas en salas de reuniones de mi facultad, incluyendo las confirmadas y canceladas, para tener un registro personal de mi uso de los espacios.

### Criterios de Aceptación

**Escenario 1: Historial con reservas existentes**  
**Given** que el docente accede a la pantalla de "Mi Historial de Reservas"  
**When** el sistema carga la vista  
**Then** se muestra una lista de todas sus reservas (confirmadas y canceladas) ordenadas por fecha descendente, con la información de: sala, fecha, hora de inicio, hora de fin, motivo y estado.

**Escenario 2: Historial vacío**  
**Given** que el docente no tiene reservas registradas en el sistema  
**When** accede a la pantalla de historial  
**Then** el sistema muestra un mensaje indicando que aún no tiene reservas registradas.

**Escenario 3: Filtrar historial por estado**  
**Given** que el docente tiene múltiples reservas con diferentes estados  
**When** aplica un filtro por estado (confirmada o cancelada)  
**Then** el sistema muestra solo las reservas que coinciden con el filtro seleccionado.

**Escenario 4: Solo reservas propias**  
**Given** que el docente accede a su historial  
**When** el sistema carga las reservas  
**Then** solo se muestran las reservas creadas por el propio docente, sin incluir reservas de otros usuarios.

**Escenario 5: Cumplimiento de atributos de calidad**  
**Given** que el docente interactúa con la pantalla de historial  
**When** consulta o filtra reservas  
**Then** el sistema responde en un tiempo razonable aun con un historial extenso (rendimiento), presenta la información en formato claro y organizado (usabilidad) y garantiza que solo el docente pueda ver sus propias reservas (seguridad).

**Trazabilidad:**  
• HU-12 → RF-14  
• RF-14: Consultar historial de reservas del docente

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-13 |
| **Título** | Consultar historial completo de reservas de la facultad |
| **Prioridad en Negocio** | Must-Have (Es necesario) |
| **Riesgo en desarrollo** | Bajo |
| **Estimación** | 3 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como secretaria de facultad, quiero consultar todas las reservas realizadas sobre las salas de reuniones de mi facultad, para tener visibilidad completa del uso de los espacios de la facultad.

> **Nota de diseño UI:** Esta pantalla con visibilidad completa solo es visible para la secretaria. El docente solo accede a su historial propio (HU-12).

### Criterios de Aceptación

**Escenario 1: Listado completo de reservas**  
**Given** que la secretaria accede a la pantalla de "Todas las Reservas"  
**When** el sistema carga la vista  
**Then** se muestra una lista de todas las reservas de la facultad (de todos los usuarios) ordenadas por fecha descendente, con: usuario, sala, fecha, horario, motivo y estado.

**Escenario 2: Filtrar por sala**  
**Given** que la secretaria consulta las reservas de la facultad  
**When** aplica un filtro por sala específica  
**Then** el sistema muestra solo las reservas de esa sala.

**Escenario 3: Filtrar por usuario**  
**Given** que la secretaria consulta las reservas de la facultad  
**When** aplica un filtro por usuario (docente o secretaria)  
**Then** el sistema muestra solo las reservas de ese usuario.

**Escenario 4: Filtrar por rango de fechas**  
**Given** que la secretaria consulta las reservas de la facultad  
**When** selecciona una fecha de inicio y fecha de fin  
**Then** el sistema muestra solo las reservas dentro de ese rango.

**Escenario 5: Solo reservas de su facultad**  
**Given** que la secretaria accede al historial completo  
**When** el sistema carga las reservas  
**Then** solo se muestran reservas de salas pertenecientes a la facultad de la secretaria.

**Escenario 6: Cumplimiento de atributos de calidad**  
**Given** que la secretaria interactúa con la pantalla de historial completo  
**When** consulta o filtra reservas  
**Then** el sistema responde en un tiempo razonable con grandes volúmenes de datos (rendimiento), permite filtrar eficientemente (usabilidad), restringe la vista a reservas de su facultad (seguridad) y muestra información consistente y actualizada (integridad de datos).

**Trazabilidad:**  
• HU-13 → RF-15  
• RF-15: Consultar todas las reservas de la facultad (secretaria)

---

# Épica 6: Reportes de Uso de Salas

**Título:** Reportes de Uso de Salas

**Usuario(s):** Secretaria de Facultad

**Descripción:** Permitir a las secretarias de facultad generar reportes sobre el uso de las salas de reuniones, basados en diferentes métricas (número de reservas, horas reservadas, por usuario), para apoyar la toma de decisiones administrativas.

> **Nota de diseño UI:** El módulo de reportes solo es visible para el rol SECRETARIA. Los docentes no ven esta opción en el menú.

| HU Relacionadas | |
|---|---|
| HU-14 | Generar reporte de uso por número de reservas |
| HU-15 | Generar reporte de uso por horas reservadas |
| HU-16 | Generar reporte de reservas por usuario |

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-14 |
| **Título** | Generar reporte de uso por número de reservas |
| **Prioridad en Negocio** | Should-Have (Es recomendable) |
| **Riesgo en desarrollo** | Moderado |
| **Estimación** | 3 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como secretaria de facultad, quiero generar un reporte del uso de las salas de reuniones basado en la cantidad de reservas realizadas por sala, pudiendo filtrar por rango de fechas, para conocer cuáles salas son las más y menos utilizadas.

### Criterios de Aceptación

**Escenario 1: Reporte generado con datos**  
**Given** que la secretaria accede a la pantalla de reportes y selecciona "Uso por número de reservas"  
**When** selecciona un rango de fechas (fecha inicio y fecha fin) y genera el reporte  
**Then** el sistema muestra una tabla con cada sala de su facultad y la cantidad total de reservas (confirmadas y canceladas) realizadas en ese período, ordenadas de mayor a menor uso.

**Escenario 2: Rango de fechas sin reservas**  
**Given** que la secretaria selecciona un rango de fechas donde no existen reservas  
**When** genera el reporte  
**Then** el sistema muestra un mensaje indicando que no hay datos disponibles para el rango seleccionado.

**Escenario 3: Rango de fechas inválido**  
**Given** que la secretaria ingresa una fecha de fin anterior a la fecha de inicio  
**When** intenta generar el reporte  
**Then** el sistema rechaza la solicitud e indica que la fecha de fin debe ser posterior a la fecha de inicio.

**Escenario 4: Solo datos de su facultad**  
**Given** que la secretaria genera un reporte  
**When** el sistema procesa los datos  
**Then** solo incluye reservas de salas pertenecientes a la facultad de la secretaria.

**Escenario 5: Cumplimiento de atributos de calidad**  
**Given** que la secretaria interactúa con el módulo de reportes  
**When** genera un reporte  
**Then** el sistema procesa y presenta los datos en un tiempo razonable (rendimiento), presenta los resultados de forma clara y comprensible (usabilidad) y garantiza que solo la secretaria pueda acceder a reportes de su facultad (seguridad).

**Trazabilidad:**  
• HU-14 → RF-17, RF-20  
• RF-17: Reporte de uso por número de reservas  
• RF-20: Filtro de reportes por rango de fechas

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-15 |
| **Título** | Generar reporte de uso por horas reservadas |
| **Prioridad en Negocio** | Should-Have (Es recomendable) |
| **Riesgo en desarrollo** | Moderado |
| **Estimación** | 3 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como secretaria de facultad, quiero generar un reporte del uso de las salas de reuniones basado en el total de horas reservadas por sala, pudiendo filtrar por rango de fechas, para entender la intensidad de uso de cada espacio.

### Criterios de Aceptación

**Escenario 1: Reporte generado con datos**  
**Given** que la secretaria accede a la pantalla de reportes y selecciona "Uso por horas reservadas"  
**When** selecciona un rango de fechas y genera el reporte  
**Then** el sistema muestra una tabla con cada sala de su facultad y el total de horas reservadas en ese período, ordenadas de mayor a menor uso.

**Escenario 2: Rango de fechas sin reservas**  
**Given** que la secretaria selecciona un rango de fechas donde no existen reservas  
**When** genera el reporte  
**Then** el sistema muestra un mensaje indicando que no hay datos disponibles para el rango seleccionado.

**Escenario 3: Rango de fechas inválido**  
**Given** que la secretaria ingresa una fecha de fin anterior a la fecha de inicio  
**When** intenta generar el reporte  
**Then** el sistema rechaza la solicitud e indica que la fecha de fin debe ser posterior a la fecha de inicio.

**Escenario 4: Solo datos de su facultad**  
**Given** que la secretaria genera un reporte  
**When** el sistema procesa los datos  
**Then** solo incluye horas de reservas en salas pertenecientes a la facultad de la secretaria.

**Escenario 5: Cumplimiento de atributos de calidad**  
**Given** que la secretaria interactúa con el módulo de reportes  
**When** genera un reporte  
**Then** el sistema calcula correctamente las horas acumuladas (integridad de datos), presenta los resultados en un tiempo razonable (rendimiento) y en formato claro (usabilidad).

**Trazabilidad:**  
• HU-15 → RF-18, RF-20  
• RF-18: Reporte de uso por horas reservadas  
• RF-20: Filtro de reportes por rango de fechas

---

## Historia de Usuario

| Campo | Valor |
|-------|-------|
| **Número** | HU-16 |
| **Título** | Generar reporte de reservas por usuario |
| **Prioridad en Negocio** | Should-Have (Es recomendable) |
| **Riesgo en desarrollo** | Moderado |
| **Estimación** | 3 puntos de historia |
| **Sprint Asignado** | — |
| **Programador responsable** | No asignado |

**Descripción:**  
Como secretaria de facultad, quiero generar un reporte de reservas agrupadas por usuario, pudiendo filtrar por rango de fechas, para identificar qué usuarios hacen mayor uso de las salas de reuniones de la facultad.

### Criterios de Aceptación

**Escenario 1: Reporte generado con datos**  
**Given** que la secretaria accede a la pantalla de reportes y selecciona "Reservas por usuario"  
**When** selecciona un rango de fechas y genera el reporte  
**Then** el sistema muestra una tabla con cada usuario que ha realizado reservas en la facultad, junto con la cantidad de reservas y el total de horas reservadas en ese período, ordenados de mayor a menor actividad.

**Escenario 2: Rango de fechas sin reservas**  
**Given** que la secretaria selecciona un rango de fechas donde no existen reservas  
**When** genera el reporte  
**Then** el sistema muestra un mensaje indicando que no hay datos disponibles para el rango seleccionado.

**Escenario 3: Rango de fechas inválido**  
**Given** que la secretaria ingresa una fecha de fin anterior a la fecha de inicio  
**When** intenta generar el reporte  
**Then** el sistema rechaza la solicitud e indica que la fecha de fin debe ser posterior a la fecha de inicio.

**Escenario 4: Solo usuarios de su facultad**  
**Given** que la secretaria genera un reporte  
**When** el sistema procesa los datos  
**Then** solo incluye reservas de usuarios pertenecientes a la facultad de la secretaria en salas de su facultad.

**Escenario 5: Cumplimiento de atributos de calidad**  
**Given** que la secretaria interactúa con el módulo de reportes  
**When** genera un reporte  
**Then** el sistema calcula correctamente los totales por usuario (integridad de datos), presenta los resultados en un tiempo razonable (rendimiento) y en un formato claro y organizado (usabilidad).

**Trazabilidad:**  
• HU-16 → RF-19, RF-20  
• RF-19: Reporte de reservas por usuario  
• RF-20: Filtro de reportes por rango de fechas

---

# Cobertura Completa de RF

| RF | HU donde se cubre | Tipo de cobertura |
|----|-------------------|-------------------|
| RF-01 | HU-01 | HU dedicada |
| RF-02 | HU-02 | HU dedicada |
| RF-03 | HU-01 | Escenarios 1 y 2 |
| RF-04 | HU-03 | HU dedicada |
| RF-05 | HU-04 | HU dedicada |
| RF-06 | HU-05 | HU dedicada |
| RF-07 | HU-06 | HU dedicada |
| RF-08 | HU-07 | HU dedicada |
| RF-09 | HU-08 | HU dedicada |
| RF-10 | HU-09 | HU dedicada |
| RF-11 | HU-09 | Escenarios 2 y 3 |
| RF-12 | HU-10 | HU dedicada |
| RF-13 | HU-11 | HU dedicada |
| RF-14 | HU-12 | HU dedicada |
| RF-15 | HU-13 | HU dedicada |
| RF-16 | HU-01, HU-04–HU-11 | Transversal (escenario trazabilidad) |
| RF-17 | HU-14 | HU dedicada |
| RF-18 | HU-15 | HU dedicada |
| RF-19 | HU-16 | HU dedicada |
| RF-20 | HU-14, HU-15, HU-16 | Transversal (filtro de fechas) |
