import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { prisma } from '../config/database';

export enum TipoAccion {
    CREAR = 'CREAR',
    LEER = 'LEER',
    ACTUALIZAR = 'ACTUALIZAR',
    ELIMINAR = 'ELIMINAR',
    APROBAR = 'APROBAR',
    RECHAZAR = 'RECHAZAR',
    REPORTAR = 'REPORTAR',
    EXPORTAR = 'EXPORTAR',
}

interface AuditLogData {
    usuarioId: string;
    accion: TipoAccion;
    entidad: string;
    entidadId: string;
    detalles?: any;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Log audit event to database and logger
 */
export const logAuditEvent = async (data: AuditLogData): Promise<void> => {
    try {
        // Log to Winston
        logger.info('Audit Event', {
            ...data,
            timestamp: new Date().toISOString(),
        });

        // Store in dedicated audit_logs table
        await prisma.auditLog.create({
            data: {
                usuarioId: data.usuarioId !== 'anonymous' ? data.usuarioId : null,
                accion: data.accion,
                entidad: data.entidad,
                entidadId: data.entidadId,
                detalles: data.detalles as any,
                ip: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    } catch (error) {
        logger.error('Failed to log audit event', { error, data });
    }
};

/**
 * Middleware to automatically log certain actions
 */
export const auditLog = (entidad: string, accion: TipoAccion) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Store original send function
        const originalSend = res.send;

        // Override send function to log after successful response
        res.send = function (data: any): Response {
            // Only log successful responses (2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const entidadId = req.params.id || req.body.id || 'N/A';

                logAuditEvent({
                    usuarioId: req.user?.id || 'anonymous',
                    accion,
                    entidad,
                    entidadId,
                    detalles: {
                        method: req.method,
                        path: req.path,
                        params: req.params,
                        query: req.query,
                    },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                }).catch((error) => {
                    logger.error('Audit log failed', { error });
                });
            }

            // Call original send
            return originalSend.call(this, data);
        };

        next();
    };
};
