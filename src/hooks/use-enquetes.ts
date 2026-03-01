import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Enquete, EnqueteStatus } from "@prisma/client";
import { apiFetch } from "@/lib/api-client";

export interface EnqueteFilters {
  status?: EnqueteStatus;
  search?: string;
}

export function useEnquetes(filters: EnqueteFilters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.search) queryParams.set("search", filters.search);

  return useQuery<Enquete[]>({
    queryKey: ["enquetes", filters],
    queryFn: async () => {
      const res = await apiFetch(`/api/enquetes?${queryParams.toString()}`);
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) throw new Error("Erro ao carregar enquetes");
      return res.json() as Promise<Enquete[]>;
    },
  });
}

export function useEnquete(id: string | null) {
  return useQuery<Enquete>({
    queryKey: ["enquetes", id],
    queryFn: async () => {
      if (!id) throw new Error("ID da enquete não fornecido");
      const res = await apiFetch(`/api/enquetes/${id}`);
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) throw new Error("Erro ao carregar enquete");
      return res.json() as Promise<Enquete>;
    },
    enabled: !!id,
  });
}

export function useCreateEnquete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch("/api/enquetes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const contentType = res.raw.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error: any = await res.json();
          throw new Error(error.error || "Erro ao criar enquete");
        }
        throw new Error(`Erro no servidor (${res.status}): Não foi possível criar a enquete.`);
      }
      return res.json() as Promise<Enquete>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquetes"] });
    },
  });
}

export function useUpdateEnquete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & any) => {
      const res = await apiFetch(`/api/enquetes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const contentType = res.raw.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error: any = await res.json();
          throw new Error(error.error || "Erro ao atualizar enquete");
        }
        throw new Error(`Erro no servidor (${res.status}): Não foi possível atualizar a enquete.`);
      }
      return res.json() as Promise<Enquete>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enquetes"] });
      queryClient.invalidateQueries({ queryKey: ["enquetes", variables.id] });
    },
  });
}

export function useDeleteEnquete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/enquetes/${id}`, {
        method: "DELETE",
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const error: any = await res.json();
        throw new Error(error.error || "Erro ao excluir enquete");
      }
      return res.json() as Promise<Enquete>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquetes"] });
    },
  });
}

export function useDuplicateEnquete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/enquetes/${id}/duplicate`, {
        method: "POST",
      });
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) {
        const error: any = await res.json();
        throw new Error(error.error || "Erro ao duplicar enquete");
      }
      return res.json() as Promise<Enquete>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquetes"] });
    },
  });
}
