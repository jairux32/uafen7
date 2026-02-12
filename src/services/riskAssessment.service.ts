import { TipoDD, NivelRiesgo, TipoActo, TipoPersona } from '@prisma/client';
import { prisma } from '../config/database';

interface OperacionInput {
    tipoActo: TipoActo;
    valorDeclarado: number;
    montoEfectivo?: number;
    vendedor: {
        tipoPersona: TipoPersona;
        paisConstitucion?: string;
        esPEP: boolean;
    };
    comprador: {
        tipoPersona: TipoPersona;
        paisConstitucion?: string;
        esPEP: boolean;
    };
}

interface FactorRiesgo {
    tipo: string;
    descripcion: string;
    peso: number;
}

/**
 * Risk Assessment Service
 * Implements Enfoque Basado en Riesgos (EBR) according to UAFE regulations
 */
export class RiskAssessmentService {
    /**
     * Determine the type of Due Diligence required based on risk profile
     * 
     * Rules:
     * - SIMPLIFICADA: Low risk (e.g., liquidación sociedad conyugal)
     * - ESTANDAR: Medium risk / regular client (e.g., hipoteca)
     * - REFORZADA: High risk (foreign companies, complex transactions)
     * - INTENSIFICADA: Very high risk (PEPs, high-risk countries)
     */
    async evaluarTipoDD(operacion: OperacionInput): Promise<TipoDD> {
        const factores = await this.identificarFactoresRiesgo(operacion);
        const score = factores.reduce((sum, f) => sum + f.peso, 0);

        // PEPs always require INTENSIFICADA
        if (operacion.vendedor.esPEP || operacion.comprador.esPEP) {
            return TipoDD.INTENSIFICADA;
        }

        // Foreign companies require REFORZADA minimum
        const tieneEmpresaExtranjera =
            (operacion.vendedor.tipoPersona === TipoPersona.JURIDICA &&
                operacion.vendedor.paisConstitucion !== 'Ecuador') ||
            (operacion.comprador.tipoPersona === TipoPersona.JURIDICA &&
                operacion.comprador.paisConstitucion !== 'Ecuador');

        if (tieneEmpresaExtranjera) {
            return score >= 70 ? TipoDD.INTENSIFICADA : TipoDD.REFORZADA;
        }

        // Score-based determination
        if (score >= 70) return TipoDD.INTENSIFICADA;
        if (score >= 50) return TipoDD.REFORZADA;
        if (score >= 30) return TipoDD.ESTANDAR;
        return TipoDD.SIMPLIFICADA;
    }

    /**
     * Calculate risk score (0-100)
     */
    async calcularScoreRiesgo(operacion: OperacionInput): Promise<number> {
        const factores = await this.identificarFactoresRiesgo(operacion);
        const score = factores.reduce((sum, f) => sum + f.peso, 0);
        return Math.min(score, 100);
    }

