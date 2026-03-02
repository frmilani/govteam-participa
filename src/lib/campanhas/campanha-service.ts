import { prisma } from "@/lib/prisma";
import { CampanhaStatus, LinkStatus, Prisma } from "@prisma/client";
import { TrackingLinkService } from "../tracking/tracking-link-service";
import { HubApiService } from "../hub-api";
import { campanhaQueue, CampanhaJobData } from "./queue";

export interface CampanhaFilters {
  status?: CampanhaStatus;
  search?: string;
}

export class CampanhaService {
  /**
   * Lista campanhas de uma organização com filtros
   */
  static async getCampanhas(organizationId: string, filters: CampanhaFilters = {}) {
    const { status, search } = filters;

    return await prisma.campanha.findMany({
      where: {
        organizationId,
        status,
        nome: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      include: {
        enquete: {
          select: {
            titulo: true,
            formPublicId: true
          }
        },
        _count: {
          select: {
            trackingLinks: true
          }
        },
        instances: {
          include: {
            instance: {
              select: { name: true, number: true, status: true }
            }
          }
        }
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  /**
   * Busca uma campanha por ID
   */
  static async getCampanhaById(id: string, organizationId: string) {
    return await prisma.campanha.findFirst({
      where: { id, organizationId },
      include: {
        enquete: true,
        trackingLinks: {
          take: 10,
          include: {
            lead: true
          }
        },
        instances: {
          include: { instance: true }
        }
      }
    });
  }

  /**
   * Cria uma nova campanha e gera os tracking links
   */
  static async createCampanha(
    organizationId: string,
    userId: string,
    data: {
      nome: string;
      enqueteId: string;
      mensagens: any;
      segmentacao: any;
      intervaloMin?: number;
      intervaloMax?: number;
      agendadoPara?: string;
      provider?: string;
      instances?: { instanceId: string; weight: number }[];
      strategy?: 'DIRECT' | 'SOFT_BLOCK' | 'OPT_IN';
      initialMessage?: string;
    }
  ) {
    // 1. Buscar leads baseados na segmentação
    const tagIds = data.segmentacao.tagIds || [];
    const leads = await prisma.lead.findMany({
      where: {
        organizationId,
        optOut: false,
        tags: tagIds.length > 0 ? {
          some: {
            tagId: { in: tagIds }
          }
        } : undefined
      }
    });

    if (leads.length === 0) {
      throw new Error("Nenhum lead encontrado para a segmentação escolhida.");
    }

    // 2. Buscar enquete para pegar o formPublicId
    const enquete = await prisma.enquete.findFirst({
      where: { id: data.enqueteId, organizationId }
    });

    if (!enquete) {
      throw new Error("Enquete não encontrada.");
    }

    const agendadoPara = data.agendadoPara ? new Date(data.agendadoPara) : null;
    const isScheduled = agendadoPara && agendadoPara > new Date();

    // 3. Criar a campanha
    const campanha = await prisma.campanha.create({
      data: {
        organizationId,
        nome: data.nome,
        enqueteId: data.enqueteId,
        templateMensagem: "",
        mensagens: {
          ...(typeof data.mensagens === 'object' ? data.mensagens : { template: data.mensagens }),
          strategy: data.strategy || 'DIRECT',
          initialMessage: data.initialMessage
        } as Prisma.InputJsonValue,
        segmentacao: data.segmentacao as Prisma.InputJsonValue,
        agendadoPara,
        intervaloMin: data.intervaloMin || 5,
        intervaloMax: data.intervaloMax || 15,
        provider: data.provider || "EVOLUTION",
        criadoPor: userId,
        status: isScheduled ? CampanhaStatus.AGENDADA : CampanhaStatus.RASCUNHO,
        totalLeads: leads.length,
        instances: {
          create: data.instances?.map((i) => ({
            instanceId: i.instanceId,
            weight: i.weight
          }))
        }
      } as any
    });

    // 4. Gerar Tracking Links para todos os leads
    // Validade padrão de 30 dias vinda da enquete ou default
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + enquete.linkExpiracaoDias);

    await TrackingLinkService.createLinksForCampaign(
      campanha.id,
      leads.map((l: any) => l.id),
      enquete.formPublicId,
      expiraEm
    );

    // 5. Se estiver agendado, adicionar job de disparador no BullMQ
    if (isScheduled) {
      const delay = agendadoPara.getTime() - Date.now();
      await campanhaQueue.add(
        `trigger-campaign-${campanha.id}`,
        { campanhaId: campanha.id, organizationId },
        { delay }
      );
    }

    return campanha;
  }

  /**
   * Atualiza uma campanha
   */
  static async updateCampanha(id: string, organizationId: string, data: any) {
    const campanha = await prisma.campanha.findUnique({
      where: { id, organizationId }
    });

    if (!campanha || (campanha.status !== CampanhaStatus.RASCUNHO && campanha.status !== CampanhaStatus.AGENDADA)) {
      throw new Error("Apenas campanhas em rascunho ou agendadas podem ser editadas");
    }

    const agendadoPara = data.agendadoPara ? new Date(data.agendadoPara) : null;
    const isScheduled = agendadoPara && agendadoPara > new Date();

    const updateData: any = {
      nome: data.nome,
      enqueteId: data.enqueteId,
      mensagens: data.mensagens as Prisma.InputJsonValue,
      segmentacao: data.segmentacao as Prisma.InputJsonValue,
      intervaloMin: data.intervaloMin || 5,
      intervaloMax: data.intervaloMax || 15,
      provider: data.provider || "EVOLUTION",
      agendadoPara,
      status: isScheduled ? CampanhaStatus.AGENDADA : CampanhaStatus.RASCUNHO,
    };

    if (data.instances) {
      updateData.instances = {
        deleteMany: {},
        create: data.instances.map((i: any) => ({
          instanceId: i.instanceId,
          weight: i.weight
        }))
      };
    }

    const updated = await prisma.campanha.update({
      where: { id },
      data: updateData
    });

    // Se mudou o agendamento, idealmente deveríamos cancelar o job anterior e criar um novo
    // Para fins de simplicidade nesta iteração, assumimos que o worker valida o status
    if (isScheduled) {
      const delay = agendadoPara.getTime() - Date.now();
      await campanhaQueue.add(
        `trigger-campaign-${updated.id}`,
        { campanhaId: updated.id, organizationId },
        { delay, jobId: `trigger-${updated.id}` } // jobId para evitar duplicatas se atualizado
      );
    }

    return updated;
  }

  /**
   * Inicia o processamento de uma campanha (Adiciona na fila BullMQ)
   */
  static async iniciarCampanha(campanhaId: string, organizationId: string) {
    console.log(`[CampanhaService] Iniciando ativação da campanha: ${campanhaId}`);

    // 1. Validar limites no Hub
    try {
      const config = await HubApiService.getSpokeConfig(organizationId);
      console.log(`[CampanhaService] Config Hub para ${organizationId}:`, config);
      if (!config.isActive && process.env.NODE_ENV !== 'development') {
        throw new Error("Assinatura inativa no Hub.");
      }
    } catch (e: any) {
      console.warn(`[CampanhaService] Falha ao validar limites no Hub: ${e.message}. Continuando em dev.`);
      if (process.env.NODE_ENV !== 'development') throw e;
    }

    const campanha = await prisma.campanha.findUnique({
      where: { id: campanhaId, organizationId },
      include: {
        trackingLinks: { where: { status: LinkStatus.NAO_ENVIADO }, include: { lead: true } },
        instances: { include: { instance: true } }
      }
    }) as any;

    const totalLeadsCount = await prisma.trackingLink.count({ where: { campanhaId } });
    const pendingLeadsCount = campanha.trackingLinks?.length || 0;

    if (!campanha || (
      campanha.status !== CampanhaStatus.RASCUNHO &&
      campanha.status !== CampanhaStatus.AGENDADA &&
      campanha.status !== CampanhaStatus.PAUSADA
    )) {
      throw new Error("Campanha não disponível para início ou retomada (deve ser Rascunho, Agendada ou Pausada)");
    }

    // 2. Extrair templates com pesos e Estratégia
    const rawMensagens = campanha.mensagens as any;
    const strategy = rawMensagens.strategy || 'DIRECT';
    const initialMessage = rawMensagens.initialMessage;

    let templateVariations: { messages: any[], weight: number }[] = [];

    // Suporte legado e nova estrutura
    if (rawMensagens.templates && Array.isArray(rawMensagens.templates)) {
      // Estrutura nova ou multi-template explícito
      templateVariations = rawMensagens.templates.map((t: any) => ({
        messages: t.messages || [],
        weight: t.weight || 100
      }));
    } else if (rawMensagens.type === 'multi-template' && Array.isArray(rawMensagens.messages)) {
      // Caso legado específico (se houver)
      templateVariations = [{ messages: rawMensagens.messages, weight: 100 }];
    } else if (Array.isArray(rawMensagens)) {
      // Caso legado diretão (array de mensagens)
      templateVariations = [{ messages: rawMensagens, weight: 100 }];
    } else if (rawMensagens.template) {
      // Caso onde encapsulamos o legado no create
      // Se 'template' for string (texto único) ou array
      const msgs = Array.isArray(rawMensagens.template) ? rawMensagens.template : [{ content: rawMensagens.template, type: 'text' }];
      templateVariations = [{ messages: msgs, weight: 100 }];
    }

    // 3. Adicionar links na fila BullMQ com distribuição baseada em peso e delay progressivo
    let currentDelay = 0;
    const totalTemplatesWeight = templateVariations.reduce((sum, t) => sum + (t.weight || 0), 0);
    const totalInstancesWeight = (campanha.instances || []).reduce((sum: number, i: any) => sum + (i.weight || 0), 0);

    const jobs: any[] = campanha.trackingLinks.map((link: any) => {
      const randomInterval = Math.floor(Math.random() * (campanha.intervaloMax - campanha.intervaloMin + 1)) + campanha.intervaloMin;
      const jobDelay = currentDelay;
      currentDelay += randomInterval * 1000;

      // Seleção Amostral por Peso para TEMPLATES
      let messagesForThisLead: any[] = [];
      if (templateVariations.length > 0) {
        let random = Math.random() * totalTemplatesWeight;
        for (const variation of templateVariations) {
          if (random < variation.weight) {
            messagesForThisLead = variation.messages;
            break;
          }
          random -= variation.weight;
        }
        // Fallback for safety
        if (messagesForThisLead.length === 0) messagesForThisLead = templateVariations[0].messages;
      }

      // Seleção Amostral por Peso para INSTÂNCIAS (Balanceamento de Carga)
      let selectedInstanceId = undefined;
      if (campanha.instances && campanha.instances.length > 0) {
        let randomInstance = Math.random() * totalInstancesWeight;
        for (const ci of campanha.instances) {
          if (randomInstance < ci.weight) {
            selectedInstanceId = ci.instance.instanceId;
            break;
          }
          randomInstance -= ci.weight;
        }
        // Fallback
        if (!selectedInstanceId) selectedInstanceId = campanha.instances[0].instance.instanceId;
      }

      return {
        name: `send-${link.id}`,
        data: {
          trackingLinkId: link.id,
          campanhaId: campanha.id,
          mensagens: messagesForThisLead,
          organizationId,
          instanceId: selectedInstanceId,
          strategy,
          initialMessage
        } as CampanhaJobData,
        opts: {
          delay: jobDelay,
          jobId: link.id // Evita duplicados na fila
        }
      };
    });

    console.log(`[CampanhaService] Enfileirando ${jobs.length} disparos no BullMQ...`);
    await campanhaQueue.addBulk(jobs);
    console.log(`[CampanhaService] Jobs adicionados com sucesso.`);

    // 3. Atualizar status e contadores da campanha
    const c = await prisma.campanha.update({
      where: { id: campanhaId },
      data: {
        status: CampanhaStatus.EM_ANDAMENTO,
        iniciadoEm: campanha.iniciadoEm || new Date(),
        totalLeads: totalLeadsCount,
        // Só resetamos se estiver realmente saindo do rascunho (reiniciando do zero)
        ...(campanha.status === CampanhaStatus.RASCUNHO || campanha.status === CampanhaStatus.AGENDADA ? {
          totalEnviados: 0,
          totalFalhados: 0
        } : {})
      }
    });

    // 4. Verificação extra: Se já processou tudo, conclui agora mesmo
    if ((c.totalEnviados + c.totalFalhados) >= totalLeadsCount && totalLeadsCount > 0) {
      return await prisma.campanha.update({
        where: { id: campanhaId },
        data: { status: CampanhaStatus.CONCLUIDA, finalizadoEm: new Date() }
      });
    }

    return c;
  }

  /**
   * Cancela uma campanha em andamento ou agendada
   */
  static async cancelarCampanha(id: string, organizationId: string) {
    return await prisma.campanha.update({
      where: { id, organizationId },
      data: { status: CampanhaStatus.CANCELADA as any }
    });
  }

  /**
   * Pausa uma campanha em andamento
   */
  static async pausarCampanha(id: string, organizationId: string) {
    return await prisma.campanha.update({
      where: { id, organizationId },
      data: { status: (CampanhaStatus as any).PAUSADA as any }
    });
  }

  /**
   * Exclui uma campanha
   */
  static async deleteCampanha(id: string, organizationId: string) {
    return await prisma.campanha.delete({
      where: {
        id,
        organizationId,
        NOT: { status: CampanhaStatus.EM_ANDAMENTO }
      },
    });
  }
  /**
   * Processa a resposta do usuário ao Opt-in (Sim/Não)
   */
  static async processarRespostaOptIn(trackingLinkId: string, aceitou: boolean) {
    const link = await prisma.trackingLink.findUnique({
      where: { id: trackingLinkId },
      include: { campanha: true, lead: true }
    });

    if (!link) {
      console.warn(`[CampanhaService] Link ${trackingLinkId} não encontrado para processar Opt-in.`);
      return;
    }

    if (!aceitou) {
      // Usuário recusou. Agradecer e encerrar.
      await import('../whatsapp/whatsapp-service').then(({ WhatsappService }) => {
        WhatsappService.sendMessage({
          to: link.lead.whatsapp,
          text: "Sem problemas! Agradecemos sua atenção. Você não receberá mais mensagens sobre isso.",
          type: 'text'
        }).catch(e => console.error("Erro ao enviar msg de recusa:", e));
      });
      return;
    }

    // Usuário aceitou. Re-enfileirar job com stage FULFILLMENT.
    const campanha = link.campanha as any; // Cast para any para acessar campos JSON

    // Reconstruir mensagens para este lead específico (mesma lógica do iniciarCampanha)
    const rawMensagens = campanha.mensagens;
    let messagesForThisLead: any[] = [];

    // Simplificação: Pegar o primeiro template ou o template único, já que no Opt-in 
    // não temos como rodar o sorteio de pesos novamente de forma determinística sem salvar qual foi escolhido.
    // Melhoria futura: Salvar o variante escolhido no TrackingLink.
    if (rawMensagens.templates && Array.isArray(rawMensagens.templates)) {
      messagesForThisLead = rawMensagens.templates[0].messages || [];
    } else if (rawMensagens.messages) {
      messagesForThisLead = rawMensagens.messages;
    } else if (Array.isArray(rawMensagens)) {
      messagesForThisLead = rawMensagens;
    } else if (rawMensagens.template) {
      messagesForThisLead = Array.isArray(rawMensagens.template) ? rawMensagens.template : [{ content: rawMensagens.template, type: 'text' }];
    }

    await campanhaQueue.add(
      `send-${link.id}-fulfillment`,
      {
        trackingLinkId: link.id,
        campanhaId: campanha.id,
        mensagens: messagesForThisLead,
        organizationId: campanha.organizationId,
        strategy: 'OPT_IN',
        stage: 'FULFILLMENT'
      } as CampanhaJobData,
      {
        delay: 1000 // 1s de delay para parecer natural
      }
    );
  }

  /**
   * Processa o bloqueio solicitado pelo usuário (Soft Block)
   */
  static async processarBloqueio(trackingLinkId: string) {
    const link = await prisma.trackingLink.findUnique({
      where: { id: trackingLinkId },
      include: { lead: true }
    });

    if (!link) return;

    // Atualizar Lead para Opt-out
    await prisma.lead.update({
      where: { id: link.leadId },
      data: { optOut: true }
    });

    // Enviar confirmação
    await import('../whatsapp/whatsapp-service').then(({ WhatsappService }) => {
      WhatsappService.sendMessage({
        to: link.lead.whatsapp,
        text: "Você foi removido da nossa lista de contatos e não receberá mais mensagens. Desculpe o incômodo.",
        type: 'text'
      }).catch(e => console.error("Erro ao enviar msg de bloqueio:", e));
    });
  }
}
