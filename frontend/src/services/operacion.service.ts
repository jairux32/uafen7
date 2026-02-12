import { apiClient } from './api';
import type { Operacion, PaginatedResponse } from '../types';

export const operacionService = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        tipoActo?: string;
        nivelRiesgo?: string;
        estado?: string;
        search?: string;
    }): Promise<PaginatedResponse<Operacion>> {
        const { data } = await apiClient.get<PaginatedResponse<Operacion>>('/operaciones', { params });
        return data;
    },

    async getById(id: string): Promise<Operacion> {
        const { data } = await apiClient.get<Operacion>(`/operaciones/${id}`);
        return data;
    },

    async create(operacion: Partial<Operacion>): Promise<Operacion> {
        const { data } = await apiClient.post<Operacion>('/operaciones', operacion);
        return data;
    },

    async updateEstado(id: string, estado: string): Promise<Operacion> {
        const { data } = await apiClient.patch<Operacion>(`/operaciones/${id}/estado`, { estado });
        return data;
    },
};
