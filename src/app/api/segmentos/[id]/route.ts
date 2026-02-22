import { NextRequest, NextResponse } from "next/server";
import { getOrganizationId } from "@/lib/auth-helpers";
import { updateSegmento, deleteSegmento } from "@/lib/segmentos/segmento-service";
import { z } from "zod";

const updateSchema = z.object({
  nome: z.string().min(1).optional(),
  paiId: z.string().nullable().optional().transform(val => val === "" ? null : val),
  cor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  icone: z.string().optional(),
  templateQualidadeId: z.string().nullable().optional().transform(val => val === "" ? null : val),
}).strict();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = await getOrganizationId();
    const { id } = await params;
    const body = await req.json();

    const validatedData = updateSchema.parse(body);
    const segmento = await updateSegmento(id, validatedData, organizationId);

    return NextResponse.json(segmento);
  } catch (error: any) {
    console.error("[API_SEGMENTO_PUT]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.format() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = await getOrganizationId();
    const { id } = await params;

    await deleteSegmento(id, organizationId);

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[API_SEGMENTO_DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
