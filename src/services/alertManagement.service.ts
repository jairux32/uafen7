import {
    TipoAlerta,
    SeveridadAlerta,
    EstadoAlerta,
    Operacion,
    DebiDaDiligencia,
} from '@prisma/client';
import { prisma } from '../config/database';
import logger from '../config/logger';
import { redisClient } from '../config/database';

interface AlertaInput {
    tipo: TipoAlerta;
    severidad: SeveridadAlerta;
    titulo: string;
    descripcion: string;
    detalles: any;
    operacionId: string;
}

/**
 * Alert Management Service
 * Generates and manages automatic alerts for suspicious operations
 */
export class AlertManagementService {
    /**
     * Validate cash payment (>= $10,000 USD is prohibited)
     */
    async validarEfectivo(operacion: Operacion): Promise<void> {
        if (operacion.montoEfectivo && operacion.montoEfectivo >= 10000) {
            await this.crearAlerta({
                tipo: TipoAlerta.EFECTIVO_EXCEDE_LIMITE,
                severidad: SeveridadAlerta.CRITICA,
                titulo: 'Pago en efectivo excede límite legal',
                descripcion: `Operación con pago en efectivo de $${operacion.montoEfectivo.toLocaleString()} USD. El límite legal es $10,000 USD.`,
                detalles: {
                    montoEfectivo: operacion.montoEfectivo,
                    limiteLegal: 10000,
                    exceso: operacion.montoEfectivo - 10000,
                },
                operacionId: operacion.id,
            });

            logger.warn('Cash payment exceeds legal limit', {
                operacionId: operacion.id,
                monto: operacion.montoEfectivo,
            });
        }
    }

    /**
     * Detect undervaluation of property
     */
    async detectarSubvaloracion(operacion: Operacion): Promise<void> {
        // TODO: Integrate with catastro/market value API
        // For now, basic heuristic: if valor < $5000 for compraventa, flag it

        if (
            operacion.tipoActo === 'COMPRAVENTA' &&
            operacion.valorDeclarado < 5000
        ) {
            await this.crearAlerta({
                tipo: TipoAlerta.SUBVALORACION_BIEN,
                severidad: SeveridadAlerta.ALTA,
                titulo: 'Posible subvaloración del bien',
                descripcion: `Valor declarado ($${operacion.valorDeclarado.toLocaleString()}) parece inusualmente bajo para una compraventa.`,
                detalles: {
                    valorDeclarado: operacion.valorDeclarado,
                    razon: 'Valor menor a $5,000 en compraventa',
                },
                operacionId: operacion.id,
            });
        }
    }

    /**
     * Detect incompatible client profile
     */
    async detectarPerfilIncompatible(
        operacion: Operacion,
        comprador: DebiDaDiligencia
    ): Promise<void> {
        // Check if declared income is compatible with transaction value
        if (comprador.ingresosMensuales) {
            const ingresoAnual = Number(comprador.ingresosMensuales) * 12;
            const valorOperacion = Number(operacion.valorDeclarado);

            // If transaction value > 5x annual income, flag it
            if (valorOperacion > ingresoAnual * 5) {
                await this.crearAlerta({
                    tipo: TipoAlerta.PERFIL_INCOMPATIBLE,
                    severidad: SeveridadAlerta.ALTA,
                    titulo: 'Perfil económico incompatible con transacción',
                    descripcion: `Valor de la transacción ($${valorOperacion.toLocaleString()}) excede significativamente la capacidad económica declarada del comprador.`,
                    detalles: {
                        valorOperacion,
                        ingresoAnual,
                        ratio: (valorOperacion / ingresoAnual).toFixed(2),
                    },
                    operacionId: operacion.id,
                });
            }
        }
    }

    /**
     * Detect excessive urgency
     */
    async detectarPremuraExcesiva(operacion: Operacion): Promise<void> {
        // Check if operation was created and executed very quickly
        const horasDesdeCreacion =
            (operacion.fechaEscritura.getTime() - operacion.createdAt.getTime()) /
            (1000 * 60 * 60);

        if (horasDesdeCreacion < 48) {
            await this.crearAlerta({
                tipo: TipoAlerta.PREMURA_EXCESIVA,
                severidad: SeveridadAlerta.MEDIA,
                titulo: 'Premura excesiva en la operación',
                descripcion: `Operación ejecutada en menos de 48 horas desde el primer contacto (${horasDesdeCreacion.toFixed(1)} horas).`,
                detalles: {
                    horasDesdeCreacion: horasDesdeCreacion.toFixed(1),
                    fechaCreacion: operacion.createdAt,
                    fechaEscritura: operacion.fechaEscritura,
                },
                operacionId: operacion.id,
            });
        }
    }

