import { Worker, Job } from 'bullmq';
import { redis } from '../redis';
import { CAMPANHA_QUEUE_NAME, CampanhaJobData } from './queue';
import { prisma } from '../prisma';
import { WhatsappService } from '../whatsapp/whatsapp-service';
import { LinkStatus, CampanhaStatus } from '@prisma/client';

export const setupCampanhaWorker = () => {
    const checkCompletion = async (campanhaId: string) => {
        const c = await prisma.campanha.findUnique({
            where: { id: campanhaId },
            select: { totalLeads: true, totalEnviados: true, totalFalhados: true, status: true }
        });

        if (c && c.status === CampanhaStatus.EM_ANDAMENTO && (c.totalEnviados + c.totalFalhados) >= c.totalLeads) {
            console.log(`[Worker] Campanha ${campanhaId} concluída.`);
            await prisma.campanha.update({
                where: { id: campanhaId },
                data: { status: CampanhaStatus.CONCLUIDA, finalizadoEm: new Date() }
            });
        }
    };

    const worker = new Worker<any>(
        CAMPANHA_QUEUE_NAME,
        async (job: Job<any>) => {
            // Caso 1: Disparador de Campanha (Agendamento)
            if (job.name.startsWith('trigger-campaign-')) {
                const { campanhaId, organizationId } = job.data;
                console.log(`[Worker] Ativando campanha agendada: ${campanhaId}`);

                try {
                    const { CampanhaService } = await import('./campanha-service');
                    await CampanhaService.iniciarCampanha(campanhaId, organizationId);
                } catch (error: any) {
                    console.error(`[Worker] Erro ao iniciar campanha ${campanhaId}:`, error.message);
                    throw error;
                }
                return;
            }

            // Caso 2: Envio Individual de Mensagem (Batch de Mensagens para o mesmo Lead)
            const { trackingLinkId, campanhaId, mensagens, strategy = 'DIRECT', initialMessage, stage = 'INITIAL', instanceId } = job.data as CampanhaJobData;

            console.log(`[Worker] Processando ${mensagens.length} mensagens para Campanha ${campanhaId}, Link ${trackingLinkId}, Estratégia: ${strategy}, Estágio: ${stage}`);

            // 1. Buscar Campanha para checar status (Pausa/Cancelamento)
            const campanha = await prisma.campanha.findUnique({
                where: { id: campanhaId },
                include: { enquete: true } // Precisamos da enquete para pegar o título se necessário
            });

            if (!campanha || campanha.status !== CampanhaStatus.EM_ANDAMENTO) {
                console.log(`[Worker] Campanha ${campanhaId} pausada ou cancelada. Pulando job.`);
                return;
            }

            // 2. Buscar Tracking Link e Lead
            const link = await prisma.trackingLink.findUnique({
                where: { id: trackingLinkId },
                include: { lead: true }
            });

            if (!link || link.status === LinkStatus.RESPONDIDO) {
                console.warn(`[Worker] Link ${trackingLinkId} não encontrado ou já respondido.`);
                return;
            }

            // Lógica OPT_IN (Estágio Inicial)
            if (strategy === 'OPT_IN' && stage === 'INITIAL') {
                try {
                    const greeting = (initialMessage || "Olá {{nome}}! Posso te enviar um link importante?").replace(/{{nome}}/g, link.lead.nome || 'Participante');

                    await WhatsappService.sendMenu({
                        to: link.lead.whatsapp,
                        text: greeting,
                        options: [
                            `Sim|OPTIN_YES:${link.id}`,
                            `Não|OPTIN_NO:${link.id}`
                        ],
                        instanceId
                    });

                    // Atualizar status para algo que indique espera (poderíamos ter um status específico, mas ENVIADO funciona se considerarmos o envio do convite)
                    // Idealmente: LinkStatus.AGUARDANDO_OPTIN (se existisse no enum). Vamos usar ENVIADO por enquanto, ou manter em ABERTO.
                    // Manter NÃO_ENVIADO pode fazer o worker tentar de novo se rodar reprocessamento.
                    // Vamos considerar que o "Convite" foi ENVIADO.
                    await prisma.trackingLink.update({
                        where: { id: link.id },
                        data: {
                            status: LinkStatus.ENVIADO, // Consideramos enviado o convite
                            enviadoEm: new Date()
                        }
                    });

                    return; // PARA AQUI. O resto é com o Webhook.
                } catch (e: any) {
                    console.error(`[Worker] Erro ao enviar Opt-in:`, e.message);
                    throw e;
                }
            }

            const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SPOKE_URL || 'http://localhost:3006';
            const shortUrl = `${APP_URL}/r/${link.hash}`;

            try {
                // Iterar pelas mensagens configuradas
                for (let i = 0; i < mensagens.length; i++) {
                    const msgConfig = mensagens[i];
                    const isLastMessage = i === mensagens.length - 1;

                    // 2. Personalizar conteúdo
                    const personalizedText = (msgConfig.content || "")
                        .replace(/{{nome}}/g, link.lead.nome || 'Participante')
                        .replace(/{{link}}/g, shortUrl)
                        .replace(/{{link_unico}}/g, shortUrl);

                    // Lógica SOFT_BLOCK (Apenas na última mensagem)
                    if (strategy === 'SOFT_BLOCK' && isLastMessage && msgConfig.type === 'text') {
                        await WhatsappService.sendMenu({
                            to: link.lead.whatsapp,
                            text: personalizedText,
                            options: [`Não quero mais|BLOCK:${link.id}`],
                            instanceId
                        });
                    } else {
                        // Fluxo Normal (DIRECT ou mensagens anteriores do SOFT_BLOCK)
                        await WhatsappService.sendMessage({
                            to: link.lead.whatsapp,
                            text: personalizedText,
                            mediaUrl: msgConfig.mediaUrl || undefined,
                            type: msgConfig.type || 'text',
                            options: msgConfig.options,
                            instanceId
                        });
                    }

                    // 4. Aguardar delayAfter se houver e não for a última mensagem
                    if (msgConfig.delayAfter > 0 && i < mensagens.length - 1) {
                        console.log(`[Worker] Aguardando ${msgConfig.delayAfter}s antes da próxima mensagem...`);
                        await new Promise(resolve => setTimeout(resolve, msgConfig.delayAfter * 1000));
                    }
                }

                // 5. Atualizar status do Link (Após todas enviadas com sucesso)
                await prisma.trackingLink.update({
                    where: { id: link.id },
                    data: {
                        status: LinkStatus.ENVIADO,
                        enviadoEm: new Date()
                    }
                });

                // 6. Incrementar contador da Campanha
                await prisma.campanha.update({
                    where: { id: campanhaId },
                    data: { totalEnviados: { increment: 1 } }
                });

                await checkCompletion(campanhaId);

            } catch (error: any) {
                console.error(`[Worker] Falha ao enviar sequência de mensagens para ${link.lead.whatsapp}:`, error.message);
                throw error;
            }
        },
        {
            connection: redis as any,
            concurrency: 1, // Enviar um por vez para evitar bloqueio no WhatsApp
        }
    );

    worker.on('completed', (job) => {
        console.log(`[Worker] Job ${job.id} finalizado com sucesso.`);
    });

    worker.on('failed', async (job, err) => {
        console.error(`[Worker] Job ${job?.id} falhou:`, err.message);

        // Incrementar falha no banco apenas após todas as tentativas (ou em cada falha se preferir, 
        // mas aqui estamos limpando o contador no início para progressão real)
        const { campanhaId, trackingLinkId } = job?.data || {};
        if (campanhaId) {
            // 1. Incrementar falha na campanha
            await prisma.campanha.update({
                where: { id: campanhaId },
                data: { totalFalhados: { increment: 1 } }
            }).catch(e => console.error('Erro ao atualizar contador de falhas na campanha:', e));

            // 2. Marcar Link como FALHADO e registrar o erro
            if (trackingLinkId) {
                await prisma.trackingLink.update({
                    where: { id: trackingLinkId },
                    data: {
                        status: (LinkStatus as any).FALHADO,
                        erroNoEnvio: err.message
                    } as any
                }).catch(e => console.error('Erro ao marcar link como falhado:', e));
            }

            await checkCompletion(campanhaId);
        }
    });

    return worker;
};
