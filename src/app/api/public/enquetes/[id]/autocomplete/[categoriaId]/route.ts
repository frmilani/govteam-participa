import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { metaphonePtBr, isFuzzyMatch } from "@/lib/phonetics/metaphone";

// Cache longo (1 hora -> 3600 segundos) conforme Dev Notes, 
// a lista na DB de estabelecimentos de uma categoria na cidade não muda 
// repentinamente durante uma votação.
export const revalidate = 3600;

function removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; categoriaId: string }> }
) {
    try {
        const { id: enqueteId, categoriaId } = await params;
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get("q") || "";

        if (!query || query.length < 2) {
            return NextResponse.json([]); // Retorna array vazio se não houver texto suficiente p/ fuzzy match
        }

        // 1. Validar Enquete e encontrar Estabelecimentos na DB
        // O cache do nextJS segurará a requisição massiva sem derrubar o db.
        const segmento = await prisma.segmento.findFirst({
            where: {
                id: categoriaId,
                enquetes: {
                    some: { id: enqueteId }
                }
            },
            include: {
                estabelecimentos: {
                    include: {
                        estabelecimento: {
                            select: {
                                id: true,
                                nome: true,
                                alias: true,
                            }
                        }
                    }
                }
            }
        });

        if (!segmento) {
            return NextResponse.json({ error: "Categoria inválida ou enquete inativa" }, { status: 404 });
        }

        const rawList = segmento.estabelecimentos.map(estSeg => estSeg.estabelecimento);

        // 2. Regra Fuzzy Endpoint (AC 4)
        // Regra 1: Direct Contains
        // Regra 2: Metaphone Match

        const qNorm = removeAccents(query.toLowerCase());
        const qMeta = metaphonePtBr(query);

        let matches = rawList.map(est => {
            const tempName = est.nome || est.alias || "";
            const tNorm = removeAccents(tempName.toLowerCase());
            const tMeta = metaphonePtBr(tempName);

            let rank = 0;

            // Regra 1: Score base exact contains (Rank máximo)
            if (tNorm.includes(qNorm)) rank += 10;

            // Regra 2: Metaphone sound match (Rank Médio)
            if (tMeta.includes(qMeta)) rank += 5;

            // Boost se começa com a string exata pra favorecer os auto-completes 
            // de quem não cometeu erro de escrita.
            if (tNorm.startsWith(qNorm)) rank += 5;
            if (tMeta.startsWith(qMeta)) rank += 2;

            return {
                id: est.id,
                nome: tempName,
                rank
            };
        }).filter(m => m.rank > 0);

        // Sort by rank descending
        matches.sort((a, b) => b.rank - a.rank);

        // Limite estrito de 5 itens para renderizar no dropdown de apoio.
        const top5 = matches.slice(0, 5).map(m => ({ id: m.id, nome: m.nome }));

        return NextResponse.json(top5);

    } catch (error: any) {
        console.error("[API_AUTOCOMPLETE_FUZZY]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
