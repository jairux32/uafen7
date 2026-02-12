import { useState } from 'react';
import toast from 'react-hot-toast';

type TabType = 'notaria' | 'usuarios' | 'parametros';

interface NotariaData {
    nombre: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email: string;
    notario: string;
}

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    activo: boolean;
}

interface Parametros {
    umbralEfectivo: number;
    umbralRiesgoAlto: number;
    diasAlertaPendiente: number;
}

export default function ConfiguracionPage() {
    const [activeTab, setActiveTab] = useState<TabType>('notaria');

    // Notaría data
    const [notaria, setNotaria] = useState<NotariaData>({
        nombre: 'Notaría Primera de Quito',
        ruc: '1791234567001',
        direccion: 'Av. 10 de Agosto N24-12, Quito',
        telefono: '02-2234567',
        email: 'contacto@notaria.com',
        notario: 'Dr. Juan Pérez González'
    });

    // Usuarios data
    const [usuarios] = useState<Usuario[]>([
        { id: '1', nombre: 'Admin Sistema', email: 'admin@notaria.com', rol: 'ADMIN_SISTEMA', activo: true },
        { id: '2', nombre: 'María López', email: 'maria@notaria.com', rol: 'OFICIAL_CUMPLIMIENTO', activo: true },
        { id: '3', nombre: 'Carlos Ruiz', email: 'carlos@notaria.com', rol: 'NOTARIO', activo: true }
    ]);

    // Parámetros data
    const [parametros, setParametros] = useState<Parametros>({
        umbralEfectivo: 10000,
        umbralRiesgoAlto: 50000,
        diasAlertaPendiente: 7
    });

    const handleSaveNotaria = () => {
        toast.success('Configuración de notaría guardada');
    };

    const handleSaveParametros = () => {
        toast.success('Parámetros del sistema guardados');
    };

    const getRolBadgeClass = (rol: string): string => {
        const classes = {
            ADMIN_SISTEMA: 'bg-purple-100 text-purple-800',
            OFICIAL_CUMPLIMIENTO: 'bg-blue-100 text-blue-800',
            NOTARIO: 'bg-green-100 text-green-800'
        };
        return classes[rol as keyof typeof classes] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-600 mt-1">
                    Gestión de notaría, usuarios y parámetros del sistema
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'notaria' as TabType, label: 'Notaría', icon: '🏢' },
                        { id: 'usuarios' as TabType, label: 'Usuarios', icon: '👥' },
                        { id: 'parametros' as TabType, label: 'Parámetros', icon: '⚙️' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'notaria' && (
                <div className="card">
                    <h2 className="text-lg font-semibold mb-6">Información de la Notaría</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de la Notaría *
                            </label>
                            <input
                                type="text"
                                value={notaria.nombre}
                                onChange={(e) => setNotaria({ ...notaria, nombre: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                RUC *
                            </label>
                            <input
                                type="text"
                                value={notaria.ruc}
                                onChange={(e) => setNotaria({ ...notaria, ruc: e.target.value })}
                                className="input"
                                maxLength={13}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dirección *
                            </label>
                            <input
                                type="text"
                                value={notaria.direccion}
                                onChange={(e) => setNotaria({ ...notaria, direccion: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                value={notaria.telefono}
                                onChange={(e) => setNotaria({ ...notaria, telefono: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={notaria.email}
                                onChange={(e) => setNotaria({ ...notaria, email: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notario Responsable *
                            </label>
                            <input
                                type="text"
                                value={notaria.notario}
                                onChange={(e) => setNotaria({ ...notaria, notario: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSaveNotaria} className="btn-primary">
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'usuarios' && (
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">Gestión de Usuarios</h2>
                        <button className="btn-primary">
                            + Nuevo Usuario
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {usuario.nombre}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {usuario.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRolBadgeClass(usuario.rol)}`}>
                                                {usuario.rol.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {usuario.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                                                Editar
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                {usuario.activo ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'parametros' && (
                <div className="card">
                    <h2 className="text-lg font-semibold mb-6">Parámetros del Sistema</h2>

                    <div className="space-y-6">
                        {/* Umbrales de Riesgo */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">Umbrales de Riesgo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Umbral de Efectivo (USD) *
                                    </label>
                                    <input
                                        type="number"
                                        value={parametros.umbralEfectivo}
                                        onChange={(e) => setParametros({ ...parametros, umbralEfectivo: Number(e.target.value) })}
                                        className="input"
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Monto mínimo para generar alerta de efectivo
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Umbral de Riesgo Alto (USD) *
                                    </label>
                                    <input
                                        type="number"
                                        value={parametros.umbralRiesgoAlto}
                                        onChange={(e) => setParametros({ ...parametros, umbralRiesgoAlto: Number(e.target.value) })}
                                        className="input"
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Valor declarado para clasificar como riesgo alto
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Alertas */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">Configuración de Alertas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Días para Alerta Pendiente *
                                    </label>
                                    <input
                                        type="number"
                                        value={parametros.diasAlertaPendiente}
                                        onChange={(e) => setParametros({ ...parametros, diasAlertaPendiente: Number(e.target.value) })}
                                        className="input"
                                        min="1"
                                        max="30"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Días antes de marcar alerta como vencida
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSaveParametros} className="btn-primary">
                            Guardar Parámetros
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
