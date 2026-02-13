import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    Building2,
    User,
    ShieldCheck,
    Zap,
    Calendar,
    Mail,
    CheckCircle2,
    Eye,
    RefreshCcw,
    Shield,
    History,
    Users,
    UserPlus,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { usuarioService } from '../../services/usuario.service';
import type { Usuario } from '../../services/usuario.service';

type TabType = 'notaria' | 'usuarios' | 'seguridad' | 'auditoria';

export default function ConfiguracionPage() {
    const [activeTab, setActiveTab] = useState<TabType>('notaria');
    const [isSaving, setIsSaving] = useState(false);
    const [isTestingUafe, setIsTestingUafe] = useState(false);

    // Users state
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Form states (simplified for UI demonstration)
    const [notariaInfo, setNotariaInfo] = useState({
        nombre: 'Notaría Primera de Quito',
        ruc: '1790000000001',
        telefono: '02-2345-678',
        provincia: 'Pichincha',
        canton: 'Quito'
    });

    const [notario, setNotario] = useState({
        nombre: 'Dr. Roberto Valdez',
        fechaNombramiento: '2023-01-15',
        certDigital: 'Válida hasta 12/2025'
    });

    const [oficial, setOficial] = useState({
        nombre: 'María Elena Pazmiño',
        email: 'cumplimiento@notaria.gob.ec',
        idCert: 'UAFE-CERT-X882',
        fechaDesignacion: '2023-03-20'
    });

    const [uafeConfig, setUafeConfig] = useState({
        sisla: '09-02-123456',
        apiKey: '••••••••••••••••••••••••'
    });

    useEffect(() => {
        if (activeTab === 'usuarios') {
            loadUsuarios();
        }
    }, [activeTab]);

    const loadUsuarios = async () => {
        setIsLoadingUsers(true);
        try {
            const data = await usuarioService.listar();
            setUsuarios(data);
        } catch (error) {
            toast.error('Error al cargar usuarios');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleToggleStatus = async (user: Usuario) => {
        try {
            await usuarioService.cambiarEstado(user.id, !user.activo);
            toast.success(`Usuario ${!user.activo ? 'activado' : 'desactivado'} correctamente`);
            loadUsuarios();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al cambiar estado');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsSaving(false);
        toast.success('Configuración guardada correctamente');
    };

    const handleTestUafe = async () => {
        setIsTestingUafe(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsTestingUafe(false);
        toast.success('Conexión con UAFE exitosa');
    };

    return (
        <div className="space-y-6">
            {/* Header / Tabs */}
            <div className="border-b border-gray-100 mb-2">
                <nav className="-mb-px flex space-x-12">
                    {[
                        { id: 'notaria', label: 'Notaría' },
                        { id: 'usuarios', label: 'Usuarios' },
                        { id: 'seguridad', label: 'Seguridad' },
                        { id: 'auditoria', label: 'Auditoría' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm transition-all
                                ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'notaria' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 1. Información General */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Información General</h3>
                            </div>

                            <div className="space-y-5 flex-grow">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nombre de la Notaría</label>
                                    <input
                                        type="text"
                                        value={notariaInfo.nombre}
                                        onChange={e => setNotariaInfo({ ...notariaInfo, nombre: e.target.value })}
                                        className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Ej. Notaría Primera de Quito"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">RUC</label>
                                        <input
                                            type="text"
                                            value={notariaInfo.ruc}
                                            onChange={e => setNotariaInfo({ ...notariaInfo, ruc: e.target.value })}
                                            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Teléfono</label>
                                        <input
                                            type="text"
                                            value={notariaInfo.telefono}
                                            onChange={e => setNotariaInfo({ ...notariaInfo, telefono: e.target.value })}
                                            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Provincia</label>
                                        <select
                                            value={notariaInfo.provincia}
                                            onChange={e => setNotariaInfo({ ...notariaInfo, provincia: e.target.value })}
                                            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        >
                                            <option>Pichincha</option>
                                            <option>Guayas</option>
                                            <option>Azuay</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cantón</label>
                                        <select
                                            value={notariaInfo.canton}
                                            onChange={e => setNotariaInfo({ ...notariaInfo, canton: e.target.value })}
                                            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        >
                                            <option>Quito</option>
                                            <option>Guayaquil</option>
                                            <option>Cuenca</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Notario Titular */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Notario Titular</h3>
                            </div>

                            <div className="space-y-5 flex-grow">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={notario.nombre}
                                        onChange={e => setNotario({ ...notario, nombre: e.target.value })}
                                        className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fecha de Nombramiento</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={notario.fechaNombramiento}
                                                onChange={e => setNotario({ ...notario, fechaNombramiento: e.target.value })}
                                                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Certificación Digital</label>
                                        <div className="w-full h-11 px-4 bg-green-50 border border-green-100 rounded-lg text-sm flex items-center gap-2 text-green-700">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Válida hasta 12/2025</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Oficial de Cumplimiento */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Oficial de Cumplimiento</h3>
                            </div>

                            <div className="space-y-5 flex-grow">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nombre del Oficial</label>
                                    <input
                                        type="text"
                                        value={oficial.nombre}
                                        onChange={e => setOficial({ ...oficial, nombre: e.target.value })}
                                        className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Correo Electrónico Institucional</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            value={oficial.email}
                                            onChange={e => setOficial({ ...oficial, email: e.target.value })}
                                            className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ID Certificación UAFE</label>
                                        <input
                                            type="text"
                                            value={oficial.idCert}
                                            onChange={e => setOficial({ ...oficial, idCert: e.target.value })}
                                            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fecha Designación</label>
                                        <input
                                            type="date"
                                            value={oficial.fechaDesignacion}
                                            onChange={e => setOficial({ ...oficial, fechaDesignacion: e.target.value })}
                                            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Configuración UAFE */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">Configuración UAFE</h3>
                                </div>
                                <div className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-100 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    Conectado
                                </div>
                            </div>

                            <div className="space-y-5 flex-grow">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Código de Sujeto Obligado (SISLA)</label>
                                    <input
                                        type="text"
                                        value={uafeConfig.sisla}
                                        onChange={e => setUafeConfig({ ...uafeConfig, sisla: e.target.value })}
                                        className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">API Key de Integración</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={uafeConfig.apiKey}
                                            onChange={e => setUafeConfig({ ...uafeConfig, apiKey: e.target.value })}
                                            className="w-full h-11 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleTestUafe}
                                    disabled={isTestingUafe}
                                    className="w-full h-11 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <RefreshCcw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-all duration-500 ${isTestingUafe ? 'animate-spin' : ''}`} />
                                    {isTestingUafe ? 'Probando...' : 'Probar Conexión con UAFE'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex items-center justify-between sticky bottom-0 z-10">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Última actualización: 12 Octubre 2023, 14:30</span>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 h-10 border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : null}
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'usuarios' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Gestión de Usuarios</h3>
                                <p className="text-xs text-gray-500">Control de acceso y roles para el personal de la notaría</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm">
                            <UserPlus className="w-4 h-4" />
                            Nuevo Usuario
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Último Acceso</th>
                                    <th className="px-12 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoadingUsers ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Cargando usuarios...
                                        </td>
                                    </tr>
                                ) : usuarios.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                ) : usuarios.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                    {user.nombres[0]}{user.apellidos[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 leading-none mb-1">
                                                        {user.nombres} {user.apellidos}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200/50">
                                                {user.rol.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`
                                                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all
                                                    ${user.activo
                                                        ? 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100'
                                                        : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100'
                                                    }
                                                `}
                                            >
                                                {user.activo ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {user.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3" />
                                            {user.ultimoAcceso ? new Date(user.ultimoAcceso).toLocaleString() : 'Nunca'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {(activeTab === 'seguridad' || activeTab === 'auditoria') && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center animate-in fade-in duration-300">
                    <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                        {activeTab === 'seguridad' ? <Shield className="w-8 h-8 text-gray-400" /> :
                            <History className="w-8 h-8 text-gray-400" />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Módulo de {activeTab}</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                        Este módulo está disponible pero ha sido simplificado para centrarse en el rediseño de la pantalla de Notaría solicitado.
                    </p>
                    <button onClick={() => setActiveTab('notaria')} className="btn-primary">
                        Volver a Configuración de Notaría
                    </button>
                </div>
            )}
        </div>
    );
}
