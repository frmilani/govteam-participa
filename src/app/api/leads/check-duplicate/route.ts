import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LeadService } from "@/lib/leads/lead-service";

export async function POST(req: NextRequest) {
  try {
    const session = (await auth()) as any;
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { whatsapp, email } = await req.json();
    
    const duplicate = await LeadService.checkDuplicate(
      session.user.organizationId,
      whatsapp ? LeadService.formatWhatsApp(whatsapp) : undefined,
      email
    );

    return NextResponse.json({ duplicate: !!duplicate, lead: duplicate });
  } catch (error: any) {
    console.error("[API_LEADS_CHECK_DUPLICATE_POST]", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
