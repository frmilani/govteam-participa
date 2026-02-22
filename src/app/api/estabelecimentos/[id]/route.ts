import { NextRequest, NextResponse } from "next/server";
import { getOrganizationId } from "@/lib/auth-helpers";
import { updateEstabelecimento, getEstabelecimento } from "@/lib/estabelecimentos/estabelecimento-service";
import { z } from "zod";
// E1.4: Validators centralizados para TipoEntidade
import { tipoEntidadeSchema, metadadosSchema } from "@/lib/estabelecimentos/estabelecimento-validators";

const updateSchema = z.object({
  nome: z.string().min(1).optional(),
  logoUrl: z.preprocess((val) => val === '' ? null : val, z.string().url().nullable().optional()),
  descricao: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  website: z.preprocess((val) => val === '' ? null : val, z.string().url().nullable().optional()),
  instagram: z.string().nullable().optional(),
  facebook: z.preprocess((val) => val === '' ? null : val, z.string().url().nullable().optional()),
  alias: z.string().nullable().optional(),
  segmentoIds: z.array(z.string()).optional(),
  ativo: z.boolean().optional(),
  // E1.4 (AC: 4, 5, 6): validação estrita via validators centralizados
  tipo: tipoEntidadeSchema,
  metadados: metadadosSchema,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = await getOrganizationId();
    const { id } = await params;

    const estabelecimento = await getEstabelecimento(id, organizationId);
    return NextResponse.json(estabelecimento);
  } catch (error: any) {
    console.error("[API_ESTABELECIMENTO_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = await getOrganizationId();
    const { id } = await params;
    const body = await req.json();

    const validatedData = updateSchema.parse(body);
    const estabelecimento = await updateEstabelecimento(id, validatedData, organizationId);

    return NextResponse.json(estabelecimento);
  } catch (error: any) {
    console.error("[API_ESTABELECIMENTO_PUT]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
