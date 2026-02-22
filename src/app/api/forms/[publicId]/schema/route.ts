import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { HubApiService } from "@/lib/hub-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Embora seja uma API pública do Hub, o Spoke pode querer restringir quem pode buscar schemas
    // Para simplificar agora, permitiremos que qualquer usuário autenticado busque.
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { publicId } = await params;
    const schema = await HubApiService.getFormSchema(publicId);

    return NextResponse.json(schema);
  } catch (error: any) {
    const { publicId } = await params;
    console.error(`[API_FORMS_SCHEMA_GET] Error fetching schema for ${publicId}:`, error);

    if (error.message === "Formulário não encontrado no Hub") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: error.message || "Erro interno ao buscar schema" }, { status: 500 });
  }
}
