import axios from 'axios';
import { z } from 'zod';

const HUB_URL = process.env.HUB_INTERNAL_URL || process.env.HUB_URL;
const FORMBUILDER_URL = process.env.FORMBUILDER_URL || HUB_URL; // Use Formbuilder URL if available
const HUB_CLIENT_ID = process.env.HUB_CLIENT_ID;
const HUB_CLIENT_SECRET = process.env.HUB_CLIENT_SECRET;

console.log("[HubAPI] Configuração Hub-to-Spoke:", {
  url: HUB_URL,
  formbuilderUrl: FORMBUILDER_URL,
  clientId: HUB_CLIENT_ID,
  hasSecret: !!HUB_CLIENT_SECRET
});

// Schema para validação do formulário do Hub
export const hubFormSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  schema: z.object({
    elements: z.array(z.record(z.string(), z.any())).default([]),
    theme: z
      .object({
        cssVariables: z.record(z.string(), z.string()),
        radius: z.string(),
      })
      .optional(),
  }).optional(),
  settings: z.object({
    storageMode: z.string().default("LOCAL"),
    submitButtonText: z.string().default("Enviar").optional(),
    successMessage: z.string().nullable().optional(),
  }).optional(),
});

export type HubFormSchema = z.infer<typeof hubFormSchema>;

export class HubApiService {
  private static client = axios.create({
    baseURL: HUB_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Lista todos os formulários da organização no Hub usando credenciais de Spoke
   */
  static async listForms(organizationId: string): Promise<Array<{ id: string, publicId: string, title: string, storageMode: string }>> {
    if (!HUB_CLIENT_ID || !HUB_CLIENT_SECRET) {
      throw new Error("Credenciais do Hub (CLIENT_ID/SECRET) não configuradas no Spoke");
    }

    try {
      const response = await this.client.get('/api/public/v1/forms', {
        headers: {
          'x-spoke-id': HUB_CLIENT_ID,
          'x-spoke-secret': HUB_CLIENT_SECRET,
          'x-organization-id': organizationId
        }
      });

      // Mapear a resposta para o formato esperado
      return response.data.map((form: any) => ({
        id: form.id,
        publicId: form.publicId,
        title: form.title,
        storageMode: form.storageMode || form.settings?.storageMode || "HUB"
      }));
    } catch (error: any) {
      console.error(`[HubApiService] Erro ao listar formulários:`, error.response?.data || error.message);
      throw new Error("Falha ao buscar lista de formulários do Hub");
    }
  }


  /**
   * Busca o schema de um formulário público no Hub
   */
  static async getFormSchema(publicId: string): Promise<any> {
    if (!HUB_CLIENT_ID || !HUB_CLIENT_SECRET) {
      throw new Error("Credenciais do Hub (CLIENT_ID/SECRET) não configuradas");
    }

    try {
      // Use FORMBUILDER_URL directly to verify form existence in the correct service
      const response = await axios.get(`${FORMBUILDER_URL}/api/public/v1/forms/${publicId}`);

      const rawData = response.data;

      // Validação do schema com a estrutura real do Hub
      const validated = hubFormSchema.parse(rawData);

      const effectiveStorageMode = validated.settings?.storageMode || "LOCAL";

      if (effectiveStorageMode !== "LOCAL") {
        throw new Error("Este formulário está configurado como 'HUB'. Altere para 'LOCAL' nas configurações do formulário no Hub.");
      }

      // Retornar o schema completo com elements para o FormRenderer
      return {
        id: validated.id,
        publicId: validated.publicId,
        title: validated.title,
        storageMode: effectiveStorageMode,
        schema: {
          elements: validated.schema?.elements || [],
          theme: validated.schema?.theme,
        },
        settings: validated.settings
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error(`[HubApiService] Erro de validação Zod:`, error.flatten());
        throw new Error("Estrutura do formulário do Hub é incompatível");
      }
      throw error;
    }
  }

  /**
   * Envia evento de telemetria para o Hub
   */
  static async reportAnalytics(formId: string, eventType: 'view' | 'submission_complete', metadata?: any) {
    if (!HUB_CLIENT_ID || !HUB_CLIENT_SECRET) return;

    try {
      // Fire-and-forget: não aguardamos a resposta para não bloquear o usuário
      // UPDATED: Telemetry moved to Formbuilder, so we send directly there instead of Hub
      axios.post(`${FORMBUILDER_URL}/api/public/v1/analytics`, {
        formId,
        eventType,
        metadata
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-spoke-id': HUB_CLIENT_ID,
          'x-spoke-secret': HUB_CLIENT_SECRET
        }
      }).catch(err => {
        console.error("[HubApiService] Erro silencioso ao enviar telemetria:", err.message);
      });
    } catch (error) {
      // Ignora erros de telemetria para não quebrar a UX
    }
  }

  /**
   * Busca as configurações e limites do Spoke no Hub
   */
  static async getSpokeConfig(organizationId: string): Promise<{
    plan: string,
    limits: { maxLeads: number, maxCampanhas: number },
    features: { whatsapp: boolean },
    isActive: boolean
  }> {
    if (!HUB_CLIENT_ID || !HUB_CLIENT_SECRET) {
      throw new Error("Credenciais do Hub (CLIENT_ID/SECRET) não configuradas");
    }

    try {
      const response = await this.client.get('/api/public/v1/spokes/config', {
        params: { spokeType: 'premio-destaque' },
        headers: {
          'x-spoke-id': HUB_CLIENT_ID,
          'x-spoke-secret': HUB_CLIENT_SECRET,
          'x-organization-id': organizationId
        }
      });

      return response.data;
    } catch (error: any) {
      console.error(`[HubApiService] Erro ao buscar config do spoke:`, error.response?.data || error.message);
      // Retorna limites básicos em caso de erro para não travar o sistema totalmente
      return {
        plan: "free",
        limits: { maxLeads: 100, maxCampanhas: 1 },
        features: { whatsapp: false },
        isActive: false
      };
    }
  }




  /**
   * Busca o Design System da organização
   */
  static async getDesignSystem(organizationId: string): Promise<any> {
    if (!HUB_CLIENT_ID || !HUB_CLIENT_SECRET) {
      console.warn("[HubApiService] HUB_CLIENT_ID/SECRET não configurados");
      return [];
    }

    try {
      const response = await this.client.get('/api/public/v1/design-systems', {
        headers: {
          'x-spoke-id': HUB_CLIENT_ID,
          'x-spoke-secret': HUB_CLIENT_SECRET,
          'x-organization-id': organizationId
        }
      });

      return response.data || [];
    } catch (error: any) {
      console.error(`[HubApiService] Erro ao buscar Design System:`, error.response?.data || error.message);
      return [];
    }
  }
}
