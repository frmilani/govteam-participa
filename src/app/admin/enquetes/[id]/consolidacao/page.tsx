"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Merge, Plus, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEstabelecimentos } from "@/hooks/use-estabelecimentos";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api-client";

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
    const router = useRouter();
    const enqueteId = params?.id as string;
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    // Filtro de categoria
    const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("all");

    const { data: clusters, isLoading, error } = useQuery<Cluster[]>({
        queryKey: ["top-of-mind-grupos", enqueteId],
        queryFn: async () => {
            const res = await apiFetch(`/api/admin/enquetes/${enqueteId}/top-of-mind/grupos`);
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Erro ao buscar grupos");
            return res.json() as Promise<Cluster[]>;
        }
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await apiFetch(`/api/admin/enquetes/${enqueteId}/top-of-mind/consolidate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Falha ao consolidar");
            return res.json();
        },
        onSuccess: () => {
            showToast("Bolha consolidada com sucesso!", "success");
            queryClient.invalidateQueries({ queryKey: ["top-of-mind-grupos", enqueteId] });
            queryClient.invalidateQueries({ queryKey: ["estabelecimentos"] });
        },
        onError: () => showToast("Erro na consolidação", "error")
    });
    const uniqueCategorias = React.useMemo(() => {
        if (!clusters) return [];
        const map = new Map<string, string>();
        clusters.forEach(c => map.set(c.categoriaId, c.categoriaNome));
        return Array.from(map.entries()).map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome));
    }, [clusters]);

    const filteredClusters = React.useMemo(() => {
        if (!clusters) return [];
        if (selectedCategoriaId === "all") return clusters;
        return clusters.filter(c => c.categoriaId === selectedCategoriaId);
    }, [clusters, selectedCategoriaId]);

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
    const totalBolhas = filteredClusters.length;
    const totalVotos = filteredClusters.reduce((acc, curr) => acc + curr.totalVotos, 0);

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in">
            <header className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-10 w-10 p-0 rounded-md shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Sala de Consolidação</h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">
                                Revise os agrupamentos fonéticos feitos pela IA e oficialize as entidades (Top of Mind).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dashboard / Painel de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border rounded-xl p-5 shadow-sm flex flex-col justify-center">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bolhas (Grupos)</span>
                        <span className="text-4xl font-black text-foreground">{totalBolhas}</span>
                    </div>
                    <div className="bg-card border rounded-xl p-5 shadow-sm flex flex-col justify-center">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total de Votos Brutos</span>
                        <span className="text-4xl font-black text-primary">{totalVotos}</span>
                    </div>
                    <div className="bg-card border rounded-xl p-5 shadow-sm flex flex-col justify-center space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block">Filtrar por Categoria</label>
                        <select
                            className="w-full flex h-11 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                            value={selectedCategoriaId}
                            onChange={(e) => setSelectedCategoriaId(e.target.value)}
                        >
                            <option value="all">Todas as Categorias</option>
                            {uniqueCategorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-orange-100/50 dark:bg-orange-950/30 text-orange-900 border border-orange-200/50 dark:text-orange-200 dark:border-orange-800 shadow-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm font-medium">
                        <strong>Atenção:</strong> Votos consolidados fogem desta lista e passam a contabilizar oficialmente nas estatísticas de Analytics.
                    </div>
                </div>
            </header>

            <div className="grid gap-6">
                {filteredClusters.length === 0 ? (
                    <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
                        <p className="text-muted-foreground">Nenhuma bolha encontrada para esta seleção.</p>
                    </div>
                ) : (
                    filteredClusters.map((cluster) => (
                        <ClusterCard key={cluster.id} cluster={cluster} mutation={mutation} />
                    ))
                )}
            </div>
        </div>
    );
}

function ClusterCard({ cluster, mutation }: { cluster: Cluster, mutation: any }) {
    const [actionType, setActionType] = useState<"new" | "existing">("new");
    const [novoNome, setNovoNome] = useState(cluster.sugestaoNome);
    const [selectedEstabelecimentoId, setSelectedEstabelecimentoId] = useState("");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const { data: estabelecimentos, isLoading: isLoadingEstabelecimentos } = useEstabelecimentos({
        segmentoId: cluster.categoriaId
    });

    const handlePreConsolidar = () => {
        if (actionType === "new" && !novoNome.trim()) return;
        if (actionType === "existing" && !selectedEstabelecimentoId) return;
        setIsConfirmModalOpen(true);
    };

    const handleConsolidar = () => {
        setIsConfirmModalOpen(false);
        mutation.mutate({
            votoLivreIds: cluster.votoLivreIds,
            novoEstabelecimento: actionType === "new" ? novoNome : undefined,
            estabelecimentoId: actionType === "existing" ? selectedEstabelecimentoId : undefined,
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
                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                            <Merge className="w-4 h-4 text-primary" /> Como Oficializar?
                        </label>

                        <div className="flex gap-4 border-b border-border/50 pb-2 mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" className="text-primary focus:ring-primary h-4 w-4 border-input" checked={actionType === "new"} onChange={() => setActionType("new")} />
                                <span className="text-sm font-medium">Criar Entidade Nova</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" className="text-primary focus:ring-primary h-4 w-4 border-input" checked={actionType === "existing"} onChange={() => setActionType("existing")} />
                                <span className="text-sm font-medium">Vincular Existente</span>
                            </label>
                        </div>

                        {actionType === "new" ? (
                            <>
                                <Input
                                    value={novoNome}
                                    onChange={(e) => setNovoNome(e.target.value)}
                                    placeholder="Nome Oficial da Entidade"
                                    className="font-medium h-11"
                                />
                                <p className="text-xs text-muted-foreground">Isso criará a entidade formal e apontará os {cluster.totalVotos} votos para ela.</p>
                            </>
                        ) : (
                            <>
                                {isLoadingEstabelecimentos ? (
                                    <div className="h-11 flex items-center px-3 text-sm text-muted-foreground bg-muted/50 rounded-md animate-pulse">
                                        Carregando estabelecimentos...
                                    </div>
                                ) : (
                                    <select
                                        className="w-full flex h-11 min-h-11 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                                        value={selectedEstabelecimentoId}
                                        onChange={(e) => setSelectedEstabelecimentoId(e.target.value)}
                                    >
                                        <option value="" disabled>-- Selecione da categoria --</option>
                                        {estabelecimentos && estabelecimentos.length > 0 ? (
                                            estabelecimentos?.map(est => (
                                                <option key={est.id} value={est.id}>{est.nome}</option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Nenhuma entidade cadastrada nesta categoria</option>
                                        )}
                                    </select>
                                )}
                                <p className="text-xs text-muted-foreground">Isso apontará os {cluster.totalVotos} votos para a entidade existente selecionada.</p>
                            </>
                        )}
                    </div>
                    <Button
                        onClick={handlePreConsolidar}
                        disabled={mutation.isPending || (actionType === "new" ? !novoNome.trim() : !selectedEstabelecimentoId)}
                        className="h-11 w-full md:w-auto px-8 gap-2 font-bold whitespace-nowrap"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Merge className="w-4 h-4" />}
                        Fundir Votos
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Confirmação de Fusão"
                description="Você está prestes a consolidar os votos dispersos."
                type="warning"
                confirmLabel="Sim, Fundir Votos"
                onConfirm={handleConsolidar}
            >
                <div className="space-y-4 py-4">
                    <p className="text-sm">
                        Esta ação irá contabilizar definitivamente os <strong>{cluster.totalVotos} votos</strong> coletados nesta bolha para a seguinte entidade:
                    </p>
                    <div className="bg-muted p-4 rounded-xl border">
                        <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Entidade Selecionada</p>
                        <p className="text-lg font-black text-primary">
                            {actionType === "new"
                                ? novoNome
                                : estabelecimentos?.find(e => e.id === selectedEstabelecimentoId)?.nome || "Entidade Desconhecida"}
                        </p>
                    </div>
                    {actionType === "new" && (
                        <p className="text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                            Uma nova entidade de pesquisa será criada no sistema com este nome e vinculada a esta categoria.
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Ao confirmar, estes votos deixarão a sala de consolidação e não poderão ser desfeitos facilmente. Deseja prosseguir?
                    </p>
                </div>
            </Modal>
        </div>
    );
}
