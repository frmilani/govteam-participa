/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,cpf]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ModoAcesso" AS ENUM ('RESTRITO_HASH', 'PUBLICO', 'HIBRIDO');

-- CreateEnum
CREATE TYPE "SecurityLevel" AS ENUM ('NONE', 'HIGH');

-- AlterTable
ALTER TABLE "Enquete" ADD COLUMN     "dataFim" TIMESTAMP(3),
ADD COLUMN     "dataInicio" TIMESTAMP(3),
ADD COLUMN     "exigirIdentificacao" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minCompleteness" INTEGER NOT NULL DEFAULT 70,
ADD COLUMN     "modoAcesso" "ModoAcesso" NOT NULL DEFAULT 'HIBRIDO',
ADD COLUMN     "securityLevel" "SecurityLevel" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Estabelecimento" ADD COLUMN     "alias" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "cupons" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Resposta" ADD COLUMN     "otpVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "percentualConclusao" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "votoValido" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "trackingLinkId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_EnqueteToSegmento" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EnqueteToEstabelecimento" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EnqueteToSegmento_AB_unique" ON "_EnqueteToSegmento"("A", "B");

-- CreateIndex
CREATE INDEX "_EnqueteToSegmento_B_index" ON "_EnqueteToSegmento"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EnqueteToEstabelecimento_AB_unique" ON "_EnqueteToEstabelecimento"("A", "B");

-- CreateIndex
CREATE INDEX "_EnqueteToEstabelecimento_B_index" ON "_EnqueteToEstabelecimento"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_organizationId_cpf_key" ON "Lead"("organizationId", "cpf");

-- AddForeignKey
ALTER TABLE "_EnqueteToSegmento" ADD CONSTRAINT "_EnqueteToSegmento_A_fkey" FOREIGN KEY ("A") REFERENCES "Enquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EnqueteToSegmento" ADD CONSTRAINT "_EnqueteToSegmento_B_fkey" FOREIGN KEY ("B") REFERENCES "Segmento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EnqueteToEstabelecimento" ADD CONSTRAINT "_EnqueteToEstabelecimento_A_fkey" FOREIGN KEY ("A") REFERENCES "Enquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EnqueteToEstabelecimento" ADD CONSTRAINT "_EnqueteToEstabelecimento_B_fkey" FOREIGN KEY ("B") REFERENCES "Estabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
