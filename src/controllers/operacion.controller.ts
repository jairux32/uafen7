import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createOperacionSchema } from '../models/schemas';
import { riskAssessmentService } from '../services/riskAssessment.service';
import { alertManagementService } from '../services/alertManagement.service';
import logger from '../config/logger';
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

            // Create operation
            const operacion = await prisma.operacion.create({
                data: {
                    ...data,
                    fechaEscritura: new Date(data.fechaEscritura),
                    creadorId: req.user.id,
                    estado: EstadoOperacion.BORRADOR,
                    nivelRiesgo,
                    factoresRiesgo,
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

            res.status(201).json({
                operacion,
                riesgo: {
                    nivel: nivelRiesgo,
                    score: scoreRiesgo,
                    factores: factoresRiesgo,
                },
            });
        } catch (error: any) {
            logger.error('Create operation error', { error });
            res.status(400).json({
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

            res.json({
                data: operaciones,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            });
        } catch (error: any) {
            logger.error('Get operations error', { error });
            res.status(500).json({
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
            const { id } = req.params;

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

            res.json(operacion);
        } catch (error: any) {
            logger.error('Get operation error', { error });
            res.status(500).json({
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
            const { id } = req.params;
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

            res.json(operacion);
        } catch (error: any) {
            logger.error('Update operation status error', { error });
            res.status(400).json({
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
            logger.error('Calculate risk error', { error });
            return res.status(500).json({
                error: 'Error al calcular riesgo',
            });
        }
    }
}

export const operacionController = new OperacionController();

