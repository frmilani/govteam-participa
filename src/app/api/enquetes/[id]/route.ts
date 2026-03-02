import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { EnqueteService } from "@/lib/enquetes/enquete-service";
import { EnqueteStatus, ModoAcesso } from "@prisma/client";
import { z } from "zod";
import { checkPermission, applyFieldMask, buildUnitScopeWhere, hpacDeniedResponse } from "@/lib/hub-permissions";
import { prisma } from "@/lib/prisma";

const updateEnqueteSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").optional(),
  descricao: z.string().optional(),
  tipoPesquisa: z.string().optional(),
  formPublicId: z.string().min(1, "Public ID do formulário é obrigatório").optional(),
  modoAcesso: z.nativeEnum(ModoAcesso).optional(),
  configVisual: z.any().optional(),
  paginaAgradecimento: z.any().optional(),
  linkExpiracaoDias: z.number().int().min(1).optional(),
  status: z.nativeEnum(EnqueteStatus).optional(),
  dataInicio: z.string().nullable().optional(),
  dataFim: z.string().nullable().optional(),
  segmentoIds: z.array(z.string()).optional(),
  estabelecimentoIds: z.array(z.string()).optional(),
  securityLevel: z.enum(["NONE", "HIGH"]).optional(),
  minCompleteness: z.number().int().min(0).max(100).optional(),
  exigirIdentificacao: z.boolean().optional(),
  exigirCpf: z.boolean().optional(),
  usarNumerosSorte: z.boolean().optional(),
  digitosNumerosSorte: z.number().int().min(4).max(5).optional(),
  usarPremiacao: z.boolean().optional(),
  quantidadePremiados: z.number().int().min(0).optional(),
  configPremiacao: z.array(z.object({ level: z.number().int(), description: z.string() })).optional(),
  premiacaoStatus: z.enum(["EM_CONFERENCIA", "PUBLICADO", "CANCELADO"]).optional(),
  regulamento: z.string().optional().nullable(),
  politicaPrivacidade: z.string().optional().nullable(),
  termosLgpd: z.string().optional().nullable(),
  resultadosStatus: z.enum(["EM_CONFERENCIA", "PUBLICADO", "CANCELADO"]).optional(),
  configResultados: z.any().optional(),
  // E2.2: Campos da aba Pesquisa
  modoColeta: z.string().optional(),
  modoDistribuicao: z.string().optional(),
  incluirQualidade: z.boolean().optional(),
  minCategoriasPorEleitor: z.number().nullable().optional(),
  maxCategoriasPorEleitor: z.number().nullable().optional(),
  randomizarOpcoes: z.boolean().optional(),
  configPesquisa: z.record(z.string(), z.any()).nullable().optional(),
});


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // HPAC: check read permission
    const perm = await checkPermission(
      session.user.id,
      session.user.organizationId,
      'participa:enquete',
      'read',
      { resourceId: id }
    );


    if (!perm.allowed) {
      return hpacDeniedResponse('participa:enquete', 'read');
    }

    const unitWhere = perm.unitScope ? {
      OR: [
        { unitId: { in: perm.unitScope } },
        { unitId: null }
      ]
    } : {};

    const hasAccess = await prisma.enquete.findFirst({
      where: { id, organizationId: session.user.organizationId, ...unitWhere },
      select: { id: true }
    });


    if (!hasAccess) return NextResponse.json({ error: "Enquete não encontrada ou acesso restrito." }, { status: 404 });

    const enquete = await EnqueteService.getEnqueteById(id, session.user.organizationId);

    if (!enquete) {
      return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 });
    }

    // HPAC: apply field mask
    const masked = applyFieldMask(enquete as any, perm.fieldMask);
    return NextResponse.json(masked);
  } catch (error: any) {
    console.error("[API_ENQUETE_ID_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // HPAC: check update permission
    const perm = await checkPermission(
      session.user.id,
      session.user.organizationId,
      'participa:enquete',
      'update',
      { resourceId: id }
    );

    if (!perm.allowed) {
      return hpacDeniedResponse('participa:enquete', 'update');
    }

    const unitWhere = perm.unitScope ? {
      OR: [
        { unitId: { in: perm.unitScope } },
        { unitId: null }
      ]
    } : {};

    const hasAccess = await prisma.enquete.findFirst({
      where: { id, organizationId: session.user.organizationId, ...unitWhere },
      select: { id: true }
    });
    if (!hasAccess) return NextResponse.json({ error: "Enquete não encontrada ou acesso restrito." }, { status: 404 });

    const body = await req.json();
    const validatedData = updateEnqueteSchema.parse(body);

    const enquete = await EnqueteService.updateEnquete(
      id,
      session.user.organizationId,
      validatedData
    );

    return NextResponse.json(enquete);
  } catch (error: any) {
    console.error(`[API_ENQUETE_ID_PUT] Erro ao atualizar enquete ${id}:`, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({
      error: error.message || "Erro interno ao atualizar enquete",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // HPAC: check delete permission
    const perm = await checkPermission(
      session.user.id,
      session.user.organizationId,
      'participa:enquete',
      'delete',
      { resourceId: id }
    );

    if (!perm.allowed) {
      return hpacDeniedResponse('participa:enquete', 'delete');
    }

    const unitWhere = perm.unitScope ? {
      OR: [
        { unitId: { in: perm.unitScope } },
        { unitId: null }
      ]
    } : {};

    const hasAccess = await prisma.enquete.findFirst({
      where: { id, organizationId: session.user.organizationId, ...unitWhere },
      select: { id: true }
    });
    if (!hasAccess) return NextResponse.json({ error: "Enquete não encontrada ou acesso restrito." }, { status: 404 });

    await EnqueteService.deleteEnquete(id, session.user.organizationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API_ENQUETE_ID_DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
