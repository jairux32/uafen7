import { apiClient } from './api';

export interface RiskCalculationInput {
    tipoActo: string;
    valorDeclarado: number;
    montoEfectivo?: number;
    vendedor?: {
        tipoPersona?: string;
        paisConstitucion?: string;
        esPEP?: boolean;
    };
    comprador?: {
        tipoPersona?: string;
        paisConstitucion?: string;
        esPEP?: boolean;
    };
}

export interface RiskFactor {
    nombre: string;
    puntos: number;
}

export interface RiskCalculationResponse {
    score: number;
    nivel: 'BAJO' | 'MEDIO' | 'ALTO' | 'MUY_ALTO';
    factores: RiskFactor[];
    tipoDD: 'SIMPLIFICADA' | 'ESTANDAR' | 'REFORZADA' | 'INTENSIFICADA';
}

/**
 * Risk Assessment Service
 * Handles real-time risk calculation
 */
class RiskAssessmentService {
    /**
     * Calculate preliminary risk score
     */
    async calcularRiesgoPreliminar(data: RiskCalculationInput): Promise<RiskCalculationResponse> {
        const response = await apiClient.post('/operaciones/calcular-riesgo', data);
        return response.data;
    }
}

export const riskAssessmentService = new RiskAssessmentService();
