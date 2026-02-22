import { NextRequest, NextResponse } from "next/server";
import { getEngagementMetrics, getEnqueteFunnel } from "@/lib/analytics/analytics-service";
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
    const searchParams = req.nextUrl.searchParams;
    const range = (searchParams.get("range") as any) || "30D";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const startDate = from ? new Date(from) : undefined;
    const endDate = to ? new Date(to) : undefined;

    try {
        const [funnel, engagement] = await Promise.all([
            getEnqueteFunnel(id, range, startDate, endDate),
            getEngagementMetrics(id, range, startDate, endDate),
        ]);

        return NextResponse.json({
            funnel,
            engagement,
        });
    } catch (error) {
        console.error("Erro ao buscar analytics:", error);
        return NextResponse.json(
            { error: "Erro ao processar dados de analytics" },
            { status: 500 }
        );
    }
}
