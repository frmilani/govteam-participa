
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const res = await prisma.resposta.findMany({
        orderBy: { respondidoEm: 'desc' },
        take: 5,
        include: {
            lead: true,
            enquete: {
                select: { titulo: true }
            }
        }
    });
    console.log(JSON.stringify(res, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
