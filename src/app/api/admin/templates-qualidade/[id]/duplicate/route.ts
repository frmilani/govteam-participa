import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkPermission } from "@/lib/hub-permissions";
import { duplicateTemplate } from "@/lib/templates-qualidade/template-qualidade-service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        // Needs create permission to duplicate
        const perm = await checkPermission(session.user.id, session.user.organizationId, "premio:template", "create");
        if (!perm.allowed) return NextResponse.json({ error: "Permissão insuficiente" }, { status: 403 });

        const duplicated = await duplicateTemplate(id, session.user.organizationId);
        return NextResponse.json(duplicated, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
