import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { reportesService } from '../../services/reportes.service';
import type { Reporte, TipoReporte, EstadoReporte } from '../../types';

export default function ReportesPage() {
    const [activeTab, setActiveTab] = useState<TipoReporte>('RESU');
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form states
    const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
    const [anio, setAnio] = useState<number>(new Date().getFullYear());
    const [operacionId, setOperacionId] = useState<string>('');

    // Cargar reportes al cambiar tab
    useEffect(() => {
        loadReportes();
    }, [activeTab]);

    const loadReportes = async () => {
        try {
            setLoading(true);
            const data = await reportesService.getByTipo(activeTab);
            setReportes(data);
        } catch (error) {
            toast.error('Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerar = async () => {
        try {
            setIsGenerating(true);

            const request = {
                tipo: activeTab,
                ...(activeTab !== 'ROS' && { mes, anio }),
                ...(activeTab === 'ROS' && { operacionId })
            };

            await reportesService.generar(request);
            toast.success('Reporte generado exitosamente');
            loadReportes();

            // Reset form
            if (activeTab === 'ROS') {
                setOperacionId('');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al generar reporte');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDescargar = async (reporte: Reporte) => {
        try {
            const blob = await reportesService.descargarXML(reporte.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${reporte.tipo}_${reporte.mes || 'individual'}_${reporte.anio || new Date().getFullYear()}.xml`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Reporte descargado');
        } catch (error) {
            toast.error('Error al descargar reporte');
        }
    };

    const getEstadoBadgeClass = (estado: EstadoReporte): string => {
        const classes = {
            GENERADO: 'bg-blue-100 text-blue-800',
            ENVIADO: 'bg-yellow-100 text-yellow-800',
            CONFIRMADO: 'bg-green-100 text-green-800',
            ERROR: 'bg-red-100 text-red-800'
        };
        return classes[estado] || 'bg-gray-100 text-gray-800';
    };

    const meses = [
        { value: 1, label: 'Enero' },
        { value: 2, label: 'Febrero' },
        { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Mayo' },
        { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' },
        { value: 11, label: 'Noviembre' },
        { value: 12, label: 'Diciembre' }
    ];

    const anios = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportes UAFE</h1>
                <p className="text-gray-600 mt-1">
                    Generación y gestión de reportes para la Unidad de Análisis Financiero
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {(['RESU', 'ROS', 'RIA'] as TipoReporte[]).map((tipo) => (
                        <button
                            key={tipo}
                            onClick={() => setActiveTab(tipo)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tipo
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tipo}
                            {tipo === 'RESU' && ' - Reporte de Estructura'}
                            {tipo === 'ROS' && ' - Operación Sospechosa'}
                            {tipo === 'RIA' && ' - Inexistencia de Actividades'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Formulario de Generación */}
            <div className="card">
                <h2 className="text-lg font-semibold mb-4">
                    Generar Nuevo Reporte {activeTab}
                </h2>

                {activeTab !== 'ROS' ? (
                    // Formulario para RESU y RIA (mensual)
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mes *
                            </label>
                            <select
                                value={mes}
                                onChange={(e) => setMes(Number(e.target.value))}
                                className="input"
                            >
                                {meses.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Año *
                            </label>
                            <select
                                value={anio}
                                onChange={(e) => setAnio(Number(e.target.value))}
                                className="input"
                            >
                                {anios.map((a) => (
                                    <option key={a} value={a}>
                                        {a}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleGenerar}
                                disabled={isGenerating}
                                className="btn-primary w-full"
                            >
                                {isGenerating ? 'Generando...' : 'Generar Reporte'}
                            </button>
                        </div>
                    </div>
                ) : (
                    // Formulario para ROS (por operación)
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID de Operación *
                            </label>
                            <input
                                type="text"
                                value={operacionId}
                                onChange={(e) => setOperacionId(e.target.value)}
                                placeholder="Ingrese el ID de la operación"
                                className="input"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Solo operaciones con riesgo ALTO o MUY_ALTO
                            </p>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleGenerar}
                                disabled={isGenerating || !operacionId}
                                className="btn-primary w-full"
                            >
                                {isGenerating ? 'Generando...' : 'Generar Reporte'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Historial de Reportes */}
            <div className="card">
                <h2 className="text-lg font-semibold mb-4">
                    Historial de Reportes {activeTab}
                </h2>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600 mt-2">Cargando reportes...</p>
                    </div>
                ) : reportes.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No hay reportes generados</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Generación
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Período
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Confirmación UAFE
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportes.map((reporte) => (
                                    <tr key={reporte.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(reporte.createdAt).toLocaleDateString('es-EC')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {reporte.mes && reporte.anio
                                                ? `${meses.find(m => m.value === reporte.mes)?.label} ${reporte.anio}`
                                                : 'Individual'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadgeClass(reporte.estado)}`}>
                                                {reporte.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reporte.confirmacionUAFE || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDescargar(reporte)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                title="Descargar XML"
                                            >
                                                📥
                                            </button>
                                            <button
                                                className="text-gray-600 hover:text-gray-900"
                                                title="Ver detalles"
                                            >
                                                👁
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
