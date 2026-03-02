"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Loader2, CheckCircle2, AlertTriangle, XCircle,
    ShieldCheck, Tag, ChevronRight, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import Link from "next/link";

interface SegmentoStatus {
    id: string;
    nome: string;
    paiId: string | null;
    paiNome?: string | null;
    status: "ok-direto" | "ok-herdado" | "sem-template";
    templateNome?: string | null;
    herdadoDe?: string | null;
}

interface DiagnosticoQualidade {
    total: number;
    comTemplate: number;
    semTemplate: number;
    segmentos: SegmentoStatus[];
}

export const QualidadeInheritanceView: React.FC<{ enqueteId: string }> = ({ enqueteId }) => {

    const { data, isLoading, isError } = useQuery<DiagnosticoQualidade>({
        queryKey: ["diagnostico-qualidade", enqueteId],
        queryFn: async () => {
            const res = await apiFetch(`/api/enquetes/${enqueteId}/arvore-qualidade`);
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const raw = await res.json() as any[];

            const segmentos: SegmentoStatus[] = raw.map((s: any) => {
                const hasDirectTemplate = !!s.templateQualidadeId;
                const hasInheritedTemplate = !hasDirectTemplate && !!s.resolvedTemplate;

                return {
                    id: s.id,
                    nome: s.nome,
                    paiId: s.paiId,
                    paiNome: s.pai?.nome ?? null,
                    status: hasDirectTemplate ? "ok-direto"
                        : hasInheritedTemplate ? "ok-herdado"
                            : "sem-template",
                    templateNome: s.templateQualidade?.nome ?? s.resolvedTemplate?.nome ?? null,
                    herdadoDe: hasInheritedTemplate ? (s.resolvedTemplate?.herdadoDe ?? s.pai?.nome ?? null) : null,
                };
            });

            const comTemplate = segmentos.filter(s => s.status !== "sem-template").length;
            return {
                total: segmentos.length,
                comTemplate,
                semTemplate: segmentos.length - comTemplate,
                segmentos,
            };
        },
        staleTime: 30_000,
        retry: 0,
    });

    // --- Estados de carregamento ---
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-4 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando cobertura de qualidade...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-3 border rounded-lg bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Não foi possível verificar. Salve a enquete com as categorias vinculadas e tente novamente.
            </div>
        );
    }

    if (!data || data.total === 0) {
        return (
            <div className="p-3 border rounded-lg bg-card text-sm text-muted-foreground text-center">
                Nenhuma categoria vinculada à enquete ainda.{" "}
                Adicione categorias na aba <strong>Categorias</strong> e salve antes de configurar a qualidade.
            </div>
        );
    }

    // --- Painel de diagnóstico ---
    const allOk = data.semTemplate === 0;
    const semTemplateLista = data.segmentos.filter(s => s.status === "sem-template");

    return (
        <div className="space-y-3 animate-in fade-in duration-300">

            {/* Barra de status geral */}
            <div className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                allOk
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-amber-500/10 border-amber-500/30"
            )}>
                <div className="flex items-center gap-2">
                    {allOk
                        ? <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                        : <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    }
                    <span className={cn(
                        "text-sm font-semibold",
                        allOk ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"
                    )}>
                        {allOk
                            ? "Todas as categorias têm template de qualidade"
                            : `${data.semTemplate} de ${data.total} categoria${data.semTemplate > 1 ? "s" : ""} sem template`
                        }
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-bold text-green-600 dark:text-green-400">{data.comTemplate}</span>
                    <span>OK</span>
                    {data.semTemplate > 0 && (
                        <>
                            <span>·</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{data.semTemplate}</span>
                            <span>sem template</span>
                        </>
                    )}
                </div>
            </div>

            {/* Lista de categorias SEM template — destaque visual para correção */}
            {semTemplateLista.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                        ⚠️ Precisam de template antes de publicar
                    </p>
                    {semTemplateLista.map(seg => (
                        <div key={seg.id} className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5">
                            <div className="flex items-center gap-2 min-w-0">
                                <XCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                <div className="min-w-0">
                                    {seg.paiNome && (
                                        <span className="text-[10px] text-muted-foreground block truncate">
                                            {seg.paiNome}
                                            <ChevronRight className="w-2.5 h-2.5 inline mx-0.5" />
                                        </span>
                                    )}
                                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 truncate block">
                                        {seg.nome}
                                    </span>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-amber-600 border-amber-500/40 bg-amber-500/10 text-[10px] shrink-0 ml-2">
                                Sem template
                            </Badge>
                        </div>
                    ))}
                    <Link
                        href="/admin/templates"
                        className="flex items-center gap-1 text-[11px] text-primary hover:underline mt-1 px-1"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Gerenciar Templates de Qualidade
                    </Link>
                </div>
            )}

            {/* Lista de categorias COM template — resumo colapsado */}
            <details className="group">
                <summary className="text-[11px] font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-1 px-1 select-none">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    {data.comTemplate} categoria{data.comTemplate !== 1 ? "s" : ""} com template configurado
                    <ChevronRight className="w-3 h-3 ml-auto group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-2 space-y-1.5 pl-2">
                    {data.segmentos.filter(s => s.status !== "sem-template").map(seg => (
                        <div key={seg.id} className="flex items-center justify-between p-2 rounded-lg border border-green-500/20 bg-green-500/5">
                            <div className="flex items-center gap-2 min-w-0">
                                <Tag className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0" />
                                <div className="min-w-0">
                                    {seg.paiNome && (
                                        <span className="text-[10px] text-muted-foreground">
                                            {seg.paiNome} <ChevronRight className="w-2.5 h-2.5 inline" />
                                        </span>
                                    )}
                                    <span className="text-xs font-medium truncate block">{seg.nome}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                {seg.status === "ok-herdado" && (
                                    <Badge variant="outline" className="text-muted-foreground text-[10px] border-border">
                                        Herdado {seg.herdadoDe ? `de ${seg.herdadoDe}` : ""}
                                    </Badge>
                                )}
                                {seg.templateNome && (
                                    <span className="text-[10px] text-muted-foreground max-w-[120px] truncate" title={seg.templateNome}>
                                        {seg.templateNome}
                                    </span>
                                )}
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </details>
        </div>
    );
};
