import { CheckCircle, Eye, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OperacionCreatedPage() {
    // Mock data - in real app, get from route state or API
    const operacion = {
        id: '#045-2026',
        tipoActo: 'Compraventa',
        valorDeclarado: '$150,000',
        estado: 'En Revisión',
    };

    const proximosPasos = [
        {
            numero: 1,
            titulo: 'Revisión de Alertas',
            descripcion: 'El Oficial de Cumplimiento revisará las alertas generadas automáticamente por el sistema.',
        },
        {
            numero: 2,
            titulo: 'Aprobación Final',
            descripcion:
                'El Notario recibirá una notificación para la revisión final y firma digital del acto.',
        },
        {
            numero: 3,
            titulo: 'Reporte UAFE',
            descripcion:
                'Si aplica, se generará el reporte mensual correspondiente para la Unidad de Análisis Financiero.',
        },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Success Message */}
            <div className="card text-center py-12">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    ¡Operación Creada Exitosamente!
                </h1>
                <p className="text-gray-600 mb-8">
                    La operación ha sido registrada en el sistema y se ha iniciado el proceso de validación.
                </p>

                {/* Operation Details */}
                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">ID OPERACIÓN</p>
                        <p className="text-xl font-bold text-primary-600">{operacion.id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">TIPO DE ACTO</p>
                        <p className="text-xl font-semibold text-gray-900">{operacion.tipoActo}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">VALOR DECLARADO</p>
                        <p className="text-xl font-semibold text-gray-900">{operacion.valorDeclarado}</p>
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    <span className="font-semibold">Estado Actual: {operacion.estado}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <Link
                        to={`/operaciones/${operacion.id}`}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Eye className="w-5 h-5" />
                        Ver Detalle de Operación
                    </Link>
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Descargar Comprobante PDF
                    </button>
                </div>
            </div>

            {/* Próximos Pasos */}
            <div className="card">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">→</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">PRÓXIMOS PASOS</h2>
                </div>

                <div className="space-y-4">
                    {proximosPasos.map((paso) => (
                        <div key={paso.numero} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                                    {paso.numero}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">{paso.titulo}</h3>
                                <p className="text-sm text-gray-600">{paso.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Back to Dashboard */}
            <div className="text-center">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
                    <ArrowLeft className="w-4 h-4" />
                    Ir al Dashboard
                </Link>
            </div>
        </div>
    );
}
