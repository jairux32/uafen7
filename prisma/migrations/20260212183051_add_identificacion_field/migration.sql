/*
  Warnings:

  - A unique constraint covering the columns `[identificacion]` on the table `DebiDaDiligencia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identificacion` to the `DebiDaDiligencia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DebiDaDiligencia" ADD COLUMN     "identificacion" TEXT NOT NULL,
ALTER COLUMN "direccion" DROP NOT NULL,
ALTER COLUMN "telefono" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DebiDaDiligencia_identificacion_key" ON "DebiDaDiligencia"("identificacion");
