import { NextRequest, NextResponse } from "next/server";
import { getOrganizationId } from "@/lib/auth-helpers";
import { getEstabelecimentos, createEstabelecimento } from "@/lib/estabelecimentos/estabelecimento-service";
import { z } from "zod";
import { checkPermission, applyFieldMaskToArray, hpacDeniedResponse } from "@/lib/hub-permissions";
import { auth } from "@/auth";
import { validateHubRequest, getOrganizationIdFromHeader } from "@/lib/hub-auth";
// E1.4: Validators centralizados para TipoEntidade
import { tipoEntidadeSchema, metadadosSchema, TIPO_ENTIDADE_VALUES } from "@/lib/estabelecimentos/estabelecimento-validators";

const createSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  logoUrl: z.string().optional().nullable().transform(val => {
    if (!val || val === '') return null;
    return z.string().url().parse(val);
  }),
  descricao: z.string().optional().nullable().transform(val => val || null),
  endereco: z.string().optional().nullable().transform(val => val || null),
  telefone: z.string().optional().nullable().transform(val => val || null),
  whatsapp: z.string().optional().nullable().transform(val => val || null),
  website: z.string().optional().nullable().transform(val => {
    if (!val || val === '') return null;
    return z.string().url().parse(val);
  }),
  instagram: z.string().optional().nullable().transform(val => val || null),
  facebook: z.string().optional().nullable().transform(val => {
    if (!val || val === '') return null;
    return z.string().url().parse(val);
  }),
  alias: z.string().optional().nullable().transform(val => val || null),
  segmentoIds: z.array(z.string()).min(1, "Selecione pelo menos um segmento"),
  // E1.4 (AC: 5, 6): Validação estrita de tipo e metadados
  tipo: tipoEntidadeSchema,
  metadados: metadadosSchema,
});

export async function GET(req: NextRequest) {
  try {
    // Try session auth first, then fall back to spoke API key auth
    let organizationId: string | null = null;
    let permResult: any = null;

    try {
      organizationId = await getOrganizationId();
      const session = (await auth()) as any;

      // HPAC: check read permission
      permResult = await checkPermission(
        session?.user?.id,
        organizationId,
        'participa:estabelecimento',
        'read'
      );
    } catch {
      // Session auth failed — try spoke API key auth
    }

    // Fallback: spoke-to-spoke API key auth
    if (!organizationId || !permResult) {
      console.log("[API_ESTABELECIMENTOS] Session auth failed or missing. Checking fallback methods...");

      const isHub = validateHubRequest(req);
      console.log(`[API_ESTABELECIMENTOS] Hub validation result: ${isHub}`);

      if (isHub) {
        organizationId = getOrganizationIdFromHeader(req);
        if (!organizationId) {
          console.error("[API_ESTABELECIMENTOS] Hub request missing x-organization-id");
          return NextResponse.json({ error: "x-organization-id header required" }, { status: 400 });
        }
        // Spoke auth grants full read access
        permResult = { allowed: true, fieldMask: null };
        console.log(`[API_ESTABELECIMENTOS] Hub auth success for org: ${organizationId}`);
      } else {
        // PUBLIC ACCESS CHECK (For Voting Forms)
        // If no session and no API key, check if organizationId is in query params
        // This allows public forms to fetch establishments
        const publicOrgId = req.nextUrl.searchParams.get("organizationId");

        console.log(`[API_ESTABELECIMENTOS] Public check. Method: ${req.method}, OrgId Param: ${publicOrgId}`);

        if (publicOrgId && req.method === 'GET') {
          organizationId = publicOrgId;
          // Grant read access for public data
          permResult = { allowed: true, fieldMask: null };
          console.log(`[API_ESTABELECIMENTOS] Public access granted for org: ${organizationId}`);
        } else {
          console.log("[API_ESTABELECIMENTOS] Unauthorized public access attempt. Returning 401.");
          return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }
      }
    }

    if (!permResult?.allowed) {
      return hpacDeniedResponse('participa:estabelecimento', 'read');
    }

    const { searchParams } = new URL(req.url);

    // E1.4 (AC: 1, 2, 5): Validar filtro tipo se informado
    const tipoParam = searchParams.get("tipo") || undefined;
    if (tipoParam && !(TIPO_ENTIDADE_VALUES as readonly string[]).includes(tipoParam)) {
      return NextResponse.json(
        { error: `Tipo inválido: '${tipoParam}'. Valores aceitos: ${TIPO_ENTIDADE_VALUES.join(', ')}` },
        { status: 400 }
      );
    }

    const filters = {
      segmentoId: searchParams.get("segmentoId") || undefined,
      ativo: searchParams.get("ativo") === "true" ? true : searchParams.get("ativo") === "false" ? false : undefined,
      search: searchParams.get("search") || undefined,
      // E1.4 (AC: 1, 2, 9): Filtro validado por tipo
      tipo: tipoParam,
    };

    if (!organizationId) throw new Error("Organization ID missing");

    const estabelecimentos = await getEstabelecimentos(organizationId, filters);
    const maskedData = applyFieldMaskToArray(estabelecimentos as any[], permResult.fieldMask);
    return NextResponse.json(maskedData);
  } catch (error: any) {
    console.error("[API_ESTABELECIMENTOS_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const organizationId = await getOrganizationId();
    const session = (await auth()) as any;

    // HPAC: check create permission
    const perm = await checkPermission(
      session?.user?.id,
      organizationId,
      'participa:estabelecimento',
      'create'
    );
    if (!perm.allowed) {
      return hpacDeniedResponse('participa:estabelecimento', 'create');
    }

    const body = await req.json();

    const validatedData = createSchema.parse(body);
    const estabelecimento = await createEstabelecimento(validatedData, organizationId);

    return NextResponse.json(estabelecimento, { status: 201 });
  } catch (error: any) {
    console.error("[API_ESTABELECIMENTOS_POST]", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.flatten());
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
