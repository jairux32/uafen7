import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createOperacionSchema } from '../models/schemas';
import { riskAssessmentService } from '../services/riskAssessment.service';
import { alertManagementService } from '../services/alertManagement.service';
import logger from '../config/logger';
import { pdfService } from '../services/pdf.service';
import { EstadoOperacion } from '@prisma/client';

/**
 * Operacion Controller
 */
export class OperacionController {
    /**
     * Create new operation
     * POST /api/operaciones
     */
    async create(req: Request, res: Response) {
        try {
            const data = createOperacionSchema.parse(req.body);

            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            // Get vendedor and comprador data for risk assessment
            const vendedor = await prisma.debiDaDiligencia.findUnique({
                where: { id: data.vendedorId },
            });

            const comprador = await prisma.debiDaDiligencia.findUnique({
                where: { id: data.compradorId },
            });

            if (!vendedor || !comprador) {
                return res.status(400).json({
                    error: 'Vendedor o comprador no encontrado',
                });
            }

            // Evaluate risk
            const operacionInput = {
                tipoActo: data.tipoActo,
                valorDeclarado: data.valorDeclarado,
                montoEfectivo: data.montoEfectivo,
                vendedor: {
                    tipoPersona: vendedor.tipoPersona,
                    paisConstitucion: vendedor.paisConstitucion || undefined,
                    esPEP: vendedor.esPEP,
                },
                comprador: {
                    tipoPersona: comprador.tipoPersona,
                    paisConstitucion: comprador.paisConstitucion || undefined,
                    esPEP: comprador.esPEP,
                },
            };

            const scoreRiesgo = await riskAssessmentService.calcularScoreRiesgo(operacionInput);
            const nivelRiesgo = riskAssessmentService.determinarNivelRiesgo(scoreRiesgo);
            const factoresRiesgo = await riskAssessmentService.identificarFactoresRiesgo(operacionInput);
            const tipoDD = await riskAssessmentService.evaluarTipoDD(operacionInput);

            // Create operation
            const operacion = await prisma.operacion.create({
                data: {
                    ...data,
                    fechaEscritura: new Date(data.fechaEscritura),
                    creadorId: req.user.id,
                    estado: EstadoOperacion.BORRADOR,
                    nivelRiesgo,
                    scoreRiesgo,
                    tipoDD,
                    factoresRiesgo: factoresRiesgo as any,
                    notariaId: req.user.notariaId,
                },
                include: {
                    vendedor: true,
                    comprador: true,
                    notaria: true,
                },
            });

            // Generate automatic alerts
            await alertManagementService.validarEfectivo(operacion);
            await alertManagementService.detectarSubvaloracion(operacion);
            await alertManagementService.detectarPerfilIncompatible(operacion, comprador);
            await alertManagementService.detectarPremuraExcesiva(operacion);

            logger.info('Operation created', {
                operacionId: operacion.id,
                nivelRiesgo,
                scoreRiesgo,
            });

            return res.status(201).json({
                operacion,
                riesgo: {
                    nivel: nivelRiesgo,
                    score: scoreRiesgo,
                    factores: factoresRiesgo,
                },
            });
        } catch (error: any) {
            logger.error('Create operation error', { error });
            return res.status(400).json({
                error: 'Error al crear operación',
                details: error.message,
            });
        }
    }

