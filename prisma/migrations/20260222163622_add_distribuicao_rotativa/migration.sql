-- CreateTable
CREATE TABLE "DistribuicaoRotativa" (
    "id" TEXT NOT NULL,
    "enqueteId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "totalAcessos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DistribuicaoRotativa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DistribuicaoRotativa_enqueteId_idx" ON "DistribuicaoRotativa"("enqueteId");

-- CreateIndex
CREATE UNIQUE INDEX "DistribuicaoRotativa_enqueteId_categoriaId_key" ON "DistribuicaoRotativa"("enqueteId", "categoriaId");
