import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkPermission, hpacDeniedResponse } from "@/lib/hub-permissions";
import { templateQualidadeSchema } from "@/lib/templates-qualidade/template-validators";
import { getTemplateById, updateTemplate, deleteTemplate } from "@/lib/templates-qualidade/template-qualidade-service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const perm = await checkPermission(session.user.id, session.user.organizationId, "participa:template", "read");
        if (!perm.allowed) return hpacDeniedResponse("participa:template", "read");

        const template = await getTemplateById(id, session.user.organizationId);
        if (!template) return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });

        return NextResponse.json(template);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        const perm = await checkPermission(session.user.id, session.user.organizationId, "participa:template", "update");
        if (!perm.allowed) return hpacDeniedResponse("participa:template", "update");

        const body = await req.json();
        const parsed = templateQualidadeSchema.parse(body);

        const updated = await updateTemplate(id, session.user.organizationId, parsed);
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        const perm = await checkPermission(session.user.id, session.user.organizationId, "participa:template", "delete");
        if (!perm.allowed) return hpacDeniedResponse("participa:template", "delete");

        await deleteTemplate(id, session.user.organizationId);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
