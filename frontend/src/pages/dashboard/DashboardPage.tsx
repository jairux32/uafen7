import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { operacionService } from '../../services/operacion.service';

// Colores para gráfico de distribución de riesgo
const RISK_COLORS: Record<string, string> = {
    'BAJO': '#10b981',
    'MEDIO': '#f59e0b',
    'ALTO': '#ef4444',
    'MUY_ALTO': '#7f1d1d',
};

export default function DashboardPage() {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: operacionService.getStats,
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando estadísticas...</div>;
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                Error al cargar el dashboard: {(error as Error).message}
            </div>
        );
    }

    // Preparar datos para gráficos
    const distribucionRiesgoData = stats?.riesgoDistribucion.map(item => ({
        ...item,
        color: RISK_COLORS[item.nivel] || '#9ca3af',
    })) || [];

    return (
        <div className="space-y-6">
            {/* Page title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Resumen de actividades de cumplimiento</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Operaciones */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Operaciones</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total || 0}</p>
                        </div>
                        <div className="text-4xl">📋</div>
                    </div>
                </div>

                {/* Alertas Pendientes */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Alertas Pendientes</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.alertasPendientes || 0}</p>
                        </div>
                        <div className="text-4xl">🚨</div>
                    </div>
                    {(stats?.alertasPendientes || 0) > 0 && (
                        <div className="mt-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Requiere atención
                            </span>
                        </div>
                    )}
                </div>

                {/* Por Revisar (En Revisión) */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">En Revisión</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.porEstado.revision || 0}</p>
                        </div>
                        <div className="text-4xl">👀</div>
                    </div>
                </div>

                {/* Borradores */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Borradores</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.porEstado.borradores || 0}</p>
                        </div>
                        <div className="text-4xl">📝</div>
                    </div>
                </div>
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Operaciones por Mes */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Operaciones por Mes</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats?.operacionesPorMes || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="mes"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={{ stroke: '#d1d5db' }}
                                />
                                <YAxis
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={{ stroke: '#d1d5db' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar
                                    dataKey="operaciones"
                                    fill="#3b82f6"
                                    radius={[8, 8, 0, 0]}
                                    name="Operaciones"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribución por Nivel de Riesgo */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Nivel de Riesgo</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={distribucionRiesgoData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props: any) => `${props.nivel}: ${((props.percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="cantidad"
                                >
                                    {distribucionRiesgoData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {distribucionRiesgoData.map((item) => (
                            <div key={item.nivel} className="flex items-center">
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-gray-600">
                                    {item.nivel}: {item.cantidad}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
