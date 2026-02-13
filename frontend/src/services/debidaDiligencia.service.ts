import { apiClient } from './api';
import type { DebiDaDiligencia } from '../types';

export interface BuscarPersonaResponse {
    encontrado: boolean;
    persona?: DebiDaDiligencia;
}

/**
 * Debida Diligencia Service
 * Handles KYC (Know Your Customer) data
 */
class DebidaDiligenciaService {
    /**
     * Search person by identification
     */
    async buscarPorIdentificacion(identificacion: string): Promise<BuscarPersonaResponse> {
        const response = await apiClient.get(`/debida-diligencia/buscar/${identificacion}`);
        return response.data;
    }

    /**
     * Create new person record
     */
    async crear(data: Omit<DebiDaDiligencia, 'id' | 'createdAt' | 'updatedAt'>): Promise<DebiDaDiligencia> {
        const response = await apiClient.post('/debida-diligencia', data);
        return response.data;
    }

    /**
     * Update existing person record
     */
    async actualizar(id: string, data: Partial<DebiDaDiligencia>): Promise<DebiDaDiligencia> {
        const response = await apiClient.patch(`/debida-diligencia/${id}`, data);
        return response.data;
    }

    /**
     * Get person by ID
     */
    async obtenerPorId(id: string): Promise<DebiDaDiligencia> {
        const response = await apiClient.get(`/debida-diligencia/${id}`);
        return response.data;
    }
}

export const debidaDiligenciaService = new DebidaDiligenciaService();
