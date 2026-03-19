---
name: uml-diagrams
description: Genera diagramas UML en Mermaid — Casos de Uso, Secuencia y Clases — para el sistema de reservas
---

# Skill: Diagramas UML

## Cuándo usar este skill
- Generar diagramas de casos de uso del sistema
- Crear diagramas de secuencia para flujos específicos
- Diseñar diagramas de clases para la arquitectura

## Herramienta: Mermaid

Todos los diagramas deben generarse en **sintaxis Mermaid** para renderizado directo en markdown.

---

## 1. Diagramas de Casos de Uso

### Plantilla Base

```mermaid
graph LR
    subgraph "Sistema de Reservas"
        UC1["RF-01: Registrar usuario"]
        UC2["RF-02: Iniciar sesión"]
        UC3["RF-04: Ver disponibilidad"]
        UC4["RF-10: Crear reserva"]
    end

    Docente((Docente)) --> UC1
    Docente --> UC2
    Docente --> UC3
    Docente --> UC4

    Secretaria((Secretaria)) --> UC1
    Secretaria --> UC2
    Secretaria --> UC3
    Secretaria --> UC4
```

### Reglas
- Cada caso de uso debe mapearse a un RF
- Incluir relaciones `<<include>>` y `<<extend>>` cuando aplique
- Agrupar por subsistema/épica
- Actores: solo **Docente** y **Secretaria** (no existe admin)

### Template por Épica

Para cada épica, el diagrama debe mostrar:
1. Actores que participan
2. Casos de uso correspondientes a los RF
3. Relaciones entre casos de uso (include/extend)
4. Límite del sistema

---

## 2. Diagramas de Secuencia

### Plantilla Base

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant C as Controller
    participant S as Service
    participant R as Repository
    participant DB as Base de Datos

    U->>F: Acción del usuario
    F->>C: POST /api/endpoint
    C->>S: método(params)
    S->>R: query(params)
    R->>DB: SQL
    DB-->>R: resultado
    R-->>S: datos
    S-->>C: respuesta
    C-->>F: HTTP 200 / JSON
    F-->>U: Muestra resultado
```

### Diagramas de Secuencia Requeridos

| Flujo | RF | Participantes clave |
|-------|-----|-------------------|
| Registro de usuario | RF-01, RF-03 | Usuario, Auth Service, Whitelist |
| Login | RF-02 | Usuario, Auth Service, JWT |
| Crear reserva | RF-10, RF-11 | Usuario, Reservation Service, Conflict Validator |
| Cancelar reserva | RF-12 | Usuario, Reservation Service, Audit Logger |
| Ajustar reserva (secretaria) | RF-13 | Secretaria, Reservation Service, Audit Logger |
| Generar reporte | RF-17-20 | Secretaria, Report Service, Repository |

### Reglas para Secuencia
- Incluir **validaciones de negocio** (conflicto de horario, franja horaria)
- Mostrar **flujos alternativos** (error, conflicto encontrado)
- Incluir **auditoría** cuando aplique (R-11)
- Seguir la arquitectura en capas: Frontend → Controller → Service → Repository → DB

---

## 3. Diagramas de Clases

### Plantilla de Entidades

```mermaid
classDiagram
    class Usuario {
        +int id
        +String nombre
        +String correoInstitucional
        +Rol rol
        +Facultad facultad
        +registrar()
        +login()
    }

    class Sala {
        +int id
        +String nombre
        +int capacidad
        +boolean habilitada
        +Facultad facultad
        +List~RecursoTecnologico~ recursos
        +habilitar()
        +deshabilitar()
    }

    class Reserva {
        +int id
        +Sala sala
        +Usuario usuario
        +Date fecha
        +Time horaInicio
        +Time horaFin
        +EstadoReserva estado
        +crear()
        +cancelar()
    }

    class Facultad {
        +int id
        +String nombre
    }

    Usuario "1" --> "1" Facultad
    Sala "1" --> "1" Facultad
    Reserva "*" --> "1" Sala
    Reserva "*" --> "1" Usuario
```

### Reglas para Clases
- Incluir **atributos** y **métodos** relevantes
- Mostrar **relaciones** con multiplicidad
- Separar por capas si es diagrama de arquitectura
- Mapear a las entidades del modelo de BD (`docs/database-model.md`)
