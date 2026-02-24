/*
  Warnings:

  - You are about to drop the column `divulgarGanhadores` on the `Enquete` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Enquete" DROP COLUMN "divulgarGanhadores",
ADD COLUMN     "premiacaoStatus" "ResultadosStatus" NOT NULL DEFAULT 'EM_CONFERENCIA';
