-- AlterEnum
ALTER TYPE "LinkStatus" ADD VALUE 'FALHADO';

-- AlterTable
ALTER TABLE "TrackingLink" ADD COLUMN     "erroNoEnvio" TEXT;
