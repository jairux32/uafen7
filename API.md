# VSinnfo API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "usuario@example.com",
    "rol": "OFICIAL_CUMPLIMIENTO",
    "notaria": {
      "id": "uuid",
      "nombre": "Notaría Primera de Quito"
    }
  }
}
```

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "cedula": "1234567890",
  "email": "usuario@example.com",
  "password": "password123",
  "rol": "MATRIZADOR",
  "notariaId": "uuid"
}
```

#### GET /auth/me
Get current user profile (protected).

---

### Operaciones

#### POST /operaciones
Create a new operation (Matrizador, Oficial, Admin).

**Request:**
```json
{
  "tipoActo": "COMPRAVENTA",
  "numeroEscritura": "001-2026",
  "fechaEscritura": "2026-02-11T10:00:00Z",
  "descripcionBien": "Casa de dos plantas ubicada en...",
  "valorDeclarado": 150000,
  "formaPago": "TRANSFERENCIA",
  "montoEfectivo": 0,
  "vendedorId": "uuid",
  "compradorId": "uuid",
  "notariaId": "uuid"
}
```

**Response:**
```json
{
  "operacion": { /* ... */ },
  "riesgo": {
    "nivel": "MEDIO",
    "score": 35,
    "factores": [
      {
        "tipo": "TIPO_ACTO",
        "descripcion": "Compraventa (riesgo medio-alto)",
        "peso": 15
      }
    ]
  }
}
```

#### GET /operaciones
Get all operations with filters.

**Query params:**
- `notariaId` (optional)
- `estado` (optional): BORRADOR, EN_REVISION, APROBADA, REPORTADA, ARCHIVADA
- `nivelRiesgo` (optional): BAJO, MEDIO, ALTO, MUY_ALTO
- `page` (default: 1)
- `limit` (default: 20)

#### GET /operaciones/:id
Get operation by ID.

#### PATCH /operaciones/:id/estado
Update operation status (Oficial, Notario, Admin).

**Request:**
```json
{
  "estado": "APROBADA"
}
```

---

### Alertas

#### GET /alertas/pendientes
Get pending alerts (Oficial, Notario, Admin).

**Query params:**
- `notariaId` (optional)

**Response:**
```json
[
  {
    "id": "uuid",
    "tipo": "EFECTIVO_EXCEDE_LIMITE",
    "severidad": "CRITICA",
    "titulo": "Pago en efectivo excede límite legal",
    "descripcion": "Operación con pago en efectivo de $12,000 USD...",
    "estado": "PENDIENTE",
    "operacion": {
      "numeroEscritura": "001-2026",
      "tipoActo": "COMPRAVENTA",
      "valorDeclarado": 150000
    }
  }
]
```

#### PATCH /alertas/:id/gestionar
Manage alert (Oficial, Admin).

**Request:**
```json
{
  "decision": "CONFIRMADA",
  "comentario": "Se verificó que el efectivo proviene de..."
}
```

---

### Reportes

#### POST /reportes/resu
Generate RESU report (Oficial, Admin).

**Request:**
```json
{
  "notariaId": "uuid",
  "mes": 1,
  "anio": 2026
}
```

**Response:**
```json
{
  "id": "uuid",
  "tipo": "RESU",
  "mes": 1,
  "anio": 2026,
  "estado": "GENERADO",
  "archivoPath": "/storage/reportes/resu/RESU_xxx_2026_01.xlsx",
  "archivoHash": "sha256hash...",
  "datosReporte": {
    "totalOperaciones": 15,
    "montoTotal": 2500000
  }
}
```

#### POST /reportes/ros
Generate ROS report (Oficial, Admin).

**Request:**
```json
{
  "alertaId": "uuid"
}
```

**Response:**
```json
{
  "message": "Reporte ROS generado (CONFIDENCIAL)",
  "reporteId": "uuid"
}
```

#### POST /reportes/:id/enviar
Send report to UAFE (Oficial, Notario, Admin).

**Response:**
```json
{
  "message": "Reporte enviado a UAFE exitosamente",
  "confirmacion": {
    "numeroConfirmacion": "RESU-1234567890",
    "fechaRecepcion": "2026-02-11T15:30:00Z",
    "estado": "RECIBIDO"
  }
}
```

---

## Roles y Permisos

### MATRIZADOR (1ª línea)
- ✅ Crear operaciones
- ✅ Ver operaciones
- ❌ Aprobar operaciones
- ❌ Gestionar alertas
- ❌ Generar reportes

### OFICIAL_CUMPLIMIENTO (2ª línea)
- ✅ Crear operaciones
- ✅ Ver operaciones
- ✅ Aprobar operaciones
- ✅ Gestionar alertas
- ✅ Generar reportes RESU/ROS
- ✅ Enviar reportes a UAFE

### NOTARIO (Máxima autoridad)
- ✅ Ver operaciones
- ✅ Ver alertas
- ✅ Aprobar operaciones
- ✅ Enviar reportes a UAFE
- ❌ Crear operaciones
- ❌ Gestionar alertas
- ❌ Generar reportes

### ADMIN_SISTEMA
- ✅ Acceso completo a todas las funciones

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Error de validación",
  "details": "Email inválido"
}
```

### 401 Unauthorized
```json
{
  "error": "No autenticado"
}
```

### 403 Forbidden
```json
{
  "error": "No autorizado",
  "message": "Se requiere uno de los siguientes roles: OFICIAL_CUMPLIMIENTO, ADMIN_SISTEMA"
}
```

### 404 Not Found
```json
{
  "error": "Operación no encontrada"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error interno del servidor"
}
```
