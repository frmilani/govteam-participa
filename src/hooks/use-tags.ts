import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag } from "@prisma/client";

import { apiFetch } from "@/lib/api-client";

export type TagWithCount = Tag & {
  _count: {
    leads: number;
  };
};

export function useTags() {
  return useQuery<TagWithCount[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await apiFetch("/api/tags");
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) throw new Error("Erro ao carregar tags");
      return res.json() as Promise<TagWithCount[]>;
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { nome: string; cor: string }) => {
      const res = await apiFetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const error: any = await res.json();
        throw new Error(error.error || "Erro ao criar tag");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; nome?: string; cor?: string }) => {
      const res = await apiFetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const error: any = await res.json();
        throw new Error(error.error || "Erro ao atualizar tag");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/tags/${id}`, {
        method: "DELETE",
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const error: any = await res.json();
        throw new Error(error.error || "Erro ao excluir tag");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
