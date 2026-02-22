"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface Segmento {
  id: string;
  nome: string;
  slug: string;
  paiId: string | null;
  cor: string | null;
  icone: string | null;
  ordem: number;
  templateQualidadeId?: string | null;
  filhos?: Segmento[];
  _count?: {
    estabelecimentos: number;
    filhos: number;
  };
}

export function useSegmentos(options?: { onlyPopulated?: boolean }) {
  const onlyPopulated = options?.onlyPopulated ?? false;
  return useQuery<Segmento[]>({
    queryKey: ["segmentos", { onlyPopulated }],
    queryFn: async () => {
      const response = await apiFetch(`/api/segmentos${onlyPopulated ? "?onlyPopulated=true" : ""}`);
      if (!response.ok) throw new Error("Erro ao carregar segmentos");
      return response.json();
    },
  });
}

export function useCreateSegmento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Segmento>) => {
      const response = await apiFetch("/api/segmentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar segmento");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segmentos"] });
    },
  });
}

export function useUpdateSegmento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Segmento> & { id: string }) => {
      const response = await apiFetch(`/api/segmentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar segmento");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segmentos"] });
    },
  });
}

export function useDeleteSegmento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`/api/segmentos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir segmento");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segmentos"] });
    },
  });
}

export function useReorderSegmentos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { id: string; ordem: number }[]) => {
      const response = await apiFetch("/api/segmentos/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!response.ok) throw new Error("Erro ao reordenar segmentos");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segmentos"] });
    },
  });
}
