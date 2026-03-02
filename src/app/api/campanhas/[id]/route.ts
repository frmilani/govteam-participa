import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { CampanhaService } from "@/lib/campanhas/campanha-service";
import { checkPermission, buildUnitScopeWhere, hpacDeniedResponse } from "@/lib/hub-permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/campanhas/[id]
 * Busca detalhes de uma campanha específica
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const orgId = session.user.organizationId;

        // HPAC: check read permission
        const perm = await checkPermission(
            session.user.id,
            orgId,
            'participa:campanha',
            'read'
        );

        if (!perm.allowed) {
            return hpacDeniedResponse('participa:campanha', 'read');
        }

        // Correção de escopo: permitir unitId null (global) para usuários com unitScope
        const unitScopeFilter = perm.unitScope && perm.unitScope.length > 0
            ? { OR: [{ unitId: { in: perm.unitScope } }, { unitId: null }] }
            : {};

        const hasAccess = await prisma.campanha.findFirst({
            where: { id, organizationId: orgId, ...unitScopeFilter },
            select: { id: true }
        });
        if (!hasAccess) return NextResponse.json({ error: "Campanha não encontrada ou acesso restrito." }, { status: 404 });

        const campanha = await CampanhaService.getCampanhaById(id, orgId);
        if (!campanha) {
            return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
        }

        return NextResponse.json(campanha);
    } catch (error: any) {
        console.error("[API_CAMPANHA_DETAIL_GET]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/campanhas/[id]
 * Atualiza uma campanha
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const orgId = session.user.organizationId;

        // HPAC: check update permission
        const perm = await checkPermission(
            session.user.id,
            orgId,
            'participa:campanha',
            'update'
        );

        if (!perm.allowed) {
            return hpacDeniedResponse('participa:campanha', 'update');
        }

        const unitScopeFilter = perm.unitScope && perm.unitScope.length > 0
            ? { OR: [{ unitId: { in: perm.unitScope } }, { unitId: null }] }
            : {};

        const hasAccess = await prisma.campanha.findFirst({
            where: { id, organizationId: orgId, ...unitScopeFilter },
            select: { id: true }
        });
        if (!hasAccess) return NextResponse.json({ error: "Campanha não encontrada ou acesso restrito." }, { status: 404 });

        const body = await req.json();

        // AC: 4 - Validação de segmentação via Zod
        const segmentacaoSchema = z.object({
            tipo: z.enum(['todos', 'grupoCategoria', 'individual']),
            grupoIds: z.array(z.string().cuid()).optional(),
            pesoDistribuicao: z.record(z.string(), z.number().min(0).max(100)).optional(),
        }).refine(data => {
            if (data.pesoDistribuicao) {
                const total = Object.values(data.pesoDistribuicao).reduce((a, b) => a + b, 0);
                return total === 100;
            }
            return true;
        }, { message: "Soma dos pesos deve ser 100%" });

        const requestSchema = z.object({
            nome: z.string().min(1, "Nome é obrigatório").optional(),
            enqueteId: z.string().cuid().optional(),
            mensagens: z.any().optional(), // Pode ser string legado ou array completo, validados no service
            agendadoPara: z.string().datetime().nullable().optional(),
            intervaloMin: z.number().min(1).optional(),
            intervaloMax: z.number().min(1).optional(),
            provider: z.string().optional(),
            instances: z.array(z.object({ instanceId: z.string(), weight: z.number() })).optional(),
            segmentacao: segmentacaoSchema.optional().nullable(),
        });

        const validation = requestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Dados inválidos", details: validation.error.format() }, { status: 400 });
        }

        const campanha = await CampanhaService.updateCampanha(id, orgId, validation.data);

        return NextResponse.json(campanha);
    } catch (error: any) {
        console.error("[API_CAMPANHA_UPDATE]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/campanhas/[id]
 * Exclui uma campanha
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const orgId = session.user.organizationId;

        // HPAC: check delete permission
        const perm = await checkPermission(
            session.user.id,
            orgId,
            'participa:campanha',
            'delete'
        );

        if (!perm.allowed) {
            return hpacDeniedResponse('participa:campanha', 'delete');
        }

        const unitScopeFilter = perm.unitScope && perm.unitScope.length > 0
            ? { OR: [{ unitId: { in: perm.unitScope } }, { unitId: null }] }
            : {};

        const hasAccess = await prisma.campanha.findFirst({
            where: { id, organizationId: orgId, ...unitScopeFilter },
            select: { id: true }
        });
        if (!hasAccess) return NextResponse.json({ error: "Campanha não encontrada ou acesso restrito." }, { status: 404 });

        await CampanhaService.deleteCampanha(id, orgId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API_CAMPANHA_DELETE]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
