import { z } from 'zod';
import { RolUsuario } from '@prisma/client';

/**
 * Validation schemas using Zod
 */

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
    nombres: z.string().min(2, 'Nombres requeridos'),
    apellidos: z.string().min(2, 'Apellidos requeridos'),
    cedula: z.string().length(10, 'Cédula debe tener 10 dígitos'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    rol: z.nativeEnum(RolUsuario),
    notariaId: z.string().uuid('ID de notaría inválido'),
});

// Operacion schemas
export const createOperacionSchema = z.object({
    tipoActo: z.enum([
        'COMPRAVENTA',
        'HIPOTECA',
        'DONACION',
        'CONSTITUCION_SOCIEDAD',
        'LIQUIDACION_SOCIEDAD_CONYUGAL',
        'PODER',
        'TESTAMENTO',
        'CANCELACION_HIPOTECA',
        'OTRO',
    ]),
    numeroEscritura: z.string().min(1, 'Número de escritura requerido'),
    fechaEscritura: z.string().datetime('Fecha inválida'),
    descripcionBien: z.string().min(10, 'Descripción del bien requerida'),
    valorDeclarado: z.number().positive('Valor debe ser positivo'),
    formaPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'MIXTO']),
    montoEfectivo: z.number().optional(),
    vendedorId: z.string().uuid('ID de vendedor inválido'),
    compradorId: z.string().uuid('ID de comprador inválido'),
    notariaId: z.string().uuid('ID de notaría inválido').optional(),
});

// Debida Diligencia schemas
export const createDDSchema = z.object({
    tipoPersona: z.enum(['NATURAL', 'JURIDICA']),
    // Persona Natural
    nombres: z.string().optional(),
    apellidos: z.string().optional(),
    cedula: z.string().optional(),
    fechaNacimiento: z.string().datetime().optional(),
    nacionalidad: z.string().optional(),
    // Persona Jurídica
    razonSocial: z.string().optional(),
    rucEmpresa: z.string().optional(),
    paisConstitucion: z.string().optional(),
    actividadEconomica: z.string().optional(),
    // Común
    direccion: z.string().min(5, 'Dirección requerida'),
    telefono: z.string().min(7, 'Teléfono requerido'),
    email: z.string().email().optional(),
    ingresosMensuales: z.number().positive().optional(),
    origenFondos: z.string().optional(),
    profesion: z.string().optional(),
    esPEP: z.boolean().default(false),
});

// Reporte schemas
export const generateRESUSchema = z.object({
    notariaId: z.string().uuid(),
    mes: z.number().min(1).max(12),
    anio: z.number().min(2020).max(2100),
});

export const generateROSSchema = z.object({
    alertaId: z.string().uuid(),
});

export const gestionarAlertaSchema = z.object({
    decision: z.enum(['PENDIENTE', 'EN_ANALISIS', 'FALSO_POSITIVO', 'CONFIRMADA', 'REPORTADA']),
    comentario: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateOperacionInput = z.infer<typeof createOperacionSchema>;
export type CreateDDInput = z.infer<typeof createDDSchema>;
export type GenerateRESUInput = z.infer<typeof generateRESUSchema>;
export type GenerateROSInput = z.infer<typeof generateROSSchema>;
export type GestionarAlertaInput = z.infer<typeof gestionarAlertaSchema>;
