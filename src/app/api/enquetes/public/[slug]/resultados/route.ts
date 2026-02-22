import { NextRequest, NextResponse } from "next/server";
import { RankingsService } from "@/lib/resultados/rankings-service";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        // 1. Buscar a enquete pelo formPublicId (slug)
        const enquete = await (prisma.enquete as any).findFirst({
            where: { formPublicId: slug },
            select: {
                id: true,
                titulo: true,
                descricao: true,
                resultadosStatus: true,
                configResultados: true,
                configVisual: true,
            }
        });

        if (!enquete) {
            return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 });
        }

        // 2. Verificar se os resultados estão publicados
        // Admins podem ver o preview mesmo sem estar publicado
        const session = await auth();
        const isAdmin = !!session?.user;
        const resultadosStatus = (enquete as any).resultadosStatus;

        if (resultadosStatus !== "PUBLICADO" && !isAdmin) {
            return NextResponse.json({
                error: "Os resultados desta enquete ainda não foram publicados.",
                status: resultadosStatus
            }, { status: 403 });
        }

        // 3. Buscar os rankings
        const segmentos = await RankingsService.getSegmentosComVotos(enquete.id);

        const rankings = await Promise.all(
            segmentos.map(async (seg) => {
                const ranking = await RankingsService.getRankingBySegmento(enquete.id, seg.id);
                return {
                    ...seg,
                    ranking
                };
            })
        );

        return NextResponse.json({
            enquete: {
                titulo: enquete.titulo,
                descricao: enquete.descricao,
                configResultados: enquete.configResultados,
                configVisual: enquete.configVisual,
            },
            rankings
        });
    } catch (error) {
        console.error("Erro ao buscar rankings públicos:", error);
        return NextResponse.json(
            { error: "Erro ao processar rankings" },
            { status: 500 }
        );
    }
}
