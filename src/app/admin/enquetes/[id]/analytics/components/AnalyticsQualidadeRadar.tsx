"use client";

import { useAnalyticsQualidade } from "@/hooks/use-analytics";
import { Loader2, AlertCircle, Quote } from "lucide-react";
import { SmartChart } from "@/components/analytics/SmartChart";

export function AnalyticsQualidadeRadar({ enqueteId, categoriaId }: { enqueteId: string, categoriaId?: string }) {
    const { data: radarData, isLoading, error } = useAnalyticsQualidade(enqueteId, categoriaId);

    if (isLoading) return (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary size-8" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Analizando jornada de qualidade...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 text-destructive border-2 border-dashed border-red-500/20 rounded-2xl bg-red-500/5 flex flex-col items-center gap-2">
            <AlertCircle className="size-8" />
            <p className="font-bold">Erro no processamento qualitativo</p>
        </div>
    );

    if (!radarData || radarData.length === 0) {
        return (
            <div className="text-center p-20 bg-muted/20 border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center gap-4">
                <div className="size-16 bg-muted/40 rounded-full flex items-center justify-center">
                    <Quote className="size-8 text-muted-foreground/40" />
                </div>
                <div>
                    <h3 className="font-black text-foreground uppercase tracking-widest text-sm">Sem avaliações suficientes</h3>
                </div>
            </div>
        );
    }

    if (radarData[0].insuficiente) {
        return (
            <div className="flex bg-cyan-500/10 text-cyan-600 p-8 rounded-3xl border border-cyan-500/20 backdrop-blur-md mt-6">
                <AlertCircle className="size-8 mr-6 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-black uppercase tracking-widest text-sm text-cyan-700">Privacidade Qualitativa Ativa</h4>
                    <p className="text-sm mt-2 opacity-90 leading-relaxed font-medium">{radarData[0].mensagem}</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-cyan-500 text-white w-fit px-3 py-1 rounded-full">
                        THRESHOLD DE ANONIMATO ATIVO
                    </div>
                </div>
            </div>
        );
    }

    const chartData = radarData.map((d: any) => ({
        label: d.pergunta,
        value: Number(d.media)
    }));

    const maxAverage = 5;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 animate-in fade-in zoom-in-95 duration-700">
            <SmartChart
                data={chartData}
                widgetType="radar"
                title="Consolidado Qualitativo"
                fieldName="Média por Pergunta"
                className="h-full scale-[1.01]"
            />

            <div className="bg-card/60 backdrop-blur-sm shadow-sm border border-border/40 rounded-2xl p-8 h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-8 border-b border-border/20 pb-4">
                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Quote size={20} />
                    </div>
                    <h4 className="font-black uppercase text-xs tracking-[0.2em] text-muted-foreground/80">Diagnóstico de Performance</h4>
                </div>

                <div className="space-y-6">
                    {radarData.map((d: any, i: number) => (
                        <div key={i} className="group">
                            <div className="flex justify-between items-end mb-2">
                                <span className="font-bold text-foreground text-xs leading-snug max-w-[80%] group-hover:text-primary transition-colors cursor-default">{d.pergunta}</span>
                                <span className="font-black text-lg text-primary">{d.media}</span>
                            </div>
                            <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-primary h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                    style={{ width: `${(d.media / maxAverage) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border/20 text-[10px] text-muted-foreground flex items-center justify-between font-black uppercase tracking-widest opacity-40">
                    <span>Métrica: Score 0-5</span>
                    <span>N = {radarData[0].respostas || 0}</span>
                </div>
            </div>
        </div>
    );
}
