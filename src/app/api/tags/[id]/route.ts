import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { TagService } from "@/lib/leads/tag-service";
import { z } from "zod";

const updateTagSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  cor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida").optional(),
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
    const validatedData = updateTagSchema.parse(body);

    const tag = await TagService.updateTag(
      id,
      session.user.organizationId,
      validatedData
    );

    return NextResponse.json(tag);
  } catch (error: any) {
    console.error("[API_TAGS_ID_PUT]", error);
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

    await TagService.deleteTag(id, session.user.organizationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API_TAGS_ID_DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
