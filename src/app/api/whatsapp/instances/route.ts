import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; // Adjust import if needed
import { checkPermission } from "@/lib/hub-permissions";
import { nanoid } from "nanoid";
import { UazApiService } from "@/lib/whatsapp/uazapi-service";

// Mocking the Service usage directly here for now as importing classes might be tricky without barrel files or correct relative paths
// But I will create the separate service file properly.
// Re-using the logic from the previous thought:

export async function GET(req: NextRequest) {
    try {
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }
        const organizationId = session.user.organizationId;

        const instances = await prisma.whatsappInstance.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(instances);
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
        const organizationId = session.user.organizationId;
        const body = await req.json();
        const { name, number } = body;

        const cleanNumber = number.replace(/\D/g, '');
        const instanceIdPrefix = `${organizationId}-${cleanNumber}`;

        // Passo 1: Verificar se já existe na UazAPI (Evitar ocupação de slot desnecessária)
        let token = null;
        let finalInstanceId = null;

        try {
            const remoteInstances = await UazApiService.listInstances();
            // A UazAPI adiciona um sufixo _XYZ. Precisamos comparar o prefixo.
            const existing = remoteInstances.find((inst: any) => inst.name.startsWith(instanceIdPrefix));

            if (existing) {
                console.log(`[UazAPI] REUTILIZANDO INSTÂNCIA EXISTENTE: ${existing.name}`);
                token = existing.token;
                finalInstanceId = existing.name;
            } else {
                console.log(`[UazAPI] NENHUMA INSTÂNCIA ENCONTRADA COM PREFIXO ${instanceIdPrefix}. CRIANDO NOVA.`);
                // Criar na UazAPI
                const createRes = await UazApiService.createInstance(instanceIdPrefix);
                token = createRes.token || createRes.instance?.token;
                finalInstanceId = createRes.instance?.name || instanceIdPrefix;
            }
        } catch (apiError: any) {
            console.error("Erro ao gerenciar instância na UazAPI:", apiError.message);
            return NextResponse.json({
                error: "Falha na comunicação com UazAPI",
                details: apiError.message
            }, { status: 500 });
        }

        const instance = await prisma.whatsappInstance.create({
            data: {
                organizationId,
                name,
                number,
                instanceId: finalInstanceId || instanceIdPrefix,
                token,
                status: 'DISCONNECTED',
            }
        });

        return NextResponse.json(instance);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
