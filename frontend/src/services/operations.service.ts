import { apiClient } from './api';
import type { Operacion, DebiDaDiligencia } from '../types';

export interface CreateOperacionRequest {
    numeroEscritura: string;
    fechaEscritura: string;
    tipoActo: string;
    descripcionBien: string;
    valorDeclarado: number;
    formaPago: string;
    montoEfectivo?: number;
    vendedorId: string;
    compradorId: string;
}

export const operationsService = {
    async getOperaciones(params?: {
        page?: number;
        limit?: number;
        tipoActo?: string;
        nivelRiesgo?: string;
        estado?: string;
        search?: string;
    }) {
        const response = await apiClient.get('/operaciones', { params });
        return response.data;
    },

    async getOperacion(id: string) {
        const response = await apiClient.get(`/operaciones/${id}`);
        return response.data;
    },

    async createOperacion(data: CreateOperacionRequest): Promise<Operacion> {
        const response = await apiClient.post('/operaciones', data);
        return response.data;
    },

    async updateOperacion(id: string, data: Partial<CreateOperacionRequest>) {
        const response = await apiClient.put(`/operaciones/${id}`, data);
        return response.data;
    },

    async deleteOperacion(id: string) {
        const response = await apiClient.delete(`/operaciones/${id}`);
        return response.data;
    },
};
