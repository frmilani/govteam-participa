import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrganizationId } from "@/lib/auth-helpers";
import { RankingsService } from "@/lib/resultados/rankings-service";
import { MetricasService } from "@/lib/resultados/metricas-service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const organizationId = await getOrganizationId();
        const { id } = await params;

        const enquete = await prisma.enquete.findFirst({
            where: { id, organizationId }
        });

        if (!enquete) {
            return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 });
        }

        // 1. Buscar métricas gerais
        const metrics = await MetricasService.getEnqueteMetrics(id);

        // 2. Buscar rankings por segmento
        const segmentos = await RankingsService.getSegmentosComVotos(id);

        const rankings = await Promise.all(
            segmentos.map(async (seg) => {
                const ranking = await RankingsService.getRankingBySegmento(id, seg.id, 5);
                return {
                    id: seg.id,
                    nome: seg.nome,
                    ranking
                };
            })
        );

        // 3. Buscar dados de funil se houver campanhas
        const campanhas = await prisma.campanha.findMany({
            where: { enqueteId: id },
            select: { id: true, nome: true }
        });

        const funnels = await Promise.all(
            campanhas.map(async (camp) => {
                const funnel = await MetricasService.getCampanhaFunnel(camp.id);
                return {
                    id: camp.id,
                    nome: camp.nome,
                    funnel
                };
            })
        );

        return NextResponse.json({
            metrics,
            rankings,
            funnels
        });

    } catch (error: any) {
        console.error("[ADMIN_RESULTS_ERROR]", error);
        return NextResponse.json({ error: error.message || "Erro ao carregar resultados" }, { status: 500 });
    }
}
