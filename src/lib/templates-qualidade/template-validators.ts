import { z } from "zod";

export const perguntaQualidadeSchema = z.object({
    id: z.string().optional(),
    texto: z.string().min(1, "Texto da pergunta é obrigatório"),
    tipo: z.enum(["rating-5", "rating-10", "likert", "sim-nao", "texto"]),
    obrigatorio: z.boolean().default(false),
    opcoes: z.array(z.string()).nullable().optional(),
    ordem: z.number().default(0),
}).superRefine((data, ctx) => {
    if (data.tipo === "likert" && (!data.opcoes || data.opcoes.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Opções são obrigatórias para perguntas do tipo Likert",
            path: ["opcoes"]
        });
    }
});

export const templateQualidadeSchema = z.object({
    nome: z.string().min(1, "Nome do template é obrigatório"),
    perguntas: z.array(perguntaQualidadeSchema).min(1, "Pelo menos uma pergunta é exigida no template"),
});

export type PerguntaQualidadeFormData = z.infer<typeof perguntaQualidadeSchema>;
export type TemplateQualidadeFormData = z.infer<typeof templateQualidadeSchema>;
