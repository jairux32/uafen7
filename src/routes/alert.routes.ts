import { Router } from 'express';
import { alertController } from '../controllers/alert.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog, TipoAccion } from '../middleware/auditLog';
import { RolUsuario } from '@prisma/client';

const router = Router();

/**
 * Alert Routes
 * All routes require authentication
 * Only Oficial de Cumplimiento and above can manage alerts
 */

// GET /api/alertas/pendientes
router.get(
    '/pendientes',
    authenticate,
    authorize(RolUsuario.OFICIAL_CUMPLIMIENTO, RolUsuario.NOTARIO, RolUsuario.ADMIN_SISTEMA),
    auditLog('Alerta', TipoAccion.LEER),
    (req, res) => alertController.getPendientes(req, res)
);

// PATCH /api/alertas/:id/gestionar
router.patch(
    '/:id/gestionar',
    authenticate,
    authorize(RolUsuario.OFICIAL_CUMPLIMIENTO, RolUsuario.ADMIN_SISTEMA),
    auditLog('Alerta', TipoAccion.ACTUALIZAR),
    (req, res) => alertController.gestionar(req, res)
);

export default router;
