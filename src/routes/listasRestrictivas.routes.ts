import { Router } from 'express';
import { listasRestrictivasController } from '../controllers/listasRestrictivas.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog, TipoAccion } from '../middleware/auditLog';
import { RolUsuario } from '@prisma/client';

const router = Router();

/**
 * Listas Restrictivas Routes
 * All routes require authentication
 */

// POST /api/verificar-listas
router.post(
    '/',
    authenticate,
    authorize(RolUsuario.MATRIZADOR, RolUsuario.OFICIAL_CUMPLIMIENTO, RolUsuario.ADMIN_SISTEMA),
    auditLog('ListasRestrictivas', TipoAccion.LEER),
    (req, res) => listasRestrictivasController.verificar(req, res)
);

export default router;
