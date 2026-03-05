import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TrackingLinkService } from "@/lib/tracking/tracking-link-service";
import { LinkStatus } from "@prisma/client";
import { HubApiService } from "@/lib/hub-api";
import { extractDemographicsParams } from "@/lib/leads/demographics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hash, dados, votos = [], votosLivres = [], qualidades = [] } = body;

    if (!hash || !dados) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 1. Validar o link de tracking
    const link = await TrackingLinkService.getValidLink(hash);
    if (!link) {
      return NextResponse.json({ error: "Este modo de acesso não é permitido para esta enquete ou o link é inválido." }, { status: 404 });
    }

    if (link.status === LinkStatus.RESPONDIDO) {
      // Retornar 409 para que o front-end mostre a tela de agradecimento em vez de erro genérico
      return NextResponse.json({ error: "Este link já foi utilizado para votar" }, { status: 409 });
    }

    const enquete = link.campanha.enquete;
    const now = new Date();

    // Isolamento Lógico (AC: 3)
    if (enquete.status !== "PUBLICADA") {
      return NextResponse.json({ error: "Esta pesquisa não está aberta para submissões" }, { status: 403 });
    }

    // Carregar os segmentos para validação (AC: 5)
    // Validação rigorosa para impedir category mapping lateral
    const enqueteConfig = await prisma.enquete.findUnique({
      where: { id: enquete.id },
      include: { segmentos: { select: { id: true } } }
    });
    const validCategoryIds = new Set((enqueteConfig?.segmentos || []).map(s => s.id));

    // Validar agendamento
    if (enquete.dataInicio && now < new Date(enquete.dataInicio)) {
      return NextResponse.json({ error: "Esta pesquisa ainda não começou" }, { status: 400 });
    }
    if (enquete.dataFim && now > new Date(enquete.dataFim)) {
      return NextResponse.json({ error: "Esta pesquisa já foi encerrada" }, { status: 400 });
    }

    // 2. Buscar o schema do formulário no Hub para validar os campos de voto
    const hubSchema = await HubApiService.getFormSchema(link.formPublicId);

    // Extrair todos os elementos recursivamente (flatten)
    const allElements: any[] = [];
    const collectElements = (elements: any[]) => {
      if (!elements || !Array.isArray(elements)) return;
      elements.forEach(el => {
        allElements.push(el);
        if (el.children) collectElements(el.children);
      });
    };
    collectElements(hubSchema.schema?.elements || []);

    const establishmentFields = allElements.filter((f: any) =>
      f.type === 'custom-establishment' || f.type === 'top-of-mind'
    );

    // --- RULE ENFORCEMENT ---
    const leadIdFromRequest = body.leadId || (link as any).leadId || null;

    if (enquete.exigirIdentificacao && !leadIdFromRequest) {
      return NextResponse.json({ error: "Identificação obrigatória para esta votação." }, { status: 400 });
    }

    if (leadIdFromRequest) {
      const lead = await prisma.lead.findUnique({ where: { id: leadIdFromRequest } });

      if (!lead) {
        return NextResponse.json({ error: "Identificação inválida." }, { status: 400 });
      }

      // 1. Requirement: CPF
      if (enquete.exigirCpf && !lead.cpf) {
        return NextResponse.json({ error: "CPF é obrigatório para participar desta votação." }, { status: 400 });
      }

      // 2. Requirement: Single vote per Lead/CPF
      // Important: Since upsertLeadPartial merges by CPF, checking leadId is equivalent to checking CPF uniqueness.
      const existingVote = await prisma.resposta.findFirst({
        where: {
          enqueteId: enquete.id,
          leadId: leadIdFromRequest,
        }
      });

      if (existingVote) {
        // Corrigir o TrackingLink para RESPONDIDO caso tenha ficado desatualizado
        const linkId = (link as any).id;
        if (linkId) {
          await prisma.trackingLink.update({
            where: { id: linkId },
            data: {
              status: LinkStatus.RESPONDIDO,
              respondidoEm: (existingVote as any).criadoEm || new Date(),
            }
          }).catch(() => { /* silencioso — não bloquear a resposta por isso */ });
        }
        // Retornar 409 (Conflict) — o front-end já trata 409 como "já votou" e mostra tela de agradecimento
        return NextResponse.json({
          error: "Você já participou desta votação. Agradecemos sua colaboração!"
        }, { status: 409 });
      }

      // 3. Requirement: High Security (OTP)
      if (enquete.securityLevel === 'HIGH' && lead.statusVerificacao !== "VERIFICADO") {
        return NextResponse.json({ error: "É necessário validar seu voto via WhatsApp para concluir." }, { status: 400 });
      }
    }

    // 3. Iniciar transação
    const result = await prisma.$transaction(async (tx) => {
      const currentLeadId = body.leadId || (link as any).leadId || null;
      let otpVerified = false;

      if (currentLeadId) {
        const lead = await tx.lead.findUnique({ where: { id: currentLeadId } });
        otpVerified = lead?.statusVerificacao === "VERIFICADO";
      }

      // Calcular percentual de conclusão baseado nos campos de estabelecimento
      const totalFields = establishmentFields.length;
      let filledFields = 0;
      const votosData: any[] = [];

      for (const field of establishmentFields) {
        const establishmentId = dados[field.id];
        if (establishmentId && typeof establishmentId === 'string') {
          filledFields++;
        }
      }

      const percentualConclusao = totalFields > 0 ? (filledFields / totalFields) * 100 : 100;

      // Determinar se o voto é válido
      // Regra: >= minCompleteness E (OTP verificado OU Hash validado)
      const minCompleteness = enquete.minCompleteness || 70;
      const isComplete = percentualConclusao >= minCompleteness;

      let votoValido = false;
      if (isComplete) {
        if (link.type === 'campaign') {
          // No modo campanha/hash, a identidade já é "confiável"
          votoValido = true;
        } else {
          // No modo público, depende do securityLevel
          if (enquete.securityLevel === 'HIGH') {
            votoValido = otpVerified;
          } else {
            votoValido = true;
          }
        }
      }

      // Criar Resposta com novos metadados
      const resposta = await tx.resposta.create({
        data: {
          enqueteId: enquete.id,
          formPublicId: link.formPublicId,
          leadId: currentLeadId,
          trackingLinkId: (link as any).id || undefined,
          dadosJson: dados,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
          percentualConclusao,
          votoValido,
          otpVerified,
        },
      });

      // --- Demographics Enrichment (E5.1) ---
      if (currentLeadId) {
        const demograficos = extractDemographicsParams(dados, allElements);
        const keys = Object.keys(demograficos);

        if (keys.length > 0) {
          // Pegar o lead fresco de dentro da TRN para merge seguro
          const leadTransacional = await tx.lead.findUnique({ where: { id: currentLeadId } });

          const existing = (leadTransacional as any)?.dadosDemograficos as Record<string, any> ?? {};
          const merged = { ...existing, ...demograficos };

          await (tx as any).lead.update({
            where: { id: currentLeadId },
            data: { dadosDemograficos: merged }
          });

          console.info(`[LEAD_ENRICH] leadId=${currentLeadId} campos=${JSON.stringify(keys)}`);
        }
      }

      // --- Lucky Numbers Logic (Consolidated) ---
      if (enquete.usarNumerosSorte && votoValido) {
        try {
          // Note: LuckyNumberService handles its own transaction or logic
          // But since we are already in a transaction, it's better to inline the logic or use the service with the tx.
          // For now, let's keep it in the transaction for atomicity.
          const lastAssignment = await (tx as any).numeroSorte.findFirst({
            where: { enqueteId: enquete.id },
            orderBy: { numero: 'desc' },
            select: { numero: true }
          });

          let nextNumber = (lastAssignment?.numero || 0) + 1;
          const digits = enquete.digitosNumerosSorte || 5;
          const maxNumber = Math.pow(10, digits) - 1;

          if (nextNumber <= maxNumber) {
            await (tx as any).numeroSorte.create({
              data: {
                enqueteId: enquete.id,
                leadId: currentLeadId,
                numero: nextNumber
              }
            });

            await tx.lead.update({
              where: { id: currentLeadId },
              data: { cupons: { increment: 1 } }
            });
          }
        } catch (lnError) {
          console.error("[Submission] Error generating lucky number:", lnError);
        }
      }

      // -------------------------------------------------------------
      // Salvar os votos individuais (Legado FormBuilder e E4.4 Engine)
      // -------------------------------------------------------------

      // 1. Processar estabelecimentoFields (Lógica antiga FormBuilder via "dados")
      for (const field of establishmentFields) {
        const establishmentIdOrSlug = dados[field.id];

        if (establishmentIdOrSlug && typeof establishmentIdOrSlug === 'string') {
          // Tentar buscar por ID primeiro
          let est = await tx.estabelecimento.findUnique({
            where: { id: establishmentIdOrSlug },
            include: { segmentos: { take: 1 } }
          });

          if (!est) {
            est = await tx.estabelecimento.findFirst({
              where: { alias: establishmentIdOrSlug },
              include: { segmentos: { take: 1 } }
            });
          }

          if (est) {
            votosData.push({
              respostaId: resposta.id,
              estabelecimentoId: est.id,
              segmentoId: est.segmentos[0]?.segmentoId || "unknown",
              campoId: field.id,
            });
          }
        }
      }

      // 2. Processar votos recebidos explicitamente da Engine V2 (E4.4)
      for (const voto of votos) {
        if (!validCategoryIds.has(voto.categoriaId)) continue;
        votosData.push({
          respostaId: resposta.id,
          estabelecimentoId: voto.estabelecimentoId,
          segmentoId: voto.categoriaId,
          campoId: "engine-v2",
        });
      }

      if (votosData.length > 0) {
        await tx.votoEstabelecimento.createMany({ data: votosData });
      }

      // -------------------------------------------------------------
      // 3. Processar Votos Livres com Metaphone (E4.4 Engine)
      // -------------------------------------------------------------
      const votosLivresData: any[] = [];
      for (const vl of votosLivres) {
        if (!validCategoryIds.has(vl.categoriaId) || !vl.texto) continue;

        // AC 4: Calcular chave metaphone on-the-fly para o voto livre submetido
        // Usa dynamic require the module that was implemented in E4.3 to prevent top level TS errors
        let chavesFoneticas: string[] = [];
        try {
          const { metaphonePtBr } = await import("@/lib/phonetics/metaphone");
          const metaKey = metaphonePtBr(vl.texto);
          if (metaKey) chavesFoneticas = metaKey.split(" ");
        } catch (e) {
          console.warn("Metaphone injection fallback", e);
        }

        votosLivresData.push({
          respostaId: resposta.id,
          categoriaId: vl.categoriaId,
          textoOriginal: vl.texto,
          chavesFoneticas: chavesFoneticas
        });
      }

      if (votosLivresData.length > 0) {
        await (tx as any).votoLivre.createMany({ data: votosLivresData });
      }

      // -------------------------------------------------------------
      // 4. Processar Respostas de Qualidade (E4.4 Engine)
      // -------------------------------------------------------------
      const qualidadesData: any[] = [];
      for (const qual of qualidades) {
        if (!validCategoryIds.has(qual.categoriaId)) continue;
        qualidadesData.push({
          respostaId: resposta.id,
          perguntaId: qual.perguntaId,
          categoriaId: qual.categoriaId,
          valor: qual.valor?.toString() || ""
        });
      }

      if (qualidadesData.length > 0) {
        await (tx as any).respostaQualidade.createMany({ data: qualidadesData });
      }


      // 4. Atualizar tracking link (apenas se for campanha)
      if (link.type === 'campaign') {
        await tx.trackingLink.update({
          where: { id: (link as any).id },
          data: {
            status: LinkStatus.RESPONDIDO,
            respondidoEm: new Date(),
          },
        });

        // 5. Atualizar estatísticas da campanha
        await tx.campanha.update({
          where: { id: (link as any).campanhaId },
          data: {
            totalRespondidos: { increment: 1 }
          }
        });
      }

      return resposta;
    });


    // 6. Telemetria para o Hub (fire and forget)
    HubApiService.reportAnalytics(enquete.hubFormId, 'submission_complete', {
      spoke: 'premio-destaque',
      enqueteId: enquete.id,
      campanhaId: link.type === 'campaign' ? (link as any).campanhaId : undefined,
      type: link.type
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (error: any) {
    console.error("[API_SUBMISSIONS_POST]", error);
    return NextResponse.json({ error: error.message || "Erro ao processar submissão" }, { status: 500 });
  }
}
