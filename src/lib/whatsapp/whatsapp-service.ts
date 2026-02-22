import axios from 'axios';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_INSTANCE_ID = process.env.WHATSAPP_INSTANCE_ID;

export interface WhatsappMessage {
  to: string;
  text: string;
  mediaUrl?: string;
  type?: 'text' | 'image' | 'audio' | 'video' | 'menu' | 'interactive';
  options?: any;
}

export class WhatsappService {
  private static client = axios.create({
    baseURL: WHATSAPP_API_URL,
    headers: {
      'apikey': WHATSAPP_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  /**
   * Envia uma mensagem de texto via WhatsApp
   */
  static async sendMessage(message: WhatsappMessage) {
    if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY || !WHATSAPP_INSTANCE_ID) {
      throw new Error("Configurações de WhatsApp não encontradas no ambiente");
    }

    try {
      // Se tiver mediaUrl, usamos o endpoint de media
      if (message.mediaUrl && message.type !== 'text') {
        const endpoint = `/message/sendMedia/${WHATSAPP_INSTANCE_ID}`;

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

        const response = await this.client.post(endpoint, payload);
        return response.data;
      }

      // Caso contrário, enviamos texto simples
      const endpoint = `/message/sendText/${WHATSAPP_INSTANCE_ID}`;
      const payload = {
        number: this.formatNumber(message.to),
        text: message.text,
        delay: 1200,
        linkPreview: true
      };

      const response = await this.client.post(endpoint, payload);
      return response.data;
    } catch (error: any) {
      console.error("[WhatsappService] Erro ao enviar mensagem:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Erro na comunicação com a API de WhatsApp");
    }
  }

  /**
   * Envia uma mensagem interativa (Menu/Botões) via WhatsApp
   */
  static async sendMenu(message: WhatsappMenuMessage) {
    if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY || !WHATSAPP_INSTANCE_ID) {
      throw new Error("Configurações de WhatsApp não encontradas no ambiente");
    }

    try {
      const endpoint = `/message/send~menu`; // Endpoint específico para menus/botões
      const payload = {
        number: this.formatNumber(message.to),
        message: message.text,
        render: message.renderType || 'buttons', // 'buttons' ou 'list'
        options: message.options, // Array de strings "Texto|ID"
        delay: 1200,
        instance: WHATSAPP_INSTANCE_ID // Algumas versões da API pedem instance no body, outras na URL. Mantendo padrão da URL se possível, mas enviando aqui por segurança da lib uazapi.
      };

      // Nota: Uazapi V2 geralmente usa endpoint /message/send~menu com POST
      // e autenticação via header 'apikey'.
      // A URL base já deve incluir /message se a API for uazapiGO, mas aqui estamos assumindo
      // que a baseURL é a raiz da API. Ajuste conforme necessário.

      // Sobrescrevendo a URL completa para garantir
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
  static async getInstanceStatus() {
    try {
      const response = await this.client.get(`/instance/connectionState/${WHATSAPP_INSTANCE_ID}`);
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
