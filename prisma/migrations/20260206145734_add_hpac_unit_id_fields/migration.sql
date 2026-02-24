-- CreateEnum
CREATE TYPE "ResultadosStatus" AS ENUM ('EM_CONFERENCIA', 'PUBLICADO', 'CANCELADO');

-- AlterTable
ALTER TABLE "Campanha" ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "Enquete" ADD COLUMN     "configResultados" JSONB DEFAULT '{"exibirVotos": true, "exibirPercentual": true}',
ADD COLUMN     "resultadosStatus" "ResultadosStatus" NOT NULL DEFAULT 'EM_CONFERENCIA',
ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "Estabelecimento" ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "Segmento" ADD COLUMN     "unitId" TEXT;

-- CreateTable
CREATE TABLE "SpokeConfig" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "organizationId" TEXT NOT NULL,
    "activeDesignSystemId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpokeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpokeConfig_organizationId_key" ON "SpokeConfig"("organizationId");

-- CreateIndex
CREATE INDEX "Campanha_unitId_idx" ON "Campanha"("unitId");

-- CreateIndex
CREATE INDEX "Enquete_unitId_idx" ON "Enquete"("unitId");

-- CreateIndex
CREATE INDEX "Estabelecimento_unitId_idx" ON "Estabelecimento"("unitId");

-- CreateIndex
CREATE INDEX "Lead_unitId_idx" ON "Lead"("unitId");

-- CreateIndex
CREATE INDEX "Segmento_unitId_idx" ON "Segmento"("unitId");
