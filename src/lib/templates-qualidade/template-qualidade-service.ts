import { prisma } from "@/lib/prisma";
import { TemplateQualidadeFormData } from "./template-validators";

export async function getTemplates(organizationId: string) {
    return prisma.templateQualidade.findMany({
        where: { organizationId },
        include: {
            _count: {
                select: { perguntas: true }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });
}

export async function getTemplateById(id: string, organizationId: string) {
    return prisma.templateQualidade.findUnique({
        where: { id, organizationId },
        include: {
            perguntas: {
                orderBy: { ordem: 'asc' }
            }
        }
    });
}

export async function createTemplate(organizationId: string, data: TemplateQualidadeFormData) {
    return prisma.templateQualidade.create({
        data: {
            organizationId,
            nome: data.nome,
            perguntas: {
                create: data.perguntas.map((p, index) => ({
                    texto: p.texto,
                    tipo: p.tipo,
                    obrigatorio: p.obrigatorio,
                    opcoes: p.opcoes || undefined,
                    ordem: index
                }))
            }
        },
        include: { perguntas: true }
    });
}

export async function updateTemplate(id: string, organizationId: string, data: TemplateQualidadeFormData) {
    return prisma.$transaction(async (tx) => {
        // Find existing to ensure ownership
        const existing = await tx.templateQualidade.findUnique({
            where: { id, organizationId }
        });

        if (!existing) throw new Error("Template not found or access denied");

        // Delete old relations
        await tx.perguntaQualidade.deleteMany({
            where: { templateQualidadeId: id }
        });

        // Update template and recreate relations
        return tx.templateQualidade.update({
            where: { id },
            data: {
                nome: data.nome,
                perguntas: {
                    create: data.perguntas.map((p, index) => ({
                        texto: p.texto,
                        tipo: p.tipo,
                        obrigatorio: p.obrigatorio,
                        opcoes: p.opcoes || undefined,
                        ordem: index
                    }))
                }
            },
            include: { perguntas: true }
        });
    });
}

export async function deleteTemplate(id: string, organizationId: string) {
    // Delete cascade will handle questions automatically via Prisma schema
    return prisma.templateQualidade.delete({
        where: { id, organizationId }
    });
}

export async function duplicateTemplate(id: string, organizationId: string) {
    const existing: any = await getTemplateById(id, organizationId);
    if (!existing) throw new Error("Template not found");

    return prisma.templateQualidade.create({
        data: {
            organizationId,
            nome: `${existing.nome} (Cópia)`,
            perguntas: {
                create: existing.perguntas.map((p: any, index: number) => ({
                    texto: p.texto,
                    tipo: p.tipo,
                    obrigatorio: p.obrigatorio,
                    opcoes: p.opcoes ? JSON.parse(JSON.stringify(p.opcoes)) : undefined,
                    ordem: index
                }))
            }
        },
        include: { perguntas: true }
    });
}
