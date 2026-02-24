"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Merge, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SugestaoTextual {
    texto: string;
    quantidade: number;
}

interface Cluster {
    id: string;
    categoriaId: string;
    categoriaNome: string;
    totalVotos: number;
    sugestaoNome: string;
    variacoesGrafica: SugestaoTextual[];
    votoLivreIds: string[];
}

export default function ConsolidacaoPage() {
    const params = useParams();
    const enqueteId = params?.id as string;
    const queryClient = useQueryClient();

    const { data: clusters, isLoading, error } = useQuery<Cluster[]>({
        queryKey: ["top-of-mind-grupos", enqueteId],
        queryFn: async () => {
            const res = await fetch(`/api/admin/enquetes/${enqueteId}/top-of-mind/grupos`);
            if (!res.ok) throw new Error("Erro ao buscar grupos");
            return res.json();
        }
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch(`/api/admin/enquetes/${enqueteId}/top-of-mind/consolidate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Falha ao consolidar");
            return res.json();
        },
        onSuccess: () => {
            alert("Bolha consolidada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["top-of-mind-grupos", enqueteId] });
        },
        onError: () => alert("Erro na consolidação")
    });

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
    if (error) return <div className="text-destructive p-8 text-center"><AlertCircle className="w-8 h-8 mx-auto mb-2" /> Erro ao carregar os dados.</div>;

    if (!clusters || clusters.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center text-muted-foreground">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <h2 className="text-xl font-semibold text-foreground">A Sala está vazia!</h2>
                <p className="mt-2">Não existem votos livres pendentes de consolidação para esta pesquisa. Tudo limpo.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in">
            <header>
                <h1 className="text-3xl font-black tracking-tight">Sala de Consolidação</h1>
                <p className="text-muted-foreground mt-2">
                    Revise os agrupamentos fonéticos feitos pela IA e oficialize as entidades (Top of Mind).
                </p>
                <div className="mt-4 p-4 rounded-xl bg-orange-100 text-orange-900 border border-orange-200 shadow-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <strong>Atenção:</strong> Votos consolidados fogem desta lista e passam a contabilizar oficialmente nas estatísticas de Analytics.
                    </div>
                </div>
            </header>

            <div className="grid gap-6">
                {clusters.map((cluster) => (
                    <ClusterCard key={cluster.id} cluster={cluster} mutation={mutation} />
                ))}
            </div>
        </div>
    );
}

function ClusterCard({ cluster, mutation }: { cluster: Cluster, mutation: any }) {
    const [actionType, setActionType] = useState<"new" | "existing">("new");
    const [novoNome, setNovoNome] = useState(cluster.sugestaoNome);

    // Simplificando pra UI, aqui poderíamos buscar opções da categoria, mas vamos forçar a criação
    const handleConsolidar = () => {
        if (!novoNome.trim()) return;

        mutation.mutate({
            votoLivreIds: cluster.votoLivreIds,
            novoEstabelecimento: novoNome,
            categoriaId: cluster.categoriaId
        });
    };

    return (
        <div className="border border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden bg-card text-card-foreground">
            <div className="p-6 pb-3 bg-muted/20 border-b">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 w-fit px-2 py-1 rounded mb-2">
                            Categoria: {cluster.categoriaNome}
                        </div>
                        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                            Bolha Dominante: "{cluster.sugestaoNome}"
                        </h3>
                        <p className="text-base mt-2 text-muted-foreground">
                            Aglomerado fonético representando <strong className="text-foreground">{cluster.totalVotos} votos</strong> coletados.
                        </p>
                    </div>
                    <div className="flex-shrink-0 bg-background border p-4 rounded-xl text-center min-w-[120px]">
                        <span className="block text-3xl font-black text-primary">{cluster.totalVotos}</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Votos Brutos</span>
                    </div>
                </div>
            </div>
            <div className="p-6 pt-4 space-y-6">

                <details className="w-full bg-background border rounded-lg group">
                    <summary className="px-4 py-3 cursor-pointer hover:bg-muted/50 rounded-lg font-medium list-none flex justify-between">
                        <span>Ver {cluster.variacoesGrafica.length} variações escritas pelos eleitores</span>
                        <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="px-4 pb-4 border-t pt-2">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {cluster.variacoesGrafica.sort((a, b) => b.quantidade - a.quantidade).map((v, i) => (
                                <li key={i} className="flex justify-between items-center bg-muted/30 p-2 rounded border">
                                    <span className="font-mono text-sm truncate pr-2" title={v.texto}>{v.texto}</span>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-bold">{v.quantidade}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>

                <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <Merge className="w-4 h-4 text-primary" /> Como Oficializar?
                        </label>
                        <Input
                            value={novoNome}
                            onChange={(e) => setNovoNome(e.target.value)}
                            placeholder="Nome Oficial da Entidade"
                            className="font-medium h-11"
                        />
                        <p className="text-xs text-muted-foreground">Isso criará a entidade formal e apontará os {cluster.totalVotos} votos para ela.</p>
                    </div>
                    <Button
                        onClick={handleConsolidar}
                        disabled={mutation.isPending || !novoNome.trim()}
                        className="h-11 w-full md:w-auto px-8 gap-2 font-bold whitespace-nowrap"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Fundir Entidade
                    </Button>
                </div>
            </div>
        </div>
    );
}
