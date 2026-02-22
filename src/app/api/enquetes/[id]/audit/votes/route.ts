import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { RespostaStatus } from "@prisma/client";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") as RespostaStatus | null;
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "respondidoEm";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const skip = (page - 1) * limit;

    // Map sortBy values to Prisma orderBy structure
    const orderByMap: Record<string, object> = {
        respondidoEm: { respondidoEm: sortOrder },
        fraudScore: { fraudScore: sortOrder },
        status: { status: sortOrder },
        ipAddress: { ipAddress: sortOrder },
        "lead.nome": { lead: { nome: sortOrder } },
        "lead.cupons": { lead: { cupons: sortOrder } },
    };
    const orderBy = orderByMap[sortBy] ?? { respondidoEm: "desc" };

    try {
        const where = {
            enqueteId: id,
            ...(status ? { status } : {}),
            ...(search ? {
                OR: [
                    { ipAddress: { contains: search } },
                    { fraudReason: { contains: search, mode: 'insensitive' as const } },
                    { lead: { nome: { contains: search, mode: 'insensitive' as const } } }
                ]
            } : {})
        };

        const [votes, total] = await Promise.all([
            prisma.resposta.findMany({
                where,
                include: {
                    lead: {
                        select: {
                            nome: true,
                            whatsapp: true,
                            cpf: true,
                            cupons: true,
                            numerosSorte: {
                                where: { enqueteId: id },
                                select: { numero: true }
                            }
                        }
                    },
                    trackingLink: {
                        select: { hash: true, status: true }
                    },
                    votos: {
                        include: {
                            estabelecimento: {
                                select: { nome: true }
                            }
                        }
                    }
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.resposta.count({ where }),
        ]);

        return NextResponse.json({
            votes,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
            },
        });
    } catch (error) {
        console.error("Erro ao buscar votos para auditoria:", error);
        return NextResponse.json(
            { error: "Erro ao processar auditoria" },
            { status: 500 }
        );
    }
}
