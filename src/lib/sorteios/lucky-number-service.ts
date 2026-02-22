import { prisma } from "../prisma";

export class LuckyNumberService {
    /**
     * Atribui números da sorte a um lead para uma determinada enquete.
     * Os números são gerados sequencialmente com base nos cupons do lead.
     */
    async assignLuckyNumbers(enqueteId: string, leadId: string) {
        // 1. Verificar se a enquete usa números da sorte
        const enquete = await prisma.enquete.findUnique({
            where: { id: enqueteId },
            select: { usarNumerosSorte: true, digitosNumerosSorte: true }
        }) as any;

        if (!enquete?.usarNumerosSorte) return [];

        // 2. Obter a quantidade de cupons do lead
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            select: { cupons: true }
        });

        if (!lead || lead.cupons <= 0) return [];

        // 3. Verificar quantos números o lead já possui para esta enquete
        const existingNumbers = await (prisma as any).numeroSorte.findMany({
            where: { enqueteId, leadId },
            orderBy: { numero: 'asc' }
        });

        const needed = lead.cupons - existingNumbers.length;
        if (needed <= 0) return existingNumbers;

        // 4. Gerar novos números sequenciais dentro de uma transação para evitar duplicatas
        const newNumbers: number[] = [];

        await prisma.$transaction(async (tx) => {
            // Obter o último número gerado para esta enquete
            const lastAssignment = await (tx as any).numeroSorte.findFirst({
                where: { enqueteId },
                orderBy: { numero: 'desc' },
                select: { numero: true }
            });

            let nextNumber = (lastAssignment?.numero || 0) + 1;

            for (let i = 0; i < needed; i++) {
                // Validar limite de dígitos
                const maxNumber = enquete.digitosNumerosSorte === 4 ? 9999 : 99999;
                if (nextNumber > maxNumber) {
                    console.error(`[LuckyNumberService] Limite de números atingido para a enquete ${enqueteId}`);
                    break;
                }

                await (tx as any).numeroSorte.create({
                    data: {
                        enqueteId,
                        leadId,
                        numero: nextNumber
                    }
                });
                newNumbers.push(nextNumber);
                nextNumber++;
            }
        });

        return [...existingNumbers.map((n: any) => n.numero), ...newNumbers];
    }

    /**
     * Obtém os números da sorte de um lead para uma enquete.
     */
    static async getLeadNumbers(enqueteId: string, leadId: string) {
        const numbers = await (prisma as any).numeroSorte.findMany({
            where: { enqueteId, leadId },
            orderBy: { numero: 'asc' },
            select: { numero: true }
        });
        return numbers.map((n: any) => n.numero);
    }

    /**
     * Formata o número da sorte com zeros à esquerda
     */
    static formatNumber(num: number, digits: number = 5): string {
        return num.toString().padStart(digits, '0');
    }
}
