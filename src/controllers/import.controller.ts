import { Request, Response } from 'express';
import { importService } from '../services/import.service';
import logger from '../config/logger';

export class ImportController {
    /**
     * Import historical operations from Excel
     * POST /api/admin/bulk-import
     */
    async bulkImport(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se subió ningún archivo' });
            }

            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            logger.info('Starting bulk import', {
                filename: req.file.originalname,
                usuarioId: req.user.id,
                notariaId: req.user.notariaId
            });

            const result = await importService.importFromExcel(
                req.file.buffer,
                req.user.notariaId,
                req.user.id
            );

            if (!result.success) {
                return res.status(207).json({
                    message: 'Importación completada con algunos errores',
                    stats: {
                        procesados: result.totalProcesadas,
                        errores: result.errores.length
                    },
                    errores: result.errores
                });
            }

            return res.json({
                message: 'Importación completada exitosamente',
                stats: {
                    procesados: result.totalProcesadas
                }
            });

        } catch (error: any) {
            logger.error('Bulk import error', { error });
            return res.status(500).json({
                error: 'Error interno durante la importación',
                details: error.message
            });
        }
    }
}

export const importController = new ImportController();
