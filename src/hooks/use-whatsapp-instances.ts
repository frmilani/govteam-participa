import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface WhatsappInstance {
    id: string;
    name: string;
    number: string | null;
    status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
}

export function useWhatsappInstances() {
    return useQuery<WhatsappInstance[]>({
        queryKey: ["whatsapp-instances"],
        queryFn: async () => {
            const response = await apiFetch("/api/whatsapp/instances");
            if (response.denied) throw new Error("HPAC_DENIED");
            if (!response.ok) {
                throw new Error("Erro ao buscar instâncias do WhatsApp");
            }
            return response.json() as Promise<WhatsappInstance[]>;
        },
    });
}
