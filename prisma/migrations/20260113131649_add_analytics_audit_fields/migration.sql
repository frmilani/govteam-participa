-- CreateEnum
CREATE TYPE "RespostaStatus" AS ENUM ('VALID', 'SUSPICIOUS', 'INVALID', 'MANUAL_REVIEW');

-- AlterTable
ALTER TABLE "Enquete" ADD COLUMN     "politicaPrivacidade" TEXT,
ADD COLUMN     "regulamento" TEXT,
ADD COLUMN     "termosLgpd" TEXT,
ADD COLUMN     "totalInvalid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSuspicious" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Resposta" ADD COLUMN     "fraudReason" TEXT,
ADD COLUMN     "fraudScore" INTEGER DEFAULT 0,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "status" "RespostaStatus" NOT NULL DEFAULT 'VALID';

-- CreateIndex
CREATE INDEX "Resposta_enqueteId_status_idx" ON "Resposta"("enqueteId", "status");

-- CreateIndex
CREATE INDEX "Resposta_ipAddress_idx" ON "Resposta"("ipAddress");
