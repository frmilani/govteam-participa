import { NextRequest, NextResponse } from "next/server";
import { resolverTemplate } from "@/lib/templates-qualidade/resolver";
import { PrismaClient } from "@prisma/client";
import { checkPermission } from "@/lib/hub-permissions";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = (await auth()) as any;
        const organizationId = session?.user?.organizationId;

        // Pode ser requisitada via painel administrativo (se autenticado, valida se tem org)
        // Se autenticado e buscando template-qualidade do segmento, vamos passar organizationId
        // Porém no frontend cliente 'pesquisa final', a rota talvez devesse ser pública.
        // O PRD diz "Integrar HPAC authorization de leitura simples se requisitado via admin. Público no client."
        // Isso quer dizer que se tiver session, checa permissão. Se não, podemos tentar ver pelas query/headers (Client Auth), 
        // ou liberar baseado em algum token? "Público no client" significa que não vai session.
        // Citação exata (AC6/T2): "Público no client."

        let targetOrgId = organizationId;

        // Se for request público do frontend, deve informar organizationId via query (ex: `?org=xxx`) ou header.
        const searchParams = req.nextUrl.searchParams;
        const queryOrgId = searchParams.get('organizationId');

        if (!session) {
            // Client Público request
            if (!queryOrgId) {
                return NextResponse.json({ error: "Missing organizationId param for public request" }, { status: 400 });
            }
            targetOrgId = queryOrgId;
        } else {
            // Admin requisition (tem sessão)
            if (!organizationId) {
                return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
            }
            // Check HPAC só para admin
            const perm = await checkPermission(session.user.id, organizationId, "participa:template", "read");
            if (!perm.allowed) {
                // Tenta check de enquete/segmento reading (pode não ser de admin global)
                const perm2 = await checkPermission(session.user.id, organizationId, "participa:enquete", "read");
                if (!perm2.allowed) {
                    return NextResponse.json({ error: "Permissão insuficiente" }, { status: 403 });
                }
            }
            targetOrgId = organizationId;
        }

        const templateData = await resolverTemplate(id, targetOrgId);

        if (!templateData) {
            return NextResponse.json({ error: "Nenhum Template Qualidade resolvido para este segmento." }, { status: 404 });
        }

        return NextResponse.json(templateData);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
