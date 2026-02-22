import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const enquete = await (prisma.enquete as any).findFirst({
            where: { formPublicId: slug },
            select: {
                id: true,
                titulo: true,
                descricao: true,
                premiacaoStatus: true,
                usarPremiacao: true,
                configPremiacao: true,
                configVisual: true,
            },
        });

        if (!enquete) {
            return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 });
        }

        const session = await auth();
        const isAdmin = !!session?.user;

        if (!enquete.usarPremiacao || ((enquete as any).premiacaoStatus !== "PUBLICADO" && !isAdmin)) {
            return NextResponse.json(
                { error: "A divulgação de ganhadores não está ativa ou ainda não foi publicada para esta enquete." },
                { status: 403 }
            );
        }

        // Buscar números sorteados que foram marcados como vencedores
        const winners = await (prisma as any).numeroSorte.findMany({
            where: {
                enqueteId: enquete.id,
                isWinner: true,
            },
            include: {
                lead: {
                    select: {
                        nome: true,
                        cpf: true,
                    },
                },
            },
            orderBy: {
                numero: "asc",
            },
        });

        // Mascarar dados sensíveis (LGPD)
        const maskedWinners = winners.map((w: any) => ({
            numero: w.numero,
            prizeName: w.prizeName,
            lead: {
                nome: maskName(w.lead.nome),
                cpf: maskCpf(w.lead.cpf),
            },
        }));

        return NextResponse.json({
            enquete: {
                titulo: enquete.titulo,
                descricao: enquete.descricao,
                configPremiacao: enquete.configPremiacao,
                configVisual: enquete.configVisual,
            },
            winners: maskedWinners,
        });
    } catch (error) {
        console.error("[WinnersAPI] Erro:", error);
        return NextResponse.json(
            { error: "Erro ao buscar ganhadores" },
            { status: 500 }
        );
    }
}

function maskName(name: string): string {
    if (!name) return "***";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];

    return parts.map((part, idx) => {
        // Manter primeiro nome completo
        if (idx === 0) return part;
        if (part.length <= 2) return part;
        // Sobrenomes: Primeira letra + asteriscos + Última letra
        return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
    }).join(" ");
}

function maskCpf(cpf: string): string {
    if (!cpf) return "***.***.***-**";
    const clean = cpf.replace(/\D/g, "");
    if (clean.length !== 11) return "***.***.***-**";
    // Formato solicitado: ***.211.429-**
    return `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**`;
}
