import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const res = await prisma.enquete.findMany();
    console.log("ENQUETES COM LOGO DO MINIO:");
    let found = false;
    res.forEach(e => {
        const config = e.configVisual as any;
        const logo = config?.logoUrl || '';
        if (logo.includes('localhost:9000') || logo.includes('logos/')) {
            console.log(`- ID: ${e.id} | Título: ${e.titulo}`);
            console.log(`  Logo: ${logo}`);
            found = true;
        }
    });
    if (!found) console.log("Nenhuma enquete usando MinIO encontrada.");

    console.log("\nESTATÍSTICAS GERAIS:");
    console.log("Total Enquetes:", res.length);
    const withLogo = res.filter(e => (e.configVisual as any)?.logoUrl).length;
    console.log("Com Logo:", withLogo);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
