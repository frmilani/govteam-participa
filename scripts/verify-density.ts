import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
    const samples = await p.resposta.findMany({
        take: 5,
        orderBy: { respondidoEm: 'desc' },
        include: { _count: { select: { votos: true } } }
    });

    console.log('\n🔍 Verificando Densidade dos Votos (Amostras):');
    samples.forEach(s => {
        console.log(`- Voto ID: ${s.id.slice(-6)} | Conclusão: ${s.percentualConclusao}% | Escolhas: ${s._count.votos}`);
    });

    const stats = await p.resposta.aggregate({
        _avg: { percentualConclusao: true },
        _min: { percentualConclusao: true },
        _max: { percentualConclusao: true },
    });
    console.log('\n📊 Estatísticas de Conclusão:');
    console.log(`- Média: ${Math.round(stats._avg.percentualConclusao || 0)}%`);
    console.log(`- Mín: ${stats._min.percentualConclusao}% | Máx: ${stats._max.percentualConclusao}%`);
}
main().finally(() => p.$disconnect());
