"use client";

import { useAnalyticsDemographics } from "@/hooks/use-analytics";
import { Loader2, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

export function AnalyticsDemographicsCharts({ enqueteId, estabelecimentoId }: { enqueteId: string, estabelecimentoId?: string }) {
    const { data: demo, isLoading, error } = useAnalyticsDemographics(enqueteId, estabelecimentoId);

    if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (error) return <div className="p-4 text-destructive border rounded">Erro ao carregar gráficos</div>;

    if (!demo || Object.keys(demo).length === 0) {
        return <div className="text-center p-8 text-muted-foreground bg-muted/20 border rounded-xl">Sem dados demográficos representativos.</div>;
    }

    if (demo.insuficiente) {
        return (
            <div className="flex bg-orange-100 text-orange-800 p-6 rounded-xl border border-orange-200">
                <AlertCircle className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-bold">Privacidade — Regra da Urna Trancada</h4>
                    <p className="text-sm mt-1 mb-0">{demo.mensagem}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {Object.entries(demo).map(([category, values]: [string, any], i) => {
                const data = Object.entries(values).map(([name, count]) => ({ name, count }));
                data.sort((a: any, b: any) => b.count - a.count); // Ordenar barras

                if (data.length === 0) return null;

                return (
                    <div key={i} className="bg-card shadow border rounded-xl p-6">
                        <h4 className="font-bold mb-4 uppercase text-sm tracking-widest text-muted-foreground">{category}</h4>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                                    <XAxis type="number" allowDecimals={false} hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ color: '#000', fontWeight: 'bold', marginBottom: '4px' }}
                                    />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} name="Eleitores" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
