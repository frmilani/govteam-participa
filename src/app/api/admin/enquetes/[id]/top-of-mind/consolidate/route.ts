import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        const organizationId = session.user.organizationId;
        const body = await req.json();
        const { votoLivreIds, estabelecimentoId, novoEstabelecimento, categoriaId } = body;

        if (!votoLivreIds || !Array.isArray(votoLivreIds) || votoLivreIds.length === 0) {
            return NextResponse.json({ error: "Nenhum voto selecionado para consolidar." }, { status: 400 });
        }

        let finalId = estabelecimentoId;

        // AC 5: Se o usuário mandou texto pra criar um novo "on the fly"
        if (!finalId && novoEstabelecimento && categoriaId) {
            // 1. Criar Estabelecimento local
            const novo = await prisma.estabelecimento.create({
                data: {
                    organizationId,
                    nome: novoEstabelecimento,
                    alias: novoEstabelecimento.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                    ativo: true,
                    segmentos: {
                        create: [{ segmentoId: categoriaId }]
                    }
                }
            });
            finalId = novo.id;
        }

        if (!finalId) {
            return NextResponse.json({ error: "Destino inválido para consolidação" }, { status: 400 });
        }

        // Executar a amarra (AC 4) - Atualizar os votos livres e apontar para a entidade oficial
        // Opcional: E transformar esse votoLivre num VotoEstabelecimento oficial? 
        // O PRD diz: "reescreve a amarração dos VotosLivres (Tabelado no E1 - campo consolidadoEmId)"
        await (prisma as any).votoLivre.updateMany({
            where: {
                id: { in: votoLivreIds }
            },
            data: {
                consolidadoEmId: finalId
            }
        });

        return NextResponse.json({ success: true, consolidadoEmId: finalId, total: votoLivreIds.length });

    } catch (error: any) {
        console.error("[API_TOP_OF_MIND_CONSOLIDATE]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
