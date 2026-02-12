import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    initialize: () => {
        const user = authService.getStoredUser();
        const token = authService.getToken();
        set({ user, token, isAuthenticated: !!token });
    },

    login: async (email: string, password: string) => {
        const response = await authService.login({ email, password });
        set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
        });
    },

    logout: () => {
        authService.logout();
        set({ user: null, token: null, isAuthenticated: false });
    },

    setUser: (user: User) => {
        set({ user });
    },
}));