    /**
     * Identify risk factors for an operation
     */
    async identificarFactoresRiesgo(operacion: OperacionInput): Promise<FactorRiesgo[]> {
        const factores: FactorRiesgo[] = [];

        // 1. Transaction type risk
        const riesgoTipoActo = this.evaluarRiesgoTipoActo(operacion.tipoActo);
        if (riesgoTipoActo.peso > 0) {
            factores.push(riesgoTipoActo);
        }

        // 2. Transaction amount risk
        if (operacion.valorDeclarado >= 100000) {
            factores.push({
                tipo: 'MONTO_ALTO',
                descripcion: `Transacción de alto valor: $${operacion.valorDeclarado.toLocaleString()}`,
                peso: 15,
            });
        }

        // 3. Cash payment risk (CRITICAL)
        if (operacion.montoEfectivo && operacion.montoEfectivo >= 10000) {
            factores.push({
                tipo: 'EFECTIVO_ALTO',
                descripcion: `Pago en efectivo >= $10,000: $${operacion.montoEfectivo.toLocaleString()}`,
                peso: 30,
            });
        }

        // 4. PEP risk (CRITICAL)
        if (operacion.vendedor.esPEP) {
            factores.push({
                tipo: 'PEP_VENDEDOR',
                descripcion: 'Vendedor es Persona Expuesta Políticamente',
                peso: 40,
            });
        }

        if (operacion.comprador.esPEP) {
            factores.push({
                tipo: 'PEP_COMPRADOR',
                descripcion: 'Comprador es Persona Expuesta Políticamente',
                peso: 40,
            });
        }

        // 5. Foreign company risk
        if (
            operacion.vendedor.tipoPersona === TipoPersona.JURIDICA &&
            operacion.vendedor.paisConstitucion !== 'Ecuador'
        ) {
            factores.push({
                tipo: 'EMPRESA_EXTRANJERA_VENDEDOR',
                descripcion: `Vendedor es empresa extranjera: ${operacion.vendedor.paisConstitucion}`,
                peso: 25,
            });
        }

        if (
            operacion.comprador.tipoPersona === TipoPersona.JURIDICA &&
            operacion.comprador.paisConstitucion !== 'Ecuador'
        ) {
            factores.push({
                tipo: 'EMPRESA_EXTRANJERA_COMPRADOR',
                descripcion: `Comprador es empresa extranjera: ${operacion.comprador.paisConstitucion}`,
                peso: 25,
            });
        }

        // 6. High-risk countries (simplified - should check against GAFI list)
        const paisesAltoRiesgo = await this.verificarPaisesAltoRiesgo([
            operacion.vendedor.paisConstitucion,
            operacion.comprador.paisConstitucion,
        ]);

        paisesAltoRiesgo.forEach((pais) => {
            factores.push({
                tipo: 'PAIS_ALTO_RIESGO',
                descripcion: `País de alto riesgo: ${pais}`,
                peso: 35,
            });
        });

        return factores;
    }

    /**
     * Determine risk level from score
     */
    determinarNivelRiesgo(score: number): NivelRiesgo {
        if (score >= 70) return NivelRiesgo.MUY_ALTO;
        if (score >= 50) return NivelRiesgo.ALTO;
        if (score >= 30) return NivelRiesgo.MEDIO;
        return NivelRiesgo.BAJO;
    }

    /**
     * Evaluate risk based on transaction type
     */
    private evaluarRiesgoTipoActo(tipoActo: TipoActo): FactorRiesgo {
        const riesgos: Record<TipoActo, { peso: number; descripcion: string }> = {
            [TipoActo.LIQUIDACION_SOCIEDAD_CONYUGAL]: {
                peso: 5,
                descripcion: 'Liquidación de sociedad conyugal (bajo riesgo)',
            },
            [TipoActo.CANCELACION_HIPOTECA]: {
                peso: 5,
                descripcion: 'Cancelación de hipoteca (bajo riesgo)',
            },
            [TipoActo.HIPOTECA]: {
                peso: 10,
                descripcion: 'Hipoteca (riesgo medio)',
            },
            [TipoActo.PODER]: {
                peso: 10,
                descripcion: 'Poder notarial (riesgo medio)',
            },
            [TipoActo.TESTAMENTO]: {
                peso: 10,
                descripcion: 'Testamento (riesgo medio)',
            },
            [TipoActo.COMPRAVENTA]: {
                peso: 15,
                descripcion: 'Compraventa (riesgo medio-alto)',
            },
            [TipoActo.DONACION]: {
                peso: 20,
                descripcion: 'Donación (riesgo alto - posible ocultamiento)',
            },
            [TipoActo.CONSTITUCION_SOCIEDAD]: {
                peso: 20,
                descripcion: 'Constitución de sociedad (riesgo alto)',
            },
            [TipoActo.OTRO]: {
                peso: 15,
                descripcion: 'Otro tipo de acto',
            },
        };

        const riesgo = riesgos[tipoActo];
        return {
            tipo: 'TIPO_ACTO',
            descripcion: riesgo.descripcion,
            peso: riesgo.peso,
        };
    }

    /**
     * Check if countries are in high-risk list (GAFI)
     * TODO: Integrate with real GAFI list
     */
    private async verificarPaisesAltoRiesgo(paises: (string | undefined)[]): Promise<string[]> {
        // Simplified list - should be updated from GAFI regularly
        const paisesAltoRiesgo = [
            'Corea del Norte',
            'Irán',
            'Myanmar',
            'Siria',
            'Yemen',
            'Afganistán',
        ];

        return paises.filter(
            (pais) => pais && paisesAltoRiesgo.includes(pais)
        ) as string[];
    }
}

export const riskAssessmentService = new RiskAssessmentService();
