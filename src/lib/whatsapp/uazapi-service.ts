import axios from 'axios';

const UAZAPI_URL = process.env.WHATSAPP_API_URL;
const UAZAPI_KEY = process.env.WHATSAPP_API_KEY;

export class UazApiService {
    /**
     * Cria uma nova instância na UazAPI (Passo 2)
     */
    static async createInstance(instanceName: string) {
        const url = `${UAZAPI_URL}/instance/init`;
        const payload = {
            name: instanceName,
            systemName: 'premio-destaque',
            adminField01: 'premio-destaque',
            adminField02: 'orchestrated-instance'
        };
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'admintoken': UAZAPI_KEY
        };

        console.log(`[UazAPI] INICIANDO CRIAÇÃO DE INSTÂNCIA: ${instanceName}`);
        console.log(`[UazAPI] URL: ${url}`);
        // Log sensitive info partially or fully depending on privacy needs, but here user asked for logs.
        console.log(`[UazAPI] Payload:`, JSON.stringify(payload, null, 2));

        try {
            const response = await axios.post(url, payload, { headers });
            console.log(`[UazAPI] SUCESSO AO CRIAR INSTÂNCIA:`, JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error: any) {
            console.error(`[UazAPI] ERRO AO CRIAR INSTÂNCIA:`, error.message);
            if (error.response) {
                console.error(`[UazAPI] Status: ${error.response.status}`);
                console.error(`[UazAPI] Erro Data:`, JSON.stringify(error.response.data, null, 2));
            }
            throw new Error(error.response?.data?.message || error.message || "Erro ao criar instância na UazAPI");
        }
    }

    /**
     * Conecta uma instância (gera QR Code) (Passo 3)
     */
    static async connectInstance(instanceToken: string, phone?: string) {
        const url = `${UAZAPI_URL}/instance/connect`;
        const payload = phone ? { phone } : {};
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'token': instanceToken
        };

        console.log(`[UazAPI] INICIANDO CONEXÃO DE INSTÂNCIA`);
        console.log(`[UazAPI] URL: ${url}`);
        console.log(`[UazAPI] Payload:`, JSON.stringify(payload, null, 2));

        try {
            const response = await axios.post(url, payload, { headers });
            console.log(`[UazAPI] SUCESSO AO CONECTAR INSTÂNCIA:`, JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error: any) {
            console.error(`[UazAPI] ERRO AO CONECTAR INSTÂNCIA:`, error.message);
            if (error.response) {
                console.error(`[UazAPI] Status: ${error.response.status}`);
                console.error(`[UazAPI] Erro Data:`, JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }

    /**
     * Verifica o status da conexão (Passo 3)
     */
    static async getConnectionState(instanceToken: string) {
        const url = `${UAZAPI_URL}/instance/status`;
        const headers = {
            'Accept': 'application/json',
            'token': instanceToken
        };

        console.log(`[UazAPI] VERIFICANDO STATUS`);
        console.log(`[UazAPI] URL: ${url}`);

        try {
            const response = await axios.get(url, { headers });
            console.log(`[UazAPI] STATUS RECEBIDO:`, JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn(`[UazAPI] INSTÂNCIA NÃO ENCONTRADA (404)`);
                return { instance: { state: 'NOT_FOUND' } };
            }
            console.error(`[UazAPI] ERRO AO VERIFICAR STATUS:`, error.message);
            return { instance: { state: 'ERROR' } };
        }
    }

    /**
     * Deleta uma instância (Passo 3)
     */
    static async deleteInstance(instanceToken: string) {
        const url = `${UAZAPI_URL}/instance`;
        const headers = {
            'Accept': 'application/json',
            'token': instanceToken
        };

        console.log(`[UazAPI] DELETANDO INSTÂNCIA`);
        console.log(`[UazAPI] URL: ${url}`);

        try {
            const response = await axios.delete(url, { headers });
            console.log(`[UazAPI] INSTÂNCIA DELETADA COM SUCESSO:`, JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn(`[UazAPI] INSTÂNCIA JÁ NÃO EXISTIA (404)`);
                return { success: true, alreadyDeleted: true };
            }
            console.error(`[UazAPI] ERRO AO DELETAR INSTÂNCIA:`, error.message);
            if (error.response) {
                console.error(`[UazAPI] Status: ${error.response.status}`);
                console.error(`[UazAPI] Erro Data:`, JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }

    /**
     * Lista todas as instâncias na UazAPI
     */
    static async listInstances() {
        const url = `${UAZAPI_URL}/instance`;
        const headers = {
            'Accept': 'application/json',
            'admintoken': UAZAPI_KEY
        };

        console.log(`[UazAPI] LISTANDO TODAS AS INSTÂNCIAS`);
        try {
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error: any) {
            console.error(`[UazAPI] ERRO AO LISTAR INSTÂNCIAS:`, error.message);
            return [];
        }
    }

    /**
     * Faz logout de uma instância (desconecta sem deletar do UazAPI)
     */
    static async logoutInstance(instanceToken: string) {
        const url = `${UAZAPI_URL}/instance/logout`;
        const headers = {
            'Accept': 'application/json',
            'token': instanceToken
        };

        console.log(`[UazAPI] REALIZANDO LOGOUT`);
        try {
            const response = await axios.post(url, {}, { headers });
            return response.data;
        } catch (error: any) {
            console.error(`[UazAPI] ERRO AO REALIZAR LOGOUT:`, error.message);
            throw error;
        }
    }
}
