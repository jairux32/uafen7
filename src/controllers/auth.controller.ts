import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { encryptionService } from '../utils/encryption';
import { generateToken } from '../middleware/auth';
import { loginSchema, registerSchema } from '../models/schemas';
import logger from '../config/logger';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 *
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@notaria.com
 *         password:
 *           type: string
 *           format: password
 *           example: admin123
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - nombres
 *         - apellidos
 *         - cedula
 *         - email
 *         - password
 *         - notariaId
 *         - rol
 *       properties:
 *         nombres:
 *           type: string
 *         apellidos:
 *           type: string
 *         cedula:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         notariaId:
 *           type: string
 *           format: uuid
 *         rol:
 *           type: string
 *           enum: [ADMIN_SISTEMA, NOTARIO, OFICIAL_CUMPLIMIENTO, MATRIZADOR]
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *         nombres:
 *           type: string
 *         apellidos:
 *           type: string
 *         rol:
 *           type: string
 */
export class AuthController {
    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Authenticate user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       401:
     *         description: Invalid credentials
     */
    async login(req: Request, res: Response) {
        try {
            const { email, password } = loginSchema.parse(req.body);

            // Find user
            const user = await prisma.usuario.findUnique({
                where: { email },
                include: { notaria: true },
            });

            if (!user || !user.activo) {
                return res.status(401).json({
                    error: 'Credenciales inválidas',
                });
            }

            // Verify password
            const isValidPassword = await encryptionService.comparePassword(
                password,
                user.password
            );

            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Credenciales inválidas',
                });
            }

            // Update last access
            await prisma.usuario.update({
                where: { id: user.id },
                data: { ultimoAcceso: new Date() },
            });

            // Generate token
            const token = generateToken(user.id);

            logger.info('User logged in', { userId: user.id, email: user.email });

            return res.json({
                token,
                user: {
                    id: user.id,
                    nombres: user.nombres,
                    apellidos: user.apellidos,
                    email: user.email,
                    rol: user.rol,
                    notaria: {
                        id: user.notaria.id,
                        nombre: user.notaria.nombre,
                    },
                },
            });
        } catch (error: any) {
            logger.error('Login error', { error });
            return res.status(400).json({
                error: 'Error en el inicio de sesión',
                details: error.message,
            });
        }
    }

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterRequest'
     *     responses:
     *       201:
     *         description: User created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       400:
     *         description: User already exists or invalid data
     */
    async register(req: Request, res: Response) {
        try {
            const data = registerSchema.parse(req.body);

            // Check if user already exists
            const existingUser = await prisma.usuario.findFirst({
                where: {
                    OR: [{ email: data.email }, { cedula: data.cedula }],
                },
            });

            if (existingUser) {
                return res.status(400).json({
                    error: 'Usuario ya existe',
                    message: 'El email o cédula ya están registrados',
                });
            }

            // Hash password
            const hashedPassword = await encryptionService.hashPassword(data.password);

            // Create user
            const user = await prisma.usuario.create({
                data: {
                    ...data,
                    password: hashedPassword,
                },
                include: { notaria: true },
            });

            logger.info('User registered', { userId: user.id, email: user.email });

            // Generate token
            const token = generateToken(user.id);

            return res.status(201).json({
                token,
                user: {
                    id: user.id,
                    nombres: user.nombres,
                    apellidos: user.apellidos,
                    email: user.email,
                    rol: user.rol,
                    notaria: {
                        id: user.notaria.id,
                        nombre: user.notaria.nombre,
                    },
                },
            });
        } catch (error: any) {
            logger.error('Registration error', { error });
            return res.status(400).json({
                error: 'Error en el registro',
                details: error.message,
            });
        }
    }

    /**
     * @swagger
     * /auth/me:
     *   get:
     *     summary: Get current user profile
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Current user profile
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       401:
     *         description: Not authenticated
     */
    async me(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const user = await prisma.usuario.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    nombres: true,
                    apellidos: true,
                    cedula: true,
                    email: true,
                    rol: true,
                    activo: true,
                    ultimoAcceso: true,
                    notaria: {
                        select: {
                            id: true,
                            nombre: true,
                            ruc: true,
                            direccion: true,
                            telefono: true,
                            email: true,
                        },
                    },
                },
            });

            return res.json(user);
        } catch (error: any) {
            logger.error('Get profile error', { error });
            return res.status(500).json({
                error: 'Error al obtener perfil',
                details: error.message,
            });
        }
    }
}

export const authController = new AuthController();
