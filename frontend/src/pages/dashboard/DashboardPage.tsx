import { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RiesgoBadge from '../../components/common/RiesgoBadge';

interface DashboardStats {
    totalOperaciones: number;
    alertasPendientes: number;
    reportesEnviados: number;
    nivelRiesgoPromedio: string;
}

// Datos para gráfico de operaciones por mes
const operacionesPorMes = [
    { mes: 'Ago', operaciones: 45 },
    { mes: 'Sep', operaciones: 52 },
    { mes: 'Oct', operaciones: 48 },
    { mes: 'Nov', operaciones: 61 },
    { mes: 'Dic', operaciones: 55 },
    { mes: 'Ene', operaciones: 68 },
    { mes: 'Feb', operaciones: 42 },
];

// Datos para gráfico de distribución de riesgo
const distribucionRiesgo = [
    { nivel: 'Bajo', cantidad: 85, color: '#10b981' },
    { nivel: 'Medio', cantidad: 45, color: '#f59e0b' },
    { nivel: 'Alto', cantidad: 15, color: '#ef4444' },
    { nivel: 'Muy Alto', cantidad: 5, color: '#7f1d1d' },
];

export default function DashboardPage() {
    const [stats] = useState<DashboardStats>({
        totalOperaciones: 150,
        alertasPendientes: 5,
        reportesEnviados: 12,
        nivelRiesgoPromedio: 'MEDIO',
    });

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
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOperaciones}</p>
                        </div>
                        <div className="text-4xl">📋</div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <span>↑ 12%</span>
                        <span className="ml-2 text-gray-500">vs mes anterior</span>
                    </div>
                </div>

                {/* Alertas Pendientes */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Alertas Pendientes</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.alertasPendientes}</p>
                        </div>
                        <div className="text-4xl">🚨</div>
                    </div>
                    <div className="mt-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Requiere atención
                        </span>
                    </div>
                </div>

                {/* Reportes Enviados */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Reportes Enviados</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.reportesEnviados}</p>
                        </div>
                        <div className="text-4xl">📄</div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-blue-600">
                        <span>✓ Al día</span>
                    </div>
                </div>

                {/* Nivel de Riesgo Promedio */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Nivel de Riesgo Promedio</p>
                            <div className="mt-2">
                                <RiesgoBadge nivel={stats.nivelRiesgoPromedio as any} size="lg" />
                            </div>
                        </div>
                        <div className="text-4xl">⚖️</div>
                    </div>
                </div>
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Operaciones por Mes */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Operaciones por Mes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={operacionesPorMes}>
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

                {/* Distribución por Nivel de Riesgo */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Nivel de Riesgo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={distribucionRiesgo}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(props: any) => `${props.nivel}: ${((props.percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="cantidad"
                            >
                                {distribucionRiesgo.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {distribucionRiesgo.map((item) => (
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

            {/* Alertas Recientes */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recientes</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Operación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="badge-alert-critica">CRÍTICA</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    Escritura 045-2026
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    11/02/2026
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="badge bg-yellow-100 text-yellow-800">PENDIENTE</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button className="text-primary-600 hover:text-primary-900">Analizar</button>
                                </td>
                            </tr>
                            {/* Add more rows as needed */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
