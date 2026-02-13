import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                // Handle 401 Unauthorized
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }

                // Handle 500 Server Error
                if (error.response && error.response.status >= 500) {
                    console.error('Server Error:', error.response.data);
                    // You could dispatch a toast notification here
                }

                return Promise.reject(error.response?.data || error); // Return standard error format
            }
        );
    }

    get axios() {
        return this.client;
    }
}

export const apiClient = new ApiClient().axios;
export default apiClient;
