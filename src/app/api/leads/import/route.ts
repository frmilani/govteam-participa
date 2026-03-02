import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LeadService } from "@/lib/leads/lead-service";
import { z } from "zod";

const importLeadSchema = z.object({
  leads: z.array(
    z.object({
      nome: z.string().min(1),
      whatsapp: z.string().min(1),
      email: z.string().email().nullable().optional().or(z.literal("")),
      sexo: z.enum(["M", "F", "OUTRO", "NAO_INFORMAR"]).nullable().optional(),
      telefone: z.string().nullable().optional(),
      facebook: z.string().nullable().optional(),
      instagram: z.string().nullable().optional(),
      tagIds: z.array(z.string()).optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = importLeadSchema.parse(body);

    const results = {
      created: 0,
      errors: [] as string[],
    };

    const unitId = (await import("@/lib/hub-permissions")).getActiveUnitFromRequest(req) || session.user.unit_id;

    for (const leadData of validatedData.leads) {
      try {
        await LeadService.createLead(session.user.organizationId, {
          ...leadData,
          email: leadData.email || null,
          origem: "IMPORTACAO" as any,
          unitId: unitId,
        });
        results.created++;
      } catch (error: any) {
        results.errors.push(`${leadData.nome}: ${error.message}`);
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("[API_LEADS_IMPORT_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
