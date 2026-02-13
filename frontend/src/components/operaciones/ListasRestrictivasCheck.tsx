import { useState } from 'react';
import { Check, X, Loader2, Shield } from 'lucide-react';
import { listasRestrictivasService } from '../../services/listasRestrictivas.service';
import { debidaDiligenciaService } from '../../services/debidaDiligencia.service';
import type { DebiDaDiligencia, ListasRestrictivasResult } from '../../types';

interface ListasRestrictivasCheckProps {
    vendedor: Partial<DebiDaDiligencia>;
    comprador: Partial<DebiDaDiligencia>;
    onVerified?: (results: any) => void;
    onPersonUpdate?: (tipo: 'vendedor' | 'comprador', data: DebiDaDiligencia) => void;
}

export default function ListasRestrictivasCheck({
    vendedor,
    comprador,
    onVerified,
    onPersonUpdate,
}: ListasRestrictivasCheckProps) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [results, setResults] = useState<ListasRestrictivasResult[]>([
        { lista: 'UAFE', estado: 'pendiente' },
        { lista: 'OFAC', estado: 'pendiente' },
        { lista: 'ONU', estado: 'pendiente' },
    ]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const validateId = (id: string, tipo: string) => {
        if (!id) return `Falta identificación del ${tipo}`;
        if (id.length !== 10 && id.length !== 13) return `Identificación del ${tipo} inválida (debe tener 10 o 13 dígitos)`;
        return null;
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        setResults(results.map(r => ({ ...r, estado: 'verificando', mensaje: undefined })));

        // Validate IDs format first
        const vError = validateId(vendedor?.identificacion || '', 'Vendedor');
        if (vError) {
            setErrorMessage(vError);
            setIsVerifying(false);
            return;
        }

        const cError = validateId(comprador?.identificacion || '', 'Comprador');
        if (cError) {
            setErrorMessage(cError);
            setIsVerifying(false);
            return;
        }

        setErrorMessage(null);

        try {
            // Check if persons exist, if not create them (auto-save for new persons)
            let vendedorId = vendedor?.id;
            if (!vendedorId && vendedor?.identificacion) {
                // Auto-create vendedor if missing ID
                try {
                    // Start with search to be safe
                    const searchV = await debidaDiligenciaService.buscarPorIdentificacion(vendedor.identificacion);
                    if (searchV.encontrado && searchV.persona) {
                        vendedorId = searchV.persona.id;
                    } else {
                        // Create new
                        const newVendedor = await debidaDiligenciaService.crear({
                            ...vendedor,
                            tipoPersona: vendedor.tipoPersona || 'NATURAL', // Ensure type
                            identificacion: vendedor.identificacion
                        } as any);
                        vendedorId = newVendedor.id;
                        onPersonUpdate?.('vendedor', newVendedor);
                    }
                } catch (e) {
                    console.error('Error auto-saving vendedor:', e);
                    setErrorMessage('Error al guardar datos del vendedor. Verifique la información.');
                    setIsVerifying(false);
                    return;
                }
            }

            let compradorId = comprador?.id;
            if (!compradorId && comprador?.identificacion) {
                // Auto-create comprador if missing ID
                try {
                    const searchC = await debidaDiligenciaService.buscarPorIdentificacion(comprador.identificacion);
                    if (searchC.encontrado && searchC.persona) {
                        compradorId = searchC.persona.id;
                    } else {
                        const newComprador = await debidaDiligenciaService.crear({
                            ...comprador,
                            tipoPersona: comprador.tipoPersona || 'NATURAL',
                            identificacion: comprador.identificacion
                        } as any);
                        compradorId = newComprador.id;
                        onPersonUpdate?.('comprador', newComprador);
                    }
                } catch (e) {
                    console.error('Error auto-saving comprador:', e);
                    setErrorMessage('Error al guardar datos del comprador. Verifique la información.');
                    setIsVerifying(false);
                    return;
                }
            }

            if (!vendedorId || !compradorId) {
                throw new Error('Faltan datos requeridos del vendedor o comprador.');
            }

            // Proceed with verification...
            const response = await listasRestrictivasService.verificar(vendedorId!, compradorId!);

            // Combine results
            const combinedResults: ListasRestrictivasResult[] = ['UAFE', 'OFAC', 'ONU'].map((listaName) => {
                const vRes = response.vendedor?.resultados?.find(r => r.lista === listaName);
                const cRes = response.comprador?.resultados?.find(r => r.lista === listaName);

                let estado: ListasRestrictivasResult['estado'] = 'limpio';
                let mensaje = '';

                if (vRes?.estado === 'coincidencia') {
                    estado = 'coincidencia';
                    mensaje += `Vendedor: ${vRes.mensaje || 'Coincidencia'}. `;
                }
                if (cRes?.estado === 'coincidencia') {
                    estado = 'coincidencia';
                    mensaje += `Comprador: ${cRes.mensaje || 'Coincidencia'}. `;
                }

                return {
                    lista: listaName as any,
                    estado: estado,
                    mensaje: mensaje.trim() || undefined
                };
            });

            setResults(combinedResults);

            // Check if clean
            const isClean = combinedResults.every((r) => r.estado === 'limpio');
            if (isClean) {
                onVerified?.(combinedResults);
            }

        } catch (error: any) {
            console.error('Error verifying lists:', error);
            setErrorMessage(error.message || 'Error al verificar listas restrictivas. Intente nuevamente.');
            setResults(results.map(r => ({ ...r, estado: 'pendiente', mensaje: 'Error de conexión' })));
        } finally {
            setIsVerifying(false);
        }
    };

    const getStatusIcon = (estado: ListasRestrictivasResult['estado']) => {
        switch (estado) {
            case 'verificando': return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
            case 'limpio': return <Check className="w-5 h-5 text-green-500" />;
            case 'coincidencia': return <X className="w-5 h-5 text-red-500" />;
            default: return <Shield className="w-5 h-5 text-gray-300" />;
        }
    };

    const getStatusText = (estado: ListasRestrictivasResult['estado'], mensaje?: string) => {
        switch (estado) {
            case 'verificando': return 'Verificando...';
            case 'limpio': return 'Sin coincidencias';
            case 'coincidencia': return mensaje || 'Coincidencia detectada';
            default: return 'Pendiente';
        }
    };

    const getStatusColor = (estado: ListasRestrictivasResult['estado']) => {
        switch (estado) {
            case 'verificando': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'limpio': return 'bg-green-50 text-green-700 border-green-100';
            case 'coincidencia': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const isButtonDisabled = isVerifying || !vendedor?.identificacion || !comprador?.identificacion;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Verificación de Listas Restrictivas
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Se realizará una consulta automática a las bases de datos de control nacionales e
                        internacionales para ambos intervinientes.
                    </p>
                </div>
            </div>

            <button
                onClick={handleVerify}
                disabled={isButtonDisabled}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isVerifying ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verificando...
                    </>
                ) : (
                    <>
                        <Shield className="w-5 h-5 mr-2" />
                        Verificar contra UAFE, OFAC, ONU
                    </>
                )}
            </button>

            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                {results.map((result) => (
                    <div
                        key={result.lista}
                        className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(result.estado)}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{result.lista}</span>
                            {getStatusIcon(result.estado)}
                        </div>
                        <p className="text-sm text-gray-600">{getStatusText(result.estado, result.mensaje)}</p>
                    </div>
                ))}
            </div>

            {results.every((r) => r.estado === 'limpio') && results.some((r) => r.estado !== 'pendiente') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-green-900">Verificación Completada</h4>
                            <p className="text-sm text-green-700 mt-1">
                                No se encontraron coincidencias en ninguna lista restrictiva.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {results.some((r) => r.estado === 'coincidencia') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <X className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-red-900">⚠️ Coincidencia Detectada</h4>
                            <p className="text-sm text-red-700 mt-1">
                                Se encontraron coincidencias en una o más listas restrictivas. Esta operación requiere
                                revisión especial.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
