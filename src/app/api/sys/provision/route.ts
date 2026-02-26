import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Provisioning API for Participa
 * Receives organization activation/update from Hub
 */
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const systemSecret = process.env.HUB_CLIENT_SECRET;

    if (!authHeader || authHeader !== `Bearer ${systemSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { organizationId, isActive } = body;

        if (!organizationId) {
            return NextResponse.json({ error: "Missing organizationId" }, { status: 400 });
        }

        // Provision SpokeConfig
        // In Participa, SpokeConfig tracks DS and plan-level info
        const config = await prisma.spokeConfig.upsert({
            where: { organizationId },
            update: {
                updatedAt: new Date(),
            },
            create: {
                organizationId,
            },
        });

        console.log(`[Provisioning] Participa provisioned for org ${organizationId}. IsActive: ${isActive}`);

        return NextResponse.json({
            success: true,
            configId: config.id
        });

    } catch (error: any) {
        console.error("[PROVISIONING_ERROR]", error);
        return NextResponse.json({
            error: "Failed to provision",
            message: error.message
        }, { status: 500 });
    }
}
