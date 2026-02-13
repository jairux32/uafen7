import { Request, Response } from 'express';
import { alertManagementService } from '../services/alertManagement.service';
import { gestionarAlertaSchema } from '../models/schemas';
import logger from '../config/logger';
import { EstadoAlerta } from '@prisma/client';

/**
 * Alert Controller
 */
export class AlertController {
    /**
     * Get pending alerts for notaría
     * GET /api/alertas/pendientes?notariaId=xxx
     */
    async getPendientes(req: Request, res: Response) {
        try {
            const { notariaId } = req.query;

            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const alertas = await alertManagementService.obtenerAlertasPendientes(
                (notariaId as string) || req.user.notariaId
            );

            return res.json(alertas);
        } catch (error: any) {
            logger.error('Get pending alerts error', { error });
            return res.status(500).json({
                error: 'Error al obtener alertas pendientes',
                details: error.message,
            });
        }
    }

    /**
     * Manage alert (review and decide)
     * PATCH /api/alertas/:id/gestionar
     */
    async gestionar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { decision, comentario } = gestionarAlertaSchema.parse(req.body);

            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            await alertManagementService.gestionarAlerta(
                id as string,
                req.user.id,
                decision as EstadoAlerta,
                comentario
            );

            logger.info('Alert managed', {
                alertaId: id,
                decision,
                usuarioId: req.user.id,
            });

            return res.json({
                message: 'Alerta gestionada exitosamente',
                alertaId: id,
                decision,
            });
        } catch (error: any) {
            logger.error('Manage alert error', { error });
            return res.status(400).json({
                error: 'Error al gestionar alerta',
                details: error.message,
            });
        }
    }
}

export const alertController = new AlertController();
