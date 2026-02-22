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

        const activeInstance = instance;

        // 1. Verificar se já temos o token (instância criada)
        let token = activeInstance.token;

        if (!token) {
            try {
                if (!activeInstance.number) {
                    throw new Error("Número da instância não configurado");
                }
                const cleanNumber = activeInstance.number.replace(/\D/g, '');
                const instanceIdPrefix = `${activeInstance.organizationId}-${cleanNumber}`;

                console.log(`[UazAPI] TOKEN AUSENTE. VERIFICANDO NA LISTA DA API COM PREFIXO ${instanceIdPrefix}...`);

                const remoteInstances = await UazApiService.listInstances();
                const existing = remoteInstances.find((inst: any) => inst.name.startsWith(instanceIdPrefix));

                if (existing) {
                    console.log(`[UazAPI] INSTÂNCIA ENCONTRADA NA LISTA: ${existing.name}`);
                    token = existing.token;

                    // Atualizar no banco com a info encontrada
                    await prisma.whatsappInstance.update({
                        where: { id },
                        data: {
                            token,
                            instanceId: existing.name
                        }
                    });
                } else {
                    console.log(`[UazAPI] INSTÂNCIA NÃO ENCONTRADA. CRIANDO NOVA COM NOME ${instanceIdPrefix}...`);
                    const createRes = await UazApiService.createInstance(instanceIdPrefix);
                    token = createRes.token || createRes.instance?.token;

                    if (!token) {
                        throw new Error("API não retornou token de instância");
                    }

                    // Atualizar token e ID final no banco
                    await prisma.whatsappInstance.update({
                        where: { id },
                        data: {
                            token,
                            instanceId: createRes.instance?.name || instanceIdPrefix
                        }
                    });
                }
            } catch (createError: any) {
                console.error("Erro ao gerenciar instância:", createError.message);
                return NextResponse.json({
                    error: "Falha ao sincronizar com UazAPI",
                    details: createError.message
                }, { status: 500 });
            }
        }

        if (!token) {
            return NextResponse.json({ error: "Token de instância inválido" }, { status: 500 });
        }

        // 2. Solicitar QR Code (Connect)
        let qrcode = null;
        try {
            const connectResponse = await UazApiService.connectInstance(token);
            // Verify where the qrcode is in the response.
            // Usually base64, qrcode, or similar.
            qrcode = connectResponse.base64 || connectResponse.qrcode || connectResponse.code;
        } catch (connectError: any) {
            console.error("Erro ao solicitar QR Code:", connectError.message);
            return NextResponse.json({
                error: "Falha ao gerar QR Code",
                details: connectError.response?.data?.message || connectError.message
            }, { status: 500 });
        }

        // 3. Atualizar status e QR Code no banco
        const updated = await prisma.whatsappInstance.update({
            where: { id },
            data: {
                status: 'CONNECTING',
                qrcode: qrcode,
                token: token // ensure token is saved if not before
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
