import { NextRequest, NextResponse } from "next/server";
import { TrackingLinkService } from "@/lib/tracking/tracking-link-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;


    const link = await TrackingLinkService.getValidLink(hash);


    if (!link) {

      return NextResponse.json({ error: "Link inválido ou não encontrado" }, { status: 404 });
    }

    if (link.isExpired) {

      return NextResponse.json({ error: "Este link de votação expirou" }, { status: 410 });
    }

    // Registra a visualização
    await TrackingLinkService.trackView(hash);

    return NextResponse.json(link);
  } catch (error: any) {
    console.error("[API_TRACKING_VALIDATE_GET]", error);
    return NextResponse.json({ error: "Erro ao validar link" }, { status: 500 });
  }
}
