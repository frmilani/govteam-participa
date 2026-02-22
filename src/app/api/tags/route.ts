import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { TagService } from "@/lib/leads/tag-service";
import { z } from "zod";

const tagSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida").default("#4F46E5"),
});

export async function GET() {
  try {
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const tags = await TagService.getTags(session.user.organizationId);
    return NextResponse.json(tags);
  } catch (error: any) {
    console.error("[API_TAGS_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = tagSchema.parse(body);

    const tag = await TagService.createTag(
      session.user.organizationId,
      validatedData
    );

    return NextResponse.json(tag);
  } catch (error: any) {
    console.error("[API_TAGS_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
