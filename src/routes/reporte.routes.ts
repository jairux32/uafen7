import { Router } from 'express';
import { reporteController } from '../controllers/reporte.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog, TipoAccion } from '../middleware/auditLog';
import { RolUsuario } from '@prisma/client';

const router = Router();

/**
 * Reporte Routes
 * All routes require authentication
 * Only Oficial de Cumplimiento can generate and send reports
 */

// POST /api/reportes/resu
router.post(
    '/resu',
    authenticate,
    authorize(RolUsuario.OFICIAL_CUMPLIMIENTO, RolUsuario.ADMIN_SISTEMA),
    auditLog('Reporte', TipoAccion.CREAR),
    (req, res) => reporteController.generarRESU(req, res)
);

// POST /api/reportes/ros
router.post(
    '/ros',
    authenticate,
    authorize(RolUsuario.OFICIAL_CUMPLIMIENTO, RolUsuario.ADMIN_SISTEMA),
    auditLog('Reporte', TipoAccion.REPORTAR),
    (req, res) => reporteController.generarROS(req, res)
);

// POST /api/reportes/:id/enviar
router.post(
    '/:id/enviar',
    authenticate,
    authorize(RolUsuario.OFICIAL_CUMPLIMIENTO, RolUsuario.NOTARIO, RolUsuario.ADMIN_SISTEMA),
    auditLog('Reporte', TipoAccion.EXPORTAR),
    (req, res) => reporteController.enviar(req, res)
);

export default router;
