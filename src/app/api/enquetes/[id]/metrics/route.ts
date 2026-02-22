import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { MetricasService } from "@/lib/resultados/metricas-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const metrics = await MetricasService.getEnqueteMetrics(id);
    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error("[API_ENQUETE_METRICS_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
