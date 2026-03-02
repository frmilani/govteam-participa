import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { CampanhaService } from "@/lib/campanhas/campanha-service";
import { CampanhaStatus } from "@prisma/client";
import { z } from "zod";
import { checkPermission, applyFieldMaskToArray, hpacDeniedResponse } from "@/lib/hub-permissions";

const messageSchema = z.object({
  type: z.enum(['text', 'image', 'audio', 'video', 'menu', 'interactive']),
  content: z.string().optional(),
  mediaUrl: z.string().optional(),
  delayAfter: z.number().int().min(0).default(0),
  options: z.any().optional(),
});

const multiTemplateSchema = z.object({
  type: z.literal('multi-template'),
  templates: z.array(z.object({
    messages: z.array(messageSchema)
  }))
});

const createCampanhaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  enqueteId: z.string().min(1, "Enquete é obrigatória"),
  mensagens: z.union([z.array(messageSchema), multiTemplateSchema]),
  segmentacao: z.object({
    tagIds: z.array(z.string()).default([])
  }),
  intervaloMin: z.number().int().min(1).default(5),
  intervaloMax: z.number().int().min(1).default(15),
  agendadoPara: z.string().datetime().optional().or(z.string().optional()),
  provider: z.string().default("EVOLUTION"),
  instances: z.array(z.object({
    instanceId: z.string(),
    weight: z.number().min(1).max(100)
  })).optional(),
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
      'participa:campanha',
      'read'
    );

    if (!perm.allowed) {
      return hpacDeniedResponse('participa:campanha', 'read');
    }

    const { searchParams } = new URL(req.url);
    const filters = {
      status: (searchParams.get("status") as CampanhaStatus) || undefined,
      search: searchParams.get("search") || undefined,
    };

    const campanhas = await CampanhaService.getCampanhas(session.user.organizationId, filters);
    return NextResponse.json(applyFieldMaskToArray(campanhas as any[], perm.fieldMask));
  } catch (error: any) {
    console.error("[API_CAMPANHAS_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id || session.user.sub || session.user.uid || (session.user as any).email;
    if (!userId) {
      return NextResponse.json({ error: "ID do usuário não encontrado" }, { status: 401 });
    }

    // HPAC: check create permission
    const perm = await checkPermission(
      userId,
      session.user.organizationId,
      'participa:campanha',
      'create'
    );

    if (!perm.allowed) {
      return hpacDeniedResponse('participa:campanha', 'create');
    }

    const body = await req.json();
    const validatedData = createCampanhaSchema.parse(body);

    const campanha = await CampanhaService.createCampanha(
      session.user.organizationId,
      userId,
      validatedData
    );

    return NextResponse.json(campanha);
  } catch (error: any) {
    console.error("[API_CAMPANHAS_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
