import { NextRequest, NextResponse } from "next/server";
import { getOrganizationId } from "@/lib/auth-helpers";
import { getSegmentos, createSegmento } from "@/lib/segmentos/segmento-service";
import { z } from "zod";
import { checkPermission, applyFieldMaskToArray, hpacDeniedResponse } from "@/lib/hub-permissions";
import { auth } from "@/auth";

const createSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  paiId: z.string().transform(val => val === "" ? null : val).pipe(z.string().cuid().nullable()).optional(),
  cor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida").optional(),
  icone: z.string().optional(),
  templateQualidadeId: z.string().nullable().optional().transform(val => val === "" ? null : val),
}).strict();

export async function GET(req: NextRequest) {
  try {
    const organizationId = await getOrganizationId();
    const session = (await auth()) as any;

    // HPAC: check read permission (soft — don't block on failure)
    let perm: any = { allowed: true, fieldMask: null };
    try {
      perm = await checkPermission(
        session?.user?.id,
        organizationId,
        'participa:segmento',
        'read'
      );
      if (!perm.allowed) {
        return hpacDeniedResponse('participa:segmento', 'read');
      }
    } catch (hpacError: any) {
      console.warn("[API_SEGMENTOS_GET] HPAC check failed, allowing read:", hpacError?.message);
      // Allow read on HPAC failure — segmentos are org-scoped config data
    }

    const { searchParams } = new URL(req.url);
    const onlyPopulated = searchParams.get("onlyPopulated") === "true";

    const segmentos = await getSegmentos(organizationId, onlyPopulated);

    return NextResponse.json(applyFieldMaskToArray(segmentos as any[], perm.fieldMask));
  } catch (error: any) {
    console.error("[API_SEGMENTOS_GET] ERRO:", error);
    if (error?.response?.data) console.error("[API_SEGMENTOS_GET] Response Data:", error.response.data);
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
      'participa:segmento',
      'create'
    );
    if (!perm.allowed) {
      return hpacDeniedResponse('participa:segmento', 'create');
    }

    console.log("[API_SEGMENTOS_POST] organizationId:", organizationId);
    const body = await req.json();
    console.log("[API_SEGMENTOS_POST] Body recebido:", body);

    const validatedData = createSchema.parse(body);
    console.log("[API_SEGMENTOS_POST] Dados validados:", validatedData);

    const segmento = await createSegmento(validatedData, organizationId);
    console.log("[API_SEGMENTOS_POST] Segmento criado:", segmento.id);

    return NextResponse.json(segmento, { status: 201 });
  } catch (error: any) {
    console.error("[API_SEGMENTOS_POST] ERRO:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
