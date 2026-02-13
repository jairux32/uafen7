import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log error
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        user: req.user?.id,
    });

    // Prisma errors
    if (err.code && err.code.startsWith('P')) {
        return res.status(400).json({
            error: 'Error de base de datos',
            message: getPrismaErrorMessage(err.code),
        });
    }

    // Validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.errors,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido',
            message: err.message,
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado',
            message: 'Por favor, inicie sesión nuevamente',
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    return res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path,
    });
};

/**
 * Get user-friendly message for Prisma error codes
 */
function getPrismaErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
        P2002: 'Ya existe un registro con estos datos únicos',
        P2003: 'Referencia inválida a registro relacionado',
        P2025: 'Registro no encontrado',
        P2014: 'Violación de relación requerida',
        P2000: 'Valor demasiado largo para el campo',
    };

    return errorMessages[code] || 'Error en la operación de base de datos';
}
