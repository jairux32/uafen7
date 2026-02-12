import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from '../config';
import { prisma } from '../config/database';

// Extend Express Request type
declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
            rol: string;
            notariaId: string;
        }
    }
}

// JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret,
};

passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await prisma.usuario.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    rol: true,
                    notariaId: true,
                    activo: true,
                },
            });

            if (!user || !user.activo) {
                return done(null, false);
            }

            return done(null, {
                id: user.id,
                email: user.email,
                rol: user.rol,
                notariaId: user.notariaId,
            });
        } catch (error) {
            return done(error, false);
        }
    })
);

/**
 * Generate JWT token
 */
export const generateToken = (userId: string): string => {
    return jwt.sign(
        { sub: userId },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );
};

/**
 * Authenticate middleware
 */
export const authenticate = passport.authenticate('jwt', { session: false });

/**
 * Authorize middleware - Check if user has required role
 */
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'No autenticado' });
            return;
        }

        if (!roles.includes(req.user.rol)) {
            res.status(403).json({
                error: 'No autorizado',
                message: `Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
            });
            return;
        }

        next();
    };
};

/**
 * Check if user belongs to the same notaría as the resource
 */
export const checkNotariaAccess = (req: Request, res: Response, next: NextFunction) => {
    const notariaId = req.params.notariaId || req.body.notariaId;

    if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    // Admin can access all notarías
    if (req.user.rol === 'ADMIN_SISTEMA') {
        return next();
    }

    // Check if user belongs to the notaría
    if (req.user.notariaId !== notariaId) {
        return res.status(403).json({
            error: 'Acceso denegado',
            message: 'No tiene acceso a esta notaría',
        });
    }

    next();
};

export default passport;
