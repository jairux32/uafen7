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
export type EstadoOperacion = 'BORRADOR' | 'EN_REVISION' | 'APROBADA' | 'REPORTADA' | 'ARCHIVADA';
export type TipoActo = 'COMPRAVENTA' | 'HIPOTECA' | 'DONACION' | 'PODER' | 'TESTAMENTO' | 'OTRO';
export type TipoDocumento = 'CEDULA' | 'RUC' | 'PASAPORTE' | 'NOMBRAMIENTO' | 'ESTATUTOS' | 'FORMULARIO_KYC' | 'COMPROBANTE_INGRESOS' | 'DECLARACION_ORIGEN_FONDOS' | 'REPORTE_ROS' | 'EVIDENCIA_ALERTA' | 'OTRO';

export interface Documento {
    id: string;
    nombre: string;
    tipo: TipoDocumento;
    descripcion?: string;
    mimeType: string;
    tamano: number;
    operacionId: string;
    subidoPor?: {
        nombres: string; // Updated to match backend select
        apellidos: string;
        email: string;
    };
    createdAt: string;
}

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
    scoreRiesgo: number | null;
    tipoDD: TipoDD | null;
    estado: EstadoOperacion;
    vendedor: DebiDaDiligencia;
    comprador: DebiDaDiligencia;
    alertas?: Alerta[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOperacionRequest {
    numeroEscritura: string;
    fechaEscritura: string;
    tipoActo: string;
    descripcionBien: string;
    valorDeclarado: number;
    formaPago: string;
    montoEfectivo?: number;
    vendedorId: string;
    compradorId: string;
}

export interface DebiDaDiligencia {
    id: string;
    tipoPersona: 'NATURAL' | 'JURIDICA';
    identificacion: string;
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    cedula?: string;
    ruc?: string;
    nacionalidad?: string;
    paisConstitucion?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    ingresosMensuales?: number;
    origenFondos?: string;
    actividadEconomica?: string;
    esPEP: boolean;
    estadoCivil?: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'UNION_LIBRE';
    nombreConyuge?: string;
    identificacionConyuge?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface RiskCalculationInput {
    tipoActo: string;
    valorDeclarado: number;
    montoEfectivo?: number;
    vendedor?: Partial<DebiDaDiligencia>;
    comprador?: Partial<DebiDaDiligencia>;
}

export interface RiskFactor {
    nombre: string;
    puntos: number;
}

export interface RiskCalculationResponse {
    score: number;
    nivel: NivelRiesgo;
    factores: RiskFactor[];
    tipoDD: TipoDD;
}

export interface ListasRestrictivasResult {
    lista: 'UAFE' | 'OFAC' | 'ONU';
    estado: 'pendiente' | 'verificando' | 'limpio' | 'coincidencia';
    mensaje?: string;
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

export interface DashboardStats {
    total: number;
    porEstado: {
        borradores: number;
        revision: number;
        aprobadas: number;
        archivadas: number;
    };
    riesgoDistribucion: {
        nivel: NivelRiesgo;
        cantidad: number;
    }[];
    operacionesPorMes: {
        mes: string;
        operaciones: number;
    }[];
    alertasPendientes: number;
}
