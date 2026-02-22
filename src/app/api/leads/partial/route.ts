import { NextRequest, NextResponse } from "next/server";
import { LeadService } from "@/lib/leads/lead-service";
import { LuckyNumberService } from "@/lib/sorteios/lucky-number-service";
import { z } from "zod";
import { OrigemLead } from "@prisma/client";
import { isValidCPF } from "@/lib/utils";

const partialLeadSchema = z.object({
    organizationId: z.string().min(1, "Organization ID is required"),
    nome: z.string().min(1, "Nome é obrigatório"),
    whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
    cpf: z.string().optional().nullable(),
    email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
    instagram: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = partialLeadSchema.parse(body);

        // Limpar CPF e garantir null se vazio
        const cleanCpf = validatedData.cpf ? validatedData.cpf.replace(/\D/g, "") : null;
        const normalizedCpf = cleanCpf && cleanCpf.length > 0 ? cleanCpf : null;

        // Validar CPF se presente
        if (normalizedCpf && !isValidCPF(normalizedCpf)) {
            return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
        }

        const lead = await LeadService.upsertLeadPartial(
            validatedData.organizationId,
            {
                nome: validatedData.nome,
                whatsapp: validatedData.whatsapp,
                cpf: normalizedCpf,
                email: (validatedData.email && validatedData.email.trim() !== "") ? validatedData.email : null,
                instagram: validatedData.instagram,
                origem: OrigemLead.FORMULARIO_WEB,
            }
        );

        return NextResponse.json({
            id: lead.id,
            nome: lead.nome,
            whatsapp: lead.whatsapp,
            cupons: lead.cupons,
            statusVerificacao: lead.statusVerificacao,
        });
    } catch (error: any) {
        console.error("[API_LEADS_PARTIAL_POST]", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 });
        }

        // Friendlier check for unique constraint
        if (error.message?.includes('Unique constraint failed')) {
            if (error.message?.includes('cpf')) {
                return NextResponse.json({ error: "Este CPF já está cadastrado em nossa base." }, { status: 400 });
            }
            return NextResponse.json({ error: "Este cadastro já existe." }, { status: 400 });
        }

        return NextResponse.json({ error: "Erro ao processar identificação. Tente novamente." }, { status: 400 });
    }
}
