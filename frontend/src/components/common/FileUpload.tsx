import React, { useState, useRef } from 'react';
import { documentoService } from '../../services/documento.service';
import type { TipoDocumento } from '../../types';

interface FileUploadProps {
    operacionId: string;
    onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ operacionId, onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [tipo, setTipo] = useState<TipoDocumento>('OTRO');
    const [descripcion, setDescripcion] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            await documentoService.upload(file, operacionId, tipo, descripcion);
            setFile(null);
            setDescripcion('');
            setTipo('OTRO');
            if (fileInputRef.current) fileInputRef.current.value = '';
            onUploadSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Error al subir el archivo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Adjuntar Documento</h3>

            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${file ? 'border-indigo-500' : 'border-gray-300 hover:border-indigo-400'
                    }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.xml"
                />

                {file ? (
                    <div className="text-indigo-600 font-medium">
                        <p>{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <div className="text-gray-500">
                        <p className="mb-2">Arrastra un archivo aquí o haz clic para seleccionar</p>
                        <p className="text-xs">PDF, Imágenes, XML (Máx 10MB)</p>
                    </div>
                )}
            </div>

            {file && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value as TipoDocumento)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="CEDULA">Cédula</option>
                            <option value="RUC">Ruc</option>
                            <option value="PASAPORTE">Pasaporte</option>
                            <option value="NOMBRAMIENTO">Nombramiento</option>
                            <option value="ESTATUTOS">Estatutos</option>
                            <option value="FORMULARIO_KYC">Formulario KYC</option>
                            <option value="COMPROBANTE_INGRESOS">Comprobante Ingresos</option>
                            <option value="DECLARACION_ORIGEN_FONDOS">Origen de Fondos</option>
                            <option value="EVIDENCIA_ALERTA">Evidencia Alerta</option>
                            <option value="REPORTE_ROS">Reporte ROS</option>
                            <option value="OTRO">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                        <input
                            type="text"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Ej: Copia certificada..."
                        />
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 text-red-600 text-sm bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!file || uploading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                >
                    {uploading ? 'Subiendo...' : 'Subir Documento'}
                </button>
            </div>
        </div>
    );
};

export default FileUpload;
