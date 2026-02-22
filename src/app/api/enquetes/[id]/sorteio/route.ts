import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const enquete = await prisma.enquete.findUnique({
            where: { id },
            select: {
                usarPremiacao: true,
                quantidadePremiados: true,
                configPremiacao: true,
                premiacaoStatus: true,
            }
        });

        const winners = await prisma.numeroSorte.findMany({
            where: {
                enqueteId: id,
                isWinner: true
            },
            include: {
                lead: {
                    select: {
                        nome: true,
                        cpf: true,
                        whatsapp: true,
                        email: true
                    }
                }
            },
            orderBy: { numero: 'asc' }
        });

        return NextResponse.json({
            enquete,
            winners
        });
    } catch (error) {
        console.error("Erro ao buscar sorteio:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { numerosFederal } = await req.json(); // Array de 5 strings/números [p1, p2, p3, p4, p5]

    if (!numerosFederal || !Array.isArray(numerosFederal) || numerosFederal.length < 1) {
        return NextResponse.json({ error: "Números da Loteria Federal não fornecidos corretamente" }, { status: 400 });
    }

    try {
        const enquete = await prisma.enquete.findUnique({
            where: { id },
            select: {
                quantidadePremiados: true,
                configPremiacao: true,
            }
        });

        if (!enquete) return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 });

        const allPrizes = (enquete.configPremiacao as any[]) || [];
        const winnersCount = enquete.quantidadePremiados || allPrizes.length || 1;

        // Buscar todos os números da sorte da enquete
        const allNumbers = await prisma.numeroSorte.findMany({
            where: { enqueteId: id },
            include: {
                lead: {
                    select: {
                        nome: true,
                        cpf: true,
                        whatsapp: true
                    }
                }
            }
        });

        if (allNumbers.length === 0) {
            return NextResponse.json({ error: "Nenhum número da sorte gerado para esta enquete" }, { status: 400 });
        }

        const uniqueWinners: any[] = [];
        const seenLeads = new Set();
        const availablePool = [...allNumbers];

        // Iterar sobre a quantidade de prêmios definida
        for (let i = 0; i < winnersCount; i++) {
            // Regra: Prêmio 1 usa Federal 1, Prêmio 2 usa Federal 2... 
            // Se ultrapassar 5, repetimos o ciclo da federal (módulo 5)
            const federalTargetStr = numerosFederal[i % numerosFederal.length];
            const target = parseInt(federalTargetStr);

            if (isNaN(target)) continue;

            // Encontrar o mais próximo no pool disponível (quem ainda não ganhou)
            const candidates = availablePool
                .filter(n => !seenLeads.has(n.leadId))
                .sort((a, b) => {
                    const diffA = Math.abs(a.numero - target);
                    const diffB = Math.abs(b.numero - target);

                    if (diffA !== diffB) return diffA - diffB;
                    return b.numero - a.numero; // Desempate: número maior
                });

            if (candidates.length > 0) {
                const winner = candidates[0];
                const prizeInfo = allPrizes[i] || { description: `${i + 1}º Prêmio` };

                uniqueWinners.push({
                    ...winner,
                    posicao: i + 1,
                    distancia: Math.abs(winner.numero - target),
                    numeroLoteriaBase: target,
                    premio: prizeInfo.description || `Prêmio ${i + 1}º`
                });

                seenLeads.add(winner.leadId);
            }
        }

        return NextResponse.json({
            success: true,
            winners: uniqueWinners
        });
    } catch (error) {
        console.error("Erro ao calcular sorteio multicanal:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { winners, action } = await req.json();

    try {
        if (action === "CONFIRM_WINNERS") {
            // Limpar ganhadores anteriores para re-apuração se necessário
            await prisma.numeroSorte.updateMany({
                where: { enqueteId: id },
                data: { isWinner: false, prizeName: null }
            });

            // Registrar novos ganhadores
            for (const w of winners) {
                await prisma.numeroSorte.update({
                    where: { id: w.id },
                    data: {
                        isWinner: true,
                        prizeName: w.premio
                    }
                });
            }

            await prisma.enquete.update({
                where: { id },
                data: { premiacaoStatus: "PUBLICADO" as any }
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    } catch (error) {
        console.error("Erro ao confirmar ganhadores:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
