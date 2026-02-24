import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkPermission, buildUnitScopeWhere } from "@/lib/hub-permissions";
import { getQualidade } from "@/lib/analytics/analytics-service";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // 5 min cache

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const hpac = await checkPermission(session.user.id || "", session.user.organizationId || "", 'premio:enquete', 'read', { resourceId: id });
        if (!hpac.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const enquete = await prisma.enquete.findFirst({
            where: {
                id,
                organizationId: session.user.organizationId,
                ...buildUnitScopeWhere(hpac.unitScope)
            },
            select: { id: true }
        });
        if (!enquete) return NextResponse.json({ error: "Enquete não encontrada ou acesso restrito." }, { status: 404 });

        const searchParams = req.nextUrl.searchParams;
        const categoriaId = searchParams.get("categoriaId") || undefined;

        const qualidades = await getQualidade(id, categoriaId);
        return NextResponse.json(qualidades);
    } catch (e: any) {
        console.error("[ANALYTICS_QUALIDADE_ERROR]", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
