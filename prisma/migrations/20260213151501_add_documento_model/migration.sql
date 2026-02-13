-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "usuarioId" TEXT,
ALTER COLUMN "hash" DROP NOT NULL,
ALTER COLUMN "cifrado" SET DEFAULT false,
ALTER COLUMN "nivelAcceso" SET DEFAULT 'RESTRINGIDO';

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
