import { apiClient } from './api';
import type { Alerta } from '../types';

export const alertaService = {
    async getPendientes(): Promise<Alerta[]> {
        const { data } = await apiClient.get<Alerta[]>('/alertas/pendientes');
        return data;
    },

    async gestionar(id: string, estado: string, comentarios?: string): Promise<Alerta> {
        const { data } = await apiClient.patch<Alerta>(`/alertas/${id}/gestionar`, {
            estado,
            comentarios,
        });
        return data;
    },
};
