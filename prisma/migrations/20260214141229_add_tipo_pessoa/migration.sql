-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('FISICA', 'JURIDICA');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "tipoPessoa" "TipoPessoa" NOT NULL DEFAULT 'FISICA';
