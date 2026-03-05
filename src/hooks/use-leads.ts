import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LeadFilters } from "@/lib/leads/lead-service";
import { Lead, LeadTag, Tag, Sexo, VerificacaoStatus } from "@prisma/client";
import { apiFetch } from "@/lib/api-client";

export type LeadWithTags = Lead & {
  tags: (LeadTag & {
    tag: Tag;
  })[];
};

export function useLeads(filters: LeadFilters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set("search", filters.search);
  if (filters.tagIds?.length) queryParams.set("tagIds", filters.tagIds.join(","));
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.optOut !== undefined) queryParams.set("optOut", String(filters.optOut));

  return useQuery<LeadWithTags[]>({
    queryKey: ["leads", filters],
    queryFn: async () => {
      const res = await apiFetch(`/api/leads?${queryParams.toString()}`);
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) throw new Error("Erro ao carregar leads");
      return res.json() as Promise<LeadWithTags[]>;
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const error: any = await res.json();
        throw new Error(error.error || "Erro ao criar lead");
      }
      return res.json() as Promise<LeadWithTags>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & any) => {
      const res = await apiFetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const error: any = await res.json();
        throw new Error(error.error || "Erro ao atualizar lead");
      }
      return res.json() as Promise<LeadWithTags>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", variables.id] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/leads/${id}`, {
        method: "DELETE",
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const error: any = await res.json();
        throw new Error(error.error || "Erro ao excluir lead");
      }
      return res.json() as Promise<LeadWithTags>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useCheckDuplicate() {
  return useMutation({
    mutationFn: async (data: { whatsapp?: string; email?: string }) => {
      const res = await apiFetch("/api/leads/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) throw new Error("Erro ao verificar duplicatas");
      return res.json() as Promise<{ isDuplicate: boolean; fields: string[] }>;
    },
  });
}

export function useOptOutLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/leads/${id}/opt-out`, {
        method: "PATCH",
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const error: any = await res.json();
        throw new Error(error.error || "Erro ao marcar opt-out");
      }
      return res.json() as Promise<LeadWithTags>;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", id] });
    },
  });
}

export function useImportLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leads: any[]) => {
      const res = await apiFetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const error: any = await res.json();
        throw new Error(error.error || "Erro ao importar leads");
      }
      return res.json() as Promise<{ created: number; errors: string[] }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
