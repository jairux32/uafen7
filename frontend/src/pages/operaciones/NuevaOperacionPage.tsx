import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, User, ShoppingCart, FileText } from 'lucide-react';
import StepIndicator from '../../components/operaciones/StepIndicator';
import PersonaForm from '../../components/operaciones/PersonaForm';
import ListasRestrictivasCheck from '../../components/operaciones/ListasRestrictivasCheck';
import { debidaDiligenciaService } from '../../services/debidaDiligencia.service';
import { operationsService } from '../../services/operations.service';
import { riskAssessmentService } from '../../services/riskAssessment.service';
import type { DebiDaDiligencia, CreateOperacionRequest, RiskCalculationResponse } from '../../types';

const STEPS = [
    { number: 1, label: 'Datos Generales' },
    { number: 2, label: 'Debida Diligencia' },
    { number: 3, label: 'Revisión' },
];

interface NuevaOperacionState {
    tipoActo: string;
    valorDeclarado: string;
    montoEfectivo: string;
    formaPago: string;
    numeroEscritura: string;
    descripcionBien: string;
    ubicacion: string;
    fechaEscritura: string;
    vendedor: Partial<DebiDaDiligencia> | null;
    comprador: Partial<DebiDaDiligencia> | null;
    riesgo: RiskCalculationResponse | null;
    listasVerificadas: boolean;
}