    /**
     * Verify against restrictive lists (UAFE, OFAC, UN, etc.)
     */
    async verificarListasRestrictivas(dd: DebiDaDiligencia): Promise<void> {
        try {
            // Search in cached lists
            const nombre = dd.tipoPersona === 'NATURAL'
                ? `${dd.nombres} ${dd.apellidos}`
                : dd.razonSocial;

            const documento = dd.cedula || dd.rucEmpresa;

            if (!nombre) return;

            // Search in database
            const matches = await prisma.listaRestrictiva.findMany({
                where: {
                    OR: [
                        { nombre: { contains: nombre, mode: 'insensitive' } },
                        ...(documento ? [{ numeroDocumento: documento }] : []),
                    ],
                    vigente: true,
                },
            });

            if (matches.length > 0) {
                for (const match of matches) {
                    // Create CRITICAL alert for each match
                    await prisma.alerta.create({
                        data: {
                            tipo: TipoAlerta.LISTA_RESTRICTIVA,
                            severidad: SeveridadAlerta.CRITICA,
                            titulo: `Match con lista restrictiva: ${match.fuente}`,
                            descripcion: `Cliente coincide con registro en lista ${match.fuente}: ${match.nombre}`,
                            estado: EstadoAlerta.PENDIENTE,
                            detalles: {
                                fuente: match.fuente,
                                nombreLista: match.nombre,
                                categoria: match.categoria,
                                nombreCliente: nombre,
                                documentoCliente: documento,
                            },
                            operacion: {
                                connect: {
                                    id: dd.operacionesComprador[0]?.id || dd.operacionesVendedor[0]?.id,
                                },
                            },
                        },
                    });

                    logger.error('CRITICAL: Match with restrictive list', {
                        fuente: match.fuente,
                        cliente: nombre,
                        lista: match.nombre,
                    });
                }
            }
        } catch (error) {
            logger.error('Error verifying restrictive lists', { error, ddId: dd.id });
        }
    }

    /**
     * Create alert
     */
    private async crearAlerta(input: AlertaInput): Promise<void> {
        try {
            await prisma.alerta.create({
                data: {
                    ...input,
                    estado: EstadoAlerta.PENDIENTE,
                },
            });

            logger.info('Alert created', {
                tipo: input.tipo,
                severidad: input.severidad,
                operacionId: input.operacionId,
            });
        } catch (error) {
            logger.error('Failed to create alert', { error, input });
            throw error;
        }
    }

    /**
     * Manage alert (review and decide)
     */
    async gestionarAlerta(
        alertaId: string,
        usuarioId: string,
        decision: EstadoAlerta,
        comentario?: string
    ): Promise<void> {
        try {
            await prisma.alerta.update({
                where: { id: alertaId },
                data: {
                    estado: decision,
                    gestionadaPorId: usuarioId,
                    fechaGestion: new Date(),
                    comentarioGestion: comentario,
                },
            });

            logger.info('Alert managed', {
                alertaId,
                usuarioId,
                decision,
            });
        } catch (error) {
            logger.error('Failed to manage alert', { error, alertaId });
            throw error;
        }
    }

    /**
     * Get pending alerts for a notaría
     */
    async obtenerAlertasPendientes(notariaId: string): Promise<any[]> {
        return prisma.alerta.findMany({
            where: {
                operacion: {
                    notariaId,
                },
                estado: EstadoAlerta.PENDIENTE,
            },
            include: {
                operacion: {
                    select: {
                        numeroEscritura: true,
                        tipoActo: true,
                        valorDeclarado: true,
                    },
                },
            },
            orderBy: [{ severidad: 'desc' }, { createdAt: 'desc' }],
        });
    }
}

export const alertManagementService = new AlertManagementService();
