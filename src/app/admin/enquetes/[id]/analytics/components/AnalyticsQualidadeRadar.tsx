"use client";

import { useAnalyticsQualidade } from "@/hooks/use-analytics";
import { Loader2, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";

const RadarChart = dynamic(() => import('recharts').then(mod => mod.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then(mod => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then(mod => mod.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import('recharts').then(mod => mod.PolarRadiusAxis), { ssr: false });
const Radar = dynamic(() => import('recharts').then(mod => mod.Radar), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

export function AnalyticsQualidadeRadar({ enqueteId, categoriaId }: { enqueteId: string, categoriaId?: string }) {
    const { data: radarData, isLoading, error } = useAnalyticsQualidade(enqueteId, categoriaId);

    if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (error) return <div className="p-4 text-destructive border rounded">Erro ao carregar mapa de Qualidade</div>;

    if (!radarData || radarData.length === 0) {
        return <div className="text-center p-8 text-muted-foreground bg-muted/20 border rounded-xl">Sem avaliação de Qualidade suficiente para este recorte.</div>;
    }

    if (radarData[0].insuficiente) {
        return (
            <div className="flex bg-orange-100 text-orange-800 p-6 rounded-xl border border-orange-200 mt-6">
                <AlertCircle className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-bold">Privacidade — Regra da Urna Trancada</h4>
                    <p className="text-sm mt-1 mb-0">{radarData[0].mensagem}</p>
                </div>
            </div>
        );
    }

    const maxAverage = 5;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-center">
            <div className="bg-card shadow border rounded-xl p-8 flex justify-center items-center">
                <div className="w-full max-w-sm aspect-square relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} outerRadius="75%">
                            <PolarGrid stroke="#e5e7eb" strokeWidth={2} />
                            <PolarAngleAxis dataKey="pergunta" tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 700 }} />
                            <PolarRadiusAxis domain={[0, maxAverage]} tickCount={6} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Radar name="Média" dataKey="media" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} strokeWidth={3} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-card shadow border rounded-xl p-6 h-full flex flex-col justify-center">
                <h4 className="font-bold mb-4 uppercase text-sm tracking-widest text-muted-foreground">Diagnóstico de Qualidade</h4>
                <div className="space-y-4">
                    {radarData.map((d: any, i: number) => (
                        <div key={i}>
                            <div className="flex justify-between items-end mb-1">
                                <span className="font-semibold text-foreground text-sm leading-tight max-w-[80%]">{d.pergunta}</span>
                                <span className="font-black text-lg text-primary">{d.media}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(d.media / maxAverage) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
