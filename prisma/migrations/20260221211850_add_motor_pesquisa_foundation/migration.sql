-- CreateEnum
CREATE TYPE "TipoEntidade" AS ENUM ('EMPRESA', 'CANDIDATO', 'PROPOSTA', 'MARCA', 'DIMENSAO', 'SERVICO_PUBLICO', 'OUTRO');

-- AlterTable
ALTER TABLE "Enquete" ADD COLUMN     "configPesquisa" JSONB,
ADD COLUMN     "incluirQualidade" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxCategoriasPorEleitor" INTEGER,
ADD COLUMN     "modoColeta" TEXT NOT NULL DEFAULT 'recall-assistido',
ADD COLUMN     "modoDistribuicao" TEXT NOT NULL DEFAULT 'grupo',
ADD COLUMN     "randomizarOpcoes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tipoPesquisa" TEXT NOT NULL DEFAULT 'premiacao';

-- AlterTable
ALTER TABLE "Estabelecimento" ADD COLUMN     "metadados" JSONB,
ADD COLUMN     "tipo" "TipoEntidade" NOT NULL DEFAULT 'EMPRESA';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "dadosDemograficos" JSONB;

-- AlterTable
ALTER TABLE "Segmento" ADD COLUMN     "templateQualidadeId" TEXT;

-- CreateTable
CREATE TABLE "TemplateQualidade" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateQualidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerguntaQualidade" (
    "id" TEXT NOT NULL,
    "templateQualidadeId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "opcoes" JSONB,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PerguntaQualidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespostaQualidade" (
    "id" TEXT NOT NULL,
    "respostaId" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RespostaQualidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotoLivre" (
    "id" TEXT NOT NULL,
    "respostaId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "textoOriginal" TEXT NOT NULL,
    "chavesFoneticas" TEXT[],
    "consolidadoEmId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VotoLivre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemplateQualidade_organizationId_idx" ON "TemplateQualidade"("organizationId");

-- CreateIndex
CREATE INDEX "RespostaQualidade_respostaId_idx" ON "RespostaQualidade"("respostaId");

-- CreateIndex
CREATE INDEX "RespostaQualidade_categoriaId_idx" ON "RespostaQualidade"("categoriaId");

-- CreateIndex
CREATE INDEX "VotoLivre_respostaId_idx" ON "VotoLivre"("respostaId");

-- CreateIndex
CREATE INDEX "VotoLivre_categoriaId_idx" ON "VotoLivre"("categoriaId");

-- CreateIndex
CREATE INDEX "VotoLivre_chavesFoneticas_idx" ON "VotoLivre"("chavesFoneticas");

-- CreateIndex
CREATE INDEX "Estabelecimento_organizationId_tipo_idx" ON "Estabelecimento"("organizationId", "tipo");

-- AddForeignKey
ALTER TABLE "Segmento" ADD CONSTRAINT "Segmento_templateQualidadeId_fkey" FOREIGN KEY ("templateQualidadeId") REFERENCES "TemplateQualidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerguntaQualidade" ADD CONSTRAINT "PerguntaQualidade_templateQualidadeId_fkey" FOREIGN KEY ("templateQualidadeId") REFERENCES "TemplateQualidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaQualidade" ADD CONSTRAINT "RespostaQualidade_respostaId_fkey" FOREIGN KEY ("respostaId") REFERENCES "Resposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotoLivre" ADD CONSTRAINT "VotoLivre_respostaId_fkey" FOREIGN KEY ("respostaId") REFERENCES "Resposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
