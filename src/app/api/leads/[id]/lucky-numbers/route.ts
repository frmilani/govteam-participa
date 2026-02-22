import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LuckyNumberService } from '@/lib/sorteios/lucky-number-service';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: leadId } = await params;
        const { searchParams } = new URL(req.url);
        const enqueteId = searchParams.get('enqueteId');

        if (!enqueteId) {
            return NextResponse.json({ error: 'ID da enquete é obrigatório' }, { status: 400 });
        }

        const numbers = await LuckyNumberService.getLeadNumbers(enqueteId, leadId);

        // Formatar os números para exibição
        const enquete = await prisma.enquete.findUnique({
            where: { id: enqueteId },
            select: { digitosNumerosSorte: true }
        });

        const formattedNumbers = numbers.map((num: number) =>
            LuckyNumberService.formatNumber(num, enquete?.digitosNumerosSorte || 5)
        );

        return NextResponse.json({ numbers: formattedNumbers });
    } catch (error: any) {
        console.error('[API Lucky Numbers] Erro:', error);
        return NextResponse.json({ error: 'Erro interno ao buscar números da sorte' }, { status: 500 });
    }
}
