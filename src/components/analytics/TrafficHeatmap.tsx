"use client";

import React, { useMemo } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HeatmapData {
    dia?: number;
    data?: string | Date;
    semana?: string | Date;
    hora: number;
    votos: number | string;
}

interface TrafficHeatmapProps {
    data: HeatmapData[];
    periodo?: {
        inicio: string | Date | undefined;
        fim: string | Date | undefined;
        range: string;
    };
    title?: string;
    description?: string;
}

const DIAS = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
];

const HORAS = Array.from({ length: 24 }, (_, i) => i);

export function TrafficHeatmap({ data, periodo, title, description }: TrafficHeatmapProps) {
    // Generate all rows based on the period to ensure it "expands" even without data
    const rows = useMemo(() => {
        const firstItem = data[0] || {};
        const isDetailedData = 'data' in firstItem;
        const isWeeklyData = 'semana' in firstItem;

        if (!periodo?.inicio || !periodo?.fim) {
            // Fallback: Use unique entries from data or default weekdays
            if (isDetailedData) {
                const uniqueDays = Array.from(new Set(data.map((d: any) =>
                    new Date(d.data).toISOString().split('T')[0]
                ))).sort();
                return uniqueDays.map(d => ({
                    id: d,
                    label: new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    fullLabel: new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
                }));
            }
            if (isWeeklyData) {
                const uniqueWeeks = Array.from(new Set(data.map((d: any) =>
                    new Date(d.semana).toISOString().split('T')[0]
                ))).sort();
                return uniqueWeeks.map(w => {
                    const d = new Date(w + 'T12:00:00');
                    const end = new Date(d); end.setDate(d.getDate() + 6);
                    return { id: w, label: `${d.getDate().toString().padStart(2, '0')}-${end.getDate().toString().padStart(2, '0')}`, fullLabel: `Semana de ${d.toLocaleDateString()} a ${end.toLocaleDateString()}` };
                });
            }
            return DIAS.map((nome, idx) => ({ id: idx, label: nome, fullLabel: nome }));
        }

        const start = new Date(periodo.inicio);
        const end = new Date(periodo.fim);
        const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        const isDetailedPeriod = dayDiff <= 31;

        if (isDetailedPeriod) {
            const list = [];
            let curr = new Date(start);
            while (curr <= end && list.length < 32) {
                const dateStr = curr.toISOString().split('T')[0];
                list.push({
                    id: dateStr,
                    label: curr.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    fullLabel: curr.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
                });
                curr.setDate(curr.getDate() + 1);
            }
            return list;
        } else {
            // Weekly
            const list = [];
            let curr = new Date(start);

            // Align with Postgres DATE_TRUNC('week') which is always Monday
            const day = curr.getDay();
            const diff = (day === 0 ? 6 : day - 1); // diff back to Monday
            curr.setDate(curr.getDate() - diff);
            curr.setHours(12, 0, 0, 0); // Avoid timezone shifts

            while (curr <= end) {
                const weekStr = curr.toISOString().split('T')[0];
                const weekEnd = new Date(curr);
                weekEnd.setDate(curr.getDate() + 6);

                const startLabel = curr.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const endLabel = weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                list.push({
                    id: weekStr,
                    label: `${startLabel} — ${endLabel}`,
                    fullLabel: `Semana de ${curr.toLocaleDateString('pt-BR')} a ${weekEnd.toLocaleDateString('pt-BR')}`
                });
                curr.setDate(curr.getDate() + 7);
            }
            return list;
        }
    }, [periodo, data]);

    const firstItem = data[0] || {};
    const isDetailed = 'data' in firstItem || (periodo && Math.ceil((new Date(periodo.fim!).getTime() - new Date(periodo.inicio!).getTime()) / (1000 * 60 * 60 * 24)) <= 31);
    const isWeekly = 'semana' in firstItem || (periodo && Math.ceil((new Date(periodo.fim!).getTime() - new Date(periodo.inicio!).getTime()) / (1000 * 60 * 60 * 24)) > 31);

    // Value lookup and peak calculation
    const maxVotos = Math.max(...data.map((d) => Number(d.votos)), 1);

    // Find the exact cell that is the peak
    const peakCell = useMemo(() => {
        if (data.length === 0) return null;
        const peak = data.reduce((prev, current) =>
            (Number(current.votos) > Number(prev.votos)) ? current : prev
        );

        let rowId;
        if (isWeekly && peak.semana) rowId = new Date(peak.semana).toISOString().split('T')[0];
        else if (isDetailed && peak.data) rowId = new Date(peak.data).toISOString().split('T')[0];
        else rowId = (peak as any).dia;

        return { rowId, hora: peak.hora, value: Number(peak.votos) };
    }, [data, isDetailed, isWeekly]);

    const getIntensityClass = (votos: number) => {
        if (votos === 0) return "bg-muted/30";
        const percent = (votos / maxVotos) * 100;

        if (percent < 20) return "bg-primary/10";
        if (percent < 40) return "bg-primary/25";
        if (percent < 60) return "bg-primary/40";
        if (percent < 80) return "bg-primary/65";
        return "bg-primary";
    };

    const getVotos = (rowId: number | string, hora: number) => {
        if (isWeekly) {
            return data.find((d: any) =>
                new Date(d.semana).toISOString().split('T')[0] === rowId && d.hora === hora
            )?.votos || 0;
        }
        if (isDetailed) {
            return data.find((d: any) =>
                new Date(d.data).toISOString().split('T')[0] === rowId && d.hora === hora
            )?.votos || 0;
        }
        return data.find((d: any) => d.dia === rowId && d.hora === hora)?.votos || 0;
    };

    return (
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="flex flex-col mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2 tracking-tight">
                            {title || "Mapa de Calor de Engajamento"}
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase font-bold tracking-wider">
                                {isWeekly ? "Visão Semanal (Média)" : isDetailed ? "Visão Diária" : "Média de Período"}
                            </span>
                        </h3>
                        {description && (
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    {peakCell && peakCell.value > 0 && (
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse border-2 border-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                            Pico Detectado
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-[100px_repeat(24,1fr)] gap-1.5">
                        {/* Header com as horas */}
                        <div />
                        {HORAS.map((h) => (
                            <div key={h} className="text-[10px] text-muted-foreground text-center font-bold uppercase">
                                {h}h
                            </div>
                        ))}

                        {/* Linhas */}
                        {rows.map((row) => (
                            <React.Fragment key={row.id}>
                                <div className="text-[11px] text-muted-foreground font-bold uppercase self-center pr-2">
                                    {row.label}
                                </div>
                                {HORAS.map((hora) => {
                                    const votos = Number(getVotos(row.id, hora));
                                    const formattedVotos = (isWeekly || !isDetailed) ? votos.toFixed(1) : Math.floor(votos);
                                    const isPeak = peakCell?.rowId === row.id && peakCell?.hora === hora && votos > 0 && votos === peakCell.value;

                                    return (
                                        <TooltipProvider key={hora}>
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "h-8 rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer hover:z-10 ring-offset-background hover:ring-2 hover:ring-primary relative",
                                                            getIntensityClass(votos)
                                                        )}
                                                    >
                                                        {isPeak && (
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_10px_rgba(250,204,21,1)] animate-ping" />
                                                                <div className="absolute w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white dark:border-slate-900 shadow-lg" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="bg-foreground text-background border-none text-xs font-bold uppercase p-2">
                                                    <p>{row.fullLabel}</p>
                                                    <p>{hora}:00 — {formattedVotos} {(isWeekly || !isDetailed) ? 'votos (média)' : 'votos'}</p>
                                                    {isPeak && <p className="text-yellow-400 mt-1">✨ Horário de Pico</p>}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <span>Intensidade:</span>
                        <div className="flex gap-2 items-center">
                            <span>0</span>
                            <div className="w-32 h-2 bg-gradient-to-r from-muted/30 to-primary rounded-full border border-border" />
                            <span>{maxVotos}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
