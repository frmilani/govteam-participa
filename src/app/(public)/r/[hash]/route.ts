import { NextRequest, NextResponse } from "next/server";
import { TrackingLinkService } from "@/lib/tracking/tracking-link-service";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;

  try {
    // 1. Buscar o link de tracking
    const link = await TrackingLinkService.getValidLink(hash);

    if (!link) {
      return NextResponse.redirect(new URL("/404", req.url));
    }

    // 2. Registrar visualização se ainda não foi registrado (apenas para links de campanha)
    if (link.type === 'campaign' && (link as any).visualizadoEm === null) {
      await prisma.$transaction([
        prisma.trackingLink.update({
          where: { id: (link as any).id },
          data: {
            visualizadoEm: new Date(),
            status: (link as any).status === "NAO_ENVIADO" || (link as any).status === "ENVIADO" ? "VISUALIZADO" : undefined,
          },
        }),
        prisma.campanha.update({
          where: { id: (link as any).campanhaId },
          data: {
            totalVisualizados: { increment: 1 },
          },
        }),
      ]);
    }

    // 3. Redirecionar para a página de votação
    return NextResponse.redirect(new URL(`/vote/${hash}`, req.url));
  } catch (error) {
    console.error("[TRACKING_REDIRECT_ERROR]", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
