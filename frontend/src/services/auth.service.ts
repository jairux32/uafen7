import { apiClient } from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

export const authService = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
        // Store token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    async register(userData: RegisterRequest): Promise<User> {
        const { data } = await apiClient.post<User>('/auth/register', userData);
        return data;
    },

    async getCurrentUser(): Promise<User> {
        const { data } = await apiClient.get<User>('/auth/me');
        return data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getStoredUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};
