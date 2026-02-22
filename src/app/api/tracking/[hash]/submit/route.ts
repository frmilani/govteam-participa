import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TrackingLinkService } from "@/lib/tracking/tracking-link-service";
import { HubApiService } from "@/lib/hub-api";
import { LinkStatus } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
    try {
        const { hash } = await params;
        const body = await req.json();
        const { data } = body;

        if (!data) {
            return NextResponse.json({ error: "Dados da submissão ausentes" }, { status: 400 });
        }

        // 1. Validar Link/Hash
        const link = await TrackingLinkService.getValidLink(hash);
        if (!link) {
            return NextResponse.json({ error: "Link inválido ou não encontrado" }, { status: 404 });
        }

        if (link.isExpired) {
            return NextResponse.json({ error: "Este link de votação já expirou" }, { status: 410 });
        }

        // 2. Verificar duplicidade para campanhas
        if (link.type === 'campaign' && link.status === LinkStatus.RESPONDIDO) {
            return NextResponse.json({ error: "Você já respondeu a esta votação" }, { status: 403 });
        }

        const enquete = link.campanha.enquete;

        // 3. Salvar Resposta (JSONB)
        const resposta = await prisma.resposta.create({
            data: {
                enqueteId: enquete.id,
                formPublicId: enquete.formPublicId,
                leadId: link.type === 'campaign' ? (link as any).leadId : null,
                trackingLinkId: link.type === 'campaign' ? (link as any).id : null,
                dadosJson: data,
                ipAddress: req.headers.get("x-forwarded-for"),
                userAgent: req.headers.get("user-agent"),
            }
        });

        // 4. Extrair Votos para VotoEstabelecimento
        // Lógica: Percorrer o objeto data. 
        // Campo: ID do Segmento, Slug do Segmento ou "prefixo_slug"
        // Valor: ID do Estabelecimento ou Slug do Estabelecimento
        const segmentos = await prisma.segmento.findMany({
            where: { organizationId: enquete.organizationId },
            select: { id: true, slug: true }
        });

        const vutoPromises = [];
        for (const [campoId, valor] of Object.entries(data)) {
            if (typeof valor !== 'string') continue;

            // 1. Tentar identificar o Segmento (Categoria)
            // Pode ser o ID direto, o slug direto, ou algo como "top-of-mind_slug"
            let segmentoId: string | undefined;

            // Busca exata por ID ou Slug
            const directSeg = segmentos.find(s => s.id === campoId || s.slug === campoId);
            if (directSeg) {
                segmentoId = directSeg.id;
            } else {
                // Busca por partes (ex: "top-of-mind_categoria-slug")
                const matchingPart = segmentos.find(s => campoId.includes(s.slug) || (s.id.length > 5 && campoId.includes(s.id)));
                segmentoId = matchingPart?.id;
            }

            if (!segmentoId) continue;

            // 2. Tentar identificar o Estabelecimento (Voto)
            // Pode ser o ID direto ou o Alias/Slug
            const est = await prisma.estabelecimento.findFirst({
                where: {
                    organizationId: enquete.organizationId,
                    OR: [
                        { id: valor },
                        { alias: valor }
                    ]
                },
                select: { id: true }
            });

            if (est) {
                vutoPromises.push(
                    prisma.votoEstabelecimento.create({
                        data: {
                            respostaId: resposta.id,
                            estabelecimentoId: est.id,
                            segmentoId: segmentoId,
                            campoId: campoId
                        }
                    })
                );
            }
        }

        if (vutoPromises.length > 0) {
            await Promise.all(vutoPromises);
        }

        // 5. Atualizar Status do Link (se campanha)
        if (link.type === 'campaign') {
            const campaignLink = link as any;
            await prisma.trackingLink.update({
                where: { id: campaignLink.id },
                data: {
                    status: LinkStatus.RESPONDIDO,
                    respondidoEm: new Date()
                }
            });

            // Incrementar contador na campanha
            if (campaignLink.campanhaId) {
                await prisma.campanha.update({
                    where: { id: campaignLink.campanhaId },
                    data: { totalRespondidos: { increment: 1 } }
                });
            }
        }

        // 6. Telemetria para o Hub
        try {
            await HubApiService.reportAnalytics(enquete.formPublicId, 'submission_complete');
        } catch (telemetryError) {
            console.error("[TELEMETRY_ERROR]", telemetryError);
            // Não falha a requisição se a telemetria der erro
        }

        return NextResponse.json({
            success: true,
            message: "Voto registrado com sucesso!",
            redirectUrl: enquete.paginaAgradecimento ? '/thanks' : null
        });

    } catch (error: any) {
        console.error("[SUBMIT_ERROR]", error);
        return NextResponse.json({ error: error.message || "Erro ao processar voto" }, { status: 500 });
    }
}
