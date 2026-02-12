import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, User, ShoppingCart, FileText } from 'lucide-react';
import StepIndicator from '../../components/operaciones/StepIndicator';
import RiskScoreCircle from '../../components/operaciones/RiskScoreCircle';
import PersonaForm from '../../components/operaciones/PersonaForm';
import ListasRestrictivasCheck from '../../components/operaciones/ListasRestrictivasCheck';
import { debidaDiligenciaService } from '../../services/debidaDiligencia.service';
import { operationsService } from '../../services/operations.service';
import { riskAssessmentService } from '../../services/riskAssessment.service';

const STEPS = [
    { number: 1, label: 'Datos Generales' },
    { number: 2, label: 'Debida Diligencia' },
    { number: 3, label: 'Revisión' },
];

export default function NuevaOperacionPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        tipoActo: 'COMPRAVENTA',
        valorDeclarado: '',
        montoEfectivo: '',
        formaPago: 'EFECTIVO',
        numeroEscritura: '',
        descripcionBien: '',
        ubicacion: '',
        fechaEscritura: '',
        vendedor: null as any,
        comprador: null as any,
        riesgo: null as any,
        listasVerificadas: false,
    });

    const updateFormData = (field: string, value: any) => {
        console.log(`Updating ${field}: `, value); // Debug log
        setFormData((prev) => ({ ...prev, [field]: value }));
    };


    // Real-time risk calculation
    useEffect(() => {
        const calculateRisk = async () => {
            // Only calculate if we have minimum required data
            if (!formData.tipoActo || !formData.valorDeclarado) {
                return;
            }

            try {
                const riskInput = {
                    tipoActo: formData.tipoActo,
                    valorDeclarado: parseFloat(formData.valorDeclarado) || 0,
                    montoEfectivo: formData.montoEfectivo ? parseFloat(formData.montoEfectivo) : undefined,
                    vendedor: formData.vendedor?.esPEP !== undefined ? {
                        tipoPersona: formData.vendedor.tipoPersona,
                        paisConstitucion: formData.vendedor.paisConstitucion,
                        esPEP: formData.vendedor.esPEP,
                    } : undefined,
                    comprador: formData.comprador?.esPEP !== undefined ? {
                        tipoPersona: formData.comprador.tipoPersona,
                        paisConstitucion: formData.comprador.paisConstitucion,
                        esPEP: formData.comprador.esPEP,
                    } : undefined,
                };

                const riskResult = await riskAssessmentService.calcularRiesgoPreliminar(riskInput);

                // Update form data with calculated risk
                setFormData(prev => ({
                    ...prev,
                    riesgo: {
                        score: riskResult.score,
                        nivel: riskResult.nivel,
                        factores: riskResult.factores,
                        tipoDD: riskResult.tipoDD,
                    },
                }));
            } catch (error) {
                console.error('Error calculating risk:', error);
            }
        };

        // Debounce the calculation
        const timeoutId = setTimeout(calculateRisk, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.tipoActo, formData.valorDeclarado, formData.montoEfectivo, formData.vendedor, formData.comprador]);

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            // Submit form
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
                    tipoPersona: formData.vendedor.tipoPersona || 'NATURAL',
                    identificacion: formData.vendedor.identificacion,
                    nombres: formData.vendedor.nombres,
                    apellidos: formData.vendedor.apellidos,
                    razonSocial: formData.vendedor.razonSocial,
                    nacionalidad: formData.vendedor.nacionalidad,
                    paisConstitucion: formData.vendedor.paisConstitucion,
                    ingresosMensuales: formData.vendedor.ingresosMensuales ? parseFloat(formData.vendedor.ingresosMensuales) : undefined,
                    origenFondos: formData.vendedor.origenFondos,
                    esPEP: formData.vendedor.esPEP || false,
                    actividadEconomica: formData.vendedor.actividadEconomica,
                };
                const vendedor = await debidaDiligenciaService.crear(vendedorData);
                vendedorId = vendedor.id;
            }

            // Create or update comprador if needed
            let compradorId = formData.comprador?.id;
            if (!compradorId && formData.comprador?.identificacion) {
                const compradorData = {
                    tipoPersona: formData.comprador.tipoPersona || 'NATURAL',
                    identificacion: formData.comprador.identificacion,
                    nombres: formData.comprador.nombres,
                    apellidos: formData.comprador.apellidos,
                    razonSocial: formData.comprador.razonSocial,
                    nacionalidad: formData.comprador.nacionalidad,
                    paisConstitucion: formData.comprador.paisConstitucion,
                    ingresosMensuales: formData.comprador.ingresosMensuales ? parseFloat(formData.comprador.ingresosMensuales) : undefined,
                    origenFondos: formData.comprador.origenFondos,
                    esPEP: formData.comprador.esPEP || false,
                    actividadEconomica: formData.comprador.actividadEconomica,
                };
                const comprador = await debidaDiligenciaService.crear(compradorData);
                compradorId = comprador.id;
            }

            // Now create the operation with the IDs
            const operacionData = {
                tipoActo: formData.tipoActo,
                valorDeclarado: parseFloat(formData.valorDeclarado),
                formaPago: formData.formaPago,
                montoEfectivo: formData.montoEfectivo ? parseFloat(formData.montoEfectivo) : undefined,
                numeroEscritura: formData.numeroEscritura,
                fechaEscritura: formData.fechaEscritura,
                descripcionBien: formData.descripcionBien,
                vendedorId,
                compradorId,
            };

            // Create the operation
            console.log('Creating operation:', operacionData);
            const createdOperation = await operationsService.createOperacion(operacionData);
            console.log('Operation created successfully:', createdOperation);

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
                                <div className={`px - 4 py - 2 rounded - full text - sm font - semibold ${formData.riesgo?.nivel === 'BAJO' ? 'bg-green-100 text-green-800' :
                                    formData.riesgo?.nivel === 'MEDIO' ? 'bg-yellow-100 text-yellow-800' :
                                        formData.riesgo?.nivel === 'ALTO' ? 'bg-orange-100 text-orange-800' :
                                            'bg-red-100 text-red-800'
                                    } `}>
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
                                        {formData.riesgo?.factores?.map((factor: any, index: any) => (
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
                        {currentStep === 3 ? 'Crear Operación →' : 'Siguiente: ' + STEPS[currentStep].label + ' →'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Paso 1: Datos Generales
function Paso1DatosGenerales({ formData, updateFormData }: any) {
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
function Paso2DebidaDiligencia({ formData, updateFormData }: any) {
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
                vendedorId={formData.vendedor?.id}
                compradorId={formData.comprador?.id}
                onVerified={() => updateFormData('listasVerificadas', true)}
            />
        </div>
    );
}

// Paso 3: Revisión
function Paso3Revision({ formData }: any) {
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
                            {formData.vendedor?.nombres || 'No especificado'}
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
                            {formData.comprador?.nombres || 'No especificado'}
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
