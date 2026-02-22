-- CreateEnum
CREATE TYPE "CampanhaStatus" AS ENUM ('RASCUNHO', 'AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('NAO_ENVIADO', 'ENVIADO', 'VISUALIZADO', 'RESPONDIDO', 'EXPIRADO');

-- CreateTable
CREATE TABLE "Campanha" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "enqueteId" TEXT NOT NULL,
    "templateMensagem" TEXT NOT NULL,
    "midiaUrl" TEXT,
    "segmentacao" JSONB NOT NULL,
    "agendadoPara" TIMESTAMP(3),
    "intervaloSegundos" INTEGER NOT NULL DEFAULT 5,
    "status" "CampanhaStatus" NOT NULL DEFAULT 'RASCUNHO',
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "totalEnviados" INTEGER NOT NULL DEFAULT 0,
    "totalVisualizados" INTEGER NOT NULL DEFAULT 0,
    "totalRespondidos" INTEGER NOT NULL DEFAULT 0,
    "totalFalhados" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "iniciadoEm" TIMESTAMP(3),
    "finalizadoEm" TIMESTAMP(3),
    "criadoPor" TEXT NOT NULL,

    CONSTRAINT "Campanha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingLink" (
    "id" TEXT NOT NULL,
    "campanhaId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "formPublicId" TEXT NOT NULL,
    "enviadoEm" TIMESTAMP(3),
    "visualizadoEm" TIMESTAMP(3),
    "respondidoEm" TIMESTAMP(3),
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'NAO_ENVIADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resposta" (
    "id" TEXT NOT NULL,
    "enqueteId" TEXT NOT NULL,
    "formPublicId" TEXT NOT NULL,
    "leadId" TEXT,
    "trackingLinkId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "dadosJson" JSONB NOT NULL,
    "tempoRespostaSegundos" INTEGER,
    "respondidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotoEstabelecimento" (
    "id" TEXT NOT NULL,
    "respostaId" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "segmentoId" TEXT NOT NULL,
    "campoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VotoEstabelecimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campanha_organizationId_idx" ON "Campanha"("organizationId");

-- CreateIndex
CREATE INDEX "Campanha_organizationId_status_idx" ON "Campanha"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TrackingLink_hash_key" ON "TrackingLink"("hash");

-- CreateIndex
CREATE INDEX "TrackingLink_hash_idx" ON "TrackingLink"("hash");

-- CreateIndex
CREATE INDEX "TrackingLink_campanhaId_status_idx" ON "TrackingLink"("campanhaId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Resposta_trackingLinkId_key" ON "Resposta"("trackingLinkId");

-- CreateIndex
CREATE INDEX "Resposta_enqueteId_idx" ON "Resposta"("enqueteId");

-- CreateIndex
CREATE INDEX "Resposta_respondidoEm_idx" ON "Resposta"("respondidoEm");

-- CreateIndex
CREATE INDEX "VotoEstabelecimento_estabelecimentoId_segmentoId_idx" ON "VotoEstabelecimento"("estabelecimentoId", "segmentoId");

-- CreateIndex
CREATE INDEX "VotoEstabelecimento_segmentoId_criadoEm_idx" ON "VotoEstabelecimento"("segmentoId", "criadoEm");

-- AddForeignKey
ALTER TABLE "Campanha" ADD CONSTRAINT "Campanha_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingLink" ADD CONSTRAINT "TrackingLink_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "Campanha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingLink" ADD CONSTRAINT "TrackingLink_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_trackingLinkId_fkey" FOREIGN KEY ("trackingLinkId") REFERENCES "TrackingLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotoEstabelecimento" ADD CONSTRAINT "VotoEstabelecimento_respostaId_fkey" FOREIGN KEY ("respostaId") REFERENCES "Resposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotoEstabelecimento" ADD CONSTRAINT "VotoEstabelecimento_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "Estabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
