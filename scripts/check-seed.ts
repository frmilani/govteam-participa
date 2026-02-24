import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
    const [total, valid, suspicious, invalid] = await Promise.all([
        p.resposta.count(),
        p.resposta.count({ where: { status: 'VALID' } }),
        p.resposta.count({ where: { status: 'SUSPICIOUS' } }),
        p.resposta.count({ where: { status: 'INVALID' } }),
    ]);
    console.log(`\n📊 VOTOS: Total=${total} | VALID=${valid} | SUSPICIOUS=${suspicious} | INVALID=${invalid}`);

    // Velocity bots
    const bots = await p.resposta.findMany({
        where: { tempoRespostaSegundos: { lt: 5, gt: 0 } },
        select: { leadId: true, ipAddress: true, tempoRespostaSegundos: true, status: true },
        take: 5,
    });
    console.log('\n🤖 Velocity Bots (< 5s):');
    bots.forEach(b => console.log(`  lead=${b.leadId?.split('-').pop()} ip=${b.ipAddress} tempo=${b.tempoRespostaSegundos}s status=${b.status}`));

    // IP Flood
    const flood = await p.resposta.groupBy({
        by: ['ipAddress'],
        _count: { ipAddress: true },
        having: { ipAddress: { _count: { gt: 5 } } },
        orderBy: { _count: { ipAddress: 'desc' } },
    });
    console.log('\n🌊 IP Flood (>5 votos):');
    flood.forEach(f => console.log(`  ip=${f.ipAddress} votos=${f._count.ipAddress}`));

    // Leads with CPF
    const leads = await p.lead.count({ where: { cpf: { not: null } } });
    const totalLeads = await p.lead.count();
    const numSorte = await p.numeroSorte.count();
    console.log(`\n👤 Leads: ${totalLeads} total | ${leads} com CPF`);
    console.log(`🎟️  NumeroSorte: ${numSorte} registros`);
}
main().finally(() => p.$disconnect());
