import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDemographics } from "@/lib/analytics/analytics-service";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // 5 min cache

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Basic check for existence and access (less restrictive than admin check for now to match overview)
        const enquete = await prisma.enquete.findFirst({
            where: { id },
            select: { id: true, organizationId: true }
        });
        if (!enquete) return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 });

        // Optional: Check if user belongs to the organization (should be true for standard users)
        // if (enquete.organizationId !== session.user.organizationId && !session.user.isPlatformAdmin) {
        //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        // }

        const searchParams = req.nextUrl.searchParams;
        const estabelecimentoId = searchParams.get("estabelecimentoId") || undefined;

        const demo = await getDemographics(id, estabelecimentoId);
        return NextResponse.json(demo);
    } catch (e: any) {
        console.error("[ANALYTICS_DEMOGRAFICO_ERROR]", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
