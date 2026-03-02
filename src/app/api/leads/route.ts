import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LeadService } from "@/lib/leads/lead-service";
import { z } from "zod";
import { Sexo, VerificacaoStatus } from "@prisma/client";
import { checkPermission, applyFieldMaskToArray, narrowUnitScope, getActiveUnitFromRequest, hpacDeniedResponse } from "@/lib/hub-permissions";

const leadSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal("")),
  sexo: z.nativeEnum(Sexo).nullable().optional(),
  telefone: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
  tipoPessoa: z.enum(['FISICA', 'JURIDICA']).optional().default('FISICA'),
  cpf: z.string().nullable().optional(),
  cnpj: z.string().nullable().optional(),
  unitId: z.string().nullable().optional(),
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
      'participa:lead',
      'read'
    );

    if (!perm.allowed) {
      return hpacDeniedResponse('participa:lead', 'read');
    }

    const { searchParams } = new URL(req.url);
    const filters = {
      search: searchParams.get("search") || undefined,
      tagIds: searchParams.get("tagIds")?.split(",") || undefined,
      status: (searchParams.get("status") as VerificacaoStatus) || undefined,
      optOut: searchParams.get("optOut") === "true" ? true : searchParams.get("optOut") === "false" ? false : undefined,
      unitScope: narrowUnitScope(perm.unitScope, getActiveUnitFromRequest(req)),
    };

    const leads = await LeadService.getLeads(session.user.organizationId, filters);

    // HPAC: apply field mask (e.g. hide cpf, email for restricted roles)
    const masked = applyFieldMaskToArray(leads as any[], perm.fieldMask);
    return NextResponse.json(masked);
  } catch (error: any) {
    console.error("[API_LEADS_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // HPAC: check create permission
    const perm = await checkPermission(
      session.user.id,
      session.user.organizationId,
      'participa:lead',
      'create'
    );

    if (!perm.allowed) {
      return hpacDeniedResponse('participa:lead', 'create');
    }

    const body = await req.json();
    const validatedData = leadSchema.parse(body);

    // Contexto de unidade
    const activeUnitId = getActiveUnitFromRequest(req) || session.user.unit_id;

    const lead = await LeadService.createLead(
      session.user.organizationId,
      {
        ...validatedData,
        email: validatedData.email || null,
        tipoPessoa: validatedData.tipoPessoa,
        cpf: validatedData.cpf,
        cnpj: validatedData.cnpj,
        unitId: validatedData.unitId || activeUnitId,
      }
    );

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error("[API_LEADS_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
