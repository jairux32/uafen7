import { useQuery } from '@tanstack/react-query';
import { alertaService } from '../../services/alerta.service';
import type { Alerta, SeveridadAlerta } from '../../types';

export default function AlertasPage() {
    const { data: alertas, isLoading } = useQuery({
        queryKey: ['alertas-pendientes'],
        queryFn: () => alertaService.getPendientes(),
    });

    const getSeverityColor = (severidad: SeveridadAlerta) => {
        const colors = {
            CRITICA: 'badge-alert-critica',
            ALTA: 'badge-alert-alta',
            MEDIA: 'badge-alert-media',
            BAJA: 'badge-alert-baja',
        };
        return colors[severidad];
    };

    const getSeverityIcon = (severidad: SeveridadAlerta) => {
        const icons = {
            CRITICA: '🔴',
            ALTA: '🟠',
            MEDIA: '🟡',
            BAJA: '🔵',
        };
        return icons[severidad];
    };

    const stats = {
        criticas: alertas?.filter(a => a.severidad === 'CRITICA').length || 0,
        altas: alertas?.filter(a => a.severidad === 'ALTA').length || 0,
        medias: alertas?.filter(a => a.severidad === 'MEDIA').length || 0,
        bajas: alertas?.filter(a => a.severidad === 'BAJA').length || 0,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Alertas</h1>
                <p className="text-gray-600">Análisis y gestión de alertas de cumplimiento</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Críticas</p>
                            <p className="text-3xl font-bold text-red-600">{stats.criticas}</p>
                        </div>
                        <span className="text-4xl">🔴</span>
                    </div>
                </div>

                <div className="card border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Altas</p>
                            <p className="text-3xl font-bold text-orange-600">{stats.altas}</p>
                        </div>
                        <span className="text-4xl">🟠</span>
                    </div>
                </div>

                <div className="card border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Medias</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.medias}</p>
                        </div>
                        <span className="text-4xl">🟡</span>
                    </div>
                </div>

                <div className="card border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Bajas</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.bajas}</p>
                        </div>
                        <span className="text-4xl">🔵</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button className="border-b-2 border-primary-600 py-4 px-1 text-sm font-medium text-primary-600">
                        Todas ({alertas?.length || 0})
                    </button>
                    <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        Pendientes ({alertas?.filter(a => a.estado === 'PENDIENTE').length || 0})
                    </button>
                    <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        En Análisis ({alertas?.filter(a => a.estado === 'EN_ANALISIS').length || 0})
                    </button>
                    <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        Confirmadas ({alertas?.filter(a => a.estado === 'CONFIRMADA').length || 0})
                    </button>
                    <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        Falsos Positivos ({alertas?.filter(a => a.estado === 'FALSO_POSITIVO').length || 0})
                    </button>
                </nav>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="card text-center py-8 text-gray-500">
                        Cargando alertas...
                    </div>
                ) : alertas && alertas.length > 0 ? (
                    alertas.map((alerta: Alerta) => (
                        <div key={alerta.id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`badge ${getSeverityColor(alerta.severidad)}`}>
                                            {getSeverityIcon(alerta.severidad)} {alerta.severidad}
                                        </span>
                                        <h3 className="text-lg font-semibold text-gray-900">{alerta.titulo}</h3>
                                    </div>

                                    <p className="text-gray-700 mb-3">{alerta.descripcion}</p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>📋 Operación: {alerta.operacion?.numeroEscritura || alerta.operacionId}</span>
                                        <span>🕐 {new Date(alerta.createdAt).toLocaleString('es-EC')}</span>
                                        <span className="badge bg-gray-100 text-gray-800">{alerta.estado.replace('_', ' ')}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <button className="btn-primary text-sm">
                                        Analizar
                                    </button>
                                    <button className="btn-secondary text-sm">
                                        Falso Positivo
                                    </button>
                                    {alerta.severidad === 'CRITICA' && (
                                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
                                            Generar ROS
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card text-center py-8 text-gray-500">
                        No hay alertas pendientes
                    </div>
                )}
            </div>
        </div>
    );
}
