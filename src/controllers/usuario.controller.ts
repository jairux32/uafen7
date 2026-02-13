import { Request, Response } from 'express';
import { prisma } from '../config/database';
import logger from '../config/logger';

export class UsuarioController {
    /**
     * List all users from the same notaria
     */
    async listar(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const notariaId = (req.user as any).notariaId as string;

            const usuarios = await prisma.usuario.findMany({
                where: { notariaId },
                select: {
                    id: true,
                    nombres: true,
                    apellidos: true,
                    cedula: true,
                    email: true,
                    rol: true,
                    activo: true,
                    ultimoAcceso: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return res.json(usuarios);
        } catch (error: any) {
            logger.error('Error listing users', { error: error.message });
            return res.status(500).json({ error: 'Error al listar usuarios' });
        }
    }

    /**
     * Update user details
     */
    async actualizar(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const id = req.params.id as string;
            const { nombres, apellidos, email, rol } = req.body;

            // Security check: only allow updating users in the same notaria
            const existingUser = await prisma.usuario.findUnique({
                where: { id },
                select: { notariaId: true }
            });

            if (!existingUser || existingUser.notariaId !== (req.user as any).notariaId) {
                return res.status(403).json({ error: 'No tienes permiso para editar este usuario' });
            }

            const updatedUser = await prisma.usuario.update({
                where: { id },
                data: { nombres, apellidos, email, rol }
            });

            logger.info('User updated', { userId: id, updatedBy: (req.user as any).id });

            return res.json(updatedUser);
        } catch (error: any) {
            logger.error('Error updating user', { error: error.message });
            return res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    }

    /**
     * Toggle user active status
     */
    async cambiarEstado(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const id = req.params.id as string;
            const { activo } = req.body;

            if (id === (req.user as any).id) {
                return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
            }

            // Security check
            const existingUser = await prisma.usuario.findUnique({
                where: { id },
                select: { notariaId: true }
            });

            if (!existingUser || existingUser.notariaId !== (req.user as any).notariaId) {
                return res.status(403).json({ error: 'No tienes permiso para modificar este usuario' });
            }

            const updatedUser = await prisma.usuario.update({
                where: { id },
                data: { activo }
            });

            logger.info('User status changed', { userId: id, activo, changedBy: (req.user as any).id });

            return res.json(updatedUser);
        } catch (error: any) {
            logger.error('Error changing user status', { error: error.message });
            return res.status(500).json({ error: 'Error al cambiar estado del usuario' });
        }
    }
}

export const usuarioController = new UsuarioController();
