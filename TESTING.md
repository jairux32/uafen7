# VSinnfo - Test Suite

## Resumen de Tests

Este proyecto incluye tests unitarios y de integración para garantizar la calidad y confiabilidad del backend VSinnfo.

## Estructura de Tests

```
tests/
├── setup.ts                          # Configuración global de tests
├── unit/                             # Tests unitarios
│   ├── riskAssessment.service.spec.ts
│   └── encryption.spec.ts
└── integration/                      # Tests de integración
    ├── auth.api.spec.ts
    └── uafe.integration.spec.ts
```

## Cobertura de Tests

### Tests Unitarios (27 casos)

#### Risk Assessment Service (15 tests)
- ✅ Evaluación de tipo de DD (4 tests)
  - SIMPLIFICADA para operaciones de bajo riesgo
  - ESTANDAR para operaciones de riesgo medio
  - REFORZADA para empresas extranjeras
  - INTENSIFICADA para PEPs

- ✅ Cálculo de score de riesgo (4 tests)
  - Score bajo para operaciones simples
  - Score alto para efectivo >= $10k
  - Score muy alto para PEPs + alto valor
  - Límite máximo de 100

- ✅ Identificación de factores de riesgo (3 tests)
  - Factor de efectivo alto
  - Factores de PEP (vendedor y comprador)
  - Factor de empresa extranjera

- ✅ Determinación de nivel de riesgo (4 tests)
  - BAJO (< 30)
  - MEDIO (30-49)
  - ALTO (50-69)
  - MUY_ALTO (>= 70)

#### Encryption Service (12 tests)
- ✅ Cifrado/descifrado AES-256-GCM (4 tests)
  - Cifrado y descifrado correcto
  - IVs únicos para mismo plaintext
  - Manejo de caracteres especiales y unicode
  - Rechazo de datos inválidos

- ✅ Hashing SHA-256 (3 tests)
  - Hashes consistentes
  - Hashes diferentes para inputs diferentes
  - Manejo de Buffer

- ✅ Password hashing con bcrypt (3 tests)
  - Hash y verificación correcta
  - Rechazo de password incorrecta
  - Salts únicos

- ✅ Generación de tokens (2 tests)
  - Longitud por defecto
  - Longitud personalizada

### Tests de Integración (18 casos)

#### Auth API (9 tests)
- ✅ POST /api/auth/register (3 tests)
  - Registro exitoso
  - Rechazo de email duplicado
  - Validación de formato de email

- ✅ POST /api/auth/login (3 tests)
  - Login exitoso
  - Rechazo de password incorrecta
  - Rechazo de usuario inexistente

- ✅ GET /api/auth/me (3 tests)
  - Perfil con token válido
  - Rechazo sin token
  - Rechazo con token inválido

#### UAFE Integration (9 tests)
- ✅ Generación de RESU (3 tests)
  - Generación exitosa
  - Estructura de Excel correcta
  - Filtrado por monto >= $10k

- ✅ Generación de ROS (3 tests)
  - Generación exitosa
  - Cifrado de datos
  - Inclusión de detalles completos

- ✅ Envío de reportes (2 tests)
  - Envío a UAFE (mocked)
  - Validación de estado

## Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Tests unitarios solamente
```bash
npm run test:unit
```

### Tests de integración solamente
```bash
npm run test:integration
```

### Con cobertura
```bash
npm run test:coverage
```

### Modo watch (desarrollo)
```bash
npm run test:watch
```

## Configuración de Test Database

Para los tests de integración, necesitas una base de datos de prueba:

```bash
# Crear base de datos de test
sudo -u postgres psql
CREATE DATABASE vsinnfo_test OWNER vsinnfo;
\q

# Configurar en .env.test
DATABASE_URL=postgresql://vsinnfo:password@localhost:5432/vsinnfo_test
```

## Comandos NPM

Agregar estos scripts a `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

## Métricas de Cobertura Esperadas

- **Statements**: >= 80%
- **Branches**: >= 75%
- **Functions**: >= 80%
- **Lines**: >= 80%

## Próximos Tests a Implementar

- [ ] Tests para Alert Management Service
- [ ] Tests para operaciones API
- [ ] Tests para middleware de autorización
- [ ] Tests E2E con flujos completos
- [ ] Tests de performance para operaciones masivas

## Notas Importantes

1. **Aislamiento**: Cada test limpia sus datos después de ejecutarse
2. **Mocks**: APIs externas (UAFE, OFAC) están mockeadas en tests
3. **Seguridad**: Tests usan credenciales de prueba, nunca producción
4. **Paralelización**: Tests pueden ejecutarse en paralelo con `--maxWorkers`

## Troubleshooting

### Error: "Cannot find module"
```bash
npm install
npm run prisma:generate
```

### Error: "Database connection failed"
```bash
# Verificar que la base de datos de test existe
psql -U vsinnfo -d vsinnfo_test
```

### Tests lentos
```bash
# Ejecutar en paralelo
npm test -- --maxWorkers=4
```
