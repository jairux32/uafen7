# Guía de Configuración de Base de Datos

## Requisitos Previos

- PostgreSQL 15 o superior instalado
- Redis 7 o superior instalado
- Node.js 20 o superior

## 1. Instalar PostgreSQL

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Verificar instalación
```bash
psql --version
```

## 2. Crear Base de Datos y Usuario

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear usuario
CREATE USER vsinnfo WITH PASSWORD 'vsinnfo_password';

# Crear base de datos
CREATE DATABASE vsinnfo_dev OWNER vsinnfo;

# Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE vsinnfo_dev TO vsinnfo;

# Salir
\q
```

## 3. Instalar Redis

### Ubuntu/Debian
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Verificar instalación
```bash
redis-cli ping
# Debe responder: PONG
```

## 4. Configurar Variables de Entorno

Copiar el archivo de ejemplo y configurar:

```bash
cp .env.example .env
```

Editar `.env`:
```bash
# Database
DATABASE_URL=postgresql://vsinnfo:vsinnfo_password@localhost:5432/vsinnfo_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu-secreto-super-seguro-aqui-cambiar-en-produccion

# Encryption (CAMBIAR EN PRODUCCIÓN)
ENCRYPTION_KEY=tu-clave-de-32-caracteres-aqui

# API Mocks
USE_API_MOCKS=true
```

## 5. Instalar Dependencias

```bash
npm install
```

## 6. Generar Cliente Prisma

```bash
npm run prisma:generate
```

## 7. Ejecutar Migraciones

```bash
# Crear y aplicar migración inicial
npm run prisma:migrate

# Cuando se solicite el nombre, usar: init
```

## 8. Verificar Base de Datos

```bash
# Abrir Prisma Studio (GUI)
npm run prisma:studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde podrás ver las tablas creadas.

## 9. Crear Datos de Prueba (Opcional)

### Crear una Notaría

```bash
# Acceder a PostgreSQL
psql -U vsinnfo -d vsinnfo_dev

# Insertar notaría
INSERT INTO "Notaria" (id, nombre, ruc, direccion, telefono, email, tamano, "numeroNotaria", canton, provincia, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Notaría Primera de Quito',
  '1791234567001',
  'Av. Amazonas N24-03 y Colón',
  '02-2234567',
  'notaria1@example.com',
  'MEDIANA',
  '001',
  'Quito',
  'Pichincha',
  NOW(),
  NOW()
);

# Salir
\q
```

### Crear Usuario Administrador

Usar el endpoint `/api/auth/register` con Postman o curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Admin",
    "apellidos": "Sistema",
    "cedula": "1234567890",
    "email": "admin@vsinnfo.com",
    "password": "Admin123!",
    "rol": "ADMIN_SISTEMA",
    "notariaId": "<UUID_DE_LA_NOTARIA>"
  }'
```

## 10. Iniciar Servidor

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm run build
npm start
```

## 11. Verificar Funcionamiento

```bash
# Health check
curl http://localhost:3000/health

# Debe responder:
# {"status":"ok","timestamp":"2026-02-11T...","environment":"development"}
```

## Comandos Útiles

### Prisma

```bash
# Ver estado de migraciones
npx prisma migrate status

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos (CUIDADO: elimina todos los datos)
npx prisma migrate reset

# Generar cliente después de cambios en schema
npm run prisma:generate

# Formatear schema.prisma
npx prisma format
```

### PostgreSQL

```bash
# Conectar a base de datos
psql -U vsinnfo -d vsinnfo_dev

# Ver tablas
\dt

# Describir tabla
\d "Notaria"

# Ver datos
SELECT * FROM "Notaria";

# Salir
\q
```

### Redis

```bash
# Conectar a Redis
redis-cli

# Ver todas las claves
KEYS *

# Ver valor de una clave
GET clave

# Limpiar todas las claves
FLUSHALL

# Salir
exit
```

## Troubleshooting

### Error: "role does not exist"
```bash
sudo -u postgres createuser vsinnfo
```

### Error: "database does not exist"
```bash
sudo -u postgres createdb vsinnfo_dev -O vsinnfo
```

### Error: "password authentication failed"
Verificar que el password en `.env` coincida con el de PostgreSQL.

### Error: "Redis connection refused"
```bash
sudo systemctl start redis-server
```

### Error: Prisma no encuentra la base de datos
Verificar que `DATABASE_URL` en `.env` esté correctamente configurado.

## Estructura de Tablas Creadas

Después de ejecutar las migraciones, se crearán las siguientes tablas:

1. `Notaria` - Sujetos obligados
2. `Usuario` - Usuarios del sistema
3. `DebiDaDiligencia` - KYC/Debida diligencia
4. `BeneficiarioFinal` - Beneficiarios finales (>=10% capital)
5. `PEP` - Personas Expuestas Políticamente
6. `Operacion` - Transacciones notariales
7. `Alerta` - Alertas de operaciones sospechosas
8. `Reporte` - Reportes UAFE (RESU, ROS, RIA)
9. `Documento` - Archivo paralelo digital
10. `ListaRestrictiva` - Listas UAFE, OFAC, ONU, etc.

## Próximos Pasos

1. ✅ Base de datos configurada
2. ✅ Migraciones ejecutadas
3. ✅ Servidor funcionando
4. ⏳ Crear datos de prueba
5. ⏳ Probar endpoints con Postman
6. ⏳ Configurar frontend (si aplica)
