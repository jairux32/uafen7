import { Search } from 'lucide-react';
import { useState } from 'react';
import { debidaDiligenciaService } from '../../services/debidaDiligencia.service';
import type { DebiDaDiligencia } from '../../types';

interface PersonaFormProps {
    title: string;
    icon: React.ReactNode;
    onPersonaChange?: (data: Partial<DebiDaDiligencia>) => void;
}

export default function PersonaForm({ title, icon, onPersonaChange }: PersonaFormProps) {
    const [tipoPersona, setTipoPersona] = useState<'NATURAL' | 'JURIDICA'>('NATURAL');
    const [formData, setFormData] = useState<Partial<DebiDaDiligencia>>({
        identificacion: '',
        nombres: '',
        apellidos: '',
        razonSocial: '',
        nacionalidad: 'Ecuatoriana',
        paisConstitucion: 'Ecuador',
        origenFondos: '',
        esPEP: false,
        actividadEconomica: '',
        estadoCivil: 'SOLTERO',
        nombreConyuge: '',
        identificacionConyuge: '',
    });
    // income string buffer for input handling
    const [ingresosMensualesStr, setIngresosMensualesStr] = useState('');

    const [isSearching, setIsSearching] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');

    const handleSearch = async () => {
        if (!formData.identificacion || formData.identificacion.length < 10) {
            setSearchMessage('⚠️ Ingrese una identificación válida (mínimo 10 dígitos)');
            return;
        }

        setIsSearching(true);
        setSearchMessage('🔍 Buscando...');

        try {
            const response = await debidaDiligenciaService.buscarPorIdentificacion(formData.identificacion);

            if (response.encontrado && response.persona) {
                // Populate form with found data
                const persona = response.persona;
                setFormData(persona);
                setIngresosMensualesStr(persona.ingresosMensuales?.toString() || '');
                setTipoPersona(persona.tipoPersona);
                setSearchMessage('✅ Persona encontrada en el sistema');
                onPersonaChange?.(persona);
            } else {
                setSearchMessage('ℹ️ Persona no encontrada. Complete los datos para crear un nuevo registro.');
            }
        } catch (error) {
            console.error('Error searching person:', error);
            setSearchMessage('❌ Error al buscar. Intente nuevamente.');
        } finally {
            setIsSearching(false);
        }
    };

    const notifyChange = (data: Partial<DebiDaDiligencia>, incomeStr: string) => {
        const cleanData = {
            ...data,
            tipoPersona: tipoPersona, // Keep current type reference
            ingresosMensuales: incomeStr ? Number(incomeStr) : undefined,
        };
        onPersonaChange?.(cleanData);
    };

    const handleChange = (field: keyof DebiDaDiligencia, value: any) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        notifyChange(newData, ingresosMensualesStr);
    };

    const handleIncomeChange = (value: string) => {
        setIngresosMensualesStr(value);
        notifyChange(formData, value);
    };

    const handleTipoPersonaChange = (tipo: 'NATURAL' | 'JURIDICA') => {
        setTipoPersona(tipo);
        let newData = { ...formData, tipoPersona: tipo };

        // Clear type-specific fields references
        if (tipo === 'NATURAL') {
            newData = { ...newData, razonSocial: undefined, paisConstitucion: 'Ecuador' };
        } else {
            newData = { ...newData, nombres: undefined, apellidos: undefined, nacionalidad: undefined };
        }

        setFormData(newData);
        notifyChange(newData, ingresosMensualesStr);
    };

    return (
        <div className="card">
            <div className="flex items-center gap-2 mb-6">
                {icon}
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>

            {/* Tipo de Persona */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    TIPO DE PERSONA
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`tipo-${title}`}
                            value="NATURAL"
                            checked={tipoPersona === 'NATURAL'}
                            onChange={() => handleTipoPersonaChange('NATURAL')}
                            className="mr-2"
                        />
                        <span className="text-sm">Natural</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`tipo-${title}`}
                            value="JURIDICA"
                            checked={tipoPersona === 'JURIDICA'}
                            onChange={() => handleTipoPersonaChange('JURIDICA')}
                            className="mr-2"
                        />
                        <span className="text-sm">Jurídica</span>
                    </label>
                </div>
            </div>

            {/* Estado Civil - Solo para Persona Natural */}
            {tipoPersona === 'NATURAL' && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ESTADO CIVIL
                    </label>
                    <select
                        value={formData.estadoCivil}
                        onChange={(e) => handleChange('estadoCivil', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="SOLTERO">Soltero/a</option>
                        <option value="CASADO">Casado/a</option>
                        <option value="DIVORCIADO">Divorciado/a</option>
                        <option value="VIUDO">Viudo/a</option>
                        <option value="UNION_LIBRE">Unión Libre</option>
                    </select>
                </div>
            )}

            {/* Datos del Cónyuge - Solo si está casado */}
            {tipoPersona === 'NATURAL' && formData.estadoCivil === 'CASADO' && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">DATOS DEL CÓNYUGE</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                NOMBRE COMPLETO DEL CÓNYUGE
                            </label>
                            <input
                                type="text"
                                value={formData.nombreConyuge}
                                onChange={(e) => handleChange('nombreConyuge', e.target.value)}
                                placeholder="Ej: María Fernanda López"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                IDENTIFICACIÓN DEL CÓNYUGE
                            </label>
                            <input
                                type="text"
                                value={formData.identificacionConyuge}
                                onChange={(e) => handleChange('identificacionConyuge', e.target.value)}
                                placeholder="Ej: 0987654321"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Identificación con búsqueda */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    IDENTIFICACIÓN (ID)
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Ej. 1712345678"
                        value={formData.identificacion}
                        onChange={(e) => handleChange('identificacion', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>
                {searchMessage && (
                    <p className="text-sm mt-2 text-gray-600">{searchMessage}</p>
                )}
            </div>

            {/* Nombres / Razón Social */}
            {tipoPersona === 'NATURAL' ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            NOMBRES
                        </label>
                        <input
                            type="text"
                            value={formData.nombres}
                            onChange={(e) => handleChange('nombres', e.target.value)}
                            placeholder="Ej: Juan Carlos"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            APELLIDOS
                        </label>
                        <input
                            type="text"
                            value={formData.apellidos}
                            onChange={(e) => handleChange('apellidos', e.target.value)}
                            placeholder="Ej: Pérez González"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            ) : (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        NOMBRES / RAZÓN SOCIAL
                    </label>
                    <input
                        type="text"
                        value={formData.razonSocial}
                        onChange={(e) => handleChange('razonSocial', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            )}

            {/* Nacionalidad e Ingresos */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {tipoPersona === 'NATURAL' ? 'NACIONALIDAD' : 'PAÍS DE CONSTITUCIÓN'}
                    </label>
                    <select
                        value={tipoPersona === 'NATURAL' ? formData.nacionalidad : formData.paisConstitucion}
                        onChange={(e) => handleChange(tipoPersona === 'NATURAL' ? 'nacionalidad' : 'paisConstitucion', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="Ecuador">Ecuador</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Perú">Perú</option>
                        <option value="Venezuela">Venezuela</option>
                        <option value="Otra">Otra</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        INGRESOS MENSUALES
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input
                            type="number"
                            value={ingresosMensualesStr}
                            onChange={(e) => handleIncomeChange(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </div>

            {/* Origen de Fondos */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    ORIGEN DE FONDOS
                </label>
                <textarea
                    value={formData.origenFondos}
                    onChange={(e) => handleChange('origenFondos', e.target.value)}
                    placeholder="Describa la procedencia de los recursos..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* PEP Checkbox */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.esPEP}
                        onChange={(e) => handleChange('esPEP', e.target.checked)}
                        className="mt-1"
                    />
                    <div>
                        <span className="font-semibold text-purple-900">
                            Persona Expuesta Políticamente (PEP)
                        </span>
                        <p className="text-sm text-purple-700 mt-1">
                            ¿Ejerce o ha ejercido cargos públicos de alto nivel?
                        </p>
                    </div>
                </label>
            </div>
        </div>
    );
}
