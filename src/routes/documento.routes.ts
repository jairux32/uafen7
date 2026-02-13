import { Router } from 'express';
import { documentoController } from '../controllers/documento.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Subir documento
router.post('/', upload.single('archivo'), documentoController.upload);

// Listar documentos de una operación
router.get('/operacion/:operacionId', documentoController.getByOperacion);

// Descargar documento
router.get('/:id/download', documentoController.download);

// Eliminar documento
router.delete('/:id', documentoController.delete);

export default router;