    /**
     * Get all operations for a notaría
     * GET /api/operaciones?notariaId=xxx
     */
    async getAll(req: Request, res: Response) {
        try {
            const { notariaId, estado, nivelRiesgo, page = '1', limit = '20' } = req.query;

            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const where: any = {
                notariaId: notariaId as string || req.user.notariaId,
            };

            if (estado) {
                where.estado = estado;
            }

            if (nivelRiesgo) {
                where.nivelRiesgo = nivelRiesgo;
            }

            const [operaciones, total] = await Promise.all([
                prisma.operacion.findMany({
                    where,
                    include: {
                        vendedor: {
                            select: {
                                tipoPersona: true,
                                nombres: true,
                                apellidos: true,
                                razonSocial: true,
                            },
                        },
                        comprador: {
                            select: {
                                tipoPersona: true,
                                nombres: true,
                                apellidos: true,
                                razonSocial: true,
                            },
                        },
                        alertas: {
                            where: { estado: 'PENDIENTE' },
                            select: { id: true, tipo: true, severidad: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limitNum,
                }),
                prisma.operacion.count({ where }),
            ]);

            return res.json({
                data: operaciones,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            });
        } catch (error: any) {
            logger.error('Get operations error', { error });
            return res.status(500).json({
                error: 'Error al obtener operaciones',
                details: error.message,
            });
        }
    }

    /**
     * Get operation by ID
     * GET /api/operaciones/:id
     */
    async getById(req: Request, res: Response) {
        try {
            const id = req.params.id as string;

            const operacion = await prisma.operacion.findUnique({
                where: { id },
                include: {
                    vendedor: true,
                    comprador: true,
                    notaria: true,
                    creador: {
                        select: {
                            id: true,
                            nombres: true,
                            apellidos: true,
                            rol: true,
                        },
                    },
                    revisor: {
                        select: {
                            id: true,
                            nombres: true,
                            apellidos: true,
                            rol: true,
                        },
                    },
                    alertas: {
                        orderBy: { severidad: 'desc' },
                    },
                },
            });

            if (!operacion) {
                return res.status(404).json({ error: 'Operación no encontrada' });
            }

            return res.json(operacion);
        } catch (error: any) {
            logger.error('Get operation error', { error });
            return res.status(500).json({
                error: 'Error al obtener operación',
                details: error.message,
            });
        }
    }

    /**
     * Update operation status
     * PATCH /api/operaciones/:id/estado
     */
    async updateEstado(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { estado } = req.body;

            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const operacion = await prisma.operacion.update({
                where: { id },
                data: {
                    estado,
                    ...(estado === EstadoOperacion.EN_REVISION && {
                        revisorId: req.user.id,
                    }),
                },
            });

            logger.info('Operation status updated', {
                operacionId: id,
                estado,
                usuarioId: req.user.id,
            });

            return res.json(operacion);
        } catch (error: any) {
            logger.error('Update operation status error', { error });
            return res.status(400).json({
                error: 'Error al actualizar estado',
                details: error.message,
            });
        }
    }

    /**
     * Calculate preliminary risk score
     * POST /api/operaciones/calcular-riesgo
     */
    async calcularRiesgoPreliminar(req: Request, res: Response) {
        try {
            const { tipoActo, valorDeclarado, montoEfectivo, vendedor, comprador } = req.body;

            if (!tipoActo || !valorDeclarado) {
                return res.status(400).json({
                    error: 'tipoActo y valorDeclarado son requeridos',
                });
            }

            // Build operation input with available data
            const operacionInput = {
                tipoActo,
                valorDeclarado,
                montoEfectivo,
                vendedor: vendedor || {
                    tipoPersona: 'NATURAL' as any,
                    esPEP: false,
                },
                comprador: comprador || {
                    tipoPersona: 'NATURAL' as any,
                    esPEP: false,
                },
            };

            // Calculate risk
            const score = await riskAssessmentService.calcularScoreRiesgo(operacionInput);
            const nivel = riskAssessmentService.determinarNivelRiesgo(score);
            const factores = await riskAssessmentService.identificarFactoresRiesgo(operacionInput);
            const tipoDD = await riskAssessmentService.evaluarTipoDD(operacionInput);

            // Format factors for frontend
            const factoresFormateados = factores.map((f) => ({
                nombre: f.descripcion,
                puntos: f.peso,
            }));

            return res.json({
                score,
                nivel,
                factores: factoresFormateados,
                tipoDD,
            });
        } catch (error: any) {
            return res.status(500).json({
                error: 'Error al calcular riesgo',
            });
        }
    }

    /**
     * Download operation report as PDF
     * GET /api/operaciones/:id/pdf
     */
    async descargarReporte(req: Request, res: Response) {
        try {
            const id = req.params.id as string;

            const operacion = await prisma.operacion.findUnique({
                where: { id },
                include: {
                    vendedor: true,
                    comprador: true,
                    notaria: true,
                },
            });

            if (!operacion) {
                return res.status(404).json({ error: 'Operación no encontrada' });
            }

            const pdfBuffer = await pdfService.generateOperacionReport(operacion);

            logger.info('PDF generated for report', { operacionId: id, size: pdfBuffer.length });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Reporte-${id}.pdf`);
            res.setHeader('Content-Length', pdfBuffer.length);
            return res.end(pdfBuffer);
        } catch (error: any) {
            logger.error('Error generating PDF:', error);
            return res.status(500).json({
                error: 'Error al generar reporte PDF',
                details: error.message,
            });
        }
    }
    /**
     * Get operation statistics for dashboard
     */
    async getStats(_req: Request, res: Response) {
        try {
            // 1. Total counts
            const [total, borradores, revision, aprobadas, archivadas] = await Promise.all([
                prisma.operacion.count(),
                prisma.operacion.count({ where: { estado: 'BORRADOR' } }),
                prisma.operacion.count({ where: { estado: 'EN_REVISION' } }),
                prisma.operacion.count({ where: { estado: 'APROBADA' } }),
                prisma.operacion.count({ where: { estado: 'ARCHIVADA' } }),
            ]);

            // 2. Risk distribution
            const riesgoDistribucion = await prisma.operacion.groupBy({
                by: ['nivelRiesgo'],
                _count: {
                    nivelRiesgo: true,
                },
            });

            // 3. Operations by month (last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const operacionesRecientes = await prisma.operacion.findMany({
                where: {
                    createdAt: {
                        gte: sixMonthsAgo
                    }
                },
                select: {
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            // Process monthly data 
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

            interface MonthlyStat {
                mes: string;
                operaciones: number;
            }

            const operacionesPorMes = operacionesRecientes.reduce<MonthlyStat[]>((acc, curr) => {
                const date = new Date(curr.createdAt);
                const mesKey = `${meses[date.getMonth()]}`;
                const existing = acc.find(m => m.mes === mesKey);
                if (existing) {
                    existing.operaciones++;
                } else {
                    acc.push({ mes: mesKey, operaciones: 1 });
                }
                return acc;
            }, []);

            // 4. Pending Alerts (High risk not approved)
            const alertasPendientes = await prisma.operacion.count({
                where: {
                    nivelRiesgo: { in: ['ALTO', 'MUY_ALTO'] },
                    estado: { not: 'APROBADA' }
                }
            });

            return res.json({
                total,
                porEstado: {
                    borradores,
                    revision,
                    aprobadas,
                    archivadas
                },
                riesgoDistribucion: riesgoDistribucion.map(r => ({
                    nivel: r.nivelRiesgo,
                    cantidad: r._count.nivelRiesgo
                })),
                operacionesPorMes,
                alertasPendientes
            });

        } catch (error: any) {
            logger.error('Error getting stats:', error);
            return res.status(500).json({
                error: 'Error al obtener estadísticas',
                details: error.message,
            });
        }
    }

    /**
     * Download KYC form as PDF
     * GET /api/operaciones/:id/kyc-pdf
     */
    async descargarKYC(req: Request, res: Response) {
        try {
            const id = req.params.id as string;

            const operacion = await prisma.operacion.findUnique({
                where: { id },
                include: {
                    vendedor: true,
                    comprador: true,
                    notaria: true,
                },
            });

            if (!operacion) {
                return res.status(404).json({ error: 'Operación no encontrada' });
            }

            const pdfBuffer = await pdfService.generateKYCForm(operacion);

            logger.info('PDF generated for KYC', { operacionId: id, size: pdfBuffer.length });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=KYC-${id}.pdf`);
            res.setHeader('Content-Length', pdfBuffer.length);
            return res.end(pdfBuffer);
        } catch (error: any) {
            logger.error('Error generating KYC PDF:', error);
            return res.status(500).json({
                error: 'Error al generar formulario KYC',
                details: error.message,
            });
        }
    }
}

export const operacionController = new OperacionController();

