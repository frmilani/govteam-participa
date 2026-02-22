import { NextRequest, NextResponse } from "next/server";
import { getOrganizationId } from "@/lib/auth-helpers";
import { reorderSegmentos } from "@/lib/segmentos/segmento-service";
import { z } from "zod";

const reorderSchema = z.object({
  updates: z.array(z.object({
    id: z.string().cuid(),
    ordem: z.number().int().min(0),
  })).min(1),
}).strict();

export async function PATCH(req: NextRequest) {
  try {
    const organizationId = await getOrganizationId();
    const body = await req.json();
    
    const { updates } = reorderSchema.parse(body);
    await reorderSegmentos(updates, organizationId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API_SEGMENTOS_REORDER]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados de reordenação inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
