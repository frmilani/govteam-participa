import { NextRequest, NextResponse } from "next/server";
import { getOrganizationId } from "@/lib/auth-helpers";
import { importEstabelecimentos } from "@/lib/estabelecimentos/estabelecimento-service";
import { z } from "zod";

const importSchema = z.object({
  estabelecimentos: z.array(z.object({
    nome: z.string().min(1),
    segmentoIds: z.array(z.string()).min(1),
    descricao: z.string().optional(),
    endereco: z.string().optional(),
    telefone: z.string().optional(),
    whatsapp: z.string().optional(),
    website: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
  })).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const organizationId = await getOrganizationId();
    const body = await req.json();
    
    const validatedData = importSchema.parse(body);
    const results = await importEstabelecimentos(validatedData.estabelecimentos, organizationId);
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("[API_ESTABELECIMENTOS_IMPORT]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados de importação inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
