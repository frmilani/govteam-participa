import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { EnqueteService } from "@/lib/enquetes/enquete-service";

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

        const userId = session.user.id || session.user.sub || session.user.uid || (session.user as any).email;

        if (!id) {
            return NextResponse.json({ error: "ID da enquete é obrigatório" }, { status: 400 });
        }

        const newEnquete = await EnqueteService.duplicateEnquete(
            id,
            session.user.organizationId,
            userId
        );

        return NextResponse.json(newEnquete);
    } catch (error: any) {
        console.error("[API_ENQUETE_DUPLICATE]", error);
        return NextResponse.json({ error: error.message || "Erro ao duplicar enquete" }, { status: 500 });
    }
}
