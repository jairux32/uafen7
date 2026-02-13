import { TipoReporte, EstadoReporte, Reporte } from '@prisma/client';
import { prisma } from '../config/database';
import logger from '../config/logger';
import config from '../config';
import axios from 'axios';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { encryptionService } from '../utils/encryption';

interface ConfirmacionUAFE {
    numeroConfirmacion: string;
    fechaRecepcion: string;
    estado: string;
}

/**
 * UAFE Integration Service
 * Handles generation and submission of RESU, ROS, and RIA reports
 * Compliance: Ley Orgánica de Prevención de Lavado de Activos (2025)
 */
export class UAFEIntegration {
    private baseURL: string;
    private apiKey?: string;
    private useMocks: boolean;

    constructor() {
        this.baseURL = config.uafe.apiUrl;
        this.apiKey = config.uafe.apiKey;
        this.useMocks = config.useApiMocks;
    }

    /**
     * Generate RESU (Reporte Estructurado de Sujetos Obligados)
     * Monthly report - Due within 15 days after month end
     * 
     * @param notariaId - Notaría ID
     * @param mes - Month (1-12)
     * @param anio - Year
     */
    async generarRESU(
        notariaId: string,
        mes: number,
        anio: number
    ): Promise<Reporte> {
        try {
            logger.info('Generating RESU report', { notariaId, mes, anio });

            // Get all operations >= $10,000 for the month
            const operaciones = await prisma.operacion.findMany({
                where: {
                    notariaId,
                    fechaEscritura: {
                        gte: new Date(anio, mes - 1, 1),
                        lt: new Date(anio, mes, 1),
                    },
                    valorDeclarado: {
                        gte: 10000,
                    },
                },
                include: {
                    vendedor: true,
                    comprador: true,
                    notaria: true,
                },
            });

            // Generate Excel file
            const archivoPath = await this.generarExcelRESU(
                operaciones,
                notariaId,
                mes,
                anio
            );

            // Calculate hash
            const fileBuffer = fs.readFileSync(archivoPath);
            const archivoHash = encryptionService.hash(fileBuffer);

            // Create report record
            const reporte = await prisma.reporte.create({
                data: {
                    tipo: TipoReporte.RESU,
                    mes,
                    anio,
                    notariaId,
                    datosReporte: {
                        totalOperaciones: operaciones.length,
                        montoTotal: operaciones.reduce(
                            (sum, op) => sum + Number(op.valorDeclarado),
                            0
                        ),
                    },
                    archivoPath,
                    archivoHash,
                    estado: EstadoReporte.GENERADO,
                },
            });

            logger.info('RESU report generated successfully', {
                reporteId: reporte.id,
                operaciones: operaciones.length,
            });

            return reporte;
        } catch (error) {
            logger.error('Failed to generate RESU', { error, notariaId, mes, anio });
            throw error;
        }
    }

    /**
     * Generate ROS (Reporte de Operaciones Sospechosas)
     * Must be submitted within 4 days of detection
     * CONFIDENTIAL - Client must NOT be notified
     * 
     * @param alertaId - Alert ID
     */
    async generarROS(alertaId: string): Promise<Reporte> {
        try {
            logger.info('Generating ROS report', { alertaId });

            const alerta = await prisma.alerta.findUnique({
                where: { id: alertaId },
                include: {
                    operacion: {
                        include: {
                            vendedor: true,
                            comprador: true,
                            notaria: true,
                        },
                    },
                },
            });

            if (!alerta) {
                throw new Error('Alert not found');
            }

            // Generate encrypted ROS data
            const rosData = {
                numeroAlerta: alerta.id,
                tipoAlerta: alerta.tipo,
                severidad: alerta.severidad,
                descripcion: alerta.descripcion,
                detalles: alerta.detalles,
                operacion: {
                    numeroEscritura: alerta.operacion.numeroEscritura,
                    tipoActo: alerta.operacion.tipoActo,
                    valorDeclarado: Number(alerta.operacion.valorDeclarado),
                    fechaEscritura: alerta.operacion.fechaEscritura,
                },
                vendedor: this.sanitizarDatosPersonales(alerta.operacion.vendedor),
                comprador: this.sanitizarDatosPersonales(alerta.operacion.comprador),
                notaria: {
                    nombre: alerta.operacion.notaria.nombre,
                    ruc: alerta.operacion.notaria.ruc,
                },
                fechaDeteccion: alerta.createdAt,
            };

            // Encrypt ROS data
            const datosEncriptados = encryptionService.encrypt(
                JSON.stringify(rosData)
            );

            // Save encrypted file
            const storageDir = path.join(config.storage.path, 'reportes', 'ros');
            if (!fs.existsSync(storageDir)) {
                fs.mkdirSync(storageDir, { recursive: true });
            }

            const fileName = `ROS_${alerta.operacion.notariaId}_${Date.now()}.enc`;
            const archivoPath = path.join(storageDir, fileName);
            fs.writeFileSync(archivoPath, datosEncriptados);

            const archivoHash = encryptionService.hash(datosEncriptados);

            // Create report record
            const reporte = await prisma.reporte.create({
                data: {
                    tipo: TipoReporte.ROS,
                    notariaId: alerta.operacion.notariaId,
                    datosReporte: rosData,
                    archivoPath,
                    archivoHash,
                    estado: EstadoReporte.GENERADO,
                    alertas: {
                        connect: { id: alertaId },
                    },
                },
            });

            logger.warn('ROS report generated (CONFIDENTIAL)', {
                reporteId: reporte.id,
                alertaId,
            });

            return reporte;
        } catch (error) {
            logger.error('Failed to generate ROS', { error, alertaId });
            throw error;
        }
    }

