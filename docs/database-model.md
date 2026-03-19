# Modelo Lógico de Base de Datos — Reservas de Salas

## Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram
    FACULTAD ||--o{ USUARIO : pertenece
    FACULTAD ||--o{ SALA : tiene
    USUARIO ||--o{ RESERVA : crea
    SALA ||--o{ RESERVA : recibe
    SALA ||--o{ SALA_RECURSO : tiene
    RECURSO_TECNOLOGICO ||--o{ SALA_RECURSO : asignado_a
    USUARIO ||--o{ LOG_AUDITORIA : genera
    LISTA_BLANCA |o--|| USUARIO : autoriza_rol

    FACULTAD {
        int id PK
        string nombre UK
        boolean activa
    }

    USUARIO {
        int id PK
        string nombre
        string correo_institucional UK
        string password_hash
        enum rol "DOCENTE | SECRETARIA"
        int facultad_id FK
        datetime fecha_registro
        boolean activo
    }

    SALA {
        int id PK
        string nombre
        string ubicacion
        int capacidad
        boolean habilitada
        int facultad_id FK
        datetime fecha_creacion
    }

    RECURSO_TECNOLOGICO {
        int id PK
        string nombre UK
        string descripcion
    }

    SALA_RECURSO {
        int id PK
        int sala_id FK
        int recurso_id FK
    }

    RESERVA {
        int id PK
        int sala_id FK
        int usuario_id FK
        string motivo
        date fecha
        time hora_inicio
        time hora_fin
        enum estado "CONFIRMADA | CANCELADA"
        datetime fecha_creacion
        datetime fecha_cancelacion
        int cancelado_por FK
    }

    LOG_AUDITORIA {
        int id PK
        int usuario_id FK
        string accion
        string entidad
        int entidad_id
        json datos_anteriores
        json datos_nuevos
        datetime fecha
        string ip_address
    }

    LISTA_BLANCA {
        string correo_institucional PK
        string nombre
        enum tipo_usuario "SECRETARIA"
    }
```

## Entidades Principales

### USUARIO
- Correo institucional como identificador único
- Rol asignado automáticamente: `DOCENTE` (default) o `SECRETARIA` (lista blanca)
- Vinculado a exactamente una `FACULTAD`

### SALA
- Pertenece a una `FACULTAD`
- Puede habilitarse/deshabilitarse (campo `habilitada`)
- Tiene recursos tecnológicos vía tabla intermedia `SALA_RECURSO`

### RESERVA
- **Nunca se elimina** — solo cambia estado a `CANCELADA`
- Validación: no puede existir otra reserva para la misma sala que se solape en `fecha` + `hora_inicio`/`hora_fin`
- Restricción: `hora_inicio >= 07:00` y `hora_fin <= 21:30`

### LISTA_BLANCA
- Contiene los correos institucionales autorizados para el rol `SECRETARIA` (RF-03, R-09)
- Relación **0..1 a 1** con `USUARIO`: un usuario puede o no estar en la lista blanca
- **Lógica de registro:** al registrarse, el sistema consulta `LISTA_BLANCA`; si el correo existe → rol `SECRETARIA`, si no → rol `DOCENTE`
- Por ahora solo contempla tipo `SECRETARIA`

### LOG_AUDITORIA
- Registra TODAS las acciones del sistema (R-11)
- Almacena datos anteriores y nuevos para trazabilidad completa

## Restricciones Clave de Integridad

```sql
-- No solapamiento de reservas (R-03, RF-11)
-- CHECK: No existe otra reserva CONFIRMADA para la misma sala
-- con fecha solapada en el rango [hora_inicio, hora_fin)

-- Franja horaria (R-02)
CHECK (hora_inicio >= '07:00' AND hora_fin <= '21:30')
CHECK (hora_inicio < hora_fin)

-- Estado de reserva (R-06)
-- Las reservas solo transicionan de CONFIRMADA → CANCELADA, nunca se DELETE
```
