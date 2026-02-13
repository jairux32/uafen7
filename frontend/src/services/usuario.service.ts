import api from './api';

export interface Usuario {
    id: string;
    nombres: string;
    apellidos: string;
    cedula: string;
    email: string;
    rol: 'ADMIN_SISTEMA' | 'NOTARIO' | 'OFICIAL_CUMPLIMIENTO' | 'MATRIZADOR';
    activo: boolean;
    ultimoAcceso?: string;
    createdAt: string;
}

export const usuarioService = {
    async listar(): Promise<Usuario[]> {
        const response = await api.get('/usuarios');
        return response.data;
    },

    async actualizar(id: string, data: Partial<Usuario>): Promise<Usuario> {
        const response = await api.patch(`/usuarios/${id}`, data);
        return response.data;
    },

    async cambiarEstado(id: string, activo: boolean): Promise<Usuario> {
        const response = await api.patch(`/usuarios/${id}/estado`, { activo });
        return response.data;
    }
};
