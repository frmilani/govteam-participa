import { useQuery, useMutation } from "@tanstack/react-query";
import { HubFormSchema } from "@/lib/hub-api";

/**
 * Hook para buscar o schema do formulário do Hub via Proxy API
 */
export function useFormSchema(publicId: string | null) {
  return useQuery<HubFormSchema>({
    queryKey: ["form-schema", publicId],
    queryFn: async () => {
      if (!publicId) throw new Error("ID do formulário não fornecido");
      const res = await fetch(`/api/forms/${publicId}/schema`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao carregar formulário");
      }
      return res.json();
    },
    enabled: !!publicId,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
}

/**
 * Hook para registrar telemetria (view ou submission)
 */
export function useTrackEvent() {
  return useMutation({
    mutationFn: async ({ 
      formId, 
      eventType, 
      metadata 
    }: { 
      formId: string; 
      eventType: 'view' | 'submission_complete'; 
      metadata?: any 
    }) => {
      const res = await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, eventType, metadata }),
      });
      return res.json();
    },
  });
}
