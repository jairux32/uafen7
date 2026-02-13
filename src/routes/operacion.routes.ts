import { Router } from 'express';
import { operacionController } from '../controllers/operacion.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog, TipoAccion } from '../middleware/auditLog';
import { RolUsuario } from '@prisma/client';

const router = Router();

/**
 * Operacion Routes
 * All routes require authentication
 */

// POST /api/operaciones
router.post(
    '/',
    authenticate,
    authorize(RolUsuario.MATRIZADOR, RolUsuario.OFICIAL_CUMPLIMIENTO, RolUsuario.ADMIN_SISTEMA),
    auditLog('Operacion', TipoAccion.CREAR),
    (req, res) => operacionController.create(req, res)
);

// GET /api/operaciones
router.get(
    '/',
    authenticate,
    auditLog('Operacion', TipoAccion.LEER),
    (req, res) => operacionController.getAll(req, res)
);

// Estadísticas del Dashboard
router.get(
    '/stats',
    authenticate,
    (req, res) => operacionController.getStats(req, res)
);

// GET /api/operaciones/:id
router.get(
    '/:id',
    authenticate,
    auditLog('Operacion', TipoAccion.LEER),
    (req, res) => operacionController.getById(req, res)
);

// PATCH /api/operaciones/:id/estado
router.patch(
    '/:id/estado',
    authenticate,
    authorize(RolUsuario.OFICIAL_CUMPLIMIENTO, RolUsuario.NOTARIO, RolUsuario.ADMIN_SISTEMA),
    auditLog('Operacion', TipoAccion.ACTUALIZAR),
    (req, res) => operacionController.updateEstado(req, res)
);

// POST /api/operaciones/calcular-riesgo
router.post(
    '/calcular-riesgo',
    authenticate,
    auditLog('Operacion', TipoAccion.LEER),
    (req, res) => operacionController.calcularRiesgoPreliminar(req, res)
);

// GET /api/operaciones/:id/pdf
router.get(
    '/:id/pdf',
    authenticate,
    auditLog('Operacion', TipoAccion.LEER),
    (req, res) => operacionController.descargarReporte(req, res)
);

// GET /api/operaciones/:id/kyc-pdf
router.get(
    '/:id/kyc-pdf',
    authenticate,
    auditLog('Operacion', TipoAccion.LEER),
    (req, res) => operacionController.descargarKYC(req, res)
);

export default router;
