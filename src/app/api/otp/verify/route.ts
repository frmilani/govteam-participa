import { NextRequest, NextResponse } from "next/server";
import { OtpService } from "@/lib/whatsapp/otp-service";
import { z } from "zod";

const verifyOtpSchema = z.object({
    phone: z.string().min(1, "WhatsApp é obrigatório"),
    code: z.string().length(6, "O código deve ter 6 dígitos"),
    organizationId: z.string().min(1, "Organization ID is required"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = verifyOtpSchema.parse(body);

        await OtpService.verifyOtp(validatedData.phone, validatedData.code, validatedData.organizationId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API_OTP_VERIFY_POST]", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
