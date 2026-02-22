"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface Estabelecimento {
  id: string;
  nome: string;
  logoUrl?: string | null;
  descricao?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  alias?: string | null;
  ativo: boolean;
  // E1.1/E1.2: Motor Universal de Pesquisa
  tipo?: string | null;
  metadados?: Record<string, unknown> | null;
  segmentos: {
    segmento: {
      id: string;
      nome: string;
      cor: string | null;
    };
  }[];
}

export function useEstabelecimentos(filters: {
  segmentoId?: string;
  ativo?: boolean;
  search?: string;
  tipo?: string;
} = {}) {
  const queryParams = new URLSearchParams();
  if (filters.segmentoId) queryParams.set("segmentoId", filters.segmentoId);
  if (filters.ativo !== undefined) queryParams.set("ativo", String(filters.ativo));
  if (filters.search) queryParams.set("search", filters.search);
  if (filters.tipo && filters.tipo !== 'all') queryParams.set("tipo", filters.tipo);

  return useQuery<Estabelecimento[]>({
    queryKey: ["estabelecimentos", filters],
    queryFn: async () => {
      const response = await apiFetch(`/api/estabelecimentos?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Erro ao carregar estabelecimentos");
      return response.json();
    },
  });
}

export function useEstabelecimento(id: string | null) {
  return useQuery<Estabelecimento>({
    queryKey: ["estabelecimento", id],
    queryFn: async () => {
      const response = await apiFetch(`/api/estabelecimentos/${id}`);
      if (!response.ok) throw new Error("Erro ao carregar estabelecimento");
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateEstabelecimento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiFetch("/api/estabelecimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar estabelecimento");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estabelecimentos"] });
    },
  });
}

export function useUpdateEstabelecimento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiFetch(`/api/estabelecimentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar estabelecimento");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["estabelecimentos"] });
      queryClient.invalidateQueries({ queryKey: ["estabelecimento", variables.id] });
    },
  });
}

export function useToggleEstabelecimento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`/api/estabelecimentos/${id}/toggle`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao alterar status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estabelecimentos"] });
    },
  });
}

export function usePresignedUrl() {
  return useMutation({
    mutationFn: async ({ fileName, fileType }: { fileName: string; fileType: string }) => {
      const response = await apiFetch("/api/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar URL de upload");
      }
      return response.json();
    },
  });
}

export function useImportEstabelecimentos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (estabelecimentos: any[]) => {
      const response = await apiFetch("/api/estabelecimentos/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estabelecimentos }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao importar estabelecimentos");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estabelecimentos"] });
    },
  });
}
