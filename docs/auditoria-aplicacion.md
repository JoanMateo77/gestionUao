# Documento de Auditoría de Aplicación
## Sistema de Reservas de Salas de Reuniones por Facultad — UAO

**Fecha de revisión:** 19 de marzo de 2026
**Tipo de documento:** Auditoría técnica y funcional
**Alcance:** Revisión completa de arquitectura, seguridad, lógica de negocio, base de datos e integridad del sistema

---

## 1. Descripción General del Sistema

El sistema es una aplicación web institucional desarrollada para la Universidad Autónoma de Occidente (UAO). Su propósito es gestionar la reserva de salas de reuniones por facultad, permitiendo a docentes reservar espacios y a secretarias administrar esos espacios y sus recursos tecnológicos.

El sistema fue construido como un monolito full-stack usando Next.js 14 con App Router. El frontend y el backend coexisten en el mismo proyecto. La base de datos utilizada es PostgreSQL 16, accedida a través del ORM Prisma 5. La autenticación se maneja con NextAuth v4 bajo una estrategia de tokens JWT. La validación de entradas usa Zod como biblioteca de esquemas.

No existe aplicación móvil. El acceso es exclusivamente vía navegador web.

---

## 2. Contexto de Negocio y Problema que Resuelve

Antes de este sistema, la reserva de salas se gestionaba de manera informal, lo que generaba conflictos de horarios, uso no coordinado de espacios y falta de trazabilidad sobre quién reservó qué y cuándo.

El sistema establece un flujo claro: una secretaria de facultad administra las salas (creación, habilitación, asignación de recursos tecnológicos). Los docentes de esa misma facultad pueden hacer reservas sobre las salas habilitadas, sujetas a validaciones automáticas de disponibilidad y horario. Todo movimiento queda registrado en un log de auditoría inmutable.

El sistema es multi-facultad por diseño: cada usuario pertenece a una facultad, y todas las operaciones quedan circunscritas a esa facultad. Un docente de Ingeniería no puede ver ni reservar salas de otra facultad.

---

## 3. Roles de Usuario y Forma de Asignación

El sistema reconoce exactamente dos roles: DOCENTE y SECRETARIA. No existe un rol de administrador global, decisión de diseño deliberada para evitar superficies de privilegio innecesarias.

El rol se asigna automáticamente en el momento del registro según una tabla de lista blanca (`ListaBlanca`) almacenada en la base de datos. Si el correo del usuario que se registra aparece en esa tabla, se le asigna el rol SECRETARIA. En cualquier otro caso, el rol asignado es DOCENTE. El usuario nunca selecciona su propio rol.

Ambos roles deben registrarse con un correo institucional con dominio `@uao.edu.co`. Esta restricción es configurable vía variable de entorno `INSTITUTIONAL_DOMAIN`, pero el dominio por defecto es el de la UAO.

---

## 4. Flujo de Autenticación

El registro ocurre en el endpoint `POST /api/auth/register`. El sistema valida el formato del correo, verifica que sea del dominio institucional, consulta la lista blanca, hashea la contraseña con bcryptjs usando 12 rondas de sal, y crea el usuario.

El inicio de sesión usa el proveedor de credenciales de NextAuth. NextAuth verifica el correo y contraseña contra la base de datos, y si son válidos emite un token JWT firmado con `NEXTAUTH_SECRET`. Ese token tiene vigencia de 24 horas.

En cada petición autenticada, el middleware de Next.js intercepta la solicitud y verifica el token. Si el token es válido, la solicitud continúa. Si no existe o está expirado, se redirige al login.

La sesión del token incluye el ID del usuario, su nombre, su rol y su `facultadId`. Estos cuatro valores viajan en todas las peticiones y son la base del control de acceso por rol y por facultad en cada endpoint.

---

## 5. Control de Acceso por Rol

El control de acceso opera en dos niveles.

El primer nivel es el middleware de ruta (`middleware.ts`). Este middleware protege globalmente todos los segmentos de ruta como `/salas`, `/reservas`, `/dashboard`, `/historial` y `/reportes`. Cualquier petición a estas rutas sin sesión válida es redirigida al login.

El segundo nivel es el control por endpoint dentro de cada API route. Cada handler verifica explícitamente el rol del usuario antes de ejecutar la operación. Los endpoints que crean, editan o eliminan salas y recursos solo permiten el rol SECRETARIA. Los endpoints de reservas permiten ambos roles, pero con diferencias en el alcance: un DOCENTE solo ve y puede cancelar sus propias reservas, mientras que una SECRETARIA ve y puede gestionar todas las reservas de su facultad.

La ausencia del rol correcto devuelve HTTP 403. La ausencia de sesión devuelve HTTP 401.

---

## 6. Lógica de Negocio de Reservas

Las reservas son la operación central del sistema. Al crear una reserva, el sistema aplica las siguientes validaciones en orden:

