-- CreateEnum
CREATE TYPE "TamanoNotaria" AS ENUM ('PEQUENA', 'MEDIANA', 'GRANDE');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('MATRIZADOR', 'OFICIAL_CUMPLIMIENTO', 'NOTARIO', 'ADMIN_SISTEMA');

-- CreateEnum
CREATE TYPE "TipoDD" AS ENUM ('SIMPLIFICADA', 'ESTANDAR', 'REFORZADA', 'INTENSIFICADA');

-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('NATURAL', 'JURIDICA');

-- CreateEnum
CREATE TYPE "NivelRiesgo" AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'MUY_ALTO');

-- CreateEnum
CREATE TYPE "TipoPEP" AS ENUM ('NACIONAL', 'EXTRANJERO', 'ORGANIZACION_INTERNACIONAL', 'FAMILIAR', 'COLABORADOR_CERCANO');

-- CreateEnum
CREATE TYPE "TipoActo" AS ENUM ('COMPRAVENTA', 'HIPOTECA', 'DONACION', 'CONSTITUCION_SOCIEDAD', 'LIQUIDACION_SOCIEDAD_CONYUGAL', 'PODER', 'TESTAMENTO', 'CANCELACION_HIPOTECA', 'OTRO');

-- CreateEnum
CREATE TYPE "FormaPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'MIXTO');

-- CreateEnum
CREATE TYPE "EstadoOperacion" AS ENUM ('BORRADOR', 'EN_REVISION', 'APROBADA', 'REPORTADA', 'ARCHIVADA');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('EFECTIVO_EXCEDE_LIMITE', 'SUBVALORACION_BIEN', 'PERFIL_INCOMPATIBLE', 'PREMURA_EXCESIVA', 'PEP_DETECTADO', 'PAIS_ALTO_RIESGO', 'LISTA_RESTRICTIVA', 'OPERACION_INUSUAL', 'BENEFICIARIO_FINAL_OCULTO', 'FRACCIONAMIENTO');

-- CreateEnum
CREATE TYPE "SeveridadAlerta" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "EstadoAlerta" AS ENUM ('PENDIENTE', 'EN_ANALISIS', 'FALSO_POSITIVO', 'CONFIRMADA', 'REPORTADA');

-- CreateEnum
CREATE TYPE "TipoReporte" AS ENUM ('RESU', 'ROS', 'RIA');

-- CreateEnum
CREATE TYPE "EstadoReporte" AS ENUM ('BORRADOR', 'GENERADO', 'ENVIADO', 'CONFIRMADO', 'ERROR');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CEDULA', 'RUC', 'PASAPORTE', 'NOMBRAMIENTO', 'ESTATUTOS', 'FORMULARIO_KYC', 'COMPROBANTE_INGRESOS', 'DECLARACION_ORIGEN_FONDOS', 'REPORTE_ROS', 'EVIDENCIA_ALERTA', 'OTRO');

-- CreateEnum
CREATE TYPE "NivelAcceso" AS ENUM ('PUBLICO', 'RESTRINGIDO', 'CONFIDENCIAL');

-- CreateEnum
CREATE TYPE "FuenteLista" AS ENUM ('UAFE', 'OFAC', 'ONU', 'PRIVADOS_LIBERTAD', 'INTERPOL');

