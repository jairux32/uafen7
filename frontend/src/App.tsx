import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import OperacionesPage from './pages/operaciones/OperacionesPage';
import NuevaOperacionPage from './pages/operaciones/NuevaOperacionPage';
import OperacionCreatedPage from './pages/operaciones/OperacionCreatedPage';
import AlertasPage from './pages/alertas/AlertasPage';
import ReportesPage from './pages/reportes/ReportesPage';
import ConfiguracionPage from './pages/configuracion/ConfiguracionPage';
import './index.css';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="operaciones" element={<OperacionesPage />} />
            <Route path="operaciones/nueva" element={<NuevaOperacionPage />} />
            <Route path="operaciones/success" element={<OperacionCreatedPage />} />
            <Route path="alertas" element={<AlertasPage />} />
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
