import { apiClient } from './api';
import type { Documento, TipoDocumento } from '../types';

export const documentoService = {
    async upload(file: File, operacionId: string, tipo: TipoDocumento, descripcion?: string): Promise<Documento> {
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('operacionId', operacionId);
        formData.append('tipo', tipo);
        if (descripcion) formData.append('descripcion', descripcion);

        const { data } = await apiClient.post<Documento>('/documentos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    async getByOperacion(operacionId: string): Promise<Documento[]> {
        const { data } = await apiClient.get<Documento[]>(`/documentos/operacion/${operacionId}`);
        return data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/documentos/${id}`);
    },

    getDownloadUrl(id: string): string {
        const token = localStorage.getItem('token');
        // Construct URL directly for usage in <a> tags or window.open
        // Note: this bypasses axios interceptors, so we might need to append token or handle auth via cookies/query
        // Ideally, we use a blob download via axios, but for simplicity let's try direct link with token in query or assuming cookie/header is handled by browser?
        // Actually, for download, it's often better to do a GET request with responseType 'blob'
        return `${apiClient.defaults.baseURL}/documentos/${id}/download?token=${token}`;
    },

    async downloadBlob(id: string, nombre: string): Promise<void> {
        const response = await apiClient.get(`/documentos/${id}/download`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', nombre);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