    /**
     * Generate RIA (Reporte de Información Adicional)
     * Response to UAFE request - Due within 5 business days
     * 
     * @param requerimientoId - UAFE requirement ID
     */
    async generarRIA(_requerimientoId: string): Promise<Reporte> {
        // TODO: Implement RIA generation based on UAFE requirements
        throw new Error('RIA generation not yet implemented');
    }

    /**
     * Send report to UAFE via Sistema de Reportes en Línea
     * 
     * @param reporteId - Report ID
     */
    async enviarReporte(reporteId: string): Promise<ConfirmacionUAFE> {
        try {
            const reporte = await prisma.reporte.findUnique({
                where: { id: reporteId },
            });

            if (!reporte) {
                throw new Error('Report not found');
            }

            if (reporte.estado !== EstadoReporte.GENERADO) {
                throw new Error(`Report cannot be sent in state: ${reporte.estado}`);
            }

            // Determine endpoint based on report type
            const endpoint =
                reporte.tipo === TipoReporte.RESU
                    ? '/reportes/resu'
                    : '/reportes/ros';

            // Send to UAFE (or mock)
            const url = this.useMocks
                ? `http://localhost:3001/mock-uafe${endpoint}`
                : `${this.baseURL}${endpoint}`;

            const response = await axios.post(
                url,
                {
                    reporteId: reporte.id,
                    tipo: reporte.tipo,
                    datos: reporte.datosReporte,
                    hash: reporte.archivoHash,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
                    },
                    timeout: 30000,
                }
            );

            const confirmacion: ConfirmacionUAFE = response.data;

            // Update report status
            await prisma.reporte.update({
                where: { id: reporteId },
                data: {
                    estado: EstadoReporte.ENVIADO,
                    fechaEnvio: new Date(),
                    numeroConfirmacion: confirmacion.numeroConfirmacion,
                },
            });

            logger.info('Report sent to UAFE successfully', {
                reporteId,
                confirmacion: confirmacion.numeroConfirmacion,
            });

            return confirmacion;
        } catch (error) {
            logger.error('Failed to send report to UAFE', { error, reporteId });

            // Update report status to ERROR
            await prisma.reporte.update({
                where: { id: reporteId },
                data: { estado: EstadoReporte.ERROR },
            });

            throw error;
        }
    }

    /**
     * Generate Excel file for RESU report
     */
    private async generarExcelRESU(
        operaciones: any[],
        notariaId: string,
        mes: number,
        anio: number
    ): Promise<string> {
        const workbook = new ExcelJS.Workbook();

        // Sheet 1: Sujeto Obligado
        const notaria = await prisma.notaria.findUnique({
            where: { id: notariaId },
        });

        const sheet1 = workbook.addWorksheet('Sujeto Obligado');
        sheet1.addRow(['RUC', notaria?.ruc]);
        sheet1.addRow(['Razón Social', notaria?.nombre]);
        sheet1.addRow(['Dirección', notaria?.direccion]);
        sheet1.addRow(['Teléfono', notaria?.telefono]);
        sheet1.addRow(['Email', notaria?.email]);
        sheet1.addRow(['Mes', mes]);
        sheet1.addRow(['Año', anio]);

        // Sheet 2: Operaciones
        const sheet2 = workbook.addWorksheet('Operaciones');
        sheet2.addRow([
            'Número Escritura',
            'Fecha',
            'Tipo Acto',
            'Valor',
            'Vendedor',
            'Comprador',
            'Forma Pago',
        ]);

        operaciones.forEach((op) => {
            sheet2.addRow([
                op.numeroEscritura,
                op.fechaEscritura.toISOString().split('T')[0],
                op.tipoActo,
                Number(op.valorDeclarado),
                op.vendedor.tipoPersona === 'NATURAL'
                    ? `${op.vendedor.nombres} ${op.vendedor.apellidos}`
                    : op.vendedor.razonSocial,
                op.comprador.tipoPersona === 'NATURAL'
                    ? `${op.comprador.nombres} ${op.comprador.apellidos}`
                    : op.comprador.razonSocial,
                op.formaPago,
            ]);
        });

        // Save file
        const storageDir = path.join(config.storage.path, 'reportes', 'resu');
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        const fileName = `RESU_${notariaId}_${anio}_${mes.toString().padStart(2, '0')}.xlsx`;
        const filePath = path.join(storageDir, fileName);

        await workbook.xlsx.writeFile(filePath);

        return filePath;
    }

    /**
     * Sanitize personal data for ROS report
     */
    private sanitizarDatosPersonales(dd: any) {
        return {
            tipoPersona: dd.tipoPersona,
            ...(dd.tipoPersona === 'NATURAL'
                ? {
                    nombres: dd.nombres,
                    apellidos: dd.apellidos,
                    cedula: dd.cedula,
                    nacionalidad: dd.nacionalidad,
                }
                : {
                    razonSocial: dd.razonSocial,
                    ruc: dd.rucEmpresa,
                    paisConstitucion: dd.paisConstitucion,
                }),
            esPEP: dd.esPEP,
        };
    }
}

export const uafeIntegration = new UAFEIntegration();
