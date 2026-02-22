"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    Info,
    CheckCircle2,
    Loader2,
    Smartphone,
    Users,
    Megaphone,
    Calendar,
    Clock,
    Tag,
    ArrowRight,
    Search,
    LayoutGrid,
    Clock3,
    XCircle,
    Signal
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useCreateCampanha, useUpdateCampanha } from "@/hooks/use-campanhas";
import { useEnquetes } from "@/hooks/use-enquetes";
import { useTags } from "@/hooks/use-tags";
import { useLeads } from "@/hooks/use-leads";
import { useWhatsappInstances } from "@/hooks/use-whatsapp-instances";

// Organisms
import { StrategySelector } from "./campanha/organisms/StrategySelector";
import { TemplateManager } from "./campanha/organisms/TemplateManager";
import { MessageSequence } from "./campanha/organisms/MessageSequence";
import { WhatsAppPreview } from "./campanha/organisms/WhatsAppPreview";
import { LeadSegmentation } from "./campanha/organisms/LeadSegmentation";
import { ConnectionManager } from "./campanha/organisms/ConnectionManager";

const messageSchema = z.object({
    type: z.enum(['text', 'image', 'audio', 'video', 'menu', 'interactive']),
    content: z.string().catch(""),
    mediaUrl: z.string().catch(""),
    delayAfter: z.number().int().min(0).catch(0),
});

const campanhaFormSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    enqueteId: z.string().min(1, "Enquete é obrigatória"),
    templates: z.array(z.object({
        messages: z.array(messageSchema).min(1, "Pelo menos uma mensagem é necessária"),
        weight: z.number().min(1).max(100)
    })).min(1).max(5),
    segmentacao: z.object({
        tipo: z.enum(['todos', 'grupoCategoria', 'individual']).default('todos').optional(),
        grupoIds: z.array(z.string()).optional(),
        pesoDistribuicao: z.record(z.string(), z.number()).optional(),
        tagIds: z.array(z.string()).catch([])
    }).superRefine((data, ctx) => {
        if (data.tipo !== 'todos' && data.pesoDistribuicao && Object.keys(data.pesoDistribuicao).length > 0) {
            const total = Object.values(data.pesoDistribuicao).reduce((acc: number, val: number) => acc + Number(val), 0) as number;
            // Permitimos pequena margem de erro por arredondamento (ex: 99.9 a 100.1)
            if (total < 99.8 || total > 100.2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `A soma dos pesos deve ser 100% (atual: ${total}%)`,
                    path: ["pesoDistribuicao"]
                });
            }
        }
    }),
    intervaloMin: z.number().int().min(1).catch(5),
    intervaloMax: z.number().int().min(1).catch(15),
    agendadoPara: z.string().catch(""),
    provider: z.string().default("EVOLUTION"),
    instances: z.array(z.object({
        instanceId: z.string(),
        weight: z.number().min(1).max(100)
    })).min(1, "Selecione pelo menos uma conexão"),
    strategy: z.enum(['DIRECT', 'SOFT_BLOCK', 'OPT_IN']),
    initialMessage: z.string().optional(),
});

type CampanhaFormData = z.infer<typeof campanhaFormSchema>;

interface CampanhaFormProps {
    campanha?: any | null;
    onClose: () => void;
}

