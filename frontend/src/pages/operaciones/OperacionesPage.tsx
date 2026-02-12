import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { operacionService } from '../../services/operacion.service';
import RiesgoBadge from '../../components/common/RiesgoBadge';
import type { Operacion } from '../../types';

export default function OperacionesPage() {
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        tipoActo: '',
        nivelRiesgo: '',
        estado: '',
        search: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['operaciones', filters],
        queryFn: () => operacionService.getAll(filters),
    });

    if (error) {
        return (
            <div className="space-y-6">
                <div className="card bg-red-50 border border-red-200 p-6">
                    <h2 className="text-lg font-semibold text-red-900 mb-2">Error al cargar operaciones</h2>
                    <p className="text-red-700">{(error as Error).message}</p>
                </div>
            </div>
        );
    }

    // Mock summary data - in real app, get from API
    const summaryCards = [
        {
            title: 'Alertas Totales',
            value: '12',
            subtitle: '+3 desde ayer',
            icon: AlertTriangle,
            color: 'red',
        },
        {
            title: 'En Revisión',
            value: '08',
            subtitle: '4 pendientes hoy',
            icon: Clock,
            color: 'blue',
        },
        {
            title: 'Riesgo Alto',
            value: '05',
            subtitle: 'Requiere atención',
            icon: AlertTriangle,
            color: 'orange',
        },
        {
            title: 'Completadas',
            value: '24',
            subtitle: '+12 esta semana',
            icon: CheckCircle,
            color: 'green',
        },
    ];

    const getIconColor = (color: string) => {
        switch (color) {
            case 'red':
                return 'text-red-600 bg-red-100';
            case 'blue':
                return 'text-blue-600 bg-blue-100';
            case 'orange':
                return 'text-orange-600 bg-orange-100';
            case 'green':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registro de Operaciones</h1>
                    <p className="text-gray-600">Supervisión y control de actos notariales para cumplimiento.</p>
                </div>
                <Link to="/operaciones/nueva" className="btn-primary">
                    + Nueva Operación
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {summaryCards.map((card) => (
                    <div key={card.title} className="card">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
                                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${getIconColor(card.color)}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Date Range */}
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={filters.fechaDesde}
                            onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                            className="flex-1 outline-none text-sm"
                        />
                    </div>

                    {/* Tipo de Acto */}
                    <select
                        value={filters.tipoActo}
                        onChange={(e) => setFilters({ ...filters, tipoActo: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Todos los actos</option>
                        <option value="COMPRAVENTA">Compraventa</option>
                        <option value="HIPOTECA">Hipoteca</option>
                        <option value="DONACION">Donación</option>
                        <option value="PODER">Poder</option>
                        <option value="TESTAMENTO">Testamento</option>
                    </select>

                    {/* Nivel de Riesgo */}
                    <select
                        value={filters.nivelRiesgo}
                        onChange={(e) => setFilters({ ...filters, nivelRiesgo: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Todos los rics</option>
                        <option value="BAJO">Bajo</option>
                        <option value="MEDIO">Medio</option>
                        <option value="ALTO">Alto</option>
                        <option value="MUY_ALTO">Muy Alto</option>
                    </select>

                    {/* Estado */}
                    <select
                        value={filters.estado}
                        onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Todos los estados</option>
                        <option value="BORRADOR">Borrador</option>
                        <option value="EN_REVISION">En Revisión</option>
                        <option value="APROBADA">Aprobada</option>
                        <option value="RECHAZADA">Rechazada</option>
                    </select>

                    {/* Apply Filters Button */}
                    <button className="btn-primary">
                        Aplicar Filtros
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Buscar por número de escritura..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Número Escritura
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Tipo de Acto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Valor Declarado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Nivel de Riesgo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Alertas
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : (data?.data?.length ?? 0) === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                        No hay operaciones
                                    </td>
                                </tr>
                            ) : (
                                data?.data?.map((op: Operacion) => (
                                    <tr key={op.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {op.numeroEscritura}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {op.tipoActo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(op.fechaEscritura).toLocaleDateString('es-EC')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${op.valorDeclarado.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RiesgoBadge nivel={op.nivelRiesgo} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${op.estado === 'APROBADA' ? 'bg-green-100 text-green-800' :
                                                op.estado === 'EN_REVISION' ? 'bg-blue-100 text-blue-800' :
                                                    op.estado === 'RECHAZADA' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {op.estado.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {op.alertas && op.alertas.length > 0 && (
                                                <span className="badge bg-red-100 text-red-800">
                                                    {op.alertas.length}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link
                                                to={`/operaciones/${op.id}`}
                                                className="text-primary-600 hover:text-primary-900 mr-3"
                                            >
                                                Ver
                                            </Link>
                                            <button className="text-gray-600 hover:text-gray-900">
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.total > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Mostrando {(filters.page - 1) * filters.limit + 1} - {Math.min(filters.page * filters.limit, data.total)} de {data.total} resultados
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                disabled={filters.page === 1}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={filters.page * filters.limit >= data.total}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
