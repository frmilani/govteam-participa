import { prisma } from "@/lib/prisma";
import { TemplateQualidade, PerguntaQualidade } from "@prisma/client";

export type ResolvedTemplate = TemplateQualidade & {
    perguntas: PerguntaQualidade[];
    herdado: boolean;
    herdadoDe?: string;
};

/**
 * Story E3.2: Herança Hierárquica
 * Resolve qual Template de Qualidade deve ser utilizado para um segmento.
 * Caminha para cima na hierarquia administrativa (Filho -> Pai -> Avô) até achar um template.
 * Limita intencionalmente a pesquisa em 3 níveis (depth <= 3) para evitar deadlocks/loops.
 */
export async function resolverTemplate(
    segmentoId: string,
    organizationId: string,
    depth: number = 0
): Promise<ResolvedTemplate | null> {
    // Limitação de profundidade para prevenção de loop
    if (depth >= 3) {
        return null;
    }

    // Faz a busca local do segmento com o possível template associado
    const segmento = await prisma.segmento.findFirst({
        where: {
            id: segmentoId,
            organizationId,
        },
        include: {
            templateQualidade: {
                include: {
                    perguntas: {
                        orderBy: {
                            ordem: 'asc'
                        }
                    }
                }
            }
        },
    }) as any;

    if (!segmento) {
        return null;
    }

    // 1. Se tem template nativo local
    if (segmento.templateQualidade) {
        return {
            ...segmento.templateQualidade,
            herdado: depth > 0,
            ...(depth > 0 && { herdadoDe: segmento.nome })
        };
    }

    // 2. Se NÃO tem template nativo, verificamos se há um paiId
    if (segmento.paiId) {
        const parentResolved = await resolverTemplate(segmento.paiId, organizationId, depth + 1);

        // Se achou no pai (ou no avô), só preservamos a flag "herdado" em repique, mas com o nome do nódulo que detinha
        // Na verdade, a depth layer garante que o primeiro pai a ser "dono" colocará seu nome em `segmento.nome` no depth > 0 base case.
        if (parentResolved) {
            return parentResolved;
        }
    }

    // 3. Se acabou a árvore ou o pai n tem, retorna nulo
    return null;
}
