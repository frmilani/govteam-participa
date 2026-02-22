import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UazApiService } from "@/lib/whatsapp/uazapi-service";

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

        const instance = await prisma.whatsappInstance.findUnique({
            where: { id, organizationId: session.user.organizationId }
        });

        if (!instance) {
            return NextResponse.json({ error: "Instância não encontrada" }, { status: 404 });
        }

        if (!instance.token) {
            return NextResponse.json({ error: "Instância não inicializada" }, { status: 400 });
        }

        // 1. Desconectar na UazAPI (Logout + Deletar Slot)
        try {
            // Tenta logout primeiro
            await UazApiService.logoutInstance(instance.token).catch(e => console.warn("Logout error:", e.message));

            // Depois deleta a instância para liberar o slot
            await UazApiService.deleteInstance(instance.token);
        } catch (error: any) {
            console.error("Erro ao limpar instância na UazAPI:", error.message);
            // Mesmo se falhar na API, vamos limpar localmente
        }

        // 2. Atualizar status localmente
        const updated = await prisma.whatsappInstance.update({
            where: { id },
            data: {
                status: 'DISCONNECTED',
                qrcode: null,
                token: null // Resetamos o token para forçar um novo init na próxima conexão
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Erro ao desconectar instância:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
