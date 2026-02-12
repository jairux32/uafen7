import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Authentication Routes
 */

// POST /api/auth/login
router.post('/login', (req, res) => authController.login(req, res));

// POST /api/auth/register
router.post('/register', (req, res) => authController.register(req, res));

// GET /api/auth/me (protected)
router.get('/me', authenticate, (req, res) => authController.me(req, res));

export default router;
