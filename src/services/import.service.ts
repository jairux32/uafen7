import { prisma } from '../config/database';
import logger from '../config/logger';
import ExcelJS from 'exceljs';
import {
    TipoActo,
    FormaPago,
    TipoPersona,
    EstadoCivil,
    EstadoOperacion,
    TipoDD
} from '@prisma/client';
import { riskAssessmentService } from './riskAssessment.service';

export interface ImportResult {
    success: boolean;
    totalFalsas: number;
    totalProcesadas: number;
    errores: string[];
}

export class ImportService {
    /**
     * Import historical data from Excel
     */
    async importFromExcel(buffer: any, notariaId: string, userId: string): Promise<ImportResult> {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            throw new Error('No se encontró la hoja de trabajo en el Excel');
        }

        const result: ImportResult = {
            success: true,
            totalFalsas: 0,
            totalProcesadas: 0,
            errores: []
        };

        // Skip header row
        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            if (!row.getCell(1).value) continue; // Skip empty rows

            try {
                await this.procesarFila(row, notariaId, userId);
                result.totalProcesadas++;
            } catch (error: any) {
                logger.error(`Error procesando fila ${i}:`, error);
                result.errores.push(`Fila ${i}: ${error.message}`);
                result.success = false;
            }
        }

        return result;
    }

    private async procesarFila(row: ExcelJS.Row, notariaId: string, userId: string) {
        // 1. Extract data
        const identificacion = row.getCell(1).text.trim();
        const nombres = row.getCell(2).text.trim();
        const apellidos = row.getCell(3).text.trim();
        const tipoPersonaStr = row.getCell(4).text.trim().toUpperCase();
        const fechaNacimientoStr = row.getCell(5).text;
        const nacionalidad = row.getCell(6).text.trim();
        const direccion = row.getCell(7).text.trim();
        const parroquia = row.getCell(8).text.trim();
        const canton = row.getCell(9).text.trim();
        const provincia = row.getCell(10).text.trim();
        const telefono = row.getCell(11).text.trim();
        const email = row.getCell(12).text.trim();
        const actividadEconomica = row.getCell(13).text.trim();
        const esPEPStr = row.getCell(14).text.trim().toUpperCase();
        const ingresosStr = row.getCell(15).text;
        const estadoCivilStr = row.getCell(16).text.trim().toUpperCase();

        // 2. Persona Setup (Upsert Vendedor/Comprador - Simplified for this bulk tool)
        // Note: In a real scenario, the template might have separate columns for Vendedor and Comprador.
        // Assuming the first set of info is for the "Persona Principal" (Client/Comprador)
        // and we might need another for the counterparty. 
        // For historical data migration, we often just want to record the operation and its actors.

        const personaData = {
            identificacion,
            nombres,
            apellidos,
            tipoPersona: (tipoPersonaStr as TipoPersona) || TipoPersona.NATURAL,
            fechaNacimiento: fechaNacimientoStr ? new Date(fechaNacimientoStr) : null,
            nacionalidad,
            direccion,
            parroquia,
            canton,
            provincia,
            telefono,
            email,
            actividadEconomica,
            esPEP: esPEPStr === 'SI' || esPEPStr === 'SÍ',
            ingresosMensuales: ingresosStr ? parseFloat(ingresosStr) : 0,
            estadoCivil: this.mapEstadoCivil(estadoCivilStr),
            vigente: true,
            fechaExpiracion: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year validity
            tipo: TipoDD.ESTANDAR // Default for historical
        };

        const persona = await prisma.debiDaDiligencia.upsert({
            where: { identificacion },
            update: personaData,
            create: personaData
        });

        // 3. Counterparty (Vendedor) - Simple mock or if template has it
        // For now, let's assume we have a minimum for the counterpart to make it valid
        const contraparteId = row.getCell(18).text.trim() || 'HIDDEN_LEGACY';
        const contraparte = await prisma.debiDaDiligencia.upsert({
            where: { identificacion: contraparteId },
            update: {},
            create: {
                identificacion: contraparteId,
                nombres: row.getCell(17).text.trim() || 'CONTRA PARTE HISTORICA',
                tipoPersona: TipoPersona.NATURAL,
                tipo: TipoDD.SIMPLIFICADA,
                vigente: true,
                fechaExpiracion: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
            }
        });

        // 4. Operación Data
        const tipoActoStr = row.getCell(19).text.trim().toUpperCase();
        const numeroEscritura = row.getCell(20).text.trim();
        const fechaEscrituraStr = row.getCell(21).text;
        const valorDeclarado = parseFloat(row.getCell(22).text) || 0;
        const avaluoMunicipal = parseFloat(row.getCell(23).text) || 0;
        const formaPagoStr = row.getCell(24).text.trim().toUpperCase();
        const montoEfectivo = formaPagoStr === 'EFECTIVO' ? valorDeclarado : 0;

        // 5. Risk Assessment (Historical usually BAJO if not specified)
        const operacionInput = {
            tipoActo: this.mapTipoActo(tipoActoStr),
            valorDeclarado,
            montoEfectivo,
            vendedor: {
                tipoPersona: contraparte.tipoPersona,
                esPEP: contraparte.esPEP
            },
            comprador: {
                tipoPersona: persona.tipoPersona,
                esPEP: persona.esPEP
            }
        };

        const score = await riskAssessmentService.calcularScoreRiesgo(operacionInput);
        const nivel = riskAssessmentService.determinarNivelRiesgo(score);
        const factores = await riskAssessmentService.identificarFactoresRiesgo(operacionInput);
        const tipoDD = await riskAssessmentService.evaluarTipoDD(operacionInput);

        // 6. Create Operacion
        await prisma.operacion.create({
            data: {
                tipoActo: operacionInput.tipoActo,
                numeroEscritura,
                fechaEscritura: new Date(fechaEscrituraStr),
                valorDeclarado,
                avaluoMunicipal: avaluoMunicipal as any,
                montoEfectivo,
                formaPago: this.mapFormaPago(formaPagoStr),
                estado: EstadoOperacion.APROBADA, // All historical are approved
                nivelRiesgo: nivel,
                scoreRiesgo: score,
                tipoDD: tipoDD,
                factoresRiesgo: factores as any,
                vendedorId: contraparte.id,
                compradorId: persona.id,
                notariaId,
                creadorId: userId,
                descripcionBien: `Migración Histórica: ${tipoActoStr}`
            }
        });
    }

    private mapEstadoCivil(str: string): EstadoCivil {
        const map: Record<string, EstadoCivil> = {
            'SOLTERO': EstadoCivil.SOLTERO,
            'CASADO': EstadoCivil.CASADO,
            'DIVORCIADO': EstadoCivil.DIVORCIADO,
            'VIUDO': EstadoCivil.VIUDO,
            'UNION LIBRE': EstadoCivil.UNION_LIBRE,
            'UNIÓN LIBRE': EstadoCivil.UNION_LIBRE
        };
        return map[str] || EstadoCivil.SOLTERO;
    }

    private mapTipoActo(str: string): TipoActo {
        const map: Record<string, TipoActo> = {
            'COMPRAVENTA': TipoActo.COMPRAVENTA,
            'COMPRA VENTA': TipoActo.COMPRAVENTA,
            'HIPOTECA': TipoActo.HIPOTECA,
            'DONACION': TipoActo.DONACION,
            'DONACIÓN': TipoActo.DONACION,
            'PODER': TipoActo.PODER,
            'TESTAMENTO': TipoActo.TESTAMENTO
        };
        return map[str] || TipoActo.OTRO;
    }

    private mapFormaPago(str: string): FormaPago {
        const map: Record<string, FormaPago> = {
            'EFECTIVO': FormaPago.EFECTIVO,
            'TRANSFERENCIA': FormaPago.TRANSFERENCIA,
            'CHEQUE': FormaPago.CHEQUE,
            'MIXTO': FormaPago.MIXTO
        };
        return map[str] || FormaPago.TRANSFERENCIA;
    }
}

export const importService = new ImportService();
