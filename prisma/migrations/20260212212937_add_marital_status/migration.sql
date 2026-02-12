-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_LIBRE');

-- AlterTable
ALTER TABLE "DebiDaDiligencia" ADD COLUMN     "estadoCivil" "EstadoCivil" NOT NULL DEFAULT 'SOLTERO',
ADD COLUMN     "identificacionConyuge" TEXT,
ADD COLUMN     "nombreConyuge" TEXT;
