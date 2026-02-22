import { NextRequest, NextResponse } from "next/server";
import { RankingsService } from "@/lib/resultados/rankings-service";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const segmentos = await RankingsService.getSegmentosComVotos(id);

    const rankings = await Promise.all(
      segmentos.map(async (seg) => {
        const ranking = await RankingsService.getRankingBySegmento(id, seg.id);
        return {
          ...seg,
          ranking
        };
      })
    );

    return NextResponse.json(rankings);
  } catch (error) {
    console.error("Erro ao buscar rankings:", error);
    return NextResponse.json(
      { error: "Erro ao processar rankings" },
      { status: 500 }
    );
  }
}
