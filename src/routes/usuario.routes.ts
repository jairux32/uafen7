import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { authenticate, authorize } from '../middleware/auth';
import { RolUsuario } from '@prisma/client';

const router = Router();

/**
 * User Management Routes
 */

// List users (Admins and Notaries)
router.get(
    '/',
    authenticate,
    authorize(RolUsuario.ADMIN_SISTEMA, RolUsuario.NOTARIO),
    (req, res) => usuarioController.listar(req, res)
);

// Update user details
router.patch(
    '/:id',
    authenticate,
    authorize(RolUsuario.ADMIN_SISTEMA, RolUsuario.NOTARIO),
    (req, res) => usuarioController.actualizar(req, res)
);

// Toggle active status
router.patch(
    '/:id/estado',
    authenticate,
    authorize(RolUsuario.ADMIN_SISTEMA, RolUsuario.NOTARIO),
    (req, res) => usuarioController.cambiarEstado(req, res)
);

export default router;
