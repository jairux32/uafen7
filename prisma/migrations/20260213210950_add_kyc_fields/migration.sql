-- AlterTable
ALTER TABLE "DebiDaDiligencia" ADD COLUMN     "canton" TEXT,
ADD COLUMN     "parroquia" TEXT,
ADD COLUMN     "provincia" TEXT;

-- AlterTable
ALTER TABLE "Operacion" ADD COLUMN     "avaluoMunicipal" DECIMAL(65,30);
