import { prisma } from "@/lib/prisma";
import { UazApiService } from "./uazapi-service";
import { InstanceStatus } from "@prisma/client";

export class WhatsappInstanceService {

    /**
     * Lista todas as instâncias de uma organização
     */
    static async listInstances(organizationId: string) {
        return await prisma.whatsappInstance.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Cria uma nova instância no banco de dados e tenta iniciar na UazAPI
     */
    static async createInstance(organizationId: string, name: string, number: string) {
        // 1. Gera um ID único para a instância na API (ex: orgId_timestamp)
        const instanceId = `${organizationId}_${Date.now()}`;

        // 2. Salva no banco de dados
        const instance = await prisma.whatsappInstance.create({
            data: {
                organizationId,
                name,
                number,
                instanceId,
                status: 'DISCONNECTED'
            }
        });

        return instance;
    }

    /**
     * Solicita conexão (QR Code) para uma instância
     */
    static async connectInstance(id: string, organizationId: string) {
        const instance = await prisma.whatsappInstance.findUnique({
            where: { id, organizationId }
        });

        if (!instance) throw new Error("Instância não encontrada");

        // 1. Tenta criar a instância na UazAPI (idempotente se já existir ou tratamos erro)
        try {
            await UazApiService.createInstance(instance.instanceId);
        } catch (e: any) {
            // Ignora erro se já existir duplicação, ou refina tratamento
            console.log("Instância já deve existir ou erro na criação", e.message);
        }

        // 2. Solicita o QR Code
        const connectionData = await UazApiService.connectInstance(instance.instanceId);

        // 3. Atualiza o status e salva o QR Code no banco (opcional, ou retorna direto)
        // O QR Code geralmente vem em base64 no campo "qrcode" ou "base64"
        const qrcode = connectionData.base64 || connectionData.qrcode;

        await prisma.whatsappInstance.update({
            where: { id },
            data: {
                status: 'CONNECTING',
                qrcode: qrcode
            }
        });

        return { qrcode };
    }

    /**
     * Sincroniza o status da instância com a API
     */
    static async syncInstanceStatus(id: string, organizationId: string) {
        const instance = await prisma.whatsappInstance.findUnique({
            where: { id, organizationId }
        });

        if (!instance) throw new Error("Instância não encontrada");

        const stateData = await UazApiService.getConnectionState(instance.instanceId);
        const apiState = stateData?.instance?.state; // 'open', 'close', 'connecting'

        let newStatus: InstanceStatus = 'DISCONNECTED';
        if (apiState === 'open') newStatus = 'CONNECTED';
        else if (apiState === 'connecting') newStatus = 'CONNECTING';

        // Se mudou, atualiza
        if (instance.status !== newStatus) {
            await prisma.whatsappInstance.update({
                where: { id },
                data: { status: newStatus }
            });
        }

        return { status: newStatus, rawState: apiState };
    }

    /**
     * Remove uma instância
     */
    static async deleteInstance(id: string, organizationId: string) {
        const instance = await prisma.whatsappInstance.findUnique({
            where: { id, organizationId }
        });

        if (!instance) throw new Error("Instância não encontrada");

        // 1. Tenta remover na API
        try {
            await UazApiService.deleteInstance(instance.instanceId);
        } catch (e) {
            console.error("Erro ao remover na API", e);
        }

        // 2. Remove do banco
        await prisma.whatsappInstance.delete({
            where: { id }
        });
    }
}
