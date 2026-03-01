import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { EnqueteService } from "@/lib/enquetes/enquete-service";
import { EnqueteStatus, ModoAcesso } from "@prisma/client";
import { z } from "zod";
import { checkPermission, applyFieldMaskToArray, narrowUnitScope, getActiveUnitFromRequest, hpacDeniedResponse } from "@/lib/hub-permissions";

const createEnqueteSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  tipoPesquisa: z.string().optional().default('premiacao'),
  formPublicId: z.string().min(1, "ID do formulário é obrigatório"),
  modoAcesso: z.nativeEnum(ModoAcesso).default(ModoAcesso.HIBRIDO),
  configVisual: z.any(),
  paginaAgradecimento: z.any(),
  linkExpiracaoDias: z.number().int().min(1).optional(),
  dataInicio: z.string().optional().nullable(),
  dataFim: z.string().optional().nullable(),
  segmentoIds: z.array(z.string()).optional(),
  estabelecimentoIds: z.array(z.string()).optional(),
  securityLevel: z.enum(["NONE", "HIGH"]).default("NONE"),
  minCompleteness: z.number().int().min(0).max(100).default(70),
  exigirIdentificacao: z.boolean().default(true),
  exigirCpf: z.boolean().default(false),
  usarNumerosSorte: z.boolean().default(false),
  digitosNumerosSorte: z.number().int().min(4).max(5).default(5),
  usarPremiacao: z.boolean().default(false),
  quantidadePremiados: z.number().int().min(0).default(0),
  configPremiacao: z.array(z.object({ level: z.number().int(), description: z.string() })).optional(),
  premiacaoStatus: z.enum(["EM_CONFERENCIA", "PUBLICADO", "CANCELADO"]).default("EM_CONFERENCIA"),
  regulamento: z.string().optional().nullable(),
  politicaPrivacidade: z.string().optional().nullable(),
  termosLgpd: z.string().optional().nullable(),
  resultadosStatus: z.enum(["EM_CONFERENCIA", "PUBLICADO", "CANCELADO"]).default("EM_CONFERENCIA"),
  configResultados: z.any().optional(),
});



export async function GET(req: NextRequest) {
  try {
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // HPAC: check read permission
    const perm = await checkPermission(
      session.user.id,
      session.user.organizationId,
      'premio:enquete',
      'read'
    );

    if (!perm.allowed) {
      return hpacDeniedResponse('premio:enquete', 'read');
    }

    const { searchParams } = new URL(req.url);
    const filters = {
      status: (searchParams.get("status") as EnqueteStatus) || undefined,
      search: searchParams.get("search") || undefined,
      unitScope: narrowUnitScope(perm.unitScope, getActiveUnitFromRequest(req)),
    };

    const enquetes = await EnqueteService.getEnquetes(session.user.organizationId, filters);

    // HPAC: apply field mask if present
    const masked = applyFieldMaskToArray(enquetes as any[], perm.fieldMask);
    return NextResponse.json(masked);
  } catch (error: any) {
    console.error("[API_ENQUETES_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[API_ENQUETES_POST] Iniciando criação de enquete...");
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      console.warn("[API_ENQUETES_POST] Sessão inválida ou sem organizationId");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    console.log("[API_ENQUETES_POST] Body recebido:", JSON.stringify(body, null, 2));

    const validatedData = createEnqueteSchema.parse(body);
    console.log("[API_ENQUETES_POST] Dados validados com Zod");

    const userId = session.user.id || session.user.sub || session.user.uid || (session.user as any).email;

    console.log("[API_ENQUETES_POST] User Session info:", {
      userId,
      organizationId: session.user.organizationId
    });

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário não encontrado na sessão" }, { status: 401 });
    }

    console.log("[API_ENQUETES_POST] Chamando EnqueteService.createEnquete...");
    // HPAC: check create permission
    const perm = await checkPermission(
      userId,
      session.user.organizationId,
      'premio:enquete',
      'create'
    );

    if (!perm.allowed) {
      return hpacDeniedResponse('premio:enquete', 'create');
    }

    const enquete = await EnqueteService.createEnquete(
      session.user.organizationId,
      userId,
      validatedData
    );

    console.log("[API_ENQUETES_POST] Enquete criada com sucesso:", enquete.id);
    return NextResponse.json(enquete);
  } catch (error: any) {
    console.error("[API_ENQUETES_POST] ERRO FATAL:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
    }
    // Handle Prisma Unique Constraint Violation
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Este formulário já está vinculado a uma enquete existente nesta organização." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 });
  }
}
