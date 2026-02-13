import { apiClient } from './api';
import type { ListasRestrictivasResult } from '../types';

export interface VerificacionResult {
    identificacion: string;
    nombre: string;
    resultados: ListasRestrictivasResult[];
}

export interface VerificarListasResponse {
    vendedor: VerificacionResult;
    comprador: VerificacionResult;
}

/**
 * Listas Restrictivas Service
 * Handles sanctions list verification
 */
class ListasRestrictivasService {
    /**
     * Verify vendor and buyer against restrictive lists
     */
    async verificar(vendedorId: string, compradorId: string): Promise<VerificarListasResponse> {
        const response = await apiClient.post('/verificar-listas', {
            vendedorId,
            compradorId,
        });
        return response.data;
    }
}

export const listasRestrictivasService = new ListasRestrictivasService();
