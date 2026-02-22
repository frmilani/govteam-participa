/*
  Warnings:

  - You are about to drop the column `intervaloSegundos` on the `Campanha` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InstanceStatus" AS ENUM ('CONNECTING', 'CONNECTED', 'DISCONNECTED');

-- AlterEnum
ALTER TYPE "CampanhaStatus" ADD VALUE 'PAUSADA';

-- AlterTable
ALTER TABLE "Campanha" DROP COLUMN "intervaloSegundos",
ADD COLUMN     "intervaloMax" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "intervaloMin" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "mensagens" JSONB,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'EVOLUTION',
ALTER COLUMN "templateMensagem" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Enquete" ADD COLUMN     "configPremiacao" JSONB DEFAULT '[]',
ADD COLUMN     "digitosNumerosSorte" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "divulgarGanhadores" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quantidadePremiados" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usarNumerosSorte" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usarPremiacao" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "NumeroSorte" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "enqueteId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "prizeName" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NumeroSorte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappInstance" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT,
    "instanceId" TEXT NOT NULL,
    "apiKey" TEXT,
    "token" TEXT,
    "status" "InstanceStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "qrcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampanhaInstance" (
    "campanhaId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "CampanhaInstance_pkey" PRIMARY KEY ("campanhaId","instanceId")
);

-- CreateIndex
CREATE INDEX "NumeroSorte_enqueteId_idx" ON "NumeroSorte"("enqueteId");

-- CreateIndex
CREATE INDEX "NumeroSorte_leadId_idx" ON "NumeroSorte"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "NumeroSorte_enqueteId_numero_key" ON "NumeroSorte"("enqueteId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappInstance_instanceId_key" ON "WhatsappInstance"("instanceId");

-- CreateIndex
CREATE INDEX "WhatsappInstance_organizationId_idx" ON "WhatsappInstance"("organizationId");

-- AddForeignKey
ALTER TABLE "NumeroSorte" ADD CONSTRAINT "NumeroSorte_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NumeroSorte" ADD CONSTRAINT "NumeroSorte_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaInstance" ADD CONSTRAINT "CampanhaInstance_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "Campanha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaInstance" ADD CONSTRAINT "CampanhaInstance_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "WhatsappInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
