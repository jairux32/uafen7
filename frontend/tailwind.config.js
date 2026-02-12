/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb', // Primary color
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                risk: {
                    bajo: '#10b981',
                    medio: '#f59e0b',
                    alto: '#f97316',
                    'muy-alto': '#ef4444',
                },
                alert: {
                    critica: '#dc2626',
                    alta: '#f97316',
                    media: '#f59e0b',
                    baja: '#3b82f6',
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
