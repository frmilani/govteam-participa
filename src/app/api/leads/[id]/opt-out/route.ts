import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LeadService } from "@/lib/leads/lead-service";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const lead = await LeadService.updateLead(
      id,
      session.user.organizationId,
      { optOut: true }
    );

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error("[API_LEADS_ID_OPT_OUT_PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
