import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkPermission, hpacDeniedResponse } from "@/lib/hub-permissions";
import { templateQualidadeSchema } from "@/lib/templates-qualidade/template-validators";
import { getTemplates, createTemplate } from "@/lib/templates-qualidade/template-qualidade-service";

export async function GET(req: NextRequest) {
    try {
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const perm = await checkPermission(
            session.user.id,
            session.user.organizationId,
            "premio:template",
            "read"
        );

        if (!perm.allowed) {
            return hpacDeniedResponse("premio:template", "read");
        }

        const templates = await getTemplates(session.user.organizationId);
        return NextResponse.json(templates);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const perm = await checkPermission(
            session.user.id,
            session.user.organizationId,
            "premio:template",
            "create"
        );

        if (!perm.allowed) {
            return hpacDeniedResponse("premio:template", "create");
        }

        const body = await req.json();
        const parsed = templateQualidadeSchema.parse(body);

        const template = await createTemplate(session.user.organizationId, parsed);
        return NextResponse.json(template, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