export default function NuevaOperacionPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<NuevaOperacionState>({
        tipoActo: 'COMPRAVENTA',
        valorDeclarado: '',
        montoEfectivo: '',
        formaPago: 'EFECTIVO',
        numeroEscritura: '',
        descripcionBien: '',
        ubicacion: '',
        fechaEscritura: '',
        vendedor: null,
        comprador: null,
        riesgo: null,
        listasVerificadas: false,
    });

    const updateFormData = (field: keyof NuevaOperacionState, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Real-time risk calculation
    useEffect(() => {
        const calculateRisk = async () => {
            // Guard clauses to prevent unnecessary API calls
            if (!formData.valorDeclarado || parseFloat(formData.valorDeclarado) <= 0) return;
            // Only calculate if we have at least partial data
            if (!formData.vendedor?.identificacion && !formData.comprador?.identificacion) return;

            try {
                const riskInput = {
                    tipoActo: formData.tipoActo,
                    valorDeclarado: parseFloat(formData.valorDeclarado) || 0,
                    montoEfectivo: formData.montoEfectivo ? parseFloat(formData.montoEfectivo) : undefined,
                    vendedor: formData.vendedor || undefined,
                    comprador: formData.comprador || undefined,
                };

                const riskResult = await riskAssessmentService.calcularRiesgoPreliminar(riskInput);

                // Update form data with calculated risk
                setFormData(prev => ({
                    ...prev,
                    riesgo: riskResult,
                }));
            } catch (error) {
                console.error('Error calculating risk:', error);
            }
        };

        // Debounce the calculation (2000ms)
        const timeoutId = setTimeout(calculateRisk, 2000);
        return () => clearTimeout(timeoutId);
    }, [formData.tipoActo, formData.valorDeclarado, formData.montoEfectivo, formData.vendedor, formData.comprador]);

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            // Create or update vendedor if needed
            let vendedorId = formData.vendedor?.id;
            if (!vendedorId && formData.vendedor?.identificacion) {
                const vendedorData = {
                    ...formData.vendedor,
                    tipoPersona: formData.vendedor.tipoPersona || 'NATURAL',
                    identificacion: formData.vendedor.identificacion,
                    // Ensure required fields
                    nacionalidad: formData.vendedor.nacionalidad || 'Ecuatoriana',
                    esPEP: formData.vendedor.esPEP || false,
                } as any; // Cast for creation
                const vendedor = await debidaDiligenciaService.crear(vendedorData);
                vendedorId = vendedor.id;
            }

            // Create or update comprador if needed
            let compradorId = formData.comprador?.id;
            if (!compradorId && formData.comprador?.identificacion) {
                const compradorData = {
                    ...formData.comprador,
                    tipoPersona: formData.comprador.tipoPersona || 'NATURAL',
                    identificacion: formData.comprador.identificacion,
                    nacionalidad: formData.comprador.nacionalidad || 'Ecuatoriana',
                    esPEP: formData.comprador.esPEP || false,
                } as any;
                const comprador = await debidaDiligenciaService.crear(compradorData);
                compradorId = comprador.id;
            }

            if (!vendedorId || !compradorId) {
                alert('Error: Faltan datos del vendedor o comprador');
                return;
            }

            // Now create the operation with the IDs
            const operacionData: CreateOperacionRequest = {
                tipoActo: formData.tipoActo,
                valorDeclarado: parseFloat(formData.valorDeclarado),
                formaPago: formData.formaPago,
                montoEfectivo: formData.montoEfectivo ? parseFloat(formData.montoEfectivo) : undefined,
                numeroEscritura: formData.numeroEscritura,
                fechaEscritura: new Date(formData.fechaEscritura).toISOString(),
                descripcionBien: formData.descripcionBien,
                vendedorId,
                compradorId,
            };

            await operationsService.createOperacion(operacionData);
            navigate('/operaciones');
        } catch (error) {
            console.error('Error creating operation:', error);
            alert('Error al crear la operación. Por favor intente nuevamente.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Nueva Operación</h1>
                <p className="text-gray-600">Complete los datos generales para iniciar la evaluación.</p>
            </div>

            {/* Step Indicator */}
            <StepIndicator steps={STEPS} currentStep={currentStep} />

            {/* Step Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {currentStep === 1 && (
                        <Paso1DatosGenerales
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}

                    {currentStep === 2 && (
                        <Paso2DebidaDiligencia
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}

                    {currentStep === 3 && (
                        <Paso3Revision formData={formData} />
                    )}
                </div>

                {/* Sidebar - Risk Assessment (visible in steps 1 and 3) */}
                {(currentStep === 1 || currentStep === 3) && (
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Evaluación de Riesgo</h3>
                                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${formData.riesgo?.nivel === 'BAJO' ? 'bg-green-100 text-green-800' :
                                    formData.riesgo?.nivel === 'MEDIO' ? 'bg-yellow-100 text-yellow-800' :
                                        formData.riesgo?.nivel === 'ALTO' ? 'bg-orange-100 text-orange-800' :
                                            formData.riesgo?.nivel === 'MUY_ALTO' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {formData.riesgo?.nivel || 'NO CALCULADO'}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-4">
                                <div className="flex-shrink-0">
                                    <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">
                                        <span className="text-3xl font-bold text-purple-600">{formData.riesgo?.score || 0}</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-700 mb-2">Factores de Riesgo:</h4>
                                    <div className="space-y-1">
                                        {formData.riesgo?.factores?.map((factor, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{factor.nombre}</span>
                                                <span className="font-medium text-purple-600">+{factor.puntos}</span>
                                            </div>
                                        )) || <span className="text-sm text-gray-500">No hay factores calculados</span>}
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-4">
                                * El puntaje se actualizará automáticamente conforme se añadan más detalles en los
                                siguientes pasos.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="btn-secondary disabled:opacity-50"
                >
                    ← Anterior
                </button>

                <div className="flex gap-3">
                    {currentStep === 3 && (
                        <button className="btn-secondary">
                            Guardar como Borrador
                        </button>
                    )}
                    <button onClick={handleNext} className="btn-primary">
                        {currentStep === 3 ? 'Crear Operación →' : 'Siguiente: ' + (STEPS[currentStep] ? STEPS[currentStep].label : 'Paso') + ' →'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Paso 1: Datos Generales
function Paso1DatosGenerales({ formData, updateFormData }: { formData: NuevaOperacionState; updateFormData: (field: keyof NuevaOperacionState, value: any) => void }) {
    return (
        <div className="card">
            <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Datos de la Operación</h2>
            </div>

            <div className="space-y-4">
                {/* Tipo de Acto */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Acto
                    </label>
                    <select
                        value={formData.tipoActo}
                        onChange={(e) => updateFormData('tipoActo', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="COMPRAVENTA">Compraventa de Inmueble</option>
                        <option value="HIPOTECA">Hipoteca</option>
                        <option value="DONACION">Donación</option>
                        <option value="PODER">Poder Especial</option>
                        <option value="TESTAMENTO">Testamento</option>
                    </select>
                </div>

                {/* Valor Declarado y Forma de Pago */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor Declarado (USD)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                            <input
                                type="number"
                                value={formData.valorDeclarado}
                                onChange={(e) => updateFormData('valorDeclarado', e.target.value)}
                                placeholder="150000"
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Forma de Pago
                        </label>
                        <select
                            value={formData.formaPago}
                            onChange={(e) => updateFormData('formaPago', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="EFECTIVO">Efectivo / Cash</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="MIXTO">Mixto</option>
                        </select>
                    </div>
                </div>

                {/* Monto en Efectivo */}
                {(formData.formaPago === 'EFECTIVO' || formData.formaPago === 'MIXTO') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto en Efectivo (USD)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                            <input
                                type="number"
                                value={formData.montoEfectivo}
                                onChange={(e) => updateFormData('montoEfectivo', e.target.value)}
                                placeholder="12500"
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        {parseFloat(formData.montoEfectivo) > 10000 && (
                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                <p className="text-sm text-amber-800">
                                    <strong>ALERTA:</strong> El pago en efectivo excede el límite legal de $10,000 USD
                                    para este tipo de acto.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Número y Fecha de Escritura */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número de Escritura
                        </label>
                        <input
                            type="text"
                            value={formData.numeroEscritura}
                            onChange={(e) => updateFormData('numeroEscritura', e.target.value)}
                            placeholder="Ej. 45021"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Escritura
                        </label>
                        <input
                            type="date"
                            value={formData.fechaEscritura}
                            onChange={(e) => updateFormData('fechaEscritura', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Descripción del Bien */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción del Bien
                    </label>
                    <textarea
                        value={formData.descripcionBien}
                        onChange={(e) => updateFormData('descripcionBien', e.target.value)}
                        placeholder="Detalles de la propiedad o bien objeto del acto..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>
        </div>
    );
}

// Paso 2: Debida Diligencia
function Paso2DebidaDiligencia({ formData, updateFormData }: { formData: NuevaOperacionState; updateFormData: (field: keyof NuevaOperacionState, value: any) => void }) {
    return (
        <div className="space-y-6">
            {/* Vendedor */}
            <PersonaForm
                title="Vendedor / Cedente"
                icon={<User className="w-5 h-5 text-purple-600" />}
                onPersonaChange={(data) => updateFormData('vendedor', data)}
            />

            {/* Comprador */}
            <PersonaForm
                title="Comprador / Cesionario"
                icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
                onPersonaChange={(data) => updateFormData('comprador', data)}
            />

            {/* Listas Restrictivas */}
            <ListasRestrictivasCheck
                vendedor={formData.vendedor || {}}
                comprador={formData.comprador || {}}
                onVerified={() => updateFormData('listasVerificadas', true)}
                onPersonUpdate={(tipo, data) => updateFormData(tipo, data)}
            />
        </div>
    );
}

// Paso 3: Revisión
function Paso3Revision({ formData }: { formData: NuevaOperacionState }) {
    return (
        <div className="space-y-6">
            {/* Resumen de Operación */}
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Datos de la Operación</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Tipo de Acto:</span>
                        <p className="font-semibold text-gray-900">{formData.tipoActo}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Fecha:</span>
                        <p className="font-semibold text-gray-900">{formData.fechaEscritura || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Cuantía</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            ${formData.valorDeclarado ? parseFloat(formData.valorDeclarado).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600">Moneda:</span>
                        <p className="font-semibold text-gray-900">USD - Dólares</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Monto de Operación:</span>
                        <p className="font-semibold text-gray-900">${formData.valorDeclarado || '0'}</p>
                    </div>
                </div>
            </div>

            {/* Resumen de Partes */}
            <div className="grid grid-cols-2 gap-6">
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Vendedor</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="font-semibold text-gray-900">
                            {formData.vendedor?.nombres || formData.vendedor?.razonSocial || 'No especificado'}
                        </p>
                        <p className="text-gray-600">
                            {formData.vendedor?.identificacion || 'Sin ID'}
                        </p>
                        <p className="text-gray-600">
                            {formData.vendedor?.nacionalidad || 'Sin nacionalidad'}
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Comprador</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="font-semibold text-gray-900">
                            {formData.comprador?.nombres || formData.comprador?.razonSocial || 'No especificado'}
                        </p>
                        <p className="text-gray-600">
                            {formData.comprador?.identificacion || 'Sin ID'}
                        </p>
                        <p className="text-gray-600">
                            {formData.comprador?.nacionalidad || 'Sin nacionalidad'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Advertencia */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-900">Impacto del Registro</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            Al hacer clic en "Crear Operación", los datos se enviarán formalmente para el control de
                            cumplimiento. Esta acción notificará a los departamentos de auditoría y no podrá ser
                            revertida sin un proceso de anulación administrativa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
