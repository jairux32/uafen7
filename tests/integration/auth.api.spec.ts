import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { encryptionService } from '../../src/utils/encryption';
import { RolUsuario } from '@prisma/client';

describe('Auth API Integration Tests', () => {
    let notariaId: string;

    beforeAll(async () => {
        // Create test notaría
        const notaria = await prisma.notaria.create({
            data: {
                nombre: 'Notaría Test',
                ruc: '1791234567001',
                direccion: 'Test Address',
                telefono: '0999999999',
                email: 'test@notaria.com',
                tamano: 'MEDIANA',
                numeroNotaria: '001',
                canton: 'Quito',
                provincia: 'Pichincha',
            },
        });
        notariaId = notaria.id;
    });

    afterAll(async () => {
        // Clean up
        await prisma.usuario.deleteMany({});
        await prisma.notaria.deleteMany({});
        await prisma.$disconnect();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    nombres: 'Juan',
                    apellidos: 'Pérez',
                    cedula: '1234567890',
                    email: 'juan.perez@test.com',
                    password: 'SecurePass123!',
                    rol: RolUsuario.MATRIZADOR,
                    notariaId,
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('juan.perez@test.com');
            expect(response.body.user.rol).toBe(RolUsuario.MATRIZADOR);
        });

        it('should reject duplicate email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    nombres: 'Maria',
                    apellidos: 'Garcia',
                    cedula: '0987654321',
                    email: 'duplicate@test.com',
                    password: 'Pass123!',
                    rol: RolUsuario.MATRIZADOR,
                    notariaId,
                });

            // Attempt duplicate
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    nombres: 'Pedro',
                    apellidos: 'Lopez',
                    cedula: '1122334455',
                    email: 'duplicate@test.com',
                    password: 'Pass456!',
                    rol: RolUsuario.MATRIZADOR,
                    notariaId,
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Usuario ya existe');
        });

        it('should reject invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    nombres: 'Test',
                    apellidos: 'User',
                    cedula: '1111111111',
                    email: 'invalid-email',
                    password: 'Pass123!',
                    rol: RolUsuario.MATRIZADOR,
                    notariaId,
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        const testUser = {
            email: 'login.test@test.com',
            password: 'TestPass123!',
        };

        beforeAll(async () => {
            // Create test user
            await request(app)
                .post('/api/auth/register')
                .send({
                    nombres: 'Login',
                    apellidos: 'Test',
                    cedula: '2222222222',
                    email: testUser.email,
                    password: testUser.password,
                    rol: RolUsuario.OFICIAL_CUMPLIMIENTO,
                    notariaId,
                });
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(testUser.email);
        });

        it('should reject incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toContain('Credenciales inválidas');
        });

        it('should reject non-existent user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'SomePassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toContain('Credenciales inválidas');
        });
    });

    describe('GET /api/auth/me', () => {
        let authToken: string;

        beforeAll(async () => {
            // Register and login to get token
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    nombres: 'Profile',
                    apellidos: 'Test',
                    cedula: '3333333333',
                    email: 'profile.test@test.com',
                    password: 'ProfilePass123!',
                    rol: RolUsuario.NOTARIO,
                    notariaId,
                });

            authToken = response.body.token;
        });

        it('should return user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe('profile.test@test.com');
            expect(response.body.rol).toBe(RolUsuario.NOTARIO);
            expect(response.body).toHaveProperty('notaria');
        });

        it('should reject request without token', async () => {
            const response = await request(app).get('/api/auth/me');

            expect(response.status).toBe(401);
        });

        it('should reject request with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });
    });
});
