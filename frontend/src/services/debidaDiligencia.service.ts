import { apiClient } from './api';

export interface DebidaDiligenciaData {
    tipoPersona: 'NATURAL' | 'JURIDICA';
    identificacion: string;
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    nacionalidad?: string;
    paisConstitucion?: string;
    ingresosMensuales?: number;
    origenFondos?: string;
    esPEP: boolean;
    actividadEconomica?: string;
}

export interface DebidaDiligencia extends DebidaDiligenciaData {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface BuscarPersonaResponse {
    encontrado: boolean;
    persona?: DebidaDiligencia;
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
    async crear(data: DebidaDiligenciaData): Promise<DebidaDiligencia> {
        const response = await apiClient.post('/debida-diligencia', data);
        return response.data;
    }

    /**
     * Update existing person record
     */
    async actualizar(id: string, data: Partial<DebidaDiligenciaData>): Promise<DebidaDiligencia> {
        const response = await apiClient.patch(`/debida-diligencia/${id}`, data);
        return response.data;
    }

    /**
     * Get person by ID
     */
    async obtenerPorId(id: string): Promise<DebidaDiligencia> {
        const response = await apiClient.get(`/debida-diligencia/${id}`);
        return response.data;
    }
}

export const debidaDiligenciaService = new DebidaDiligenciaService();
