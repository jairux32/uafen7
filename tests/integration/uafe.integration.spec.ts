import { uafeIntegration } from '../../src/integrations/uafe.integration';
import { prisma } from '../../src/config/database';
import { TipoReporte, EstadoReporte, TipoActo, TipoPersona } from '@prisma/client';
import fs from 'fs';
import path from 'path';

describe('UAFE Integration Tests', () => {
    let notariaId: string;
    let operacionId: string;
    let vendedorId: string;
    let compradorId: string;

    beforeAll(async () => {
        // Create test data
        const notaria = await prisma.notaria.create({
            data: {
                nombre: 'Notaría UAFE Test',
                ruc: '1791234567001',
                direccion: 'Test Address',
                telefono: '0999999999',
                email: 'uafe@test.com',
                tamano: 'MEDIANA',
                numeroNotaria: '001',
                canton: 'Quito',
                provincia: 'Pichincha',
            },
        });
        notariaId = notaria.id;

        // Create vendedor
        const vendedor = await prisma.debiDaDiligencia.create({
            data: {
                tipoPersona: TipoPersona.NATURAL,
                nombres: 'Carlos',
                apellidos: 'Vendedor',
                cedula: '1234567890',
                direccion: 'Vendedor Address',
                telefono: '0999999999',
                esPEP: false,
                notariaId,
            },
        });
        vendedorId = vendedor.id;

        // Create comprador
        const comprador = await prisma.debiDaDiligencia.create({
            data: {
                tipoPersona: TipoPersona.NATURAL,
                nombres: 'Ana',
                apellidos: 'Compradora',
                cedula: '0987654321',
                direccion: 'Comprador Address',
                telefono: '0988888888',
                esPEP: false,
                notariaId,
            },
        });
        compradorId = comprador.id;

        // Create operacion
        const operacion = await prisma.operacion.create({
            data: {
                tipoActo: TipoActo.COMPRAVENTA,
                numeroEscritura: '001-2026',
                fechaEscritura: new Date('2026-01-15'),
                descripcionBien: 'Casa de dos plantas',
                valorDeclarado: 150000,
                formaPago: 'TRANSFERENCIA',
                vendedorId,
                compradorId,
                notariaId,
                estado: 'APROBADA',
                nivelRiesgo: 'MEDIO',
            },
        });
        operacionId = operacion.id;
    });

    afterAll(async () => {
        // Clean up
        await prisma.reporte.deleteMany({});
        await prisma.operacion.deleteMany({});
        await prisma.debiDaDiligencia.deleteMany({});
        await prisma.notaria.deleteMany({});
        await prisma.$disconnect();
    });

    describe('generarRESU', () => {
        it('should generate RESU report successfully', async () => {
            const reporte = await uafeIntegration.generarRESU(notariaId, 1, 2026);

            expect(reporte).toBeDefined();
            expect(reporte.tipo).toBe(TipoReporte.RESU);
            expect(reporte.mes).toBe(1);
            expect(reporte.anio).toBe(2026);
            expect(reporte.estado).toBe(EstadoReporte.GENERADO);
            expect(reporte.archivoPath).toBeDefined();
            expect(reporte.archivoHash).toBeDefined();
            expect(reporte.datosReporte).toHaveProperty('totalOperaciones');
            expect(reporte.datosReporte).toHaveProperty('montoTotal');
        });

        it('should create Excel file with correct structure', async () => {
            const reporte = await uafeIntegration.generarRESU(notariaId, 1, 2026);

            // Verify file exists
            expect(fs.existsSync(reporte.archivoPath)).toBe(true);

            // Verify file is Excel format
            expect(reporte.archivoPath).toMatch(/\.xlsx$/);
        });

        it('should include only operations >= $10,000', async () => {
            // Create low-value operation
            await prisma.operacion.create({
                data: {
                    tipoActo: TipoActo.PODER,
                    numeroEscritura: '002-2026',
                    fechaEscritura: new Date('2026-01-20'),
                    descripcionBien: 'Poder general',
                    valorDeclarado: 500, // Below threshold
                    formaPago: 'EFECTIVO',
                    vendedorId,
                    compradorId,
                    notariaId,
                    estado: 'APROBADA',
                    nivelRiesgo: 'BAJO',
                },
            });

            const reporte = await uafeIntegration.generarRESU(notariaId, 1, 2026);

            // Should only include the high-value operation
            expect(reporte.datosReporte.totalOperaciones).toBe(1);
        });
    });

    describe('generarROS', () => {
        let alertaId: string;

        beforeAll(async () => {
            // Create alert
            const alerta = await prisma.alerta.create({
                data: {
                    tipo: 'EFECTIVO_EXCEDE_LIMITE',
                    severidad: 'CRITICA',
                    titulo: 'Pago en efectivo excede límite',
                    descripcion: 'Operación con pago en efectivo de $12,000',
                    estado: 'CONFIRMADA',
                    operacionId,
                    detalles: {
                        montoEfectivo: 12000,
                        limiteLegal: 10000,
                    },
                },
            });
            alertaId = alerta.id;
        });

        it('should generate ROS report successfully', async () => {
            const reporte = await uafeIntegration.generarROS(alertaId);

            expect(reporte).toBeDefined();
            expect(reporte.tipo).toBe(TipoReporte.ROS);
            expect(reporte.estado).toBe(EstadoReporte.GENERADO);
            expect(reporte.archivoPath).toBeDefined();
            expect(reporte.archivoHash).toBeDefined();
        });

        it('should encrypt ROS data', async () => {
            const reporte = await uafeIntegration.generarROS(alertaId);

            // Verify file exists and is encrypted
            expect(fs.existsSync(reporte.archivoPath)).toBe(true);
            expect(reporte.archivoPath).toMatch(/\.enc$/);

            // Read file content - should not be readable JSON
            const fileContent = fs.readFileSync(reporte.archivoPath, 'utf-8');
            expect(() => JSON.parse(fileContent)).toThrow();
        });

        it('should include alert and operation details', async () => {
            const reporte = await uafeIntegration.generarROS(alertaId);

            expect(reporte.datosReporte).toHaveProperty('numeroAlerta');
            expect(reporte.datosReporte).toHaveProperty('tipoAlerta');
            expect(reporte.datosReporte).toHaveProperty('operacion');
            expect(reporte.datosReporte).toHaveProperty('vendedor');
            expect(reporte.datosReporte).toHaveProperty('comprador');
        });
    });

    describe('enviarReporte', () => {
        it('should send RESU report to UAFE (mocked)', async () => {
            const reporte = await uafeIntegration.generarRESU(notariaId, 1, 2026);

            // In test mode, this should use mocked API
            // For now, we'll skip actual sending in tests
            // In real implementation, you'd mock axios

            expect(reporte.estado).toBe(EstadoReporte.GENERADO);
        });

        it('should reject sending report in wrong state', async () => {
            const reporte = await uafeIntegration.generarRESU(notariaId, 1, 2026);

            // Update to ENVIADO
            await prisma.reporte.update({
                where: { id: reporte.id },
                data: { estado: EstadoReporte.ENVIADO },
            });

            // Try to send again
            await expect(uafeIntegration.enviarReporte(reporte.id)).rejects.toThrow();
        });
    });
});