export function CampanhaForm({ campanha, onClose }: CampanhaFormProps) {
    const [activeTab, setActiveTab] = useState<"basic" | "public" | "connections" | "review">("basic");
    const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const createMutation = useCreateCampanha();
    const updateMutation = useUpdateCampanha();

    const { data: enquetes = [] } = useEnquetes({ status: 'PUBLICADA' });
    const { data: tags = [] } = useTags();
    const { data: whatsappInstances = [] } = useWhatsappInstances();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<CampanhaFormData>({
        resolver: zodResolver(campanhaFormSchema as any),
        defaultValues: {
            nome: "",
            enqueteId: "",
            templates: [
                {
                    messages: [
                        { type: 'text', content: "Olá {{nome}}! Convidamos você para participar da nossa pesquisa: {{link}}", mediaUrl: "", delayAfter: 0 }
                    ],
                    weight: 100
                }
            ],
            segmentacao: {
                tipo: 'todos',
                grupoIds: [],
                pesoDistribuicao: {},
                tagIds: []
            },
            intervaloMin: 5,
            intervaloMax: 15,
            agendadoPara: "",
            provider: "EVOLUTION",
            instances: [],
            strategy: "DIRECT",
            initialMessage: "Olá {{nome}}! Temos um convite especial para você. Podemos enviar o link?"
        },
    });

    const { fields: templateFields, append: appendTemplate, remove: removeTemplate } = useFieldArray({
        control,
        name: "templates"
    });

    const { fields: instanceFields, append: appendInstance, remove: removeInstance, update: updateInstance } = useFieldArray({
        control,
        name: "instances"
    });

    useEffect(() => {
        if (campanha) {
            let mappedTemplates = [];
            const rawMensagens = campanha.mensagens as any;

            if (rawMensagens && rawMensagens.type === 'multi-template' && Array.isArray(rawMensagens.templates)) {
                mappedTemplates = rawMensagens.templates.map((t: any) => ({
                    messages: t.messages || t || [],
                    weight: t.weight || 100
                }));
            } else if (Array.isArray(rawMensagens)) {
                mappedTemplates = [{ messages: rawMensagens, weight: 100 }];
            } else {
                mappedTemplates = [{
                    messages: [{ type: 'text', content: "", mediaUrl: "", delayAfter: 5 }],
                    weight: 100
                }];
            }

            reset({
                nome: campanha.nome || "",
                enqueteId: campanha.enqueteId || "",
                templates: mappedTemplates.map((t: any) => ({
                    messages: (Array.isArray(t.messages) ? t.messages : []).map((m: any) => ({
                        type: m.type || 'text',
                        content: m.content || "",
                        mediaUrl: m.mediaUrl || "",
                        delayAfter: m.delayAfter || 0
                    })),
                    weight: t.weight || 100
                })),
                segmentacao: {
                    tipo: campanha.segmentacao?.tipo || 'todos',
                    grupoIds: campanha.segmentacao?.grupoIds || [],
                    pesoDistribuicao: campanha.segmentacao?.pesoDistribuicao || {},
                    tagIds: Array.isArray(campanha.segmentacao?.tagIds) ? campanha.segmentacao.tagIds : []
                },
                intervaloMin: campanha.intervaloMin || 5,
                intervaloMax: campanha.intervaloMax || 15,
                agendadoPara: campanha.agendadoPara ? new Date(campanha.agendadoPara).toISOString().slice(0, 16) : "",
                provider: campanha.provider || "EVOLUTION",
                instances: campanha.instances?.map((i: any) => ({ instanceId: i.instanceId, weight: i.weight })) || [],
                strategy: rawMensagens?.strategy || "DIRECT",
                initialMessage: rawMensagens?.initialMessage || "Olá {{nome}}! Temos um convite especial para você. Podemos enviar o link?",
            });
        }
    }, [campanha, reset]);

    const selectedTagIds = watch("segmentacao.tagIds") || [];
    const templates = watch("templates") || [];
    const activeStrategy = watch("strategy");
    const initialMessage = watch("initialMessage");

    const rebalanceWeightsAfterAction = (newCount: number) => {
        const equalShare = Math.floor(100 / newCount);
        for (let i = 0; i < newCount; i++) {
            const val = i === newCount - 1 ? 100 - (equalShare * (newCount - 1)) : equalShare;
            setValue(`templates.${i}.weight`, val);
        }
    };

    const handleTemplateWeightChange = (index: number, newValue: number) => {
        const currentTemplates = watch('templates');
        const count = currentTemplates.length;
        if (count <= 1) {
            setValue(`templates.${index}.weight`, 100);
            return;
        }
        const remaining = 100 - newValue;
        const otherIndices = currentTemplates.map((_, i) => i).filter(i => i !== index);
        const otherWeightsSum = otherIndices.reduce((sum, i) => sum + (currentTemplates[i].weight || 0), 0);

        setValue(`templates.${index}.weight`, newValue);
        if (otherWeightsSum === 0) {
            const equalShare = Math.floor(remaining / otherIndices.length);
            otherIndices.forEach((otherIdx, i) => {
                const val = i === otherIndices.length - 1 ? remaining - (equalShare * (otherIndices.length - 1)) : equalShare;
                setValue(`templates.${otherIdx}.weight`, val);
            });
        } else {
            let distributed = 0;
            otherIndices.forEach((otherIdx, i) => {
                if (i === otherIndices.length - 1) {
                    setValue(`templates.${otherIdx}.weight`, Math.max(0, remaining - distributed));
                } else {
                    const share = Math.round((currentTemplates[otherIdx].weight / otherWeightsSum) * remaining);
                    setValue(`templates.${otherIdx}.weight`, Math.max(0, share));
                    distributed += share;
                }
            });
        }
    };

    const { data: leads = [], isLoading: isLoadingLeads } = useLeads({
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
    });

    const onSubmit = async (data: any) => {
        try {
            setErrorMessage(null);
            const payload = {
                ...data,
                mensagens: {
                    type: 'multi-template',
                    templates: data.templates,
                    strategy: data.strategy,
                    initialMessage: data.initialMessage
                }
            };
            if (campanha) {
                await updateMutation.mutateAsync({ id: campanha.id, ...payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onClose();
        } catch (error: any) {
            setErrorMessage(error.message || "Erro ao salvar campanha");
        }
    };

    const stats = {
        total: leads.length,
        homens: leads.filter(l => l.sexo === 'M').length,
        mulheres: leads.filter(l => l.sexo === 'F').length,
        outros: leads.filter(l => l.sexo !== 'M' && l.sexo !== 'F').length
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-background overflow-hidden relative">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-border/50 shrink-0 bg-background/90 backdrop-blur-md z-[70] xl:w-[calc(100%-400px)] 2xl:w-[calc(100%-480px)]">
                <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                        <Megaphone size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground tracking-tight leading-none">
                            {campanha ? "Editar Campanha" : "Nova Campanha de WhatsApp"}
                        </h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                            <Signal size={12} className="text-emerald-500" />
                            {campanha ? "Atualização de disparo" : "Criação de fluxo automatizado"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 rounded-full">
                        <X size={20} />
                    </Button>
                </div>
            </div>

            {/* Split Content Layer */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Column: Fixed Wrapper for Form with its own footer */}
                <div className="flex-1 flex flex-col min-w-0 bg-card/30 border-r border-border/50">

                    {/* Floating Tabs Manager */}
                    <div className="bg-background/95 backdrop-blur-sm border-b border-border/50 px-8 py-4 flex items-center gap-1 shrink-0 z-50">
                        <button
                            type="button"
                            onClick={() => setActiveTab("basic")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                activeTab === 'basic' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <LayoutGrid size={14} />
                            Configurações Básicas
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("public")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                activeTab === 'public' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Users size={14} />
                            Público e Segmentação
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("connections")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                activeTab === 'connections' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Smartphone size={14} />
                            Conexões e Disparo
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("review")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ml-auto",
                                activeTab === 'review' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <CheckCircle2 size={14} />
                            Revisão
                        </button>
                    </div>

                    {/* Scrollable Form Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-12">
                        <div className="max-w-4xl mx-auto space-y-10">
                            {errorMessage && (
                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in slide-in-from-top-2">
                                    <XCircle size={18} />
                                    <p className="text-xs font-bold uppercase tracking-wider">{errorMessage}</p>
                                </div>
                            )}

                            {activeTab === 'basic' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-card border border-border rounded-2xl shadow-sm">
                                        <div className="md:col-span-2 flex items-center gap-2 mb-2">
                                            <Info size={16} className="text-primary" />
                                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Identificação da Campanha</h3>
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider px-2">Nome da Campanha</label>
                                            <Input {...register('nome')} placeholder="Ex: Pesquisa de Satisfação 2024" className="h-12 bg-background/50" />
                                            {errors.nome && <p className="text-[9px] text-destructive font-bold uppercase mt-1 px-2">{errors.nome.message}</p>}
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider px-2">Enquete Destino</label>
                                            <select {...register('enqueteId')} className="w-full h-12 rounded-xl bg-background/50 border border-input px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none">
                                                <option value="">Selecione uma enquete</option>
                                                {enquetes.map(e => <option key={e.id} value={e.id}>{e.titulo}</option>)}
                                            </select>
                                            {errors.enqueteId && <p className="text-[9px] text-destructive font-bold uppercase mt-1 px-2">{errors.enqueteId.message}</p>}
                                        </div>
                                    </div>
                                    <StrategySelector register={register} watch={watch} />
                                    <div className="space-y-8 p-8 bg-card border border-border rounded-2xl shadow-sm">
                                        <TemplateManager
                                            templateFields={templateFields} activeTemplateIndex={activeTemplateIndex} setActiveTemplateIndex={setActiveTemplateIndex}
                                            watch={watch} appendTemplate={appendTemplate} removeTemplate={removeTemplate}
                                            handleTemplateWeightChange={handleTemplateWeightChange} rebalanceWeightsAfterAction={rebalanceWeightsAfterAction}
                                        />
                                        <div className="w-full h-px bg-border/50" />
                                        <MessageSequence control={control} activeTemplateIndex={activeTemplateIndex} register={register} watch={watch} setValue={setValue} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'public' && (
                                <LeadSegmentation
                                    stats={stats} tags={tags} selectedTagIds={selectedTagIds}
                                    onTagToggle={(tagId) => {
                                        const newIds = selectedTagIds.includes(tagId) ? selectedTagIds.filter((id: string) => id !== tagId) : [...selectedTagIds, tagId];
                                        setValue("segmentacao.tagIds", newIds);
                                    }}
                                    leads={leads} isLoadingLeads={isLoadingLeads}
                                    register={register} watch={watch} setValue={setValue} enqueteId={watch("enqueteId")}
                                />
                            )}

                            {activeTab === 'connections' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <ConnectionManager
                                        whatsappInstances={whatsappInstances} instanceFields={instanceFields}
                                        appendInstance={appendInstance} removeInstance={removeInstance} updateInstance={updateInstance}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-card border border-border rounded-2xl shadow-sm">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2"><Clock3 size={14} /> Intervalo entre Mensagens</label>
                                            <div className="flex items-center gap-3">
                                                <input type="number" {...register('intervaloMin', { valueAsNumber: true })} className="w-full h-12 bg-background/50 border border-input rounded-xl px-4 text-sm font-bold text-center appearance-none focus:ring-2" />
                                                <span className="text-[10px] font-black text-muted-foreground">A</span>
                                                <input type="number" {...register('intervaloMax', { valueAsNumber: true })} className="w-full h-12 bg-background/50 border border-input rounded-xl px-4 text-sm font-bold text-center appearance-none focus:ring-2" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2"><Calendar size={14} /> Agendar Início</label>
                                            <input type="datetime-local" {...register('agendadoPara')} className="w-full h-12 bg-background/50 border border-input rounded-xl px-4 text-sm font-bold focus:ring-2 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'review' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
                                        <div className="flex items-center gap-2 mb-6">
                                            <CheckCircle2 size={18} className="text-primary" />
                                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Resumo da Campanha</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Tipo de Segmentação</span>
                                                <span className="font-bold">{watch("segmentacao.tipo") === 'grupoCategoria' ? "Grupos de Categorias" : "Padrão (Todos)"}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total de Leads Selecionados</span>
                                                <span className="font-bold">{stats.total} leads</span>
                                            </div>
                                        </div>

                                        {watch("segmentacao.tipo") === 'grupoCategoria' && (
                                            <div className="border border-border rounded-xl bg-background/50 overflow-hidden">
                                                <div className="bg-muted px-4 py-2 border-b border-border">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preview de Distribuição por Grupo</span>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    {(watch("segmentacao.grupoIds") || []).map((id: string) => {
                                                        const peso = (watch("segmentacao.pesoDistribuicao") || {})[id] || 0;
                                                        const estimado = Math.round((stats.total * peso) / 100);
                                                        return (
                                                            <div key={id} className="flex flex-col">
                                                                <div className="flex justify-between text-xs mb-1">
                                                                    <span className="font-bold text-foreground">Grupo {id.slice(0, 6)}...</span>
                                                                    <div className="flex gap-4">
                                                                        <span className="text-primary font-bold">{peso}%</span>
                                                                        <span className="text-muted-foreground">Aprox. {estimado} leads</span>
                                                                    </div>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                                    <div className="h-full bg-primary" style={{ width: `${peso}%` }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Integrated Footer Column-specific */}
                    <div className="px-8 py-5 bg-muted/20 border-t border-border/50 flex items-center justify-between shrink-0 z-50">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            {stats.total} leads selecionados para esta campanha
                        </p>
                        <div className="flex items-center gap-3">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="h-10 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-muted">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="h-10 px-10 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />}
                                {campanha ? "Atualizar Campanha" : "Iniciar Campanha"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar for WhatsApp Preview (Fixed Position) */}
                <div className="hidden xl:block w-[400px] 2xl:w-[480px] shrink-0" />
                <div className="hidden xl:block fixed top-[84px] bottom-0 right-0 w-[400px] 2xl:w-[480px] bg-muted/5 border-l border-border/50 z-20">
                    <div className="h-full flex flex-col items-center justify-center p-8 2xl:p-12 overflow-hidden">
                        <div className="w-full transform animate-in fade-in slide-in-from-right-8 duration-700 scale-[0.75] 2xl:scale-100 origin-center transition-all">
                            {(() => {
                                const activeEnqueteId = watch("enqueteId");
                                const selectedEnqueteList = enquetes.find(e => e.id === activeEnqueteId);
                                const enqueteLogo = (selectedEnqueteList?.configVisual as any)?.logoUrl;

                                return (
                                    <WhatsAppPreview
                                        strategy={activeStrategy}
                                        initialMessage={initialMessage}
                                        messages={templates[activeTemplateIndex]?.messages || []}
                                        activeTemplateIndex={activeTemplateIndex}
                                        avatarUrl={enqueteLogo}
                                    />
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </form>
    );
}
