import { resolverTemplate } from "./src/lib/templates-qualidade/resolver";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
    console.log("=== Testing Template Hierarchical Resolution ===");

    // We will find a Segmento, update it to have no template and point to a parent that has a template
    const segments = await prisma.segmento.findMany({ take: 2 });
    if (segments.length < 2) {
        console.log("Not enough segments to test hierarchy. Exiting.");
        return;
    }

    const orgId = segments[0].organizationId;
    const parent = segments[0];
    const child = segments[1];

    console.log(`Setting up: Parent [${parent.nome}] and Child [${child.nome}]`);

    // Create a dummy template if not exists
    let template = await (prisma as any).templateQualidade.findFirst({ where: { organizationId: orgId } });
    if (!template) {
        template = await (prisma as any).templateQualidade.create({
            data: {
                nome: "Test Hierarchy Template",
                organizationId: orgId,
            }
        });
    }

    // Set Parent to have Template. Child to not have Template but point to Parent.
    await prisma.segmento.update({
        where: { id: parent.id },
        data: { templateQualidadeId: template.id } as any
    });

    await prisma.segmento.update({
        where: { id: child.id },
        data: { paiId: parent.id, templateQualidadeId: null } as any
    });

    // Test 1: Resolve for Parent
    const resParent = await resolverTemplate(parent.id, orgId);
    console.log(`\nTest 1 (Parent Resolution):`);
    console.log(`Resolved: ${resParent !== null}`);
    if (resParent) {
        console.log(`Herdado: ${resParent.herdado}`);
    }

    // Test 2: Resolve for Child
    const resChild = await resolverTemplate(child.id, orgId);
    console.log(`\nTest 2 (Child Inherited Resolution):`);
    console.log(`Resolved: ${resChild !== null}`);
    if (resChild) {
        console.log(`Herdado: ${resChild.herdado}`);
        console.log(`HerdadoDe: ${resChild.herdadoDe}`);
    }

    console.log("=== DONE ===");
}

run().catch(console.error).finally(() => prisma.$disconnect());
