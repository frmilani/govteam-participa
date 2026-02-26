import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { BrainCircuit, Filter, Layers, Shuffle, CheckCircle2, ShieldQuestion, Info, AlertTriangle, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { useSegmentos } from "@/hooks/use-segmentos";
import { EnqueteFormData } from "../EnqueteFormSchema";
import { QualidadeInheritanceView } from "../QualidadeInheritanceView";
import { TipoPesquisaInfoDialog } from "@/components/admin/TipoPesquisaInfoDialog";
import { Button } from "@/components/ui/Button";

export const ResearchTab: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const enqueteId = params?.id as string;
    const { data: segmentos = [] } = useSegmentos();
    const totalCategorias = segmentos.filter((s: any) => !s.paiId).length || 1;

    const { register, watch, setValue, control, formState: { errors } } = useFormContext<EnqueteFormData>();

    const modoColeta = watch("modoColeta") || "recall-assistido";
    const modoDistribuicao = watch("modoDistribuicao") || "grupo";
    const tipoPesquisa = watch("tipoPesquisa");
    const incluirQualidade = watch("incluirQualidade") || false;
    const configPesquisa = watch("configPesquisa") || {};
    const [isTipoInfoModalOpen, setIsTipoInfoModalOpen] = React.useState(false);
    const [helpView, setHelpView] = React.useState<'main' | 'qualidade' | 'distribuicao' | 'blocos'>('main');

    const openHelp = (view: 'main' | 'qualidade' | 'distribuicao' | 'blocos') => {
        setHelpView(view);
        setIsTipoInfoModalOpen(true);
    };

    const showRecallDuplo = tipoPesquisa === "politica" || tipoPesquisa === "corporativo";
    const showMaxCategorias = modoDistribuicao === "aleatorio";

    React.useEffect(() => {
        if (!showMaxCategorias) {
            setValue("minCategoriasPorEleitor", undefined, { shouldDirty: true, shouldValidate: true });
            setValue("maxCategoriasPorEleitor", undefined, { shouldDirty: true, shouldValidate: true });
        }
    }, [showMaxCategorias, setValue]);

    const updateConfigPesquisa = (key: string, value: any) => {
        const currentConfig = { ...configPesquisa };
        if (key.includes(".")) {
            const [parent, child] = key.split(".");
            currentConfig[parent] = { ...(currentConfig[parent] || {}), [child]: value };
        } else {
            currentConfig[key] = value;
        }
        setValue("configPesquisa", currentConfig, { shouldDirty: true });
    };

    const getNestedValue = (key: string) => {
        if (key.includes(".")) {
            const [parent, child] = key.split(".");
            return configPesquisa?.[parent]?.[child] || false;
        }
        return configPesquisa?.[key] || false;
    };

    return (
        <div className="space-y-8 max-w-3xl animate-in fade-in duration-300">
            {/* Seção 1: Modo de Coleta */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-card-foreground">Modo de Coleta</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        { id: "top-of-mind", label: "Top of Mind Puro", desc: "Sem dicas visuais, apenas campo aberto", helpId: "top-of-mind" },
                        { id: "recall-assistido", label: "Recall Assistido", desc: "Sugere ao digitar (Autocomplete)", helpId: "recall-assistido" },
                        { id: "lista-sugerida", label: "Lista Sugerida", desc: "Lista fixa de opções visíveis", helpId: "lista-sugerida" },
                        ...(showRecallDuplo ? [{ id: "recall-duplo", label: "Recall Duplo", desc: "Espontânea seguida de Estimulada", helpId: "top-of-mind" }] : []),
                    ].map((modo) => (
                        <div
                            key={modo.id}
                            className={cn(
                                "flex flex-col items-start p-4 rounded-xl border transition-all text-left relative group",
                                modoColeta === modo.id
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border bg-card hover:border-primary/50"
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => setValue("modoColeta", modo.id, { shouldDirty: true })}
                                className="absolute inset-0 z-0"
                                aria-label={`Selecionar ${modo.label}`}
                            />
                            <div className="flex items-center justify-between w-full mb-1 relative z-10 pointer-events-none">
                                <span className={cn(
                                    "text-sm font-bold",
                                    modoColeta === modo.id ? "text-primary" : "text-card-foreground"
                                )}>
                                    {modo.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openHelp(modo.helpId as any);
                                        }}
                                        className="pointer-events-auto p-1 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <HelpCircle className="w-3.5 h-3.5" />
                                    </button>
                                    {modoColeta === modo.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                </div>
                            </div>
                            <span className="text-[11px] text-muted-foreground relative z-10 pointer-events-none">{modo.desc}</span>
                        </div>
                    ))}
                </div>

                {modoColeta === "top-of-mind" && (
                    <div className="mt-4 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs">
                                <strong>Atenção:</strong> Neste modo, o motor não apresentará opções. Cadastros prévios de Participantes/Entidades não serão exibidos aos votantes.
                            </p>
                            {enqueteId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/admin/enquetes/${enqueteId}/consolidacao`)}
                                    className="mt-3 border-yellow-500/50 hover:bg-yellow-500/20 text-yellow-800 dark:text-yellow-200 gap-2 h-8 text-[10px] font-bold uppercase"
                                >
                                    <BrainCircuit className="w-3.5 h-3.5" />
                                    Abrir Sala de Consolidação
                                </Button>
                            )}
                        </div>
                    </div>
                )}


                {modoColeta === "recall-duplo" && (
                    <div className="mt-4 p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Info className="w-4 h-4 mt-0.5 shrink-0" />
                        <p className="text-xs">
                            <strong>Mecânica:</strong> Irá criar um fluxo de dois passos: Passo 1 aberto (Espontânea) seguido imediatamente pelo Passo 2 com os pré-cadastros (Estimulada).
                        </p>
                    </div>
                )}

                <label className="flex items-center gap-3 p-4 mt-4 border rounded-xl bg-card cursor-pointer hover:bg-muted/30 transition-colors">
                    <input
                        type="checkbox"
                        className="w-5 h-5 text-primary rounded border-input focus:ring-primary"
                        checked={getNestedValue("permitirNaoSei")}
                        onChange={(e) => updateConfigPesquisa("permitirNaoSei", e.target.checked)}
                    />
                    <div>
                        <span className="text-sm font-bold text-card-foreground block">Permitir resposta "Não sei/Não conheço"</span>
                        <span className="text-[11px] text-muted-foreground">Adiciona uma opção explícita de abstenção em cada categoria</span>
                    </div>
                </label>
            </div>

            {/* Seção 2: Qualidade */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                        <ShieldQuestion className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-card-foreground">Validação & Qualidade</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => openHelp('qualidade')}
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                </div>

                <label className="flex items-center gap-3 p-4 border rounded-xl bg-card cursor-pointer hover:bg-muted/30 transition-colors">
                    <input
                        type="checkbox"
                        {...register("incluirQualidade")}
                        className="w-5 h-5 text-primary rounded border-input focus:ring-primary"
                    />
                    <div>
                        <span className="text-sm font-bold text-card-foreground block">Incluir perguntas de controle de qualidade</span>
                        <span className="text-[11px] text-muted-foreground">Adiciona questões armadilha para evitar respostas em massa feitas por robôs ou pessoas desatentas.</span>
                    </div>
                </label>

                {incluirQualidade && (
                    <div className="ml-8 mt-2 p-3 border-l-2 border-primary/30 pl-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[11px] text-muted-foreground pb-2">
                            Configurações avançadas de templates de qualidade e pesos estarão disponíveis na próxima fase de desenvolvimento.
                        </p>
                        {enqueteId ? (
                            <QualidadeInheritanceView enqueteId={enqueteId} />
                        ) : (
                            <p className="text-sm text-muted-foreground italic mt-2">
                                Salve a enquete primeiro para configurar a árvore de qualidade.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Seção 3: Distribuição */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <Shuffle className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-card-foreground">Distribuição & Rotatividade</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        { id: "todas", label: "Tudo desta vez", desc: "Eleitor vota em todas as categorias", helpId: "todas" },
                        { id: "grupo", label: "Por grupo (telas)", desc: "Exibe categorias definidas na campanha", helpId: "grupo" },
                        { id: "individual", label: "Individual (uma por tela)", desc: "A campanha foca em uma única categoria", helpId: "individual" },
                        { id: "aleatorio", label: "Aleatório / sorteio", desc: "Sorteio de N categorias por eleitor", helpId: "aleatorio" },
                        { id: "rotativo", label: "Rotativo demográfico", desc: "Distribuição equilibrada e científica", helpId: "rotativo" },
                    ].map((modo) => (
                        <div
                            key={modo.id}
                            className={cn(
                                "flex flex-col items-start p-4 rounded-xl border transition-all text-left relative min-h-[90px]",
                                modoDistribuicao === modo.id
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border bg-card hover:border-primary/50"
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => setValue("modoDistribuicao", modo.id, { shouldDirty: true })}
                                className="absolute inset-0 z-0"
                            />
                            <div className="flex items-center justify-between w-full mb-1 relative z-10 pointer-events-none">
                                <span className={cn(
                                    "text-sm font-bold",
                                    modoDistribuicao === modo.id ? "text-primary" : "text-card-foreground"
                                )}>
                                    {modo.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openHelp(modo.helpId as any);
                                        }}
                                        className="pointer-events-auto p-1 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <HelpCircle className="w-3.5 h-3.5" />
                                    </button>
                                    {modoDistribuicao === modo.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                </div>
                            </div>
                            <span className="text-[11px] text-muted-foreground relative z-10 pointer-events-none">{modo.desc}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-3 rounded-lg border border-primary/20 bg-primary/5 text-primary flex items-start gap-3 animate-in fade-in duration-300">
                    <Info className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                    <div className="text-xs text-foreground">
                        <strong className="text-primary tracking-wide uppercase">Preview de Distribuição:</strong><br />
                        {modoDistribuicao === "todas" && `Com ${totalCategorias} categorias ativas, o eleitor verá e votará em todas elas.`}
                        {modoDistribuicao === "grupo" && `Com ${totalCategorias} categorias ativas, o eleitor verá um subconjunto definido nos Grupos da Campanha de disparo.`}
                        {modoDistribuicao === "individual" && `Com ${totalCategorias} categorias ativas, cada eleitor será direcionado a exatamente 1 categoria designada por campanha.`}
                        {modoDistribuicao === "aleatorio" && `Com ${totalCategorias} categorias ativas, o motor irá sortear exatamente ${watch("maxCategoriasPorEleitor") || 1} categorias para o eleitor.`}
                        {modoDistribuicao === "rotativo" && `As ${totalCategorias} categorias serão distribuídas de forma equitativa (round-robin) entre o fluxo contínuo de eleitores.`}
                    </div>
                </div>

                {showMaxCategorias && (
                    <div className="mt-4 p-4 border rounded-lg bg-card/50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                            Limitação MÁXIMA de Categorias por Eleitor
                        </label>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground font-medium uppercase text-right w-10">Máx</span>
                            <Input
                                type="number"
                                value={watch("maxCategoriasPorEleitor") || totalCategorias}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val > 0 && val <= totalCategorias) setValue("maxCategoriasPorEleitor", val);
                                }}
                                min={1}
                                max={totalCategorias}
                                className="w-20 text-center font-bold no-arrows"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">O eleitor receberá um sorteio deste número de categorias para responder.</span>
                    </div>
                )}
            </div>

            {/* Seção 4: Blocos Adicionais */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-card-foreground">Blocos Adicionais (Experiência)</h3>
                    <button
                        type="button"
                        onClick={() => openHelp('blocos')}
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { id: "nps", label: "NPS (Net Promoter Score)" },
                        { id: "priorizacao", label: "Priorização (Drag & Drop)" },
                        { id: "aprovacao", label: "Aprovação Geral" },
                        { id: "textoLivre", label: "Caixa de Texto Livre" }
                    ].map((bloco) => {
                        const isChecked = getNestedValue(`blocosAdicionais.${bloco.id}`);
                        return (
                            <div key={bloco.id} className="flex flex-col gap-2 p-3 border rounded-lg bg-card transition-colors hover:border-primary/50">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-primary rounded border-input focus:ring-primary"
                                        checked={isChecked}
                                        onChange={(e) => updateConfigPesquisa(`blocosAdicionais.${bloco.id}`, e.target.checked)}
                                    />
                                    <span className="text-sm font-medium text-card-foreground">{bloco.label}</span>
                                </label>
                                {isChecked && (
                                    <div className="ml-7 pt-1 animate-in fade-in duration-300">
                                        <p className="text-[11px] text-muted-foreground">Configurações deste módulo em breve.</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <TipoPesquisaInfoDialog
                isOpen={isTipoInfoModalOpen}
                onClose={() => setIsTipoInfoModalOpen(false)}
                initialView={helpView as any}
            />
        </div >
    );
};
