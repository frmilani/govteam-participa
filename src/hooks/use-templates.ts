import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

interface PerguntaQualidade {
    id?: string;
    texto: string;
    tipo: string;
    obrigatorio: boolean;
    opcoes?: string[] | null;
    ordem: number;
}

export interface TemplateQualidade {
    id: string;
    organizationId: string;
    nome: string;
    perguntas?: PerguntaQualidade[];
    _count?: { perguntas: number };
    updatedAt: string;
    createdAt: string;
}

export function useTemplates() {
    return useQuery<TemplateQualidade[]>({
        queryKey: ["templates-qualidade"],
        queryFn: async () => {
            const res = await apiFetch("/api/admin/templates-qualidade");
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Failed to load templates");
            return res.json() as Promise<TemplateQualidade[]>;
        },
    });
}

export function useTemplate(id?: string) {
    return useQuery<TemplateQualidade>({
        queryKey: ["templates-qualidade", id],
        queryFn: async () => {
            const res = await apiFetch(`/api/admin/templates-qualidade/${id}`);
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Failed to load template");
            return res.json() as Promise<TemplateQualidade>;
        },
        enabled: !!id,
    });
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/admin/templates-qualidade/${id}`, {
                method: "DELETE",
            });
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Failed to delete template");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates-qualidade"] });
        },
    });
}

export function useDuplicateTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/admin/templates-qualidade/${id}/duplicate`, {
                method: "POST",
            });
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Failed to duplicate template");
            return res.json() as Promise<TemplateQualidade>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates-qualidade"] });
        },
    });
}

export function useSaveTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id?: string; data: any }) => {
            const url = id
                ? `/api/admin/templates-qualidade/${id}`
                : `/api/admin/templates-qualidade`;

            const res = await apiFetch(url, {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Failed to save template");
            return res.json() as Promise<TemplateQualidade>;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["templates-qualidade"] });
            if (variables.id) {
                queryClient.invalidateQueries({ queryKey: ["templates-qualidade", variables.id] });
            }
        },
    });
}
