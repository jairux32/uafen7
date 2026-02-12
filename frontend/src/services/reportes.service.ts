import { apiClient } from './api';
import type { Reporte, TipoReporte } from '../types';

interface GenerarReporteRequest {
    tipo: TipoReporte;
    mes?: number;
    anio?: number;
    operacionId?: string;
}

export const reportesService = {
    // Listar todos los reportes
    async getAll(): Promise<Reporte[]> {
        const { data } = await apiClient.get<Reporte[]>('/reportes');
        return data;
    },

    // Listar reportes por tipo
    async getByTipo(tipo: TipoReporte): Promise<Reporte[]> {
        const { data } = await apiClient.get<Reporte[]>(`/reportes?tipo=${tipo}`);
        return data;
    },

    // Generar nuevo reporte
    async generar(request: GenerarReporteRequest): Promise<Reporte> {
        const { data } = await apiClient.post<Reporte>('/reportes/generar', request);
        return data;
    },

    // Descargar XML
    async descargarXML(id: string): Promise<Blob> {
        const { data } = await apiClient.get(`/reportes/${id}/xml`, {
            responseType: 'blob'
        });
        return data;
    },

    // Obtener detalles
    async getById(id: string): Promise<Reporte> {
        const { data } = await apiClient.get<Reporte>(`/reportes/${id}`);
        return data;
    }
};
