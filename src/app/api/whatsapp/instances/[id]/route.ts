import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UazApiService } from "@/lib/whatsapp/uazapi-service";

export async function DELETE(
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

        // 1. Tentar deletar na UazAPI se tiver token
        if (instance.token) {
            try {
                await UazApiService.deleteInstance(instance.token);
            } catch (error: any) {
                console.error("Erro ao deletar na UazAPI (continuando):", error.message);
                // Continuamos para deletar do banco mesmo se a API falhar (ex: instância já sumiu de lá)
            }
        }

        // 2. Deletar do banco de dados
        await prisma.whatsappInstance.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Erro ao deletar instância:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
