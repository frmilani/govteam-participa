"use client";

import React, { useState } from "react";
import {
    ShieldCheck,
    ShieldAlert,
    CheckCircle2,
    Search,
    RefreshCw,
    MoreHorizontal,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    UserCheck,
    Ban,
    ArrowLeft,
    Trophy,
    HelpCircle,
    Info,
    List,
    Download,
    Eye,
    Zap,
    Fingerprint,
    Activity,
    Cpu,
    Shield,
    Globe,
    ExternalLink,
    Lock,
    Star,
    Crown
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Modal } from "@/components/ui/Modal";
import { VoteDetailModal } from "@/components/admin/enquete/VoteDetailModal";
// ThemeProvider and VoteTemplateProvider removed — they inject voting theme CSS
// into admin UI causing color interference (beige/gray backgrounds).

export default function ResultadosAuditPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<"resultados" | "auditoria" | "listagem" | "apuracao">("auditoria");
    const [federalPrizes, setFederalPrizes] = useState<string[]>(["", "", "", "", ""]);
    const [calcWinners, setCalcWinners] = useState<any[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [auditSearch, setAuditSearch] = useState("");
    const [sortBy, setSortBy] = useState<string>("respondidoEm");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
        setPage(1);
    };
    const [listSearch, setListSearch] = useState("");
    const [listCategory, setListCategory] = useState("TODAS");
    const [isSentinelaModalOpen, setIsSentinelaModalOpen] = useState(false);
    const [selectedVote, setSelectedVote] = useState<any>(null);
    const [isVoteDetailModalOpen, setIsVoteDetailModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelectAll = () => {
        if (!auditData?.votes) return;
        const pageIds = auditData.votes.map((v: any) => v.id);
        const allOnPageSelected = pageIds.every((id: string) => selectedIds.includes(id));

        if (allOnPageSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const { data: auditData, isLoading: isLoadingAudit, refetch: refetchAudit } = useQuery({
        queryKey: ["audit", id, page, statusFilter, auditSearch, sortBy, sortOrder, limit],
        queryFn: async () => {
            const response = await axios.get(`/api/enquetes/${id}/audit/votes`, {
                params: {
                    page,
                    limit,
                    status: statusFilter || undefined,
                    search: auditSearch || undefined,
                    sortBy,
                    sortOrder
                }
            });
            return response.data;
        },
    });

    const { data: enquete, isLoading: isLoadingEnquete } = useQuery({
        queryKey: ["enquete", id],
        queryFn: async () => {
            const response = await axios.get(`/api/enquetes/${id}`);
            return response.data;
        }
    });

    const { data: rankingsData } = useQuery({
        queryKey: ["rankings", id],
        queryFn: async () => {
            const response = await axios.get(`/api/enquetes/${id}/rankings`);
            return response.data;
        },
        enabled: activeTab !== "auditoria"
    });

    const batchMutation = useMutation({
        mutationFn: async (payload: { action: string; ids?: string[]; reason?: string }) => {
            await axios.post(`/api/enquetes/${id}/audit/batch-action`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["audit"] });
            queryClient.invalidateQueries({ queryKey: ["rankings"] });
            queryClient.invalidateQueries({ queryKey: ["enquete"] });
        }
    });

    const sorteioMutation = useMutation({
        mutationFn: async (payload: { action: string; winners?: any[]; federalPrizes?: string[] }) => {
            if (payload.action === "CALCULATE") {
                const res = await axios.post(`/api/enquetes/${id}/sorteio`, { numerosFederal: payload.federalPrizes });
                return res.data;
            } else if (payload.action === "CONFIRM_WINNERS") {
                const res = await axios.patch(`/api/enquetes/${id}/sorteio`, payload);
                return res.data;
            }
        },
        onSuccess: (data, variables) => {
            if (variables.action === "CALCULATE") {
                setCalcWinners(data.winners);
            } else {
                queryClient.invalidateQueries({ queryKey: ["enquete"] });
                setCalcWinners([]);
                setFederalPrizes(["", "", "", "", ""]);
                setActiveTab("apuracao");
            }
        }
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "VALID": return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-none">Válido</Badge>;
            case "SUSPICIOUS": return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-none">Suspeito</Badge>;
            case "INVALID": return <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-none">Inválido</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 bg-background/50 min-h-full -m-6 p-6">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print, 
                    button, 
                    .tooltip,
                    header,
                    footer,
                    nav {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        padding: 0 !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .page-break {
                        page-break-before: always;
                    }
                    .card-print {
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: none !important;
                        break-inside: avoid;
                    }
                }
            `}} />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="h-10 w-10 p-0 rounded-md"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                Resultados & Auditoria
                            </h1>
                            {enquete && (
                                <span className={cn(
                                    "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                                    enquete.resultadosStatus === 'PUBLICADO' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                        enquete.resultadosStatus === 'CANCELADO' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                            "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                )}>
                                    {enquete.resultadosStatus === 'PUBLICADO' ? "Publicado" :
                                        enquete.resultadosStatus === 'CANCELADO' ? "Cancelado" :
                                            "Em Conferência"}
                                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground font-medium text-sm mt-1">Apuração dos votos e monitoramento de integridade</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {enquete?.resultadosStatus === 'PUBLICADO' && (
                        <Button
                            variant="outline"
                            onClick={() => window.open(`/resultados/${enquete.formPublicId}`, '_blank')}
                            className="font-bold gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Ver Página Pública
                        </Button>
                    )}
                    <Button
                        onClick={() => batchMutation.mutate({ action: 'RUN_DETECTION' })}
                        disabled={batchMutation.isPending}
                        className="font-bold uppercase tracking-wider text-[10px] gap-2"
                    >
                        <RefreshCw className={cn("w-4 h-4", batchMutation.isPending && "animate-spin")} />
                        Rodar Sentinela
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg w-fit no-print border border-border">
                <button
                    onClick={() => setActiveTab("auditoria")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-md text-xs font-bold transition-all",
                        activeTab === "auditoria" ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <ShieldAlert className="w-4 h-4" />
                    Audit Room
                </button>
                <button
                    onClick={() => setActiveTab("resultados")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-md text-xs font-bold transition-all",
                        activeTab === "resultados" ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Apuração Oficial
                </button>
                <button
                    onClick={() => setActiveTab("listagem")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                        activeTab === "listagem" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <List className="w-4 h-4" />
                    Lista de Rankings
                </button>
                {enquete?.usarPremiacao && (
                    <button
                        onClick={() => setActiveTab("apuracao")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                            activeTab === "apuracao" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Trophy className="w-4 h-4" />
                        Apuração Oficial
                    </button>
                )}
            </div>

            {activeTab === "auditoria" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Filters & Actions Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar por IP, lead..."
                                    value={auditSearch}
                                    onChange={(e) => {
                                        setAuditSearch(e.target.value);
                                        setPage(1); // Reset to page 1 on search
                                    }}
                                    className="pl-10 pr-4 h-9 bg-background border border-input rounded-md text-sm w-64 focus:ring-1 focus:ring-ring focus:border-primary transition-all font-medium outline-none"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="h-9 bg-background border border-input rounded-md px-3 text-sm font-medium focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all cursor-pointer"
                            >
                                <option value="">Todos os Status</option>
                                <option value="VALID">✅ Válidos</option>
                                <option value="SUSPICIOUS">⚠️ Suspeitos</option>
                                <option value="INVALID">❌ Inválidos</option>
                            </select>
                            {auditData?.pagination?.total !== undefined && (
                                <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full border border-border/50 shadow-sm">
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 leading-none">
                                        {auditData.pagination.total} votos encontrados
                                    </div>
                                    {selectedIds.length > 0 && (
                                        <>
                                            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                            <div className="text-[10px] uppercase tracking-wider font-extrabold text-primary leading-none">
                                                {selectedIds.length} selecionados
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground mr-2 uppercase tracking-widest">Ações em Massa:</span>
                            <button className="p-2 bg-emerald-500/10 text-emerald-600 rounded-md hover:bg-emerald-500/20 transition-colors" title="Validar Selecionados">
                                <UserCheck className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors" title="Invalidar Selecionados">
                                <Ban className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Records Table */}
                    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-12 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-border cursor-pointer transition-all focus:ring-offset-0 focus:ring-0 checked:bg-primary"
                                            checked={auditData?.votes && auditData.votes.length > 0 && auditData.votes.every((v: any) => selectedIds.includes(v.id))}
                                            onChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    {/* Sortable: Lead */}
                                    <TableHead>
                                        <button onClick={() => handleSort("lead.nome")} className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group">
                                            Eleitor / Lead
                                            {sortBy === "lead.nome" ? (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />}
                                        </button>
                                    </TableHead>
                                    {/* Sortable: IP */}
                                    <TableHead>
                                        <button onClick={() => handleSort("ipAddress")} className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group">
                                            IP Address
                                            {sortBy === "ipAddress" ? (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />}
                                        </button>
                                    </TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">CPF / DOC</TableHead>
                                    {/* Sortable: Cupons */}
                                    <TableHead className="text-center">
                                        <button onClick={() => handleSort("lead.cupons")} className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group mx-auto">
                                            Cupons
                                            {sortBy === "lead.cupons" ? (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />}
                                        </button>
                                    </TableHead>
                                    {/* Sortable: Data */}
                                    <TableHead>
                                        <button onClick={() => handleSort("respondidoEm")} className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group">
                                            Data / Hora
                                            {sortBy === "respondidoEm" ? (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />}
                                        </button>
                                    </TableHead>
                                    {/* Sortable: Score */}
                                    <TableHead>
                                        <button onClick={() => handleSort("fraudScore")} className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group">
                                            Score
                                            {sortBy === "fraudScore" ? (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />}
                                            <HelpCircle className="w-3 h-3 text-muted-foreground/50 ml-0.5 cursor-help" onClick={(e) => { e.stopPropagation(); setIsSentinelaModalOpen(true); }} />
                                        </button>
                                    </TableHead>
                                    {/* Sortable: Status */}
                                    <TableHead className="text-center">
                                        <button onClick={() => handleSort("status")} className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group mx-auto">
                                            Status
                                            {sortBy === "status" ? (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />}
                                        </button>
                                    </TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingAudit ? (
                                    <TableRow><TableCell colSpan={9} className="h-48 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">Carregando auditoria...</TableCell></TableRow>
                                ) : auditData?.votes?.length === 0 ? (
                                    <TableRow><TableCell colSpan={9} className="h-48 text-center text-muted-foreground">Nenhum voto encontrado para os critérios selecionados.</TableCell></TableRow>
                                ) : auditData?.votes.map((vote: any) => (
                                    <TableRow
                                        key={vote.id}
                                        className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setSelectedVote(vote);
                                            setIsVoteDetailModalOpen(true);
                                        }}
                                    >
                                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-border cursor-pointer transition-all focus:ring-offset-0 focus:ring-0 checked:bg-primary"
                                                checked={selectedIds.includes(vote.id)}
                                                onChange={() => toggleSelect(vote.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground text-sm">{vote.lead?.nome || "Anônimo"}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{vote.lead?.whatsapp || "-"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-[10px] text-muted-foreground font-medium">{vote.ipAddress || "-"}</TableCell>
                                        <TableCell className="font-mono text-[10px] text-muted-foreground font-medium">{vote.lead?.cpf || "-"}</TableCell>
                                        <TableCell className="text-center font-bold text-xs text-muted-foreground">{vote.lead?.cupons || 0}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-medium">
                                            {format(new Date(vote.respondidoEm), "dd MMM, HH:mm", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all",
                                                            vote.fraudScore > 70 ? "bg-rose-500" : vote.fraudScore > 40 ? "bg-orange-500" : "bg-emerald-500"
                                                        )}
                                                        style={{ width: `${vote.fraudScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground">{vote.fraudScore}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="inline-block">
                                                            {vote.status === "VALID" && <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Válido</span>}
                                                            {vote.status === "SUSPICIOUS" && <span className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">Suspeito</span>}
                                                            {vote.status === "INVALID" && <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-destructive/20">Inválido</span>}
                                                        </div>
                                                    </TooltipTrigger>
                                                    {vote.fraudReason && (
                                                        <TooltipContent className="bg-destructive text-destructive-foreground font-bold p-2 text-[10px] uppercase">
                                                            Motivo: {vote.fraudReason}
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell>
                                            <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded-md border border-transparent hover:border-border">
                                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                        <div className="flex flex-col">
                            {auditData?.pagination && (
                                <span className="text-sm font-medium text-muted-foreground">
                                    Mostrando {((page - 1) * limit) + 1}-{Math.min(page * limit, auditData.pagination.total)} de {auditData.pagination.total} respostas
                                </span>
                            )}
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">
                                    Página {page} de {auditData?.pagination?.pages || 1}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">Exibir:</span>
                                    <select
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        className="bg-transparent border-none text-[10px] font-bold text-primary focus:ring-0 outline-none p-0 cursor-pointer hover:underline"
                                    >
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value={200}>200</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPage(p => Math.max(1, p - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={page === 1 || isLoadingAudit}
                                className="px-6 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 flex items-center gap-2"
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPage(p => p + 1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={page >= (auditData?.pagination?.pages || 1) || isLoadingAudit}
                                className="px-6 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-30"
                            >
                                Próximo
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "resultados" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vencedores em Destaque */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {rankingsData?.map((seg: any) => {
                                const winner = seg.ranking?.[0];
                                return (
                                    <div key={seg.id} className="group bg-card rounded-[40px] border border-border p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer overflow-hidden relative">
                                        {/* Winner Decoration */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <Badge variant="outline" className="border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground py-1 px-3">
                                                {seg.nome}
                                            </Badge>
                                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                                <Crown className="w-5 h-5" />
                                            </div>
                                        </div>

                                        {winner ? (
                                            <div className="space-y-6 relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center border border-border text-xl font-black text-muted-foreground overflow-hidden shrink-0">
                                                        {winner.estabelecimento.logoUrl ? (
                                                            <img src={winner.estabelecimento.logoUrl} alt={winner.estabelecimento.nome} className="w-full h-full object-contain p-2" />
                                                        ) : (
                                                            winner.estabelecimento.nome.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-xl font-black text-foreground truncate leading-tight">
                                                            {winner.estabelecimento.nome}
                                                        </h3>
                                                        <p className="text-primary text-xs font-black uppercase tracking-widest mt-1">Vencedor</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 pt-4 border-t border-border">
                                                    <div className="flex-1">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 block">Votos</span>
                                                        <p className="text-lg font-black text-foreground">{winner.votos}</p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 block">Preferência</span>
                                                        <p className="text-lg font-black text-primary">{winner.percentual}%</p>
                                                    </div>
                                                </div>

                                                <div className="bg-muted p-3 rounded-2xl flex items-center justify-center gap-2 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Ver Ranking Completo</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs italic">
                                                Sem dados de apuração
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-muted/30 rounded-lg p-6 border border-border relative overflow-hidden group shadow-sm">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheck className="w-24 h-24 text-foreground" />
                            </div>
                            <h4 className="font-bold relative z-10 text-sm text-foreground uppercase tracking-widest">Resumo de Qualidade</h4>
                            <div className="mt-6 space-y-3 relative z-10">
                                <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Votos Totais</span>
                                    <span className="text-xl font-bold text-foreground tabular-nums">{auditData?.pagination?.total || 0}</span>
                                </div>
                                <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
                                    <span className="text-amber-600 text-[10px] font-bold uppercase tracking-wider">Suspeitos</span>
                                    <span className="text-xl font-bold text-amber-600 tabular-nums">
                                        {auditData?.votes?.filter((v: any) => v.status === 'SUSPICIOUS').length || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
                                    <span className="text-destructive text-[10px] font-bold uppercase tracking-wider">Taxa de Fraude</span>
                                    <span className="text-xl font-bold text-destructive tabular-nums">
                                        {((auditData?.votes?.filter((v: any) => v.status === 'INVALID').length / (auditData?.pagination?.total || 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsPublishModalOpen(true)}
                                disabled={enquete?.resultadosStatus === 'PUBLICADO' || batchMutation.isPending}
                                className="w-full mt-8 font-bold uppercase tracking-widest text-[10px]"
                                variant={enquete?.resultadosStatus === 'PUBLICADO' ? "secondary" : "primary"}
                            >
                                {enquete?.resultadosStatus === 'PUBLICADO' ? "Resultados Publicados" : "Finalizar & Publicar"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "listagem" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center bg-card p-6 rounded-lg border border-border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm border border-primary/20">
                                <List className="w-5 h-5" />
                            </div>
                            <div className="print:hidden">
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Rankings Completos</h3>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Consulta rápida por categoria e posição</p>
                            </div>
                            <div className="hidden print:block">
                                <h3 className="text-xl font-bold text-foreground uppercase">Relatório Oficial de Resultados</h3>
                                <p className="text-sm text-muted-foreground font-medium">Extraído em {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 print:hidden">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={listSearch}
                                    onChange={(e) => setListSearch(e.target.value)}
                                    className="pl-9 pr-4 h-9 bg-background border border-input rounded-md text-sm w-48 focus:ring-1 focus:ring-ring focus:border-primary transition-all font-medium outline-none"
                                />
                            </div>
                            <select
                                value={listCategory}
                                onChange={(e) => setListCategory(e.target.value)}
                                className="h-9 bg-background border border-input rounded-md px-3 text-sm font-medium focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all min-w-[150px]"
                            >
                                <option value="TODAS">Todas Categorias</option>
                                {rankingsData?.map((seg: any) => (
                                    <option key={seg.id} value={seg.id}>{seg.nome}</option>
                                ))}
                            </select>
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                                className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
                            >
                                <Download className="w-4 h-4" />
                                Exportar PDF
                            </Button>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground pl-8 w-20">Pos.</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Estabelecimento</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Categoria</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">Votos</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground text-right pr-8">%</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rankingsData
                                    ?.filter((seg: any) => listCategory === "TODAS" || seg.id === listCategory)
                                    .flatMap((seg: any) =>
                                        seg.ranking
                                            ?.filter((res: any) =>
                                                res.estabelecimento.nome.toLowerCase().includes(listSearch.toLowerCase()) ||
                                                seg.nome.toLowerCase().includes(listSearch.toLowerCase())
                                            )
                                            .map((res: any) => (
                                                <TableRow key={`${seg.id}-${res.posicao}`} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="pl-8 font-bold text-muted-foreground/30">{res.posicao}º</TableCell>
                                                    <TableCell className="font-bold text-foreground text-sm">{res.estabelecimento.nome}</TableCell>
                                                    <TableCell>
                                                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border text-[10px] font-bold uppercase tracking-wider">
                                                            {seg.nome}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-muted-foreground tabular-nums">{res.votos}</TableCell>
                                                    <TableCell className="text-right pr-8 font-bold text-emerald-600 tabular-nums">{res.percentual}%</TableCell>
                                                </TableRow>
                                            ))
                                    )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {activeTab === "apuracao" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                        <div className="p-8 space-y-8">
                            {/* Header row: title + button */}
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        Apuração de Ganhadores (Loteria Federal)
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-2 font-medium max-w-xl ml-13">
                                        Insira o número sorteado do 1º prêmio da Loteria Federal. O sistema identificará os números da sorte mais próximos com base na regra de aproximação.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => sorteioMutation.mutate({ action: "CALCULATE", federalPrizes })}
                                    disabled={federalPrizes[0].length < 4 || sorteioMutation.isPending}
                                    className="shrink-0 h-12 px-8 font-black uppercase text-xs tracking-widest gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-xl"
                                >
                                    {sorteioMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    Apurar Ganhadores
                                </Button>
                            </div>

                            {/* Inputs component */}
                            <div className="bg-muted/10 p-8 rounded-[32px] border border-border/50 shadow-inner space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {federalPrizes.map((val, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                                {idx + 1}º Prêmio Federal
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={5}
                                                value={val}
                                                onChange={(e) => {
                                                    const newPrizes = [...federalPrizes];
                                                    newPrizes[idx] = e.target.value.replace(/\D/g, "");
                                                    setFederalPrizes(newPrizes);
                                                }}
                                                placeholder="00000"
                                                className="w-full h-12 px-3 bg-background border-2 border-border rounded-xl text-center text-lg font-black tracking-widest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:opacity-30"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {calcWinners.length > 0 && (
                                <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            Relatório de Candidatos ao Prêmio
                                        </h4>
                                        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                            {calcWinners.length} Ganhadores Encontrados
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        {calcWinners.map((winner, idx) => (
                                            <div
                                                key={winner.id}
                                                className="group relative bg-card border border-border shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-visible"
                                                style={{
                                                    borderRadius: '32px',
                                                    WebkitMaskImage: 'radial-gradient(circle at 0px 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)',
                                                    maskImage: 'radial-gradient(circle at 0px 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)',
                                                    WebkitMaskComposite: 'destination-out',
                                                    maskComposite: 'exclude'
                                                }}
                                            >
                                                <div className="flex flex-col md:flex-row items-stretch min-h-[140px]">
                                                    {/* Left Side: Number */}
                                                    <div className="bg-primary/5 md:w-48 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-dashed border-primary/20 relative">
                                                        <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 opacity-50">Nº da Sorte</div>
                                                        <div className="flex gap-1">
                                                            {winner.numero.toString().padStart(5, '0').split('').map((digit: string, dIdx: number) => (
                                                                <span key={dIdx} className="w-7 h-10 bg-card border-2 border-primary/20 rounded-lg flex items-center justify-center text-xl font-black text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                                    {digit}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {/* Zigzag Divider */}
                                                        <div className="absolute top-0 bottom-0 -right-[6px] w-[12px] overflow-hidden hidden md:block z-30 pointer-events-none translate-x-[2px]">
                                                            <svg className="h-full w-full fill-card stroke-border" viewBox="0 0 10 100" preserveAspectRatio="none">
                                                                <path d="M0 0 L10 2 L0 4 L10 6 L0 8 L10 10 L0 12 L10 14 L0 16 L10 18 L0 20 L10 22 L0 24 L10 26 L0 28 L10 30 L0 32 L10 34 L0 36 L10 38 L0 40 L10 42 L0 44 L10 46 L0 48 L10 50 L0 52 L10 54 L0 56 L10 58 L0 60 L10 62 L0 64 L10 66 L0 68 L10 70 L0 72 L10 74 L0 76 L10 78 L0 80 L10 82 L0 84 L10 86 L0 88 L10 90 L0 92 L10 94 L0 96 L10 98 L0 100" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {/* Main Content Area */}
                                                    <div className="flex-1 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden bg-card">
                                                        <div className="flex-1 text-center md:text-left min-w-0">
                                                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                                                <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-none italic uppercase">
                                                                    {winner.lead?.nome}
                                                                </h3>
                                                                <div className="px-2 py-0.5 bg-muted rounded-full text-[9px] font-black text-muted-foreground uppercase tracking-widest border border-border w-fit mx-auto md:mx-0">
                                                                    CPF: {winner.lead?.cpf}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 ring-4 ring-primary/5">
                                                                    <Trophy size={14} className="fill-current" />
                                                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                                                        {winner.premio}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[9px] font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                                                                    {winner.distancia === 0 ? "Número Exato" : `Aproximação (${winner.distancia} pts)`}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right Status */}
                                                        <div className="flex flex-col items-center md:items-end md:pl-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 gap-2">
                                                            <div className="flex gap-0.5 text-primary/30">
                                                                {[1, 2, 3].map(i => <Star key={i} size={16} fill="currentColor" className="transition-transform group-hover:scale-125 group-hover:text-primary duration-300" />)}
                                                            </div>
                                                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Validado sentinela</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-10 border-t border-border flex flex-col sm:flex-row justify-end items-center gap-4">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-auto italic">
                                            * Confirme se todos os dados estão corretos antes de publicar.
                                        </p>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCalcWinners([])}
                                            className="h-12 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground"
                                        >
                                            Limpar Resultado
                                        </Button>
                                        <Button
                                            onClick={() => sorteioMutation.mutate({ action: "CONFIRM_WINNERS", winners: calcWinners })}
                                            className="h-12 px-10 font-black uppercase text-xs tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200/50 flex items-center gap-2"
                                            disabled={sorteioMutation.isPending}
                                        >
                                            {sorteioMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                            Consolidar & Publicar Ganhadores
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {calcWinners.length === 0 && enquete?.premiacaoStatus === 'PUBLICADO' && (
                                <div className="space-y-6 pt-10 border-t border-border mt-8">
                                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-[24px] border border-emerald-500/20">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                                                    <Globe className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Vencedores Consolidados</h4>
                                                    <p className="text-xs text-muted-foreground font-medium">Os ganhadores já foram confirmados e a página de consulta pública está ativa.</p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/ganhadores/${enquete?.formPublicId}`}
                                                target="_blank"
                                                className="bg-background hover:bg-muted text-foreground border border-border rounded-xl px-6 h-10 font-black uppercase tracking-widest text-[9px] flex items-center gap-2 transition-all shadow-sm"
                                            >
                                                Acessar Página Pública <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isSentinelaModalOpen}
                onClose={() => setIsSentinelaModalOpen(false)}
                title="Sentinela: Tecnologia Anti-Fraude"
                description="Entenda os critérios técnicos e a inteligência por trás da auditoria de integridade."
                maxWidth="max-w-3xl"
                confirmLabel="Entendi"
                onConfirm={() => setIsSentinelaModalOpen(false)}
            >
                <div className="space-y-8 py-4">
                    {/* Hero Section of Modal */}
                    <div className="bg-foreground rounded-lg p-6 text-background relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-background/10 flex items-center justify-center border border-background/20 backdrop-blur-sm">
                                <Cpu className="w-6 h-6 text-background" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold tracking-tight">Score de Integridade</h4>
                                <p className="text-background/60 text-[10px] font-bold uppercase tracking-[0.2em]">Cálculo em Tempo Real</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-lg border border-border bg-muted/20 space-y-3 shadow-sm">
                            <div className="h-9 w-9 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h5 className="font-bold text-foreground text-sm uppercase tracking-wider">Velocity Check</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                Identifica envios realizados em menos de <span className="text-foreground font-bold">5 segundos</span>. Padrão típico de scripts automatizados (bots) ou disparadores de massa.
                            </p>
                        </div>

                        <div className="p-5 rounded-lg border border-border bg-muted/20 space-y-3 shadow-sm">
                            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Fingerprint className="w-5 h-5" />
                            </div>
                            <h5 className="font-bold text-foreground text-sm uppercase tracking-wider">IP Clustering</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                Monitora a densidade de votos por endereço IP. Limites de <span className="text-foreground font-bold">10 votos/hora</span> evitam fazendas de votos ou redes controladas.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-2">Escala de Risco</h5>
                        <div className="space-y-2">
                            {[
                                { range: "0% - 20%", label: "Orgânico", color: "bg-emerald-500", desc: "Comportamento humano natural dentro dos parâmetros." },
                                { range: "21% - 60%", label: "Alerta Médio", color: "bg-amber-500", desc: "Leves anomalias, como múltiplos votos na mesma rede doméstica." },
                                { range: "61%+ ", label: "Alta Probabilidade", color: "bg-destructive", desc: "Forte evidência de fraude ou automação. Marcado para descarte." },
                            ].map((level) => (
                                <div key={level.label} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border shadow-sm">
                                    <div className={cn("h-2 w-2 rounded-full", level.color)} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-xs font-bold text-foreground uppercase tracking-tight">{level.label}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{level.range}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-medium leading-tight">{level.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-4 ring-1 ring-primary/5">
                        <Shield className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-tight">Mecanismo Anti-Bypass</p>
                            <p className="text-[10px] text-primary/70 font-medium mt-1 leading-relaxed">
                                O Sentinela utiliza análise de entropia e validação de User-Agent randômico para evitar que scripts sofisticados burlem os controles básicos.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>

            <VoteDetailModal
                isOpen={isVoteDetailModalOpen}
                onClose={() => setIsVoteDetailModalOpen(false)}
                vote={selectedVote}
            />

            <Modal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                title="Publicar Resultados?"
                description="Deseja publicar oficialmente os resultados? Eles ficarão visíveis publicamente para todos os eleitores e estabelecimentos."
                confirmLabel="Confirmar Publicação"
                type="warning"
                onConfirm={() => {
                    batchMutation.mutate({ action: 'PUBLISH_RESULTS' });
                    setIsPublishModalOpen(false);
                }}
                isLoading={batchMutation.isPending}
            />
        </div>
    );
}
