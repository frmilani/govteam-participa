-- CreateEnum
CREATE TYPE "EnqueteStatus" AS ENUM ('RASCUNHO', 'PUBLICADA', 'PAUSADA', 'ENCERRADA');

-- CreateTable
CREATE TABLE "Enquete" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "formPublicId" TEXT NOT NULL,
    "hubFormId" TEXT NOT NULL,
    "configVisual" JSONB NOT NULL,
    "paginaAgradecimento" JSONB NOT NULL,
    "status" "EnqueteStatus" NOT NULL DEFAULT 'RASCUNHO',
    "linkExpiracaoDias" INTEGER NOT NULL DEFAULT 30,
    "criadoPor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicadoEm" TIMESTAMP(3),
    "encerramentoEm" TIMESTAMP(3),

    CONSTRAINT "Enquete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Enquete_organizationId_idx" ON "Enquete"("organizationId");

-- CreateIndex
CREATE INDEX "Enquete_organizationId_status_idx" ON "Enquete"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Enquete_organizationId_formPublicId_key" ON "Enquete"("organizationId", "formPublicId");
