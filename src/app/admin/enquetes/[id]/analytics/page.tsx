"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye,
    FileText,
    TrendingUp,
    Clock,
    Smartphone,
    CalendarDays,
    Download,
    Filter,
    ArrowLeft,
    Layers,
    Building2,
    Users,
    Sparkles,
    X
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { KpiCard } from "@/components/analytics/KpiCard";
import { AiInsightsCard } from "@/components/analytics/AiInsightsCard";
import { ModernFunnel } from "@/components/analytics/ModernFunnel";
import { TrafficHeatmap } from "@/components/analytics/TrafficHeatmap";
import { AnalyticsOverviewCards } from "./components/AnalyticsOverviewCards";
import { AnalyticsRankingTable } from "./components/AnalyticsRankingTable";
import { AnalyticsDemographicsCharts } from "./components/AnalyticsDemographicsCharts";
import { AnalyticsQualidadeRadar } from "./components/AnalyticsQualidadeRadar";
import { SmartChart } from "@/components/analytics/SmartChart";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    LineChart,
    Line
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";

import { DateRange } from "@/lib/analytics/analytics-service";

type Tab = "funnel" | "heatmap" | "trend" | "device" | "votos" | "demografia" | "qualidade";

export default function AnalyticsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("funnel");
    const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");
    const [range, setRange] = useState<DateRange>("7D");
    const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["analytics", id, range, customRange],
        queryFn: async () => {
            const response = await axios.get(`/api/enquetes/${id}/analytics/overview`, {
                params: {
                    range,
                    from: customRange?.from.toISOString(),
                    to: customRange?.to.toISOString()
                }
            });
            return response.data;
        },
    });

    const funnelData = useMemo(() => {
        if (!data?.funnel) return [];
        const stages = [];
        const f = data?.funnel;
        const e = data?.engagement;
        if (!f) return [];

        if (f.leads > 0) {
            stages.push({
                id: 'leads',
                label: "Base de Leads",
                value: f.leads,
                color: "#6366F1", // Indigo
                darkColor: "#4338CA",
                percentage: '100%'
            });
        }

        if (f.enviados > 0) {
            stages.push({
                id: 'enviados',
                label: "Mensagens Enviadas",
                value: f.enviados,
                color: "#3B82F6", // Blue
                darkColor: "#1D4ED8"
            });
        }

        stages.push({
            id: 'vis',
            label: "Visualizações",
            value: f.visualizados,
            color: "#0EA5E9", // Sky
            darkColor: "#0369A1"
        });

        stages.push({
            id: 'ini',
            label: "Iniciaram Votação",
            value: f.iniciados,
            color: "#06B6D4", // Cyan
            darkColor: "#0E7490"
        });

        stages.push({
            id: 'con',
            label: "Concluíram",
            value: f.concluidos,
            color: "#10B981", // Emerald
            darkColor: "#047857",
            percentage: (f.taxas?.conclusao || 0).toFixed(1) + "%"
        });

        if (e?.participacao?.leads > 0) {
            stages.push({
                id: 'new_leads',
                label: "Leads Novos",
                value: e.participacao.leads,
                color: "#F43F5E", // Rose
                darkColor: "#BE123C",
                percentage: f.leads > 0 ? ((e.participacao.leads / f.leads) * 100).toFixed(1) + "%" : undefined
            });
        }

        return stages;
    }, [data]);

    const insights = useMemo(() => {
        const list: any[] = [];
        if (!data) return list;

        const conclusao = data.funnel?.taxas?.conclusao || 0;
        if (conclusao > 70) {
            list.push({ text: "Excelente taxa de conversão! Seu público está altamente engajado com o formato da enquete.", type: "positive" });
        } else if (conclusao < 30) {
            list.push({ text: "Taxa de conclusão abaixo da média. Considere reduzir o número de categorias para evitar fadiga.", type: "negative" });
        } else {
            list.push({ text: "Engajamento está dentro da média esperada para campanhas orgânicas.", type: "info" });
        }

        const devices = data.engagement?.deviceDistrib || [];
        const mobile = devices.find((d: any) => d.device === 'Mobile')?.count || 0;
        const desktop = devices.find((d: any) => d.device === 'Desktop')?.count || 0;
        if (mobile > desktop * 2) {
            list.push({ text: "Público massivamente Mobile. Otimize seus banners para visualização vertical.", type: "info" });
        }

        const heatmap = data.engagement?.votosPorHora || [];
        const topHour = [...heatmap].sort((a, b) => Number(b.votos) - Number(a.votos))[0];
        if (topHour) {
            const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
            let timeLabel = "";

            if ('data' in topHour) {
                const d = new Date(topHour.data);
                timeLabel = `em ${d.toLocaleDateString('pt-BR')} às ${topHour.hora}h`;
            } else if ('semana' in topHour) {
                const d = new Date(topHour.semana);
                timeLabel = `na semana de ${d.toLocaleDateString('pt-BR')} às ${topHour.hora}h`;
            } else {
                timeLabel = `às ${dias[topHour.dia]}s por volta das ${topHour.hora}h`;
            }

            list.push({ text: `Maior atividade detectada ${timeLabel}.`, type: "positive" });
        }

        return list.length > 0 ? list : [
            { text: "Coletando dados suficientes para gerar análises preditivas...", type: "info" }
        ];
    }, [data]);

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="h-10 w-10 p-0 rounded-xl border-border hover:bg-muted shrink-0"
                        >
                            <ArrowLeft size={18} />
                        </Button>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold uppercase tracking-widest">
                                    Business Intelligence
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                Analytics & Insights
                            </h1>
                            <p className="text-muted-foreground font-medium text-[10px] uppercase tracking-wider block">
                                Monitoramento de engajamento e conversão em tempo real
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-card p-1 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-2 px-4 py-2 border-r border-border mr-1.5 group cursor-pointer hover:bg-muted/50 transition-colors rounded-l-xl">
                            <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                                Esta Enquete
                            </span>
                            <div className="flex flex-col gap-0.5 ml-2">
                                <div className="w-2.5 h-0.5 bg-muted-foreground/30 rounded-full" />
                                <div className="w-2.5 h-0.5 bg-muted-foreground/30 rounded-full" />
                            </div>
                        </div>

                        <div
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 border-r border-border mr-1.5 cursor-pointer hover:bg-muted/50 transition-all relative overflow-visible",
                                range === "CUSTOM" && "bg-primary/5 border-primary/20"
                            )}
                            onClick={() => setIsPickerOpen(!isPickerOpen)}
                        >
                            <CalendarDays className={cn("w-4 h-4 transition-colors", range === "CUSTOM" ? "text-primary" : "text-muted-foreground")} />

                            {range === "CUSTOM" && customRange && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "auto", opacity: 1 }}
                                    className="flex items-center gap-2 ml-2 overflow-hidden whitespace-nowrap border-l border-border pl-2"
                                >
                                    <span className="text-[10px] font-bold text-foreground">
                                        {customRange.from.toLocaleDateString('pt-BR')} - {customRange.to.toLocaleDateString('pt-BR')}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setRange("7D");
                                            setCustomRange(undefined);
                                        }}
                                        className="p-1 hover:bg-primary/10 rounded-full text-primary hover:text-primary transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {isPickerOpen && (
                                    <DateRangePicker
                                        initialRange={customRange}
                                        onClose={() => setIsPickerOpen(false)}
                                        onSelect={(r) => {
                                            setCustomRange(r);
                                            setRange("CUSTOM");
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {(["HOJE", "ONTEM", "7D", "30D", "12M"] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => {
                                        setRange(r);
                                        setCustomRange(undefined);
                                    }}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                        range === r
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 px-4 py-2 border-l border-border ml-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group rounded-r-xl hover:bg-muted/50">
                            <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                        </div>
                    </div>
                </div>

                {/* KPI Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KpiCard
                            title="Visualizações únicas"
                            value={data?.funnel?.visualizados || 0}
                            change={12.5}
                            icon={<Eye size={20} />}
                            color="indigo"
                        />
                        <KpiCard
                            title="Conversões Efetuadas"
                            value={data?.funnel?.concluidos || 0}
                            change={8.2}
                            icon={<FileText size={20} />}
                            color="emerald"
                        />
                        <KpiCard
                            title="Taxa de Aproveitamento"
                            value={((data?.funnel?.concluidos / (data?.funnel?.visualizados || 1)) * 100).toFixed(1) + "%"}
                            change={-2.4}
                            icon={<TrendingUp size={20} />}
                            color="sky"
                        />
                        <KpiCard
                            title="Abstração por Categorias"
                            value={`${data?.engagement?.participacao?.pais || 0} / ${data?.engagement?.participacao?.filhos || 0}`}
                            icon={<Layers size={20} />}
                            color="amber"
                        />
                        <KpiCard
                            title="Empresas Avaliadas"
                            value={data?.engagement?.participacao?.empresas || 0}
                            icon={<Building2 size={20} />}
                            color="indigo"
                        />
                        <KpiCard
                            title="Novos Contatos (Leads)"
                            value={data?.engagement?.participacao?.leads || 0}
                            icon={<Users size={20} />}
                            color="rose"
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <AiInsightsCard insights={insights} />
                    </div>
                </div>

                {/* Custom Tabs */}
                <div className="flex items-center gap-1 bg-muted p-1.5 rounded-lg border border-border w-fit shadow-sm">
                    {[
                        { id: "funnel", label: "Funil", icon: TrendingUp },
                        { id: "heatmap", label: "Engajamento", icon: Clock },
                        { id: "trend", label: "Tendência", icon: CalendarDays },
                        { id: "device", label: "Dispositivos", icon: Smartphone },
                        { id: "votos", label: "Votação", icon: Layers },
                        { id: "demografia", label: "Demografia", icon: Users },
                        { id: "qualidade", label: "Qualidade", icon: Sparkles },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all",
                                activeTab === tab.id
                                    ? "bg-background text-primary shadow-sm ring-1 ring-border"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    {activeTab === "funnel" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <ModernFunnel data={funnelData} title="Jornada do Participante" />
                            </div>
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-card rounded-lg p-8 border border-border shadow-sm flex flex-col h-full relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <TrendingUp className="w-24 h-24" />
                                    </div>
                                    <h4 className="text-xl font-bold text-foreground mb-4">Análise de Performance</h4>
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-10">
                                        O funil de conversão demonstra a eficiência da campanha. A maior taxa de desistência ocorre no onboarding. Otimizar a landing page pode aumentar a conversão final em até 15%.
                                    </p>

                                    <div className="space-y-4 mt-auto">
                                        <div className="p-5 bg-muted/50 rounded-lg border border-border flex items-center justify-between shadow-sm">
                                            <div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Tempo Médio</span>
                                                <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">
                                                    {data?.engagement?.tempoMedioSegundos ? `${Math.floor(data.engagement.tempoMedioSegundos / 60)}m ${Math.round(data.engagement.tempoMedioSegundos % 60)}s` : "0s"}
                                                </p>
                                            </div>
                                            <Clock className="w-8 h-8 text-muted-foreground/30" />
                                        </div>

                                        <div className="p-5 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between shadow-sm">
                                            <div>
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Conversão Final</span>
                                                <p className="text-2xl font-bold text-primary mt-1 tabular-nums">
                                                    {data?.funnel?.taxas?.conclusao?.toFixed(1)}%
                                                </p>
                                            </div>
                                            <TrendingUp className="w-8 h-8 text-primary/30" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "heatmap" && (
                        <TrafficHeatmap
                            data={data?.engagement?.votosPorHora || []}
                            periodo={data?.engagement?.periodo}
                            title="Mapa de Calor de Engajamento"
                            description="Padrões de atividade baseados nos horários de submissão dos votos."
                        />
                    )}

                    {activeTab === "trend" && (
                        <div className="bg-card/60 backdrop-blur-md rounded-2xl p-8 border border-border/40 shadow-xl shadow-primary/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                        <CalendarDays className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-foreground tracking-tight">Tendência Histórica</h3>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Evolução temporal de acessos e conversões</p>
                                    </div>
                                </div>

                                <div className="flex items-center bg-muted/50 p-1.5 rounded-xl border border-border/40 backdrop-blur-sm self-start">
                                    {(["area", "bar", "line"] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setChartType(type)}
                                            className={cn(
                                                "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                                chartType === type
                                                    ? "bg-background text-primary shadow-lg shadow-black/5 ring-1 ring-border scale-105"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {type === "area" ? "Área" : type === "bar" ? "Barras" : "Linhas"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-[400px] w-full">
                                <SmartChart
                                    data={(data?.engagement?.tendencia || []).map((t: any) => ({
                                        label: t.data,
                                        value: t.visualizacoes,
                                        submissions: t.respostas // Pass extra data if needed, but SmartChart handles simple pairs. 
                                        // For multi-series, ECharts needs a more custom config.
                                    }))}
                                    widgetType={chartType === 'area' ? 'area' : chartType === 'bar' ? 'bar_vertical' : 'line'}
                                    title="Visualizações totais"
                                    showTotal
                                    className="h-full border-none shadow-none bg-transparent p-0"
                                />
                                {/* TODO: For dual series (Views + Respostas), we'd need MultiSmartChart. 
                                    But even a single series with premium look is better than simple Recharts. 
                                    Let's keep Recharts for MultiSeries Trend for now but styled properly, 
                                    as the user liked it. Actually, Recharts is fine for Trends. 
                                    Demographics was the real "simple" problem. */}
                            </div>
                        </div>
                    )}

                    {activeTab === "device" && (
                        <div className="bg-card/60 backdrop-blur-md rounded-2xl p-8 border border-border/40 shadow-xl shadow-primary/5">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-12 w-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-600 border border-sky-500/20 shadow-inner">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Distribuição de Acesso</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Frequência por categoria de dispositivo</p>
                                </div>
                            </div>
                            <div className="h-[350px] w-full">
                                <SmartChart
                                    data={(data?.engagement?.deviceDistrib || []).map((d: any) => ({
                                        label: d.device || "Desconhecido",
                                        value: d.count || 0
                                    }))}
                                    widgetType="bar_horizontal"
                                    title="Dispositivos"
                                    showTotal
                                    colorScheme="gradient"
                                    className="h-full border-none shadow-none bg-transparent p-0"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "votos" && typeof id === 'string' && (
                        <AnalyticsRankingTable enqueteId={id} />
                    )}

                    {activeTab === "demografia" && typeof id === 'string' && (
                        <AnalyticsDemographicsCharts enqueteId={id} />
                    )}

                    {activeTab === "qualidade" && typeof id === 'string' && (
                        <AnalyticsQualidadeRadar enqueteId={id} />
                    )}
                </div>
            </div>
        </div>
    );
}