-- CreateTable
CREATE TABLE "Notaria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tamano" "TamanoNotaria" NOT NULL,
    "numeroNotaria" TEXT NOT NULL,
    "canton" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "notariaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebiDaDiligencia" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDD" NOT NULL,
    "tipoPersona" "TipoPersona" NOT NULL,
    "nombres" TEXT,
    "apellidos" TEXT,
    "cedula" TEXT,
    "ruc" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "nacionalidad" TEXT,
    "razonSocial" TEXT,
    "rucEmpresa" TEXT,
    "paisConstitucion" TEXT,
    "actividadEconomica" TEXT,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "ingresosMensuales" DECIMAL(65,30),
    "origenFondos" TEXT,
    "profesion" TEXT,
    "esPEP" BOOLEAN NOT NULL DEFAULT false,
    "nivelRiesgo" "NivelRiesgo",
    "scoreRiesgo" INTEGER,
    "fechaVerificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebiDaDiligencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiarioFinal" (
    "id" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "porcentajeCapital" DECIMAL(65,30) NOT NULL,
    "tipoParticipacion" TEXT NOT NULL,
    "esPEP" BOOLEAN NOT NULL DEFAULT false,
    "ddId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeneficiarioFinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PEP" (
    "id" TEXT NOT NULL,
    "tipoPEP" "TipoPEP" NOT NULL,
    "cargoActual" TEXT,
    "cargoAnterior" TEXT,
    "institucion" TEXT NOT NULL,
    "fechaInicioCargo" TIMESTAMP(3),
    "fechaFinCargo" TIMESTAMP(3),
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "relacionConPEP" TEXT,
    "ddId" TEXT,
    "beneficiarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PEP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operacion" (
    "id" TEXT NOT NULL,
    "tipoActo" "TipoActo" NOT NULL,
    "numeroEscritura" TEXT NOT NULL,
    "fechaEscritura" TIMESTAMP(3) NOT NULL,
    "descripcionBien" TEXT NOT NULL,
    "valorDeclarado" DECIMAL(65,30) NOT NULL,
    "formaPago" "FormaPago" NOT NULL,
    "montoEfectivo" DECIMAL(65,30),
    "nivelRiesgo" "NivelRiesgo" NOT NULL,
    "factoresRiesgo" JSONB NOT NULL,
    "estado" "EstadoOperacion" NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "compradorId" TEXT NOT NULL,
    "notariaId" TEXT NOT NULL,
    "creadorId" TEXT NOT NULL,
    "revisorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAlerta" NOT NULL,
    "severidad" "SeveridadAlerta" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "detalles" JSONB NOT NULL,
    "estado" "EstadoAlerta" NOT NULL,
    "fechaGestion" TIMESTAMP(3),
    "comentarioGestion" TEXT,
    "operacionId" TEXT NOT NULL,
    "gestionadaPorId" TEXT,
    "reporteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL,
    "tipo" "TipoReporte" NOT NULL,
    "mes" INTEGER,
    "anio" INTEGER,
    "datosReporte" JSONB NOT NULL,
    "archivoPath" TEXT,
    "archivoHash" TEXT,
    "estado" "EstadoReporte" NOT NULL,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEnvio" TIMESTAMP(3),
    "numeroConfirmacion" TEXT,
    "fechaConfirmacion" TIMESTAMP(3),
    "notariaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "path" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "cifrado" BOOLEAN NOT NULL DEFAULT true,
    "nivelAcceso" "NivelAcceso" NOT NULL,
    "ddId" TEXT,
    "operacionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListaRestrictiva" (
    "id" TEXT NOT NULL,
    "fuente" "FuenteLista" NOT NULL,
    "nombre" TEXT NOT NULL,
    "alias" TEXT[],
    "tipoDocumento" TEXT,
    "numeroDocumento" TEXT,
    "nacionalidad" TEXT,
    "categoria" TEXT NOT NULL,
    "fechaIncorporacion" TIMESTAMP(3) NOT NULL,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "ultimaSincronizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListaRestrictiva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notaria_ruc_key" ON "Notaria"("ruc");

-- CreateIndex
CREATE INDEX "Notaria_ruc_idx" ON "Notaria"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cedula_key" ON "Usuario"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_cedula_idx" ON "Usuario"("cedula");

-- CreateIndex
CREATE INDEX "Usuario_notariaId_idx" ON "Usuario"("notariaId");

-- CreateIndex
CREATE INDEX "DebiDaDiligencia_cedula_idx" ON "DebiDaDiligencia"("cedula");

-- CreateIndex
CREATE INDEX "DebiDaDiligencia_rucEmpresa_idx" ON "DebiDaDiligencia"("rucEmpresa");

-- CreateIndex
CREATE INDEX "DebiDaDiligencia_vigente_idx" ON "DebiDaDiligencia"("vigente");

-- CreateIndex
CREATE INDEX "BeneficiarioFinal_cedula_idx" ON "BeneficiarioFinal"("cedula");

-- CreateIndex
CREATE INDEX "BeneficiarioFinal_ddId_idx" ON "BeneficiarioFinal"("ddId");

-- CreateIndex
CREATE UNIQUE INDEX "PEP_ddId_key" ON "PEP"("ddId");

-- CreateIndex
CREATE UNIQUE INDEX "PEP_beneficiarioId_key" ON "PEP"("beneficiarioId");

-- CreateIndex
CREATE INDEX "PEP_vigente_idx" ON "PEP"("vigente");

-- CreateIndex
CREATE INDEX "Operacion_notariaId_idx" ON "Operacion"("notariaId");

-- CreateIndex
CREATE INDEX "Operacion_estado_idx" ON "Operacion"("estado");

-- CreateIndex
CREATE INDEX "Operacion_fechaEscritura_idx" ON "Operacion"("fechaEscritura");

-- CreateIndex
CREATE INDEX "Operacion_nivelRiesgo_idx" ON "Operacion"("nivelRiesgo");

-- CreateIndex
CREATE INDEX "Alerta_operacionId_idx" ON "Alerta"("operacionId");

-- CreateIndex
CREATE INDEX "Alerta_estado_idx" ON "Alerta"("estado");

-- CreateIndex
CREATE INDEX "Alerta_severidad_idx" ON "Alerta"("severidad");

-- CreateIndex
CREATE INDEX "Alerta_tipo_idx" ON "Alerta"("tipo");

-- CreateIndex
CREATE INDEX "Reporte_notariaId_idx" ON "Reporte"("notariaId");

-- CreateIndex
CREATE INDEX "Reporte_tipo_idx" ON "Reporte"("tipo");

-- CreateIndex
CREATE INDEX "Reporte_estado_idx" ON "Reporte"("estado");

-- CreateIndex
CREATE INDEX "Reporte_mes_anio_idx" ON "Reporte"("mes", "anio");

-- CreateIndex
CREATE INDEX "Documento_ddId_idx" ON "Documento"("ddId");

-- CreateIndex
CREATE INDEX "Documento_operacionId_idx" ON "Documento"("operacionId");

-- CreateIndex
CREATE INDEX "Documento_tipo_idx" ON "Documento"("tipo");

-- CreateIndex
CREATE INDEX "ListaRestrictiva_nombre_idx" ON "ListaRestrictiva"("nombre");

-- CreateIndex
CREATE INDEX "ListaRestrictiva_numeroDocumento_idx" ON "ListaRestrictiva"("numeroDocumento");

-- CreateIndex
CREATE INDEX "ListaRestrictiva_fuente_idx" ON "ListaRestrictiva"("fuente");

-- CreateIndex
CREATE INDEX "ListaRestrictiva_vigente_idx" ON "ListaRestrictiva"("vigente");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_notariaId_fkey" FOREIGN KEY ("notariaId") REFERENCES "Notaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiarioFinal" ADD CONSTRAINT "BeneficiarioFinal_ddId_fkey" FOREIGN KEY ("ddId") REFERENCES "DebiDaDiligencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PEP" ADD CONSTRAINT "PEP_ddId_fkey" FOREIGN KEY ("ddId") REFERENCES "DebiDaDiligencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PEP" ADD CONSTRAINT "PEP_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "BeneficiarioFinal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operacion" ADD CONSTRAINT "Operacion_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "DebiDaDiligencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operacion" ADD CONSTRAINT "Operacion_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "DebiDaDiligencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operacion" ADD CONSTRAINT "Operacion_notariaId_fkey" FOREIGN KEY ("notariaId") REFERENCES "Notaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operacion" ADD CONSTRAINT "Operacion_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operacion" ADD CONSTRAINT "Operacion_revisorId_fkey" FOREIGN KEY ("revisorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "Operacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_gestionadaPorId_fkey" FOREIGN KEY ("gestionadaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_reporteId_fkey" FOREIGN KEY ("reporteId") REFERENCES "Reporte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_notariaId_fkey" FOREIGN KEY ("notariaId") REFERENCES "Notaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_ddId_fkey" FOREIGN KEY ("ddId") REFERENCES "DebiDaDiligencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "Operacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
