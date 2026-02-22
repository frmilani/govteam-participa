import React, { useEffect } from 'react';
import { Users, User, Loader2, Tag as TagIcon, LayoutList, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSegmentos } from '@/hooks/use-segmentos';

interface LeadSegmentationProps {
    stats: {
        total: number;
        homens: number;
        mulheres: number;
        outros: number;
    };
    tags: any[];
    selectedTagIds: string[];
    onTagToggle: (tagId: string) => void;
    leads: any[];
    isLoadingLeads: boolean;
    register: any;
    watch: any;
    setValue: any;
    enqueteId: string;
}

export function LeadSegmentation({ stats, tags, selectedTagIds, onTagToggle, leads, isLoadingLeads, register, watch, setValue, enqueteId }: LeadSegmentationProps) {

    // Segmentos
    const { data: segmentos = [], isLoading: isLoadingSegmentos } = useSegmentos({ onlyPopulated: false });
    const segmentacaoTipo = watch("segmentacao.tipo");
    const grupoIds = watch("segmentacao.grupoIds") || [];
    const pesoDistribuicao = watch("segmentacao.pesoDistribuicao") || {};

    // Only show root segments
    const gruposPrincipais = segmentos.filter((s: any) => !s.paiId).sort((a: any, b: any) => a.ordem - b.ordem);

    const handleGrupoToggle = (grupoId: string) => {
        const newIds = grupoIds.includes(grupoId) ? grupoIds.filter((id: string) => id !== grupoId) : [...grupoIds, grupoId];
        setValue("segmentacao.grupoIds", newIds);

        // Recalculate weights equally
        if (newIds.length > 0) {
            const equalWeight = Number((100 / newIds.length).toFixed(1));
            const newPesos: Record<string, number> = {};
            newIds.forEach((id: string, idx: number) => {
                newPesos[id] = idx === newIds.length - 1 ? Number((100 - equalWeight * (newIds.length - 1)).toFixed(1)) : equalWeight;
            });
            setValue("segmentacao.pesoDistribuicao", newPesos);
        } else {
            setValue("segmentacao.pesoDistribuicao", {});
        }
    };

    const handlePesoChange = (grupoId: string, value: number) => {
        const newPesos = { ...pesoDistribuicao, [grupoId]: value };
        setValue("segmentacao.pesoDistribuicao", newPesos);
    };

    const totalPeso = Object.values(pesoDistribuicao).reduce((a, b) => Number(a) + Number(b), 0) as number;

    return (
        <div className="space-y-8 animate-in fade-in duration-300 h-full flex flex-col">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 border border-border rounded-xl space-y-1 text-center md:text-left">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Total Público</span>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <Users size={16} className="text-primary" />
                        <span className="text-xl font-black text-foreground leading-none">{stats.total}</span>
                    </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1 transition-colors hover:bg-blue-500/20 text-center md:text-left">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Homens</span>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <User size={16} className="text-blue-500" />
                        <span className="text-xl font-black text-blue-500 leading-none">{stats.homens}</span>
                    </div>
                </div>
                <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl space-y-1 transition-colors hover:bg-pink-500/20 text-center md:text-left">
                    <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest block">Mulheres</span>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <User size={16} className="text-pink-500" />
                        <span className="text-xl font-black text-pink-500 leading-none">{stats.mulheres}</span>
                    </div>
                </div>
                <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-xl space-y-1 transition-colors hover:bg-slate-500/20 text-center md:text-left">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Outros / N.I.</span>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <User size={16} className="text-slate-500" />
                        <span className="text-xl font-black text-slate-500 leading-none">{stats.outros}</span>
                    </div>
                </div>
            </div>

            {/* Tag Selection */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block">Segmentar por Tags</label>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => {
                        const isSelected = selectedTagIds.includes(tag.id);
                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => onTagToggle(tag.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                                    isSelected
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                )}
                            >
                                <TagIcon size={12} className="inline mr-1" />
                                {tag.nome}
                            </button>
                        );
                    })}
                    {tags.length === 0 && <p className="text-[10px] text-muted-foreground italic font-bold">Nenhuma tag encontrada.</p>}
                </div>
            </div>

            {/* Segmentação por Categoria */}
            {enqueteId && (
                <div className="space-y-4 p-5 bg-card border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <LayoutList size={16} className="text-primary" />
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Distribuição de Categorias</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={cn(
                            "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                            segmentacaoTipo === 'todos' || !segmentacaoTipo ? "bg-primary/5 border-primary shadow-sm" : "bg-background border-border hover:border-primary/30"
                        )}>
                            <input type="radio" value="todos" {...register("segmentacao.tipo")} className="mt-1" defaultChecked />
                            <div>
                                <span className="block text-sm font-bold text-foreground mb-1">Todos recebem mesmo link</span>
                                <span className="block text-[10px] text-muted-foreground leading-relaxed">Qualquer eleitor avaliará todas as categorias habilitadas.</span>
                            </div>
                        </label>
                        <label className={cn(
                            "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                            segmentacaoTipo === 'grupoCategoria' ? "bg-primary/5 border-primary shadow-sm" : "bg-background border-border hover:border-primary/30"
                        )}>
                            <input type="radio" value="grupoCategoria" {...register("segmentacao.tipo")} className="mt-1" />
                            <div>
                                <span className="block text-sm font-bold text-foreground mb-1">Segmentar por grupos</span>
                                <span className="block text-[10px] text-muted-foreground leading-relaxed">Dividir leads por pesos entre múltiplos grupos da enquete.</span>
                            </div>
                        </label>
                    </div>

                    {segmentacaoTipo === 'grupoCategoria' && (
                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-2">Selecione os Grupos</label>
                            {isLoadingSegmentos ? (
                                <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {gruposPrincipais.map((grupo: any) => {
                                            const isSelected = grupoIds.includes(grupo.id);
                                            return (
                                                <button
                                                    key={grupo.id}
                                                    type="button"
                                                    onClick={() => handleGrupoToggle(grupo.id)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                                                        isSelected
                                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                            : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    {grupo.nome}
                                                </button>
                                            );
                                        })}
                                        {gruposPrincipais.length === 0 && <p className="text-xs text-muted-foreground">Enquete não possui grupos.</p>}
                                    </div>

                                    {grupoIds.length > 0 && (
                                        <div className="p-4 bg-muted/40 rounded-xl space-y-4 border border-border mt-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-foreground uppercase tracking-widest block">Distribuir Pesos (%)</label>
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", totalPeso === 100 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive")}>
                                                    Total: {totalPeso.toFixed(1)}%
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                {grupoIds.map((id: string) => {
                                                    const grupo = gruposPrincipais.find((g: any) => g.id === id);
                                                    return (
                                                        <div key={id} className="flex flex-col gap-1">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="font-bold text-foreground">{grupo?.nome || id}</span>
                                                                <span className="text-muted-foreground font-medium">{pesoDistribuicao[id] || 0}%</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    step="1"
                                                                    value={pesoDistribuicao[id] || 0}
                                                                    onChange={(e) => handlePesoChange(id, Number(e.target.value))}
                                                                    className="flex-1 accent-primary"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={pesoDistribuicao[id] || 0}
                                                                    onChange={(e) => handlePesoChange(id, Number(e.target.value))}
                                                                    className="w-16 h-8 text-xs text-center font-bold bg-background border border-input rounded-md"
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Leads List */}
            <div className="flex-1 space-y-3 min-h-[300px]">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block">Participantes Selecionados</label>
                    <span className="text-[10px] font-bold text-muted-foreground">{leads.length} leads</span>
                </div>

                <div className="border border-border rounded-lg overflow-hidden bg-background">
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-muted/80 backdrop-blur-md z-10 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Nome</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">WhatsApp</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sexo</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingLeads ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center">
                                            <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                                        </td>
                                    </tr>
                                ) : leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center text-xs font-bold text-muted-foreground uppercase">
                                            Nenhum lead encontrado com estas tags.
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map(lead => (
                                        <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                                            <td className="px-4 py-3 text-xs font-bold text-foreground">{lead.nome}</td>
                                            <td className="px-4 py-3 text-xs font-medium text-muted-foreground">{lead.whatsapp}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                                                    lead.sexo === 'M' ? "bg-blue-100 text-blue-600" :
                                                        lead.sexo === 'F' ? "bg-pink-100 text-pink-600" :
                                                            "bg-slate-100 text-slate-600"
                                                )}>
                                                    {lead.sexo || 'N.I.'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {lead.tags.map((lt: any) => (
                                                        <span key={lt.tagId} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[8px] font-black uppercase border border-border/50">
                                                            {lt.tag.nome}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
