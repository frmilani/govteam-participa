"use client";

import { useAnalyticsOverview } from "@/hooks/use-analytics";
import { Loader2, Users, CheckCircle, PieChart, Activity } from "lucide-react";

export function AnalyticsOverviewCards({ enqueteId }: { enqueteId: string }) {
    const { data: overview, isLoading, error } = useAnalyticsOverview(enqueteId);

    if (isLoading) return <div className="p-4 flex gap-4"><Loader2 className="animate-spin w-6 h-6 text-primary" /> Carregando Visão Geral...</div>
    if (error || !overview) return <div className="p-4 text-destructive border rounded">Erro ao carregar Visão Geral</div>

    const conclusaoFormatada = overview.taxaConclusaoMedia ? overview.taxaConclusaoMedia.toFixed(1) : "0.0";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Respostas</p>
                    <p className="text-3xl font-black">{overview.totalRespostas}</p>
                </div>
            </div>

            <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">% Médio Conclusão</p>
                    <p className="text-3xl font-black">{conclusaoFormatada}%</p>
                </div>
            </div>

            <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Geração de Votos</p>
                    <p className="text-3xl font-black">{overview.votosGerais}</p>
                </div>
            </div>

            <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-600">
                    <PieChart className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Mix de Coleta</p>
                    <div className="flex flex-col text-sm font-semibold mt-1">
                        <span className="text-blue-600">Lista: {overview.distribuicao?.lista || 0}</span>
                        <span className="text-orange-600">Livre: {overview.distribuicao?.livre || 0}</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
