import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Verifying Premio Destaque DB ---');

    // Check Segments
    const segments = await prisma.segmento.count({ where: { organizationId: 'org-acieo-01' } });
    console.log(`Segments (ACIEO): ${segments}`);

    // Check Establishments
    const establishments = await prisma.estabelecimento.count({ where: { organizationId: 'org-acieo-01' } });
    console.log(`Establishments (ACIEO): ${establishments}`);

    // Check Polls
    const polls = await prisma.enquete.count({ where: { organizationId: 'org-acieo-01' } });
    console.log(`Polls (ACIEO): ${polls}`);

    // Check Leads
    const leads = await prisma.lead.count({ where: { organizationId: 'org-acieo-01' } });
    console.log(`Leads (ACIEO): ${leads}`);

    // Check Votes
    // Depending on schema, votes might be Resposta or VotoEstabelecimento
    // seed-poc.ts creates Resposta and VotoEstabelecimento
    const votes = await prisma.votoEstabelecimento.count();
    console.log(`Votes (Total): ${votes}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
