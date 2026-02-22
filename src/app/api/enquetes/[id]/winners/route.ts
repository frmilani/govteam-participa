import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: enqueteId } = await params;
        const { searchParams } = new URL(req.url);

        const enquete = await prisma.enquete.findUnique({
            where: { id: enqueteId },
            select: {
                premiacaoStatus: true,
                usarPremiacao: true,
                configPremiacao: true,
            },
        });

        if (!enquete?.usarPremiacao || enquete?.premiacaoStatus !== "PUBLICADO") {
            return NextResponse.json(
                { error: "Divulgação de ganhadores não está ativa para esta enquete." },
                { status: 403 }
            );
        }

        // Buscar números sorteados que foram marcados como vencedores
        const winners = await (prisma as any).numeroSorte.findMany({
            where: {
                enqueteId,
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
            winners: maskedWinners,
            config: enquete.configPremiacao,
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
    const parts = name.split(" ");
    return parts
        .map((part) => {
            if (part.length <= 2) return part;
            return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
        })
        .join(" ");
}

function maskCpf(cpf: string): string {
    if (!cpf) return "***.***.***-**";
    // CPF: 123.456.789-00 -> ***.456.789-**
    const clean = cpf.replace(/\D/g, "");
    if (clean.length !== 11) return "***.***.***-**";
    return `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**`;
}
