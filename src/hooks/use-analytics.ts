import { useQuery } from '@tanstack/react-query';

export function useAnalyticsOverview(enqueteId: string) {
    return useQuery({
        queryKey: ['analytics', 'overview', enqueteId],
        queryFn: async () => {
            const res = await fetch(`/api/enquetes/${enqueteId}/analytics/overview`);
            if (!res.ok) throw new Error("Erro ao carregar overview");
            return res.json();
        }
    });
}

export function useAnalyticsRanking(enqueteId: string, categoriaId?: string) {
    return useQuery({
        queryKey: ['analytics', 'ranking', enqueteId, categoriaId],
        queryFn: async () => {
            const url = new URL(`/api/enquetes/${enqueteId}/analytics/ranking`, window.location.origin);
            if (categoriaId) url.searchParams.set('categoriaId', categoriaId);

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Erro ao carregar ranking");
            return res.json();
        }
    });
}

export function useAnalyticsDemographics(enqueteId: string, estabelecimentoId?: string) {
    return useQuery({
        queryKey: ['analytics', 'demographics', enqueteId, estabelecimentoId],
        queryFn: async () => {
            const url = new URL(`/api/enquetes/${enqueteId}/analytics/demographics`, window.location.origin);
            if (estabelecimentoId && estabelecimentoId !== 'all') {
                url.searchParams.set('estabelecimentoId', estabelecimentoId);
            }

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Erro ao carregar demographics");
            return res.json();
        }
    });
}

export function useAnalyticsQualidade(enqueteId: string, categoriaId?: string) {
    return useQuery({
        queryKey: ['analytics', 'qualidade', enqueteId, categoriaId],
        queryFn: async () => {
            const url = new URL(`/api/enquetes/${enqueteId}/analytics/qualidade`, window.location.origin);
            if (categoriaId) url.searchParams.set('categoriaId', categoriaId);

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Erro ao carregar qualidade");
            return res.json();
        }
    });
}
