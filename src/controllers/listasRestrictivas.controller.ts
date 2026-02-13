import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { complianceService } from '../services/compliance.service';
import logger from '../config/logger';

/**
 * Listas Restrictivas Controller
 * Handles verification against sanctions lists (Simulated)
 */
export class ListasRestrictivasController {
    /**
     * Verify vendor and buyer against restrictive lists
     * POST /api/verificar-listas
     */
    async verificar(req: Request, res: Response) {
        try {
            const { vendedorId, compradorId } = req.body;

            if (!vendedorId || !compradorId) {
                return res.status(400).json({
                    error: 'vendedorId y compradorId son requeridos',
                });
            }

            // Get vendor and buyer data
            const vendedor = await prisma.debiDaDiligencia.findUnique({
                where: { id: vendedorId },
            });

            const comprador = await prisma.debiDaDiligencia.findUnique({
                where: { id: compradorId },
            });

            if (!vendedor || !comprador) {
                return res.status(404).json({
                    error: 'Vendedor o comprador no encontrado',
                });
            }

            // Get full names
            const vendedorNombre =
                vendedor.razonSocial ||
                `${vendedor.nombres || ''} ${vendedor.apellidos || ''}`.trim();
            const compradorNombre =
                comprador.razonSocial ||
                `${comprador.nombres || ''} ${comprador.apellidos || ''}`.trim();

            logger.info(`Starting compliance check for Vendedor: ${vendedorNombre}, Comprador: ${compradorNombre}`);

            // Verify both persons using ComplianceService
            const [vendedorResult, compradorResult] = await Promise.all([
                complianceService.checkPerson(
                    vendedor.identificacion,
                    vendedorNombre
                ),
                complianceService.checkPerson(
                    comprador.identificacion,
                    compradorNombre
                ),
            ]);

            logger.info('Listas restrictivas verification completed (Simulation)', {
                vendedorId,
                compradorId,
            });

            return res.json({
                vendedor: {
                    globalStatus: Object.values(vendedorResult).some(r => r.status === 'MATCH') ? 'MATCH' : 'CLEAN',
                    details: vendedorResult
                },
                comprador: {
                    globalStatus: Object.values(compradorResult).some(r => r.status === 'MATCH') ? 'MATCH' : 'CLEAN',
                    details: compradorResult
                }
            });
        } catch (error) {
            logger.error('Error verifying listas restrictivas:', error);
            return res.status(500).json({
                error: 'Error al verificar listas restrictivas',
            });
        }
    }
}

export const listasRestrictivasController = new ListasRestrictivasController();
