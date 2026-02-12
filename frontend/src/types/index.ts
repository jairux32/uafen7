// API Types
export interface User {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: RolUsuario;
    notariaId: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

export type RolUsuario = 'MATRIZADOR' | 'OFICIAL_CUMPLIMIENTO' | 'NOTARIO' | 'ADMIN_SISTEMA';

export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'MUY_ALTO';
export type TipoDD = 'SIMPLIFICADA' | 'ESTANDAR' | 'REFORZADA' | 'INTENSIFICADA';
export type EstadoOperacion = 'BORRADOR' | 'EN_REVISION' | 'APROBADA' | 'RECHAZADA';
export type TipoActo = 'COMPRAVENTA' | 'HIPOTECA' | 'DONACION' | 'PODER' | 'TESTAMENTO' | 'OTRO';

export interface Operacion {
    id: string;
    numeroEscritura: string;
    fechaEscritura: Date;
    tipoActo: TipoActo;
    descripcionBien: string;
    valorDeclarado: number;
    formaPago: string;
    montoEfectivo?: number;
    nivelRiesgo: NivelRiesgo;
    scoreRiesgo: number;
    tipoDD: TipoDD;
    estado: EstadoOperacion;
    vendedor: DebiDaDiligencia;
    comprador: DebiDaDiligencia;
    alertas?: Alerta[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DebiDaDiligencia {
    id: string;
    tipoPersona: 'NATURAL' | 'JURIDICA';
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    cedula?: string;
    ruc?: string;
    nacionalidad: string;
    direccion: string;
    telefono: string;
    email?: string;
    esPEP: boolean;
    estadoCivil?: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'UNION_LIBRE';
    nombreConyuge?: string;
    identificacionConyuge?: string;
}

export type SeveridadAlerta = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
export type EstadoAlerta = 'PENDIENTE' | 'EN_ANALISIS' | 'CONFIRMADA' | 'FALSO_POSITIVO';

export interface Alerta {
    id: string;
    tipo: string;
    severidad: SeveridadAlerta;
    titulo: string;
    descripcion: string;
    estado: EstadoAlerta;
    operacionId: string;
    operacion?: Operacion;
    createdAt: Date;
}

export type TipoReporte = 'RESU' | 'ROS' | 'RIA';
export type EstadoReporte = 'GENERADO' | 'ENVIADO' | 'CONFIRMADO' | 'ERROR';

export interface Reporte {
    id: string;
    tipo: TipoReporte;
    mes?: number;
    anio?: number;
    estado: EstadoReporte;
    archivoPath: string | null;
    confirmacionUAFE?: string;
    datosReporte: any;
    createdAt: Date;
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: RolUsuario;
    notariaId: string;
}

// API Response Types
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: any;
}
