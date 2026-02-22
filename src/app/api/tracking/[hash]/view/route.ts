import { NextRequest, NextResponse } from "next/server";
import { HubApiService } from "@/lib/hub-api";
import { TrackingLinkService } from "@/lib/tracking/tracking-link-service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
    try {
        const { hash } = await params;

        // Buscar a enquete vinculada a este hash/ID
        const link = await TrackingLinkService.getValidLink(hash);

        if (link && link.campanha?.enquete?.formPublicId) {
            // Registrar no Hub
            await HubApiService.reportAnalytics(link.campanha.enquete.formPublicId, 'view');

            // Se for um link de campanha, registrar visualização local também
            if (link.type === 'campaign') {
                await TrackingLinkService.trackView(hash);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[VIEW_TELEMETRY_ERROR]", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
