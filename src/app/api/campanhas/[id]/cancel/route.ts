import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { CampanhaService } from "@/lib/campanhas/campanha-service";
import { checkPermission } from "@/lib/hub-permissions";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const orgId = session.user.organizationId;

        const perm = await checkPermission(
            session.user.id,
            orgId,
            'premio:campanha',
            'update'
        );

        if (!perm.allowed) {
            return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
        }

        await CampanhaService.cancelarCampanha(id, orgId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