Primero, validación de esquema con Zod: el formato de fecha debe ser YYYY-MM-DD, los campos de hora deben ser HH:MM, la hora de inicio debe ser mayor o igual a las 07:00, la hora de fin debe ser menor o igual a las 21:30, y la hora de inicio debe ser estrictamente menor que la hora de fin.

Segundo, validación de disponibilidad: la capa de repositorio ejecuta una consulta a la base de datos buscando reservas confirmadas en la misma sala, en la misma fecha, cuyo intervalo de tiempo se solape con el solicitado. La lógica de solapamiento es: hay conflicto si `nuevo.inicio < existente.fin AND nuevo.fin > existente.inicio`. Si se encuentra al menos un conflicto, la operación falla con HTTP 409.

Tercero, creación de la reserva: si pasa ambas validaciones, se inserta el registro con estado `CONFIRMADA`.

Las reservas nunca se eliminan físicamente de la base de datos. La cancelación es una actualización de estado: el campo `estado` cambia de `CONFIRMADA` a `CANCELADA` y se registra el ID del usuario que canceló en el campo `canceladoPor`. Esta decisión preserva la historia completa de uso de las salas.

---

## 7. Gestión de Salas

Solo las secretarias pueden crear, editar, habilitar o deshabilitar salas. La sala pertenece a la facultad de la secretaria que la crea. El nombre de la sala debe ser único dentro de la facultad.

Deshabilitar una sala no elimina sus reservas futuras confirmadas. El sistema registra la sala como inhabilitada pero las reservas existentes permanecen en el historial. Este comportamiento es correcto desde el punto de vista de auditoría.

Las salas pueden tener recursos tecnológicos asignados (proyectores, pantallas, equipos de videoconferencia, etc.). Estos recursos vienen de un catálogo global de `RecursoTecnologico`. La relación sala-recurso es de muchos a muchos, con restricción de unicidad para evitar asignar el mismo recurso dos veces a la misma sala.

---

## 8. Trazabilidad y Auditoría

Toda operación que modifica datos genera una entrada en la tabla `LogAuditoria`. Esta tabla captura: el ID del usuario que ejecutó la acción, el nombre de la acción (verbo en mayúsculas como `CREAR_RESERVA`, `CANCELAR_RESERVA`, `EDITAR_SALA`), el tipo de entidad afectada, el ID del registro afectado, un snapshot del estado anterior en JSON, un snapshot del estado posterior en JSON, la fecha y hora de la operación, y la dirección IP del solicitante.

La tabla de auditoría es de solo inserción. Ningún endpoint del sistema ofrece capacidad de borrar o modificar registros de log. Esto garantiza integridad del historial.

Las operaciones cubiertas por la auditoría son: registro de usuario, creación y edición de sala, cambio de estado de sala, asignación y retiro de recursos, creación y cancelación de reserva.

Si la función de auditoría falla (por ejemplo, por un error de base de datos), el error se registra en consola pero no interrumpe la operación principal. Esta decisión es deliberada para no bloquear al usuario ante un fallo de log, aunque implica un riesgo de pérdida de trazabilidad en condiciones de degradación.

---

## 9. Modelo de Datos

La base de datos tiene ocho tablas principales.

`Facultad` almacena las unidades organizacionales de la universidad. Su nombre es único. El seed inicial carga tres facultades de la UAO.

`Usuario` almacena las cuentas de los usuarios del sistema. Su correo institucional es único. Tiene un campo de hash de contraseña, el rol (enumerado entre DOCENTE y SECRETARIA), y la clave foránea a `Facultad`.

`ListaBlanca` contiene los correos pre-autorizados para recibir el rol de SECRETARIA en el registro. Es consultada una sola vez al momento del registro y no vuelve a usarse.

`Sala` almacena los cuartos físicos. Su nombre es único por facultad. Tiene campos de ubicación, capacidad, estado de habilitación, y referencia a la facultad propietaria.

`RecursoTecnologico` es el catálogo global de equipos y recursos disponibles. Su nombre es único en todo el sistema.

`SalaRecurso` es la tabla de relación muchos a muchos entre `Sala` y `RecursoTecnologico`. Tiene restricción de unicidad compuesta sobre `salaId` y `recursoId`.

`Reserva` es la tabla central. Almacena sala, usuario, fecha, hora de inicio, hora de fin, motivo opcional, estado (CONFIRMADA o CANCELADA), y la referencia al usuario que canceló si aplica.

`LogAuditoria` almacena el historial de todas las operaciones con sus snapshots JSON.

Los índices de rendimiento cubren las combinaciones más frecuentes de consulta: sala-fecha-estado para verificar disponibilidad, usuario para historial personal, fecha para filtros de rango, y entidad-fecha para consultas de auditoría.

---

## 10. Validaciones a Nivel de Base de Datos

Más allá del código de aplicación, la base de datos impone sus propias restricciones. Las más relevantes son: la restricción CHECK que impide almacenar reservas con hora de inicio antes de las 07:00 o hora de fin después de las 21:30, la restricción que exige que la hora de inicio sea menor que la hora de fin, y las restricciones de unicidad descritas en el modelo de datos.

