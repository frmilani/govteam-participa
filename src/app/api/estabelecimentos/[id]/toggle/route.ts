import { NextRequest, NextResponse } from "next/server";
import { getOrganizationId } from "@/lib/auth-helpers";
import { toggleEstabelecimento } from "@/lib/estabelecimentos/estabelecimento-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = await getOrganizationId();
    const { id } = await params;
    
    const estabelecimento = await toggleEstabelecimento(id, organizationId);
    return NextResponse.json(estabelecimento);
  } catch (error: any) {
    console.error("[API_ESTABELECIMENTO_TOGGLE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
