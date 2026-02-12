import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { z } from 'zod';
import { TipoPersona } from '@prisma/client';
import logger from '../config/logger';

/**
 * Schema for creating/updating Debida Diligencia
 */
const createDDSchema = z.object({
    tipoPersona: z.nativeEnum(TipoPersona),
    identificacion: z.string().min(10).max(13),
    nombres: z.string().optional(),
    apellidos: z.string().optional(),
    razonSocial: z.string().optional(),
    nacionalidad: z.string().optional(),
    paisConstitucion: z.string().optional(),
    ingresosMensuales: z.number().positive().optional(),
    origenFondos: z.string().optional(),
    esPEP: z.boolean(),
    actividadEconomica: z.string().optional(),
});

/**
 * Debida Diligencia Controller
 * Manages KYC (Know Your Customer) data for vendors and buyers
 */
export class DebidaDiligenciaController {
    /**
     * Search person by identification
     * GET /api/debida-diligencia/buscar/:identificacion
     */
    async buscarPorIdentificacion(req: Request, res: Response) {
        try {
            const { identificacion } = req.params;

            if (!identificacion || identificacion.length < 10) {
                return res.status(400).json({
                    error: 'Identificación inválida',
                });
            }

            const persona = await prisma.debiDaDiligencia.findUnique({
                where: { identificacion },
            });

            if (!persona) {
                return res.json({
                    encontrado: false,
                });
            }

            return res.json({
                encontrado: true,
                persona: {
                    id: persona.id,
                    tipoPersona: persona.tipoPersona,
                    identificacion: persona.identificacion,
                    nombres: persona.nombres,
                    apellidos: persona.apellidos,
                    razonSocial: persona.razonSocial,
                    nacionalidad: persona.nacionalidad,
                    paisConstitucion: persona.paisConstitucion,
                    ingresosMensuales: persona.ingresosMensuales,
                    origenFondos: persona.origenFondos,
                    esPEP: persona.esPEP,
                    actividadEconomica: persona.actividadEconomica,
                },
            });
        } catch (error) {
            logger.error('Error searching person:', error);
            return res.status(500).json({
                error: 'Error al buscar persona',
            });
        }
    }

    /**
     * Create new person record
     * POST /api/debida-diligencia
     */
    async crear(req: Request, res: Response) {
        try {
            const data = createDDSchema.parse(req.body);

            // Check if person already exists
            const existente = await prisma.debiDaDiligencia.findUnique({
                where: { identificacion: data.identificacion },
            });

            if (existente) {
                return res.status(409).json({
                    error: 'Ya existe una persona con esta identificación',
                    personaId: existente.id,
                });
            }

            // Create new person
            const persona = await prisma.debiDaDiligencia.create({
                data: {
                    tipoPersona: data.tipoPersona,
                    identificacion: data.identificacion,
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    razonSocial: data.razonSocial,
                    nacionalidad: data.nacionalidad,
                    paisConstitucion: data.paisConstitucion,
                    ingresosMensuales: data.ingresosMensuales,
                    origenFondos: data.origenFondos,
                    esPEP: data.esPEP,
                    actividadEconomica: data.actividadEconomica,
                },
            });

            logger.info(`Created DD record: ${persona.id} - ${persona.identificacion}`);

            return res.status(201).json(persona);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Datos inválidos',
                    detalles: error.errors,
                });
            }

            logger.error('Error creating DD:', error);
            return res.status(500).json({
                error: 'Error al crear registro de debida diligencia',
            });
        }
    }

    /**
     * Update existing person record
     * PATCH /api/debida-diligencia/:id
     */
    async actualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = createDDSchema.partial().parse(req.body);

            const persona = await prisma.debiDaDiligencia.update({
                where: { id },
                data,
            });

            logger.info(`Updated DD record: ${persona.id}`);

            return res.json(persona);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Datos inválidos',
                    detalles: error.errors,
                });
            }

            logger.error('Error updating DD:', error);
            return res.status(500).json({
                error: 'Error al actualizar registro',
            });
        }
    }

    /**
     * Get person by ID
     * GET /api/debida-diligencia/:id
     */
    async obtenerPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const persona = await prisma.debiDaDiligencia.findUnique({
                where: { id },
            });

            if (!persona) {
                return res.status(404).json({
                    error: 'Persona no encontrada',
                });
            }

            return res.json(persona);
        } catch (error) {
            logger.error('Error getting DD:', error);
            return res.status(500).json({
                error: 'Error al obtener registro',
            });
        }
    }
}

export const debidaDiligenciaController = new DebidaDiligenciaController();
