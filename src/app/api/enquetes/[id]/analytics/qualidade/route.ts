import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getQualidade } from "@/lib/analytics/analytics-service";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // 5 min cache

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const enquete = await prisma.enquete.findFirst({
            where: { id },
            select: { id: true, organizationId: true }
        });
        if (!enquete) return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 });

        const searchParams = req.nextUrl.searchParams;
        const categoriaId = searchParams.get("categoriaId") || undefined;

        const qualidade = await getQualidade(id, categoriaId);
        return NextResponse.json(qualidade);
    } catch (e: any) {
        console.error("[ANALYTICS_QUALIDADE_ERROR]", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
