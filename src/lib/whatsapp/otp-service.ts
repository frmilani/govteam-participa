import { prisma } from "@/lib/prisma";
import { HubApiService } from "@/lib/hub-api";
import { LuckyNumberService } from "@/lib/sorteios/lucky-number-service";
import { WhatsappService } from "./whatsapp-service";
import { VerificacaoStatus } from "@prisma/client";
import { LeadService } from "../leads/lead-service";

export class OtpService {
    /**
     * Generates a 6-digit OTP, saves it to the database, and sends it via WhatsApp
     */
    static async sendOtp(phone: string, organizationId: string) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        const formattedPhone = LeadService.formatWhatsApp(phone);

        // Store in VerificationToken table (identifier is the phone number)
        // We update or create
        await prisma.verificationToken.upsert({
            where: {
                identifier_token: {
                    identifier: formattedPhone,
                    token: code,
                },
            },
            update: {
                expires,
            },
            create: {
                identifier: formattedPhone,
                token: code,
                expires,
            },
        });

        // Send via WhatsApp
        const message = `Seu código de verificação para o Participa é: ${code}. Válido por 5 minutos.`;
        await WhatsappService.sendMessage({
            to: formattedPhone,
            text: message,
        });

        return { success: true };
    }

    /**
     * Verifies an OTP and updates the Lead status and coupons
     */
    static async verifyOtp(phone: string, code: string, organizationId: string) {
        const formattedPhone = LeadService.formatWhatsApp(phone);

        const tokenRecord = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: {
                    identifier: formattedPhone,
                    token: code,
                },
            },
        });

        if (!tokenRecord) {
            throw new Error("Código inválido");
        }

        if (tokenRecord.expires < new Date()) {
            // Clean up expired token
            await prisma.verificationToken.delete({
                where: {
                    identifier_token: {
                        identifier: formattedPhone,
                        token: code,
                    },
                },
            });
            throw new Error("Código expirado");
        }

        // Success! 
        // 1. Clean up the token
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: formattedPhone,
                    token: code,
                },
            },
        });

        // 2. Update Lead status and grant coupons
        const lead = await prisma.lead.findFirst({
            where: { organizationId, whatsapp: formattedPhone },
        });

        if (lead) {
            const newStatus = VerificacaoStatus.VERIFICADO;

            // Recalculate coupons with new status
            const totalCoupons = LeadService.calculateCoupons({
                whatsapp: lead.whatsapp,
                email: lead.email,
                instagram: lead.instagram,
                statusVerificacao: newStatus,
            });

            await prisma.lead.update({
                where: { id: lead.id },
                data: {
                    statusVerificacao: newStatus,
                    cupons: totalCoupons,
                    ultimaInteracao: new Date(),
                },
            });

            // RF-012: Assign Lucky Numbers if needed
            // NOTE: We need to know which Enquete this OTP belongs to. 
            // However, the OTP verify currently doesn't receive enqueteId.
            // We'll rely on the frontend or the final submission to trigger this, 
            // OR we can trigger for ALL active enquetes that the lead is participating in.
            // For now, let's keep it in Submission and Partial Lead where we HAVE the context.
        }

        return { success: true };
    }
}
