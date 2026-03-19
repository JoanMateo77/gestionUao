# Guía General para IA: Cómo Generar Colecciones Postman desde un Proyecto

> Instrucciones paso a paso y genéricas para que un agente IA analice un backend y genere una colección Postman completa y funcional.

---

## 1. Analizar el Proyecto (Exploración)

### 1.1 Leer la documentación primero
Revisa si existe documentación de la API, roles o restricciones funcionales. Esto determinará el orden lógico y qué reglas aplican a cada endpoint.

### 1.2 Identificar el stack tecnológico y seguridad
Dependiendo de qué tecnologías y librerías se usen (ej. tokens Bearer con JWT manual, NextAuth, cookies HTTP Only), se debe adaptar cómo interactúa la colección. Identifica el método exacto en el proyecto para extraer y guardar tokens.

### 1.3 Mapear la API
Para cada archivo de ruta o controlador, extrae la siguiente información:

| Campo | Ejemplo / Cómo encontrarlo |
|-------|----------------------------|
| **Ruta** | Estructura de carpetas (`api/users/[id]/status` → `/api/users/:id/status`) |
| **Auth requerida** | `getServerSession(authOptions)` / `req.user` = requiere autenticación |
| **Rol requerido** | Verificaciones explícitas de roles (`user.role !== 'ADMIN'`) |
| **Request body** | `await req.json()` / `req.body` → schemas de validación (Zod/Joi/DTOs) |
| **Query params** | `searchParams.get('page')` / `req.query.page` |
| **Respuestas** | `NextResponse.json(...)` / `res.json(...)` con status codes esperados |

---

## 2. Construir la Colección JSON

### 2.1 Estructura del archivo Postman v2.1
Crea un JSON válido basado en el esquema `v2.1.0/collection.json`, conteniendo la información base, variables globales y el array de peticiones `item`.

### 2.2 Variables dinámicas
Es imprescindible el uso de variables dinámicas auto-asignables.
Variables típicas:
- `baseUrl` → URL del servidor (ej. `http://localhost:3000`)
- `sessionToken` / `jwtToken` → Token de sesión
- IDs dinámicos: `userId`, `resourceId`, `orderId`, etc.

### 2.3 Manejo de Autenticación
Adapta el Postman al método detectado:
- **Cookies HTTP Option**: `<"key": "Cookie", "value": "auth-token={{sessionToken}}">`
- **JWT Estándar**: Uso de `Bearer {{jwtToken}}` en los `Headers` o bloque `Auth`.

### 2.4 Organizar en Carpetas Lógicas
Divide la colección conceptualmente por los dominios o features del sistema:

```text
📁 Auth         → Register, Login, Me/Session
📁 Catálogos    → Entidades de sólo lectura (ej. Países, Categorías)
📁 Entidades    → CRUD principal (ej. Usuarios, Productos)
📁 Operaciones  → Flujos complejos (ej. Procesar Pago, Cambiar Estado)
📁 Seguridad    → Pruebas negativas y validaciones (401, 403, 409)
```

---

## 3. Test Scripts Esenciales para Validar

Genera scripts en la pestaña `Tests` (`post-ejecución`) para automatizar el flujo:

**Validar estado HTTP:**
```javascript
pm.test('Status 200 o 201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));
```

**Asignar variables automáticamente (Ejemplo CRUD):**
```javascript
const data = pm.response.json();
if (data.token) pm.collectionVariables.set('sessionToken', data.token);
if (data.id) pm.collectionVariables.set('entityId', data.id);
```

---

## 4. Orden de Ejecución Recomendado

Diseña la colección para ejecutarse secuencialmente de arriba hacia abajo:

1. Llamadas iniciales públicas y catálogos base.
2. Interacciones de Auth (Register, Login, guardado de Token).
3. Obtención y asignamiento de catálogos necesarios para las entidades principales.
4. CRUD fundamental secuencial (POST -> GET -> PATCH/PUT -> DELETE).
5. Escenarios de error esperados (Validación de robustez: 400s, 401s, 403s, 409s).

---

## 5. Ejemplo de Referencia

Procura siempre guardar la colección base en el directorio del proyecto con estructura clara:
`postman/[Nombre_Del_Proyecto].postman_collection.json`
