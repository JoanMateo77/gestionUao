# Requisitos del Sistema — Reservas de Salas de Reuniones

## Requisitos Funcionales (RF)

### Épica 1: Gestión de Usuarios y Acceso
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-01 | Registro con correo institucional | Registro de usuarios con correo institucional, incluyendo facultad |
| RF-02 | Autenticación | Inicio de sesión para usuarios registrados |
| RF-03 | Asignación automática de rol | Rol asignado según correo: docente (default) o secretaria (lista blanca) |

### Épica 2: Consulta de Disponibilidad
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-04 | Visualización de disponibilidad | Calendario con disponibilidad de salas de la facultad del usuario |

### Épica 3: Gestión de Salas (Secretaria)
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-05 | Crear sala | Crear salas asociadas a la facultad de la secretaria |
| RF-06 | Editar sala | Modificar información de salas existentes |
| RF-07 | Habilitar/deshabilitar sala | Cambiar estado de disponibilidad |
| RF-08 | Agregar recursos tecnológicos | Asignar recursos (proyector, etc.) a una sala |
| RF-09 | Retirar recursos tecnológicos | Quitar recursos de una sala |

### Épica 4: Gestión de Reservas (Docente + Secretaria)
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-10 | Crear reserva | Reservar sala respetando disponibilidad |
| RF-11 | Validación de conflictos | Validación automática anti-solapamiento |
| RF-12 | Cancelar reserva | Cancelar conservando historial (no eliminar) |
| RF-13 | Ajustar reserva | Solo secretaria, en casos excepcionales |

### Épica 5: Historial y Trazabilidad
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-14 | Historial del docente | Consultar reservas propias |
| RF-15 | Historial completo (facultad) | Secretaria consulta todas las reservas de la facultad |
| RF-16 | Registro de trazabilidad | Log de todas las acciones para auditoría |

### Épica 6: Reportes (Secretaria)
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-17 | Reporte por nº de reservas | Uso de salas medido en cantidad de reservas |
| RF-18 | Reporte por horas reservadas | Uso de salas medido en horas |
| RF-19 | Reporte por usuario | Reservas agrupadas por usuario |
| RF-20 | Filtro por rango de fechas | Todos los reportes filtrables por fecha inicio/fin |

---

## Requisitos No Funcionales (RNF)

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF-01 | Rendimiento | Soportar alto número de usuarios sin degradar desempeño |
| RNF-02 | Escalabilidad | Arquitectura escalable ante crecimiento |
| RNF-03 | Disponibilidad | Accesible vía navegador web |
| RNF-04 | Mantenibilidad | Código documentado y bien estructurado |
| RNF-05 | Seguridad | Control de acceso basado en roles |
| RNF-06 | Integridad | Consistencia entre reservas y disponibilidad |

---

## Restricciones (R)

| ID | Restricción |
|----|-------------|
| R-01 | Salas solo para reuniones, no para clases |
| R-02 | Reservas solo entre 7:00 AM y 9:30 PM |
| R-03 | No se permiten reservas simultáneas de la misma sala |
| R-04 | Validación obligatoria de disponibilidad al crear reserva |
| R-05 | Reserva confirmada bloquea la sala automáticamente |
| R-06 | Reservas no se eliminan, solo se cancelan (historial) |
| R-07 | No existe rol administrador |
| R-08 | Rol docente es el default al registrarse |
| R-09 | Rol secretaria solo por lista blanca de correos |
| R-10 | Acceso vía navegador web |
| R-11 | Trazabilidad obligatoria en todas las acciones |

---

## Matriz de Trazabilidad: Épicas → RF

```
Épica 1 (Usuarios)       → RF-01, RF-02, RF-03
Épica 2 (Disponibilidad) → RF-04
Épica 3 (Salas)          → RF-05, RF-06, RF-07, RF-08, RF-09
Épica 4 (Reservas)       → RF-10, RF-11, RF-12, RF-13
Épica 5 (Historial)      → RF-14, RF-15, RF-16
Épica 6 (Reportes)       → RF-17, RF-18, RF-19, RF-20
```
