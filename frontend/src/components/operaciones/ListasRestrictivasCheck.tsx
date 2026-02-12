import { useState } from 'react';
import { Check, X, Loader2, Shield } from 'lucide-react';
import { listasRestrictivasService } from '../../services/listasRestrictivas.service';

interface ListResult {
    lista: 'UAFE' | 'OFAC' | 'ONU';
    estado: 'pendiente' | 'verificando' | 'limpio' | 'coincidencia';
    mensaje?: string;
}

interface ListasRestrictivasCheckProps {
    vendedorId?: string;
    compradorId?: string;
    onVerified?: (results: any) => void;
}

export default function ListasRestrictivasCheck({
    vendedorId,
    compradorId,
    onVerified,
}: ListasRestrictivasCheckProps) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [results, setResults] = useState<ListResult[]>([
        { lista: 'UAFE', estado: 'pendiente' },
        { lista: 'OFAC', estado: 'pendiente' },
        { lista: 'ONU', estado: 'pendiente' },
    ]);
    const [errorMessage, setErrorMessage] = useState('');

    const handleVerify = async () => {
        if (!vendedorId || !compradorId) {
            setErrorMessage('Debe completar los datos del vendedor y comprador primero');
            return;
        }

        setIsVerifying(true);
        setErrorMessage('');

        // Set all to verifying state
        setResults([
            { lista: 'UAFE', estado: 'verificando' },
            { lista: 'OFAC', estado: 'verificando' },
            { lista: 'ONU', estado: 'verificando' },
        ]);

        try {
            const response = await listasRestrictivasService.verificar(vendedorId, compradorId);

            // Update results based on API response
            const vendedorResults = response.vendedor.resultados;
            const compradorResults = response.comprador.resultados;

            // Combine results (if either vendedor or comprador has coincidencia, show it)
            const combinedResults: ListResult[] = ['UAFE', 'OFAC', 'ONU'].map((lista) => {
                const vendedorResult = vendedorResults.find((r) => r.lista === lista);
                const compradorResult = compradorResults.find((r) => r.lista === lista);

                // If either has coincidencia, show coincidencia
                if (vendedorResult?.estado === 'coincidencia' || compradorResult?.estado === 'coincidencia') {
                    return {
                        lista: lista as 'UAFE' | 'OFAC' | 'ONU',
                        estado: 'coincidencia' as const,
                        mensaje: vendedorResult?.estado === 'coincidencia'
                            ? `Vendedor: ${vendedorResult.mensaje}`
                            : `Comprador: ${compradorResult?.mensaje}`,
                    };
                }

                return {
                    lista: lista as 'UAFE' | 'OFAC' | 'ONU',
                    estado: 'limpio' as const,
                    mensaje: 'Sin coincidencias',
                };
            });

            setResults(combinedResults);

            if (onVerified) {
                onVerified(response);
            }
        } catch (error) {
            console.error('Error verifying listas:', error);
            setErrorMessage('Error al verificar listas restrictivas. Intente nuevamente.');
            setResults([
                { lista: 'UAFE', estado: 'pendiente' },
                { lista: 'OFAC', estado: 'pendiente' },
                { lista: 'ONU', estado: 'pendiente' },
            ]);
        } finally {
            setIsVerifying(false);
        }
    };

    const getStatusIcon = (estado: ListResult['estado']) => {
        switch (estado) {
            case 'pendiente':
                return <Shield className="w-5 h-5 text-gray-400" />;
            case 'verificando':
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'limpio':
                return <Check className="w-5 h-5 text-green-500" />;
            case 'coincidencia':
                return <X className="w-5 h-5 text-red-500" />;
        }
    };

    const getStatusColor = (estado: ListResult['estado']) => {
        switch (estado) {
            case 'pendiente':
                return 'bg-gray-50 border-gray-200';
            case 'verificando':
                return 'bg-blue-50 border-blue-200';
            case 'limpio':
                return 'bg-green-50 border-green-200';
            case 'coincidencia':
                return 'bg-red-50 border-red-200';
        }
    };

    const getStatusText = (estado: ListResult['estado'], mensaje?: string) => {
        switch (estado) {
            case 'pendiente':
                return 'Pendiente';
            case 'verificando':
                return 'Verificando...';
            case 'limpio':
                return mensaje || 'Sin coincidencias';
            case 'coincidencia':
                return mensaje || 'Coincidencia encontrada';
        }
    };

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
                disabled={isVerifying || !vendedorId || !compradorId}
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
