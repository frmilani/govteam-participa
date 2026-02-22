import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        const { searchParams } = new URL(req.url);
        const formPublicId = searchParams.get("formPublicId");
        const segmentoId = searchParams.get("segmentoId");
        const search = searchParams.get("search");

        if (!formPublicId) {
            return NextResponse.json({ error: "formPublicId is required" }, { status: 400, headers });
        }

        // 1. Find the Enquete and its linked Establishments
        const enquete = await prisma.enquete.findFirst({
            where: { formPublicId },
            include: {
                estabelecimentos: {
                    select: { id: true }
                }
            }
        });

        if (!enquete) {
            return NextResponse.json({ error: "Enquete not found" }, { status: 404, headers });
        }

        // 2. Filter Establishments
        // Logic:
        // - Must be active
        // - Must belong to the requested Segment (if filtered)
        // - Must be linked to the Enquete (if Enquete has specific linked establishments)
        //   If Enquete has NO linked establishments, does it mean ALL? Or NONE?
        //   Usually in this system, empty list means "Draft" or "None". 
        //   But let's assume we strictly respect the `estabelecimentos` list if it exists.

        // For "Top of Mind", usually it's open text, but here we are selecting from a list.
        // So we fetch the candidates.

        const whereClause: any = {
            ativo: true,
            organizationId: enquete.organizationId,
        };

        // Filter by Search
        if (search && search.trim() !== "") {
            whereClause.OR = [
                { nome: { contains: search, mode: 'insensitive' } },
                { alias: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Filter by Segment (ID or Slug)
        const segmentoSlug = searchParams.get("segmentoSlug");

        if (segmentoId) {
            whereClause.segmentos = {
                some: {
                    segmentoId: segmentoId
                }
            };
        } else if (segmentoSlug) {
            whereClause.segmentos = {
                some: {
                    segmento: {
                        slug: segmentoSlug
                    }
                }
            };
        }

        // Filter by Enquete Scope (Stimulated Vote)
        // If the enquete has a list of linked establishments, only return those.
        // If the list is empty, return empty — the enquete must explicitly define its candidates.
        const linkedIds = enquete.estabelecimentos.map(e => e.id);

        if (linkedIds.length > 0) {
            whereClause.id = { in: linkedIds };
        } else {
            // No companies linked to this enquete — return empty
            return NextResponse.json([], { headers });
        }

        const estabelecimentos = await prisma.estabelecimento.findMany({
            where: whereClause,
            select: {
                id: true,
                nome: true,
                alias: true,
                logoUrl: true,
                descricao: true,
                // We include data needed for the card
            },
            orderBy: { nome: 'asc' },
            take: 100 // Limit results for performance
        });

        // Format for Formbuilder (Label/Value)
        const formatted = estabelecimentos.map(e => ({
            label: e.nome,
            value: e.id,
            description: e.descricao,
            image: e.logoUrl,
            ...e
        }));

        return NextResponse.json(formatted, { headers });

    } catch (error: any) {
        console.error("[API_PUBLIC_CANDIDATES]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers });
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}
