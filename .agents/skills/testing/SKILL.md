---
name: testing
description: Genera planes de prueba funcionales, casos de prueba y criterios de aceptación para el sistema de reservas
---

# Skill: Testing y Plan de Pruebas

## Cuándo usar este skill
- Crear plan de pruebas funcionales
- Diseñar casos de prueba para endpoints
- Validar criterios de aceptación de HU

## Formato de Caso de Prueba

```markdown
### CP-XXX: [Título del caso de prueba]

**HU:** HU-XX  
**RF:** RF-XX  
**Prioridad:** Alta | Media | Baja  
**Tipo:** Funcional | Integración | Boundary

| Campo | Valor |
|-------|-------|
| **Precondiciones** | [Estado inicial requerido] |
| **Datos de entrada** | [Datos específicos] |
| **Pasos** | 1. [Paso 1] |
| | 2. [Paso 2] |
| **Resultado esperado** | [Lo que debe ocurrir] |
| **Resultado real** | [Se llena en ejecución] |
| **Estado** | Pendiente | Pasó | Falló |
```

## Áreas Críticas de Prueba

### 1. Validación de Conflictos de Horario (RF-11)
Probar exhaustivamente:
- Reserva que se solapa completamente
- Reserva que se solapa parcialmente (inicio)
- Reserva que se solapa parcialmente (fin)
- Reserva que contiene otra
- Reserva adyacente (no debe conflictuar)
- Reserva en diferente sala (no debe conflictuar)

### 2. Franja Horaria (R-02)
- Reserva a las 6:59 AM → debe rechazar
- Reserva a las 7:00 AM → debe aceptar
- Reserva que termina a las 9:30 PM → debe aceptar
- Reserva que termina a las 9:31 PM → debe rechazar

### 3. Control de Acceso (RNF-05)
- Docente intenta CRUD de salas → debe rechazar
- Docente intenta ajustar reserva ajena → debe rechazar
- Secretaria ajusta reserva → debe aceptar
- Docente cancela reserva propia → debe aceptar
- Docente accede a reportes → debe rechazar

### 4. No Eliminación de Reservas (R-06)
- Cancelar reserva → estado cambia a CANCELADA
- Reserva cancelada sigue visible en historial
- No existe operación DELETE para reservas

### 5. Asignación de Roles (RF-03)
- Registro con correo en lista blanca → rol SECRETARIA
- Registro con correo normal → rol DOCENTE
- Registro con correo no institucional → rechazar

## Matriz de Cobertura RF → Casos de Prueba

| RF | Cantidad mínima de CP | Enfoque |
|----|----------------------|---------|
| RF-01 | 4 | Registro válido, duplicado, no institucional, lista blanca |
| RF-02 | 3 | Login válido, contraseña incorrecta, usuario inexistente |
| RF-03 | 2 | Asignación docente, asignación secretaria |
| RF-04 | 3 | Calendario con reservas, sin reservas, filtro por fecha |
| RF-10 | 5 | Reserva válida, conflicto, fuera de horario, sala deshabilitada, otra facultad |
| RF-11 | 6 | Todos los tipos de solapamiento |
| RF-12 | 3 | Cancelar propia, cancelar ajena (secretaria), historial preservado |
| RF-17-20 | 4 | Cada tipo de reporte + filtro por fechas |

## Template de Plan de Pruebas

```markdown
# Plan de Pruebas — [Iteración/Sprint]

## Alcance
[Qué RFs se prueban en esta iteración]

## Ambiente
[Ambiente de prueba: local, staging, etc.]

## Casos de Prueba
[Lista de CP-XXX con prioridad]

## Datos de Prueba
[Datos necesarios: usuarios, salas, reservas de ejemplo]

## Criterios de Salida
- 100% de CP de prioridad Alta ejecutados
- 0 defectos críticos abiertos
- Cobertura de RF según matriz
```
