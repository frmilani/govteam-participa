import { z } from "zod";
import { ModoAcesso } from "@prisma/client";

export const enqueteFormSchema = z.object({
    titulo: z.string().min(1, "Título é obrigatório"),
    descricao: z.string().optional(),
    tipoPesquisa: z.string().min(1, "Tipo de pesquisa é obrigatório"),
    formPublicId: z.string().min(1, "Public ID do formulário é obrigatório"),
    modoAcesso: z.nativeEnum(ModoAcesso),
    configVisual: z.object({
        primaryColor: z.string(),
        logoUrl: z.string().optional(),
        bannerUrl: z.string().optional(),
        template: z.string(),
    }),
    paginaAgradecimento: z.object({
        titulo: z.string(),
        mensagem: z.string(),
        showShareButtons: z.boolean(),
    }),
    linkExpiracaoDias: z.number().int().min(1).optional(),
    dataInicio: z.string().optional().nullable(),
    dataFim: z.string().optional().nullable(),
    segmentoIds: z.array(z.string()).optional(),
    estabelecimentoIds: z.array(z.string()).optional(),
    // E2.2: Campos da nova aba Pesquisa
    modoColeta: z.string().default("recall-assistido"),
    incluirQualidade: z.boolean().default(false),
    modoDistribuicao: z.string().default("grupo"),
    minCategoriasPorEleitor: z.number().nullable().optional(),
    maxCategoriasPorEleitor: z.number().nullable().optional(),
    randomizarOpcoes: z.boolean().default(true),
    configPesquisa: z.record(z.string(), z.any()).nullable().optional(),
    securityLevel: z.enum(["NONE", "HIGH"]),
    minCompleteness: z.number().int().min(0).max(100),
    exigirIdentificacao: z.boolean(),
    exigirCpf: z.boolean(),
    usarNumerosSorte: z.boolean(),
    digitosNumerosSorte: z.number().int().min(4).max(5),
    usarPremiacao: z.boolean(),
    quantidadePremiados: z.number().int().min(0),
    configPremiacao: z.array(z.object({ level: z.number().int(), description: z.string() })),
    premiacaoStatus: z.enum(["EM_CONFERENCIA", "PUBLICADO", "CANCELADO"]),
    regulamento: z.string().optional().nullable(),
    politicaPrivacidade: z.string().optional().nullable(),
    termosLgpd: z.string().optional().nullable(),
    resultadosStatus: z.enum(["EM_CONFERENCIA", "PUBLICADO", "CANCELADO"]),
    configResultados: z.object({
        exibirVotos: z.boolean(),
        exibirPercentual: z.boolean(),
    }),
});

export type EnqueteFormData = z.infer<typeof enqueteFormSchema>;
