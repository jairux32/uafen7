import { apiClient } from './api';
import type { RiskCalculationInput, RiskCalculationResponse } from '../types';

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
