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
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `https://${host}` : "https://participa.govteam.com.br");
      return NextResponse.redirect(new URL("/404", baseUrl));
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

    // 3. Reconstruir a base URL para não vazar 0.0.0.0 do contêiner Docker
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl && host) {
      const protocol = req.headers.get("x-forwarded-proto") || "https";
      baseUrl = `${protocol}://${host}`;
    }

    if (!baseUrl) {
      baseUrl = "https://participa.govteam.com.br"; // fallback seguro final
    }

    // 4. Redirecionar para a página de votação
    return NextResponse.redirect(new URL(`/vote/${hash}`, baseUrl));
  } catch (error) {
    console.error("[TRACKING_REDIRECT_ERROR]", error);

    // Tratamento de Erro Seguro Reconstruindo a Base
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `https://${host}` : "https://participa.govteam.com.br");

    return NextResponse.redirect(new URL("/", baseUrl));
  }
}
