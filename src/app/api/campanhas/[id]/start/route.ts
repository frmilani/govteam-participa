import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { CampanhaService } from "@/lib/campanhas/campanha-service";

/**
 * POST /api/campanhas/[id]/start
 * Inicia o disparo de uma campanha
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const orgId = session.user.organizationId;

    // 1. Iniciar Campanha (Adiciona na fila BullMQ e altera status)
    await CampanhaService.iniciarCampanha(id, orgId);

    return NextResponse.json({ success: true, message: "Campanha enviada para fila de processamento" });
  } catch (error: any) {
    console.error("[API_CAMPANHA_START]", error);
    return NextResponse.json({ error: error.message || "Erro ao iniciar campanha" }, { status: 500 });
  }
}
