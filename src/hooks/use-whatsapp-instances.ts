import { useQuery } from "@tanstack/react-query";

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
            const response = await fetch("/api/whatsapp/instances");
            if (!response.ok) {
                throw new Error("Erro ao buscar instâncias do WhatsApp");
            }
            return response.json();
        },
    });
}
