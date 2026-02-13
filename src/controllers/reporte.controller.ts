import { Request, Response } from 'express';
import { uafeIntegration } from '../integrations/uafe.integration';
import { generateRESUSchema, generateROSSchema } from '../models/schemas';
import logger from '../config/logger';

/**
 * Reporte Controller
 */
export class ReporteController {
    /**
     * Generate RESU report
     * POST /api/reportes/resu
     */
    async generarRESU(req: Request, res: Response) {
        try {
            const { notariaId, mes, anio } = generateRESUSchema.parse(req.body);

            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const reporte = await uafeIntegration.generarRESU(notariaId, mes, anio);

            logger.info('RESU report generated', {
                reporteId: reporte.id,
                mes,
                anio,
                usuarioId: req.user.id,
            });

            return res.status(201).json(reporte);
        } catch (error: any) {
            logger.error('Generate RESU error', { error });
            return res.status(400).json({
                error: 'Error al generar RESU',
                details: error.message,
            });
        }
    }

    /**
     * Generate ROS report
     * POST /api/reportes/ros
     */
    async generarROS(req: Request, res: Response) {
        try {
            const { alertaId } = generateROSSchema.parse(req.body);

            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const reporte = await uafeIntegration.generarROS(alertaId);

            logger.warn('ROS report generated (CONFIDENTIAL)', {
                reporteId: reporte.id,
                alertaId,
                usuarioId: req.user.id,
            });

            return res.status(201).json({
                message: 'Reporte ROS generado (CONFIDENCIAL)',
                reporteId: reporte.id,
            });
        } catch (error: any) {
            logger.error('Generate ROS error', { error });
            return res.status(400).json({
                error: 'Error al generar ROS',
                details: error.message,
            });
        }
    }

    /**
     * Send report to UAFE
     * POST /api/reportes/:id/enviar
     */
    async enviar(req: Request, res: Response) {
        try {
            const id = req.params.id as string;

            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const confirmacion = await uafeIntegration.enviarReporte(id);

            logger.info('Report sent to UAFE', {
                reporteId: id,
                confirmacion: confirmacion.numeroConfirmacion,
                usuarioId: req.user.id,
            });

            return res.json({
                message: 'Reporte enviado a UAFE exitosamente',
                confirmacion,
            });
        } catch (error: any) {
            logger.error('Send report error', { error });
            return res.status(400).json({
                error: 'Error al enviar reporte',
                details: error.message,
            });
        }
    }
}

export const reporteController = new ReporteController();
