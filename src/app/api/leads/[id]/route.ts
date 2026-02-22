import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LeadService } from "@/lib/leads/lead-service";
import { z } from "zod";
import { Sexo } from "@prisma/client";

const updateLeadSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório").optional(),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal("")),
  sexo: z.nativeEnum(Sexo).nullable().optional(),
  telefone: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
  optOut: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateLeadSchema.parse(body);

    const lead = await LeadService.updateLead(
      id,
      session.user.organizationId,
      {
        ...validatedData,
        email: validatedData.email || null,
      }
    );

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error("[API_LEADS_ID_PUT]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await LeadService.deleteLead(id, session.user.organizationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API_LEADS_ID_DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
