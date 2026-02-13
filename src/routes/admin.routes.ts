import { Router } from 'express';
import { importController } from '../controllers/import.controller';
import { authenticate, authorize } from '../middleware/auth';
import { RolUsuario } from '@prisma/client';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Admin Routes
 * Restricted to ADMIN_SISTEMA or NOTARIO
 */

router.post(
    '/bulk-import',
    authenticate,
    authorize(RolUsuario.ADMIN_SISTEMA, RolUsuario.NOTARIO),
    upload.single('file'),
    (req, res) => importController.bulkImport(req, res)
);

export default router;
