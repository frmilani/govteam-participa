import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
type InstanceStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
import { UazApiService } from "@/lib/whatsapp/uazapi-service";

export async function GET(
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
            return NextResponse.json({ status: 'DISCONNECTED', raw: 'NO_TOKEN' });
        }

        const statusResponse = await UazApiService.getConnectionState(instance.token);
        const apiStatus = statusResponse?.instance?.state || statusResponse?.instance?.status; // 'open', 'close', 'connecting'
        const apiQrcode = statusResponse?.instance?.qrcode;

        let newStatus: InstanceStatus = 'DISCONNECTED';
        if (apiStatus === 'open' || apiStatus === 'connected') newStatus = 'CONNECTED';
        else if (apiStatus === 'connecting') newStatus = 'CONNECTING';

        // Atualizar se status ou QR code mudou
        if (instance.status !== newStatus || instance.qrcode !== apiQrcode) {
            await prisma.whatsappInstance.update({
                where: { id },
                data: {
                    status: newStatus,
                    qrcode: apiQrcode
                }
            });
        }

        return NextResponse.json({
            status: newStatus,
            raw: apiStatus,
            qrcode: apiQrcode
        });
    } catch (error: any) {
        console.error("Erro ao verificar status:", error.message);
        return NextResponse.json({ error: "Erro ao verificar status" }, { status: 500 });
    }
}
