import axios from 'axios';
import { prisma } from '../prisma';
import { UazApiService } from './uazapi-service';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_INSTANCE_ID = process.env.WHATSAPP_INSTANCE_ID;

export interface WhatsappMessage {
  to: string;
  text: string;
  mediaUrl?: string;
  type?: 'text' | 'image' | 'audio' | 'video' | 'menu' | 'interactive';
  options?: any;
  instanceId?: string; // Permitir passar instância específica
}

export class WhatsappService {
  private static client = axios.create({
    baseURL: WHATSAPP_API_URL,
    headers: {
      'apikey': WHATSAPP_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  private static tokenCache: Record<string, string> = {};

  static async resolveToken(instanceId: string): Promise<string> {
    // 1. Tenta cache em memória primeiro
    if (this.tokenCache[instanceId]) {
      return this.tokenCache[instanceId];
    }

    // 2. Tenta buscar do banco de dados do Participa
    const dbInstance = await prisma.whatsappInstance.findUnique({
      where: { instanceId }
    });

    if (dbInstance?.token) {
      this.tokenCache[instanceId] = dbInstance.token;
      return dbInstance.token;
    }

    // 3. Fallback: Lista instâncias na UazAPI e pega o token
    console.log(`[WhatsappService] Fallback: Buscando token na UazAPI para instância ${instanceId}`);
    try {
      const instances = await UazApiService.listInstances();
      const found = instances.find((i: any) => i.name === instanceId || i.instanceName === instanceId);

      if (found && found.token) {
        this.tokenCache[instanceId] = found.token;

        // Salva o token no banco para a próxima vez se o BD existir
        if (dbInstance) {
          await prisma.whatsappInstance.update({
            where: { id: dbInstance.id },
            data: { token: found.token }
          });
        }
        return found.token;
      }
    } catch (e) {
      console.warn("[WhatsappService] Erro ao buscar fallback na UazAPI:", e);
    }

    // Retorna próprio ID se bater parede (comportamento legado para Evolution se for o caso)
    return instanceId;
  }

  /**
   * Envia uma mensagem de texto via WhatsApp
   */
  static async sendMessage(message: WhatsappMessage) {
    const instanceId = message.instanceId || WHATSAPP_INSTANCE_ID;

    if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY || !instanceId) {
      throw new Error("Configurações de WhatsApp não encontradas (URL, API_KEY ou INSTANCE_ID)");
    }

    try {
      const actualToken = await this.resolveToken(instanceId);

      const config = {
        headers: {
          'token': actualToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      // Se tiver mediaUrl, usamos o endpoint de media
      if (message.mediaUrl && message.type !== 'text') {
        const endpoint = `/message/sendMedia/${instanceId}`; // Manter legado ou se houver rota nova, /send/media

        // Mapear tipos Evolution: image, video, document, audio
        let mediaType = 'image';
        if (message.type === 'video') mediaType = 'video';
        if (message.type === 'audio') mediaType = 'audio';

        const payload = {
          number: this.formatNumber(message.to),
          media: message.mediaUrl,
          caption: message.text,
          mediaType: mediaType,
          delay: 1200,
        };

        const response = await this.client.post(endpoint, payload, config);
        return response.data;
      }

      // Caso contrário, enviamos texto simples (Nova API UAZAPI)
      const endpoint = `/send/text`;
      const payload = {
        number: this.formatNumber(message.to),
        text: message.text,
        delay: 1200,
        linkPreview: true
      };

      const response = await this.client.post(endpoint, payload, config);
      return response.data;
    } catch (error: any) {
      console.error("[WhatsappService] Erro ao enviar mensagem:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || `Erro na comunicação com a API de WhatsApp (Instance: ${instanceId})`);
    }
  }

  /**
   * Envia uma mensagem interativa (Menu/Botões) via WhatsApp
   */
  static async sendMenu(message: WhatsappMenuMessage & { instanceId?: string }) {
    const instanceId = message.instanceId || WHATSAPP_INSTANCE_ID;

    if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY || !instanceId) {
      throw new Error("Configurações de WhatsApp não encontradas (URL, API_KEY ou INSTANCE_ID)");
    }

    try {
      const payload = {
        number: this.formatNumber(message.to),
        message: message.text,
        render: message.renderType || 'buttons', // 'buttons' ou 'list'
        options: message.options, // Array de strings "Texto|ID"
        delay: 1200,
        instance: instanceId
      };

      const fullUrl = `${WHATSAPP_API_URL}/message/send~menu`;

      const response = await axios.post(fullUrl, payload, {
        headers: {
          'apikey': WHATSAPP_API_KEY,
          'Content-Type': 'application/json',
        }
      });

      return response.data;
    } catch (error: any) {
      console.error("[WhatsappService] Erro ao enviar menu:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Erro na comunicação com a API de WhatsApp (Menu)");
    }
  }

  /**
   * Formata o número para o padrão internacional (sem +, apenas números)
   */
  private static formatNumber(number: string): string {
    const cleaned = number.replace(/\D/g, '');
    // Se o número não tem o DDI do Brasil (55), adiciona se tiver 11 dígitos
    if (cleaned.length === 11 && !cleaned.startsWith('55')) {
      return `55${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Verifica o status da instância de WhatsApp
   */
  static async getInstanceStatus(specificInstanceId?: string) {
    const instanceId = specificInstanceId || WHATSAPP_INSTANCE_ID;
    if (!instanceId) return { state: 'DISCONNECTED' };

    try {
      const response = await this.client.get(`/instance/connectionState/${instanceId}`);
      return response.data;
    } catch (error: any) {
      console.error("[WhatsappService] Erro ao verificar status:", error.message);
      return { state: 'DISCONNECTED' };
    }
  }
}

export interface WhatsappMenuMessage {
  to: string;
  text: string;
  renderType?: 'buttons' | 'list';
  options: string[]; // ["Opção 1|id1", "Opção 2|id2"]
}
