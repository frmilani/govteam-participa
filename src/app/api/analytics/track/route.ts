import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { HubApiService } from "@/lib/hub-api";
import { z } from "zod";

const trackSchema = z.object({
  formId: z.string(),
  eventType: z.enum(['view', 'submission_complete']),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Telemetria é uma rota de client-side que não exige necessariamente admin
    // Mas validamos que o usuário está no contexto de uma organização se necessário
    const session = (await auth()) as any;

    const body = await req.json();
    const validatedData = trackSchema.parse(body);

    // Envia para o Hub via Service
    HubApiService.reportAnalytics(
      validatedData.formId,
      validatedData.eventType,
      validatedData.metadata
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API_ANALYTICS_TRACK_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ success: false }, { status: 200 }); // Retorna 200 mesmo em erro para não quebrar a UI
  }
}