La validación de solapamiento de reservas se implementa a nivel de aplicación y no como restricción de exclusión en la base de datos. Esto significa que bajo condiciones de alta concurrencia extrema podría existir una ventana de tiempo en la que dos solicitudes simultáneas pasen la validación antes de que alguna sea persistida. En producción, una restricción de exclusión en PostgreSQL con el tipo `tsrange` elevaría este control al motor de base de datos y eliminaría esa ventana.

---

## 11. Seguridad

Las contraseñas se almacenan siempre como hash bcrypt con 12 rondas de sal. Nunca aparecen en texto plano en logs, auditorías ni respuestas de API.

Las consultas a la base de datos se construyen exclusivamente a través de Prisma con parámetros tipados, lo que previene inyección SQL por diseño.

La protección contra CSRF es gestionada por NextAuth de forma nativa.

El dominio del correo institucional actúa como primera barrera de entrada al sistema: personas externas a la universidad no pueden registrarse.

No existe implementación de limitación de intentos de login (rate limiting). Un atacante podría intentar fuerza bruta sobre el endpoint de autenticación sin restricción técnica actual.

No existe mecanismo de refresh de token. Al expirar las 24 horas, el usuario debe autenticarse nuevamente.

Los secretos de la aplicación (`NEXTAUTH_SECRET`, `DATABASE_URL`) se gestionan por variables de entorno y no están codificados en el repositorio.

---

## 12. Decisiones de Diseño Relevantes

Se eligió Next.js como framework único para frontend y backend porque unifica el proyecto, simplifica el despliegue y es la tecnología principal que el equipo domina.

Se eligió el modelo de repositorios y servicios por separado porque permite testear la lógica de negocio sin acoplarse a la base de datos, y facilita el mantenimiento futuro.

Se eligió Zod para validación porque integra la validación en tiempo de ejecución con la inferencia de tipos de TypeScript, reduciendo duplicación de esquemas.

Se decidió no tener rol de administrador global porque el contexto universitario no lo requiere: cada facultad es autónoma y la secretaria cubre la administración local. Un rol global habría ampliado innecesariamente la superficie de ataque.

Se decidió que las reservas nunca se borren porque el historial tiene valor institucional: permite saber quién usó qué sala y cuándo, incluso si la reserva fue cancelada.

Se decidió que el fallo de auditoría no corte la operación principal porque bloquear al usuario por un problema de log secundario sería una degradación de experiencia desproporcionada. El riesgo es aceptado conscientemente.

---

## 13. Limitaciones Conocidas

Los módulos de reportes (reporte por número de reservas, por horas, por usuario) están documentados en los requisitos y el plan de entrega, pero su implementación en la interfaz de usuario no está completamente visible en el código revisado. La lógica de backend existe parcialmente.

No existen pruebas automatizadas. No hay suite de pruebas unitarias, de integración ni end-to-end. El sistema se ha validado manualmente.

No existe pipeline de CI/CD. Los despliegues son manuales.

No existe herramienta de monitoreo activo ni sistema de alertas. Los errores de producción solo son detectables revisando los logs del servidor.

No se documentó una política de retención de datos para los logs de auditoría. Con el tiempo, la tabla `LogAuditoria` crecerá indefinidamente sin un plan de archivado.

---

## 14. Estado de Cumplimiento de Requisitos

De los veinte requisitos funcionales definidos, quince están completamente implementados y verificables en el código. Los cinco restantes (principalmente los de reportes y la vista de calendario avanzada) tienen la lógica de datos implementada pero su interfaz de usuario está incompleta o no fue incluida en el alcance del sprint entregado.

Todos los requisitos no funcionales están cubiertos a nivel de diseño: la arquitectura en capas garantiza mantenibilidad, el uso de PostgreSQL e índices garantiza rendimiento esperado, el RBAC garantiza seguridad, y las restricciones de base de datos junto con la validación de Zod garantizan integridad de datos.

Las once restricciones de negocio definidas están implementadas en código y verificables.

---

## 15. Conclusión de Auditoría

El sistema está construido sobre decisiones técnicas sólidas y alineadas con las buenas prácticas de la industria. La separación de responsabilidades entre capa de presentación, API, servicios y repositorios es clara. La seguridad básica está correctamente implementada. El modelo de datos es coherente con las reglas de negocio. La trazabilidad de auditoría es completa para todas las operaciones críticas.

Los riesgos identificados son operacionales y de madurez, no de diseño fundamental: ausencia de pruebas automatizadas, ausencia de limitación de intentos de login, validación de solapamiento de reservas solo a nivel de aplicación, y módulos de reportes incompletos en la interfaz.

El sistema es apto para operar en un entorno de uso real dentro de la institución, con la recomendación de priorizar la implementación de pruebas automatizadas y rate limiting antes de una exposición de tráfico alto.
