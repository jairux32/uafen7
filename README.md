# VSinnfo - Plataforma de Cumplimiento Notarial Ecuador

Sistema de prevención de lavado de activos y financiamiento de delitos para notarías en Ecuador, en cumplimiento con la **Ley Orgánica de Prevención, Detección y Combate del Delito de Lavado de Activos y de la Financiación de Otros Delitos** (vigente desde julio 2025) y las regulaciones de la **UAFE** (Unidad de Análisis Financiero y Económico).

## 🎯 Características Principales

- ✅ **Debida Diligencia (KYC)** con niveles diferenciados (Simplificada, Estándar, Reforzada, Intensificada)
- ✅ **Identificación de Beneficiarios Finales** (≥10% capital)
- ✅ **Detección de PEPs** (Personas Expuestas Políticamente)
- ✅ **Validación automática de efectivo** (límite $10,000 USD)
- ✅ **Generación de alertas** (10 tipos de operaciones sospechosas)
- ✅ **Reportes UAFE** (RESU mensual, ROS en 4 días, RIA)
- ✅ **Consulta de listas restrictivas** (UAFE, OFAC, ONU)
- ✅ **Archivo paralelo digital** cifrado y segregado
- ✅ **Trazabilidad completa** con logs de auditoría

## 🏗️ Arquitectura

- **Backend**: Node.js 20+ con TypeScript
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL 15+
- **Cache**: Redis 7+
- **ORM**: Prisma
- **Autenticación**: JWT + Passport.js
- **Despliegue**: Híbrido (on-premise + cloud backup)

## 📋 Requisitos Previos

- Node.js >= 20.0.0
- PostgreSQL >= 15
- Redis >= 7
- npm >= 10.0.0

## 🚀 Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd uafen7

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Iniciar en modo desarrollo
npm run dev
```

## 🗄️ Base de Datos

```bash
# Crear migración
npx prisma migrate dev --name nombre_migracion

# Abrir Prisma Studio (GUI)
npm run prisma:studio

# Resetear base de datos (CUIDADO: elimina todos los datos)
npx prisma migrate reset
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Solo tests de integración
npm run test:integration
```

## 📦 Estructura del Proyecto

```
uafen7/
├── src/
│   ├── config/           # Configuraciones
│   ├── controllers/      # Controladores de rutas
│   ├── services/         # Lógica de negocio
│   ├── middleware/       # Middlewares (auth, encryption, etc.)
│   ├── models/           # Tipos y schemas Zod
│   ├── integrations/     # APIs externas (UAFE, OFAC, ONU)
│   ├── jobs/             # Tareas programadas (cron)
│   ├── utils/            # Utilidades
│   ├── mocks/            # Simulación de APIs
│   └── index.ts          # Entry point
├── prisma/
│   └── schema.prisma     # Esquema de base de datos
├── tests/                # Tests unitarios e integración
├── storage/              # Almacenamiento de archivos
├── logs/                 # Logs de aplicación
└── infrastructure/       # Configuración de despliegue
```

## 👥 Roles de Usuario

1. **Matrizador** (1ª línea): Ingreso de datos y operaciones
2. **Oficial de Cumplimiento** (2ª línea): Revisión, alertas y reportes
3. **Notario** (Máxima autoridad): Aprobación final
4. **Admin Sistema**: Administración técnica

## 📊 Reportes UAFE

### RESU (Reporte Estructurado de Sujetos Obligados)
- **Frecuencia**: Mensual
- **Plazo**: 15 días posteriores al cierre del mes
- **Contenido**: Operaciones ≥ $10,000 USD

### ROS (Reporte de Operaciones Sospechosas)
- **Frecuencia**: Por evento
- **Plazo**: 4 días desde conocimiento
- **Confidencial**: Cliente NO es notificado

### RIA (Reporte de Información Adicional)
- **Frecuencia**: Por requerimiento UAFE
- **Plazo**: 5 días hábiles

## 🔒 Seguridad

- Cifrado AES-256-GCM para datos sensibles
- Autenticación JWT con refresh tokens
- RBAC (Control de acceso basado en roles)
- Rate limiting y protección DDoS
- Logs de auditoría completos
- Cumplimiento con Ley de Protección de Datos Ecuador

## 📝 Licencia

Propietario - Todos los derechos reservados

## 📞 Soporte

Para soporte técnico, contactar a: [email de soporte]
