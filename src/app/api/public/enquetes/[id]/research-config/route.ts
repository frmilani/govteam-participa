import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EnqueteStatus } from "@prisma/client";
import { resolverTemplate } from "@/lib/templates-qualidade/resolver";
import { DistribuicaoService } from "@/lib/distribuicao/distribuicao-service";

export const revalidate = 60; // Cache de 60 segundos

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // id can be the real id or publicId. For now considering real ID based on url pattern, or might be string.

        // Fetch the enquete with its segments explicitly structured
        const enquete = await prisma.enquete.findFirst({
            where: {
                id: id,
                status: {
                    in: [EnqueteStatus.PUBLICADA]
                }
            },
            include: {
                segmentos: {
                    orderBy: {
                        ordem: 'asc'
                    }
                }
            }
        });

        if (!enquete) {
            return NextResponse.json({ error: "Enquete não encontrada ou não ativa" }, { status: 404 });
        }

        const searchParams = req.nextUrl.searchParams;
        const trackingHash = searchParams.get('trackingHash');
        const reqCampanhaId = searchParams.get('campanhaId');

        let resolvedCampanhaId = reqCampanhaId || undefined;
        let resolvedLeadId = undefined;

        if (trackingHash) {
            const tracking = await prisma.trackingLink.findUnique({
                where: { hash: trackingHash },
                select: { campanhaId: true, leadId: true }
            });
            if (tracking) {
                resolvedCampanhaId = tracking.campanhaId;
                resolvedLeadId = tracking.leadId;
            }
        }

        // Parse usando resolverTemplate para cada categoria (em paralelo)
        const categoriasEstruturadas = await Promise.all(
            enquete.segmentos.map(async (segmento) => {
                const resolved = await resolverTemplate(segmento.id, enquete.organizationId);

                return {
                    id: segmento.id,
                    nome: segmento.nome,
                    slug: segmento.slug,
                    icone: segmento.icone,
                    cor: segmento.cor,
                    paiId: segmento.paiId,
                    templateQualidade: resolved
                };
            })
        );

        // Retornar a estrutura de pesquisa contendo a configuração de distribuição,
        // modos de coleta e lista de categorias já com templates aplicados.
        return NextResponse.json({
            id: enquete.id,
            titulo: enquete.titulo,
            tipoPesquisa: (enquete as any).tipoPesquisa,
            modoColeta: (enquete as any).modoColeta || "recall-assistido",
            randomizarOpcoes: (enquete as any).randomizarOpcoes !== undefined ? (enquete as any).randomizarOpcoes : true,
            modoDistribuicao: (enquete as any).modoDistribuicao || "grupo",
            minCategoriasPorEleitor: (enquete as any).minCategoriasPorEleitor,
            maxCategoriasPorEleitor: (enquete as any).maxCategoriasPorEleitor,
            blocosAdicionais: (enquete as any).configPesquisa?.blocosAdicionais || {},
            configPesquisa: (enquete as any).configPesquisa || {},
            categorias: await DistribuicaoService.resolverCategorias(enquete.id, categoriasEstruturadas, resolvedCampanhaId, resolvedLeadId)
        });

    } catch (error: any) {
        console.error("[API_RESEARCH_CONFIG]", error);
        if (error.message?.includes("Campanha com modo individual não definiu categoriaId")) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
