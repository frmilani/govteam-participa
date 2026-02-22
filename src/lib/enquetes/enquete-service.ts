import { prisma } from "@/lib/prisma";
import { EnqueteStatus, Prisma, ModoAcesso, SecurityLevel } from "@prisma/client";

// Redefining since prisma generate is failing with EPERM
export type ResultadosStatus = "EM_CONFERENCIA" | "PUBLICADO" | "CANCELADO";
import { HubApiService } from "../hub-api";

export interface EnqueteFilters {
  status?: EnqueteStatus;
  search?: string;
  unitScope?: string[] | null;
}

export class EnqueteService {
  /**
   * Lista enquetes de uma organização com filtros
   */
  static async getEnquetes(organizationId: string, filters: EnqueteFilters = {}) {
    const { status, search, unitScope } = filters;

    // HPAC: build unit scope filter
    const unitWhere = unitScope ? { unitId: { in: unitScope } } : {};

    return await prisma.enquete.findMany({
      where: {
        organizationId,
        status,
        titulo: search ? { contains: search, mode: 'insensitive' } : undefined,
        ...unitWhere,
      },
      include: {
        segmentos: true,
        estabelecimentos: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  /**
   * Busca uma enquete por ID
   */
  static async getEnqueteById(id: string, organizationId: string) {
    return await prisma.enquete.findFirst({
      where: { id, organizationId },
      include: {
        segmentos: true,
        estabelecimentos: true,
      }
    });
  }

  /**
   * Cria uma nova enquete validando o formulário no Hub
   */
  static async createEnquete(
    organizationId: string,
    userId: string,
    data: {
      titulo: string;
      descricao?: string;
      formPublicId: string;
      unitId?: string;
      modoAcesso: ModoAcesso;
      configVisual: any;
      paginaAgradecimento: any;
      linkExpiracaoDias?: number;
      dataInicio?: string | null;
      dataFim?: string | null;
      segmentoIds?: string[];
      estabelecimentoIds?: string[];
      securityLevel?: SecurityLevel;
      minCompleteness?: number;
      exigirIdentificacao?: boolean;
      exigirCpf?: boolean;
      usarNumerosSorte?: boolean;
      digitosNumerosSorte?: number;
      usarPremiacao?: boolean;
      quantidadePremiados?: number;
      configPremiacao?: any;
      premiacaoStatus?: ResultadosStatus;
      regulamento?: string | null;
      politicaPrivacidade?: string | null;
      termosLgpd?: string | null;
      resultadosStatus?: ResultadosStatus;
      configResultados?: any;
    }

  ) {
    // 1. Validar se o formulário existe no Hub e obter o ID interno
    const hubSchema = await HubApiService.getFormSchema(data.formPublicId);

    // 2. Criar no banco
    return await prisma.enquete.create({
      data: {
        organizationId,
        unitId: data.unitId || null,
        titulo: data.titulo,
        descricao: data.descricao,
        formPublicId: data.formPublicId,
        modoAcesso: data.modoAcesso || "HIBRIDO",
        hubFormId: hubSchema.id, // Armazenamos o ID interno do Hub
        configVisual: data.configVisual as Prisma.InputJsonValue,
        paginaAgradecimento: data.paginaAgradecimento as Prisma.InputJsonValue,
        linkExpiracaoDias: data.linkExpiracaoDias || 30,
        criadoPor: userId,
        status: "RASCUNHO",
        dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
        segmentos: {
          connect: data.segmentoIds?.map(id => ({ id })) || []
        },
        estabelecimentos: {
          connect: data.estabelecimentoIds?.map(id => ({ id })) || []
        },
        securityLevel: data.securityLevel || "NONE",
        minCompleteness: data.minCompleteness || 70,
        exigirIdentificacao: data.exigirIdentificacao !== undefined ? data.exigirIdentificacao : true,
        exigirCpf: data.exigirCpf !== undefined ? data.exigirCpf : false,
        usarNumerosSorte: data.usarNumerosSorte || false,
        digitosNumerosSorte: data.digitosNumerosSorte || 5,
        usarPremiacao: data.usarPremiacao || false,
        quantidadePremiados: data.quantidadePremiados || 0,
        configPremiacao: data.configPremiacao as Prisma.InputJsonValue || [],
        premiacaoStatus: data.premiacaoStatus || "EM_CONFERENCIA",
        regulamento: data.regulamento,
        politicaPrivacidade: data.politicaPrivacidade,
        termosLgpd: data.termosLgpd,
        resultadosStatus: data.resultadosStatus || "EM_CONFERENCIA",
        configResultados: data.configResultados as Prisma.InputJsonValue || { exibirVotos: true, exibirPercentual: true },
      },

    });
  }

  /**
   * Atualiza uma enquete existente
   */
  static async updateEnquete(
    id: string,
    organizationId: string,
    data: Partial<{
      titulo: string;
      descricao: string;
      formPublicId: string;
      modoAcesso: ModoAcesso;
      configVisual: any;
      paginaAgradecimento: any;
      linkExpiracaoDias: number;
      status: EnqueteStatus;
      dataInicio: string | null;
      dataFim: string | null;
      segmentoIds: string[];
      estabelecimentoIds: string[];
      securityLevel: SecurityLevel;
      minCompleteness: number;
      exigirIdentificacao: boolean;
      exigirCpf: boolean;
      usarNumerosSorte: boolean;
      digitosNumerosSorte: number;
      usarPremiacao: boolean;
      quantidadePremiados: number;
      configPremiacao: any;
      premiacaoStatus: ResultadosStatus;
      regulamento: string | null;
      politicaPrivacidade: string | null;
      termosLgpd: string | null;
      resultadosStatus: ResultadosStatus;
      configResultados: any;
    }>

  ) {
    const existing = await prisma.enquete.findFirst({
      where: { id, organizationId }
    });

    if (!existing) {
      console.error("[EnqueteService.updateEnquete] Enquete não encontrada para os parâmetros fornecidos:", { id, organizationId });
      throw new Error(`Enquete não encontrada (ID: ${id}, Org: ${organizationId})`);
    }

    const updateData: any = { ...data };

    // Se o formulário mudou, precisamos atualizar o hubFormId interno e validar no Hub
    if (data.formPublicId && data.formPublicId !== existing.formPublicId) {
      try {
        const hubSchema = await HubApiService.getFormSchema(data.formPublicId);
        updateData.hubFormId = hubSchema.id;
      } catch (error: any) {
        console.error("[EnqueteService.updateEnquete] Falha ao validar formulário no Hub:", error.message);
        // Opcional: Impedir a atualização se o formulário for inválido
        // throw new Error(`Formulário inválido ou inacessível no Hub: ${error.message}`);
      }
    }

    // Converter datas para Date objects se presentes
    if (data.dataInicio !== undefined) {
      updateData.dataInicio = data.dataInicio ? new Date(data.dataInicio) : null;
    }
    if (data.dataFim !== undefined) {
      updateData.dataFim = data.dataFim ? new Date(data.dataFim) : null;
    }

    if (data.segmentoIds !== undefined) {
      updateData.segmentos = {
        set: data.segmentoIds.map(id => ({ id }))
      };
      delete updateData.segmentoIds;
    }

    if (data.estabelecimentoIds !== undefined) {
      updateData.estabelecimentos = {
        set: data.estabelecimentoIds.map(id => ({ id }))
      };
      delete updateData.estabelecimentoIds;
    }

    // Se estiver publicando agora, define a data de publicação
    if (data.status === "PUBLICADA") {
      updateData.publicadoEm = new Date();
    }

    // Se estiver encerrando agora, define a data de encerramento
    if (data.status === "ENCERRADA") {
      updateData.encerramentoEm = new Date();
    }

    console.log("[EnqueteService.updateEnquete] Tentando atualizar enquete:", { id, organizationId });



    return await prisma.enquete.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Exclui uma enquete (apenas se for rascunho ou encerrada e não tiver respostas)
   */
  static async deleteEnquete(id: string, organizationId: string) {
    const enquete = await prisma.enquete.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { respostas: true }
        }
      }
    });

    if (!enquete) throw new Error("Enquete não encontrada");

    const hasResponses = enquete._count.respostas > 0;
    const isDeletableStatus = enquete.status === EnqueteStatus.RASCUNHO || enquete.status === EnqueteStatus.ENCERRADA;

    if (!isDeletableStatus) {
      throw new Error("Apenas enquetes em rascunho ou encerradas podem ser excluídas");
    }

    if (hasResponses) {
      throw new Error("Esta enquete possui respostas e não pode ser excluída para preservar os dados");
    }

    return await prisma.enquete.delete({
      where: { id, organizationId },
    });
  }

  /**
   * Duplica uma enquete existente
   */
  static async duplicateEnquete(id: string, organizationId: string, userId: string) {
    const source = await prisma.enquete.findFirst({
      where: { id, organizationId },
      include: {
        segmentos: true,
        estabelecimentos: true,
      }
    });

    if (!source) throw new Error("Enquete original não encontrada");

    // Prepara dados para a cópia
    const copyData = {
      organizationId,
      unitId: source.unitId,
      titulo: `Cópia de ${source.titulo}`,
      descricao: source.descricao,
      formPublicId: source.formPublicId,
      hubFormId: source.hubFormId,
      modoAcesso: source.modoAcesso,
      configVisual: source.configVisual as Prisma.InputJsonValue,
      paginaAgradecimento: source.paginaAgradecimento as Prisma.InputJsonValue,
      linkExpiracaoDias: source.linkExpiracaoDias,
      criadoPor: userId,
      status: EnqueteStatus.RASCUNHO,
      minCompleteness: source.minCompleteness,
      securityLevel: source.securityLevel,
      exigirIdentificacao: source.exigirIdentificacao,
      exigirCpf: source.exigirCpf,
      resultadosStatus: "EM_CONFERENCIA" as ResultadosStatus, // Reset status
      configResultados: source.configResultados as Prisma.InputJsonValue,
      segmentos: {
        connect: source.segmentos.map(s => ({ id: s.id }))
      },
      estabelecimentos: {
        connect: source.estabelecimentos.map(e => ({ id: e.id }))
      }
    };

    return await prisma.enquete.create({
      data: copyData
    });
  }
}
