import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { invalidateVotes, validateVotes, detectFraudPatterns } from "@/lib/audit/fraud-service";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth() as any;
    const isAuthorized = session?.user && (
        session.user.isPlatformAdmin ||
        ["ADMIN", "ORG_ADMIN", "MANAGER", "SUPER ADMIN"].includes(session.user.role?.toUpperCase())
    );

    if (!isAuthorized) {
        console.warn(`[AUTH] Unauthorized batch-action attempt by user ${session?.user?.id} with role ${session?.user?.role}`);
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, ids, reason } = body;

    try {
        if (action === "RUN_DETECTION") {
            const result = await detectFraudPatterns(id);
            return NextResponse.json({ success: true, result });
        }

        if (action === "PUBLISH_RESULTS") {
            await prisma.enquete.update({
                where: { id },
                data: {
                    resultadosStatus: "PUBLICADO" as any,
                    status: "ENCERRADA" as any // Automatically close voting if results are published
                }
            });
            return NextResponse.json({ success: true });
        }

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "IDs não fornecidos" }, { status: 400 });
        }

        if (action === "INVALIDATE") {
            await invalidateVotes(ids, reason || "Invalidado manualmente via auditoria", session.user.id!);
            return NextResponse.json({ success: true });
        }

        if (action === "VALIDATE") {
            await validateVotes(ids, session.user.id!);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    } catch (error) {
        console.error("Erro ao processar ação de auditoria:", error);
        return NextResponse.json(
            { error: "Erro ao processar comando" },
            { status: 500 }
        );
    }
}
