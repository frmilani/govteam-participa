
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Dumping ALL Enquete Details (JSON) ---');
    const enquetes = await prisma.enquete.findMany({
        include: {
            _count: {
                select: { respostas: true }
            }
        }
    });

    console.log(JSON.stringify(enquetes.map(e => ({
        id: e.id,
        orgId: e.organizationId,
        titulo: e.titulo,
        status: e.status,
        formPublicId: e.formPublicId,
        hubFormId: e.hubFormId,
        dataInicio: e.dataInicio?.toISOString(),
        respostas: e._count.respostas
    })), null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
