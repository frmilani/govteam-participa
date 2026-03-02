"use client";

import { useAnalyticsDemographics } from "@/hooks/use-analytics";
import { Loader2, AlertCircle, PieChart, BarChart3, Users } from "lucide-react";
import { SmartChart } from "@/components/analytics/SmartChart";

export function AnalyticsDemographicsCharts({ enqueteId, estabelecimentoId }: { enqueteId: string, estabelecimentoId?: string }) {
    const { data: demo, isLoading, error } = useAnalyticsDemographics(enqueteId, estabelecimentoId);

    if (isLoading) return (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary size-8" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Processando dados demográficos...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 text-destructive border-2 border-dashed border-red-500/20 rounded-2xl bg-red-500/5 flex flex-col items-center gap-2">
            <AlertCircle className="size-8" />
            <p className="font-bold">Falha na extração de dados</p>
            <p className="text-xs opacity-70">Não foi possível processar a base demográfica desta enquete.</p>
        </div>
    );

    if (!demo || Object.entries(demo).filter(([k]) => k !== 'insuficiente').length === 0) {
        return (
            <div className="text-center p-20 bg-muted/20 border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center gap-4">
                <div className="size-16 bg-muted/40 rounded-full flex items-center justify-center">
                    <Users className="size-8 text-muted-foreground/40" />
                </div>
                <div>
                    <h3 className="font-black text-foreground uppercase tracking-widest text-sm">Sem dados representativos</h3>
                    <p className="text-xs text-muted-foreground mt-1">A amostragem atual ainda não atingiu o threshold de privacidade.</p>
                </div>
            </div>
        );
    }

    if (demo.insuficiente) {
        return (
            <div className="flex bg-orange-500/10 text-orange-500 p-8 rounded-3xl border border-orange-500/20 backdrop-blur-md">
                <AlertCircle className="size-8 mr-6 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-black uppercase tracking-widest text-sm">Privacidade Protegida</h4>
                    <p className="text-sm mt-2 opacity-90 leading-relaxed">{demo.mensagem}</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-orange-500 text-white w-fit px-3 py-1 rounded-full">
                        Regra da Urna Trancada Ativa
                    </div>
                </div>
            </div>
        );
    }

    // Filtrar e ordenar categorias
    const categories = Object.entries(demo).filter(([k]) => k !== 'insuficiente');

    return (
        <div className="space-y-10 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <Users className="text-primary size-6" />
                        Perfil da Audiência
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-black opacity-60">Distribuição por atributos biográficos e sociais</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {categories.map(([category, values]: [string, any], i) => {
                    const chartData = Object.entries(values).map(([label, value]) => ({
                        label,
                        value: value as number
                    }));

                    chartData.sort((a, b) => b.value - a.value);

                    const isSexo = category.toLowerCase().includes('sexo') || category.toLowerCase().includes('genero');
                    const isIdade = category.toLowerCase().includes('idade') || category.toLowerCase().includes('faixa');
                    const widgetType = isSexo ? 'doughnut' : isIdade ? 'pie' : 'bar_horizontal';

                    return (
                        <SmartChart
                            key={i}
                            data={chartData}
                            widgetType={widgetType}
                            title={category}
                            showTotal
                            colorScheme={isSexo ? 'traffic_light' : isIdade ? 'gradient' : 'default'}
                            className="h-full border-primary/5"
                        />
                    );
                })}
            </div>

            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 text-[9px] text-primary/60 uppercase tracking-[0.2em] text-center font-black">
                Dados processados com tecnologia Hub Analytics &copy; 2026
            </div>
        </div>
    );
}
