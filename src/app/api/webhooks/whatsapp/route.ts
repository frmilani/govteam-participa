import { NextRequest, NextResponse } from "next/server";
import { CampanhaService } from "@/lib/campanhas/campanha-service";
import { prisma } from "@/lib/prisma";
import { LinkStatus } from "@prisma/client";

/**
 * POST /api/webhooks/whatsapp
 * Recebe atualizações de status das mensagens enviadas
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // O formato depende da API de WhatsApp utilizada (Evolution API, WPPConnect, etc.)
    // Exemplo genérico baseado em Evolution API:
    const { event, data } = body;

    if (event === "messages.upsert") {
      // Mensagem recebida ou enviada (ignorar enviadas pelo sistema se fromMe for true)
      const msg = data.message || data; // Depende da estrutura exata

      // Checar se é resposta de Botão ou Lista
      // Estruturas comuns: message.buttonsResponseMessage || message.listResponseMessage || message.interactive.button_reply

      let selectedId = null;
      let from = null;

      // Adaptação para estrutura Evolution/Uazapi
      if (data.key && !data.key.fromMe) {
        from = data.key.remoteJid; // 55119999@s.whatsapp.net
        const content = data.message;

        if (content?.buttonsResponseMessage) {
          selectedId = content.buttonsResponseMessage.selectedButtonId;
        } else if (content?.listResponseMessage) {
          selectedId = content.listResponseMessage.singleSelectReply?.selectedRowId;
        } else if (content?.interactiveResponseMessage) { // Nova estrutura
          const interactive = content.interactiveResponseMessage;
          if (interactive.nativeFlowResponseMessage) {
            // Botões nativos (mais complexo, parsear paramsJson)
            try {
              const params = JSON.parse(interactive.nativeFlowResponseMessage.paramsJson);
              selectedId = params.id;
            } catch (e) { }
          } else {
            selectedId = interactive.body?.text; // Fallbacks
          }
        }
      }

      console.log(`[WhatsappWebhook] Mensagem recebida de ${from}, ID: ${selectedId}`);

      if (selectedId) {
        // Parse do ID: ACTION:TRACKING_LINK_ID
        // Ex: OPTIN_YES:clk_12345
        const parts = selectedId.split(':');
        if (parts.length >= 2) {
          const action = parts[0];
          const trackingLinkId = parts[1];

          if (action === 'OPTIN_YES') {
            await CampanhaService.processarRespostaOptIn(trackingLinkId, true);
          } else if (action === 'OPTIN_NO') {
            await CampanhaService.processarRespostaOptIn(trackingLinkId, false);
          } else if (action === 'BLOCK') {
            await CampanhaService.processarBloqueio(trackingLinkId);
          }
        }
      }
    }

    if (event === "messages.update") {
      // Atualização de status (pendente, enviado, entregue, lido)
      const { key, status } = data[0];
      const whatsappId = key.id;

      // Mapear status da API para nosso LinkStatus se necessário
      // Por enquanto, apenas registramos o log
      console.log(`[WhatsappWebhook] Status da mensagem ${whatsappId}: ${status}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[WhatsappWebhook] Erro:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
