import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/hub-permissions";
import { auth } from "@/auth";
import { resolverTemplate } from "@/lib/templates-qualidade/resolver";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const perm = await checkPermission(session.user.id, session.user.organizationId, "participa:enquete", "read");
        if (!perm.allowed) {
            return NextResponse.json({ error: "Permissão insuficiente" }, { status: 403 });
        }

        const enqueteId = id;

        // Fetch the enquete with its segments explicitly structured if Enquete->Segmentos is joined
        const enquete = await prisma.enquete.findUnique({
            where: { id: enqueteId, organizationId: session.user.organizationId },
            include: {
                segmentos: {
                    include: {
                        pai: true,
                        filhos: true,
                        templateQualidade: true,
                    },
                    orderBy: {
                        ordem: 'asc'
                    }
                }
            }
        });

        if (!enquete) {
            return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 });
        }

        const segmentsWithQualityTree = await Promise.all(enquete.segmentos.map(async (segmento) => {
            const resolved = await resolverTemplate(segmento.id, session.user.organizationId);

            return {
                id: segmento.id,
                nome: segmento.nome,
                paiId: segmento.paiId,
                pai: segmento.pai ? { nome: segmento.pai.nome } : null,
                templateQualidadeId: segmento.templateQualidadeId,
                templateQualidade: segmento.templateQualidade
                    ? { id: segmento.templateQualidade.id, nome: segmento.templateQualidade.nome }
                    : null,
                resolvedTemplate: resolved
                    ? { id: resolved.id, nome: resolved.nome, herdadoDe: resolved.herdadoDe ?? null }
                    : null,
            };
        }));

        return NextResponse.json(segmentsWithQualityTree);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
