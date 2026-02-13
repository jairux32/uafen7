import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, User, ShoppingCart, AlertTriangle, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { documentoService } from '../../services/documento.service';
import FileUpload from '../../components/common/FileUpload';
import type { Operacion, Documento } from '../../types';
import toast from 'react-hot-toast';

export default function OperacionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [operacion, setOperacion] = useState<Operacion | null>(null);
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (id) {
            loadOperacion(id);
            loadDocumentos(id);
        }
    }, [id]);

    const loadOperacion = async (operacionId: string) => {
        try {
            const data = await operationsService.getOperacion(operacionId);
            setOperacion(data);
        } catch (error) {
            console.error('Error loading operacion:', error);
            toast.error('Error al cargar la operación');
        } finally {
            setLoading(false);
        }
    };

    const loadDocumentos = async (operacionId: string) => {
        try {
            const docs = await documentoService.getByOperacion(operacionId);
            setDocumentos(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    };

    const handleDownloadPdf = async () => {
        if (!id) return;
        try {
            setDownloading(true);
            const blob = await operationsService.getOperacionPdf(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `operacion-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Reporte descargado correctamente');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Error al descargar el reporte');
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadKyc = async () => {
        if (!id) return;
        try {
            setDownloading(true);
            const blob = await operationsService.getOperacionKycPdf(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `KYC-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Formulario KYC descargado correctamente');
        } catch (error) {
            console.error('Error downloading KYC PDF:', error);
            toast.error('Error al descargar el formulario KYC');
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadDocument = async (doc: Documento) => {
        try {
            await documentoService.downloadBlob(doc.id, doc.nombre);
        } catch (error) {
            console.error('Error downloading document:', error);
            toast.error('Error al descargar documento');
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        if (!confirm('¿Estás seguro de eliminar este documento?')) return;
        try {
            await documentoService.delete(docId);
            toast.success('Documento eliminado');
            if (id) loadDocumentos(id); // Reload list
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Error al eliminar documento');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Cargando...</div>;
    }

    if (!operacion) {
        return <div className="text-center py-10">Operación no encontrada</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/operaciones')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Detalle de Operación</h1>
                        <p className="text-sm text-gray-500">ID: {operacion.id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={downloading}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        {downloading ? 'Generando...' : 'Descargar Reporte'}
                    </button>
                    <button
                        onClick={handleDownloadKyc}
                        disabled={downloading}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        {downloading ? 'Generando...' : 'Formulario KYC'}
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* General Info */}
                <div className="card col-span-1 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Información General</h3>
                    </div>
                    <div className="space-y-3">
                        <InfoRow label="Tipo de Acto" value={operacion.tipoActo} />
                        <InfoRow label="Fecha Escritura" value={new Date(operacion.fechaEscritura).toLocaleDateString()} icon={<Calendar className="w-4 h-4" />} />
                        <InfoRow label="Valor Declarado" value={`$${operacion.valorDeclarado}`} icon={<DollarSign className="w-4 h-4" />} />
                        <InfoRow label="Forma de Pago" value={operacion.formaPago} />
                        <InfoRow label="Número Escritura" value={operacion.numeroEscritura} />
                        <InfoRow label="Descripción" value={operacion.descripcionBien} className="col-span-2" />
                    </div>
                </div>

                {/* Risk Info */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Evaluación de Riesgo</h3>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-2 ${operacion.nivelRiesgo === 'BAJO' ? 'bg-green-100 text-green-700' :
                            operacion.nivelRiesgo === 'MEDIO' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {operacion.scoreRiesgo ?? '0'}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${operacion.nivelRiesgo === 'BAJO' ? 'bg-green-100 text-green-700' :
                            operacion.nivelRiesgo === 'MEDIO' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {operacion.nivelRiesgo} {operacion.tipoDD ? `(DD ${operacion.tipoDD})` : ''}
                        </span>
                    </div>
                </div>

                {/* Seller */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Vendedor</h3>
                    </div>
                    <div className="space-y-3">
                        <InfoRow label="Nombre" value={operacion.vendedor.nombres ? `${operacion.vendedor.nombres} ${operacion.vendedor.apellidos}` : operacion.vendedor.razonSocial} />
                        <InfoRow label="Identificación" value={operacion.vendedor.identificacion} />
                        <InfoRow label="Nacionalidad" value={operacion.vendedor.nacionalidad} />
                        <InfoRow label="PEP" value={operacion.vendedor.esPEP ? 'SÍ' : 'NO'} />
                    </div>
                </div>

                {/* Buyer */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Comprador</h3>
                    </div>
                    <div className="space-y-3">
                        <InfoRow label="Nombre" value={operacion.comprador.nombres ? `${operacion.comprador.nombres} ${operacion.comprador.apellidos}` : operacion.comprador.razonSocial} />
                        <InfoRow label="Identificación" value={operacion.comprador.identificacion} />
                        <InfoRow label="Nacionalidad" value={operacion.comprador.nacionalidad} />
                        <InfoRow label="PEP" value={operacion.comprador.esPEP ? 'SÍ' : 'NO'} />
                    </div>
                </div>
            </div>

            {/* Documentos - Nueva Sección */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-900">Expediente Digital</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lista de Documentos */}
                    <div className="lg:col-span-2 space-y-4">
                        {documentos.length === 0 ? (
                            <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500 border border-dashed border-gray-300">
                                No hay documentos adjuntos a esta operación.
                            </div>
                        ) : (
                            documentos.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-50 p-3 rounded-lg">
                                            <FileText className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{doc.nombre}</h4>
                                            <div className="flex gap-2 text-xs text-gray-500">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded">{doc.tipo}</span>
                                                <span>{(doc.tamano / 1024 / 1024).toFixed(2)} MB</span>
                                                <span>• {new Date(doc.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {doc.descripcion && (
                                                <p className="text-xs text-gray-400 mt-1">{doc.descripcion}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDownloadDocument(doc)}
                                            className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-indigo-600"
                                            title="Descargar"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            className="p-2 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Subida de Archivos */}
                    <div className="lg:col-span-1">
                        <FileUpload
                            operacionId={id!}
                            onUploadSuccess={() => loadDocumentos(id!)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value, icon, className = '' }: { label: string, value: any, icon?: React.ReactNode, className?: string }) {
    if (!value) return null;
    return (
        <div className={`flex flex-col ${className}`}>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
            <div className="flex items-center gap-2 text-gray-900 font-medium">
                {icon}
                <span>{value}</span>
            </div>
        </div>
    );
}
