import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

export const documentoController = {
    // Subir documento
    async upload(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se ha subido ningún archivo' });
            }

            const { operacionId, tipo, descripcion } = req.body;
            const usuarioId = (req as any).user?.id;

            if (!operacionId || !tipo) {
                // Eliminar archivo si faltan datos
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: 'Faltan datos requeridos (operacionId, tipo)' });
            }

            const documento = await prisma.documento.create({
                data: {
                    nombre: req.file.originalname,
                    tipo: tipo, // Asegurarse que coincida con enum TipoDocumento
                    descripcion: descripcion || null,
                    path: req.file.path,
                    tamano: req.file.size,
                    mimeType: req.file.mimetype,
                    operacionId: String(operacionId),
                    usuarioId: String(usuarioId),
                    nivelAcceso: 'RESTRINGIDO', // Default
                },
            });

            return res.status(201).json(documento);

        } catch (error: any) {
            console.error('Error al subir documento:', error);
            // Intentar eliminar archivo si hubo error en DB
            if (req.file && fs.existsSync(req.file.path)) {
                try { fs.unlinkSync(req.file.path); } catch (e) { console.error('Error borrando archivo huérfano:', e); }
            }
            return res.status(500).json({ error: 'Error interno al subir documento', details: error.message });
        }
    },

    // Listar documentos de una operación
    async getByOperacion(req: Request, res: Response) {
        try {
            const operacionId = String(req.params.operacionId);

            const documentos = await prisma.documento.findMany({
                where: { operacionId },
                orderBy: { createdAt: 'desc' },
                include: {
                    subidoPor: {
                        select: { nombres: true, apellidos: true, email: true }
                    }
                }
            });

            return res.json(documentos);

        } catch (error: any) {
            console.error('Error obteniendo documentos:', error);
            return res.status(500).json({ error: 'Error al obtener documentos' });
        }
    },

    // Descargar documento
    async download(req: Request, res: Response) {
        try {
            const id = String(req.params.id);

            const documento = await prisma.documento.findUnique({
                where: { id },
            });

            if (!documento) {
                return res.status(404).json({ error: 'Documento no encontrado' });
            }

            if (!fs.existsSync(documento.path)) {
                return res.status(404).json({ error: 'Archivo físico no encontrado' });
            }

            return res.download(documento.path, documento.nombre);

        } catch (error: any) {
            console.error('Error descargando documento:', error);
            return res.status(500).json({ error: 'Error al descargar documento' });
        }
    },

    // Eliminar documento
    async delete(req: Request, res: Response) {
        try {
            const id = String(req.params.id);

            const documento = await prisma.documento.findUnique({
                where: { id },
            });

            if (!documento) {
                return res.status(404).json({ error: 'Documento no encontrado' });
            }

            // Eliminar de DB
            await prisma.documento.delete({ where: { id } });

            // Eliminar archivo físico
            if (fs.existsSync(documento.path)) {
                fs.unlinkSync(documento.path);
            }

            return res.json({ message: 'Documento eliminado correctamente' });

        } catch (error: any) {
            console.error('Error eliminando documento:', error);
            return res.status(500).json({ error: 'Error al eliminar documento' });
        }
    }
};
