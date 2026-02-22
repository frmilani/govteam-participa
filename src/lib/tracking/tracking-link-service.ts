import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { LinkStatus, EnqueteStatus, CampanhaStatus } from "@prisma/client";
import { HubApiService } from "../hub-api";

export class TrackingLinkService {
  /**
   * Gera um hash único de 8 caracteres para o tracking link
   */
  static generateHash(): string {
    return nanoid(8);
  }

  /**
   * Cria tracking links para uma lista de leads em uma campanha
   */
  static async createLinksForCampaign(
    campanhaId: string,
    leadIds: string[],
    formPublicId: string,
    expiraEm: Date
  ) {
    const data = leadIds.map((leadId) => ({
      campanhaId,
      leadId,
      formPublicId,
      hash: this.generateHash(),
      expiraEm,
      status: LinkStatus.NAO_ENVIADO,
    }));

    return await prisma.trackingLink.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Busca um link pelo hash ou busca uma enquete pública pelo formPublicId
   */
  static async getValidLink(hash: string) {
    // 1. Tentar buscar como TrackingLink (voto via campanha)
    const link = await prisma.trackingLink.findUnique({
      where: { hash },
      include: {
        lead: true,
        campanha: {
          include: {
            enquete: true,
          },
        },
      },
    });

    if (link) {
      // Se a enquete for APENAS PÚBLICA, o hash não deve funcionar
      if (link.campanha.enquete.modoAcesso === 'PUBLICO') {
        return null;
      }

      const isExpired = link.expiraEm < new Date();
      if (isExpired && link.status !== LinkStatus.EXPIRADO) {
        await prisma.trackingLink.update({
          where: { id: link.id },
          data: { status: LinkStatus.EXPIRADO },
        });
        return { ...link, status: LinkStatus.EXPIRADO, isExpired: true, type: 'campaign' };
      }
      // Buscar o schema do formulário do Hub para campanhas também
      const schema = await HubApiService.getFormSchema(link.formPublicId);

      return { ...link, isExpired, type: 'campaign', schema };
    }

    // 2. Se não encontrou link, tentar buscar como Enquete Pública (divulgação direta)
    const enquete = await prisma.enquete.findFirst({
      where: { 
        formPublicId: hash,
        status: { in: [EnqueteStatus.PUBLICADA, EnqueteStatus.PAUSADA, EnqueteStatus.ENCERRADA] }
      }
    });

    if (enquete) {
      // Se a enquete for RESTRITO_HASH, o acesso público direto não deve funcionar
      if (enquete.modoAcesso === 'RESTRITO_HASH') {
        return null;
      }

      // Buscar o schema do formulário do Hub
      const schema = await HubApiService.getFormSchema(enquete.formPublicId);

      return {
        type: 'public',
        formPublicId: enquete.formPublicId,
        schema, // Incluir o schema do formulário
        campanha: {
          enquete
        },
        isExpired: enquete.status === EnqueteStatus.ENCERRADA,
        status: enquete.status
      };
    }

    return null;
  }

  /**
   * Registra a visualização de um link
   */
  static async trackView(hash: string) {
    const link = await prisma.trackingLink.findUnique({ where: { hash } });
    
    // Se não for um tracking link de campanha, não precisa registrar no banco
    if (!link || link.status === LinkStatus.RESPONDIDO) return;

    return await prisma.trackingLink.update({
      where: { hash },
      data: {
        status: LinkStatus.VISUALIZADO,
        visualizadoEm: new Date(),
      },
    });
  }
}
