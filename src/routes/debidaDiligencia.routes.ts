import { Router } from 'express';
import { debidaDiligenciaController } from '../controllers/debidaDiligencia.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog, TipoAccion } from '../middleware/auditLog';
import { RolUsuario } from '@prisma/client';

const router = Router();

/**
 * Debida Diligencia Routes
 * All routes require authentication
 */

// GET /api/debida-diligencia/buscar/:identificacion
router.get(
    '/buscar/:identificacion',
    authenticate,
    auditLog('DebiDaDiligencia', TipoAccion.LEER),
    (req, res) => debidaDiligenciaController.buscarPorIdentificacion(req, res)
);

// POST /api/debida-diligencia
router.post(
    '/',
    authenticate,
    authorize(RolUsuario.MATRIZADOR, RolUsuario.OFICIAL_CUMPLIMIENTO, RolUsuario.ADMIN_SISTEMA),
    auditLog('DebiDaDiligencia', TipoAccion.CREAR),
    (req, res) => debidaDiligenciaController.crear(req, res)
);

// PATCH /api/debida-diligencia/:id
router.patch(
    '/:id',
    authenticate,
    authorize(RolUsuario.MATRIZADOR, RolUsuario.OFICIAL_CUMPLIMIENTO, RolUsuario.ADMIN_SISTEMA),
    auditLog('DebiDaDiligencia', TipoAccion.ACTUALIZAR),
    (req, res) => debidaDiligenciaController.actualizar(req, res)
);

// GET /api/debida-diligencia/:id
router.get(
    '/:id',
    authenticate,
    auditLog('DebiDaDiligencia', TipoAccion.LEER),
    (req, res) => debidaDiligenciaController.obtenerPorId(req, res)
);

export default router;
