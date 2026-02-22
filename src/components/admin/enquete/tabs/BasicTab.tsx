import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Info, ShieldCheck, Globe, Users, Loader2, HelpCircle, Trophy, Landmark, Building2, Briefcase, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { EnqueteFormData } from "../EnqueteFormSchema";
import { applyPreset } from "@/lib/enquete/presets";
import { useToast } from "@/components/ui/Toast";
import { ModoAcessoInfoDialog } from "@/components/admin/ModoAcessoInfoDialog";
import { TipoPesquisaInfoDialog } from "@/components/admin/TipoPesquisaInfoDialog";

interface BasicTabProps {
    isLoadingHubForms: boolean;
    hubForms: Array<{ id: string; publicId: string; title: string }>;
    enquete: any;
}

export const BasicTab: React.FC<BasicTabProps> = ({
    isLoadingHubForms,
    hubForms,
    enquete,
}) => {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<EnqueteFormData>();

    const modoAcesso = watch("modoAcesso");
    const tipoPesquisa = watch("tipoPesquisa");
    const [isModoAcessoModalOpen, setIsModoAcessoModalOpen] = useState(false);
    const [isTipoInfoModalOpen, setIsTipoInfoModalOpen] = useState(false);
    const { showToast } = useToast();

    const handleTipoChange = (tipoId: string, tipoLabel: string) => {
        if (tipoPesquisa === tipoId) return; // Se já é o mesmo, não faz nada

        setValue("tipoPesquisa", tipoId, { shouldValidate: true });

        // Aplica as predefinições apenas via UI (user click)
        if (tipoId !== "custom") {
            applyPreset(tipoId, setValue);
            showToast(`Valores otimizados para "${tipoLabel}" foram preenchidos.`, "success");
        }
    };

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                        Título da Enquete <span className="text-red-500">*</span>
                    </label>
                    <Input
                        {...register("titulo")}
                        placeholder="Ex: Melhores do Ano 2024"
                        className="h-11 font-bold"
                    />
                    {errors.titulo && (
                        <span className="text-xs text-red-500 font-bold mt-1 block">
                            {errors.titulo.message}
                        </span>
                    )}
                </div>

                <div className="space-y-1.5 mt-4">
                    <div className="flex items-center gap-2 mb-1.5">
                        <label
                            className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => setIsTipoInfoModalOpen(true)}
                        >
                            Tipo de Pesquisa <HelpCircle className="w-3 h-3" />
                        </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { id: "premiacao", label: "Premiação", icon: Trophy },
                            { id: "politica", label: "Política", icon: Landmark },
                            { id: "politicas-publicas", label: "Pol. Públicas", icon: Building2 },
                            { id: "corporativo", label: "Corporativo", icon: Briefcase },
                            { id: "custom", label: "Custom", icon: Sparkles },
                        ].map((tipo) => (
                            <button
                                key={tipo.id}
                                type="button"
                                onClick={() => handleTipoChange(tipo.id, tipo.label)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-2 text-center",
                                    tipoPesquisa === tipo.id
                                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                                )}
                            >
                                <tipo.icon size={20} />
                                <div className="text-[9px] font-bold uppercase tracking-wider leading-tight">
                                    {tipo.label}
                                </div>
                            </button>
                        ))}
                    </div>
                    <input type="hidden" {...register("tipoPesquisa")} />
                    {errors.tipoPesquisa && (
                        <span className="text-xs text-destructive font-bold mt-1 block">
                            {errors.tipoPesquisa.message}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Formulário do Hub
                </label>
                <div className="relative">
                    <select
                        {...register("formPublicId")}
                        disabled={isLoadingHubForms}
                        className={cn(
                            "w-full h-10 px-3 bg-background border border-input rounded-md text-sm font-medium outline-none disabled:opacity-50 appearance-none focus:ring-1 focus:ring-ring focus:border-primary transition-all",
                            errors.formPublicId &&
                            "border-destructive focus:border-destructive focus:ring-destructive/20"
                        )}
                    >
                        <option value="">Selecione um formulário...</option>
                        {enquete?.formPublicId &&
                            !hubForms.find((f) => f.publicId === enquete.formPublicId) && (
                                <option value={enquete.formPublicId}>
                                    {enquete.formPublicId} (Vínculo Atual)
                                </option>
                            )}
                        {hubForms.map((form) => (
                            <option key={form.id} value={form.publicId}>
                                {form.title} ({form.publicId})
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        {isLoadingHubForms ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Info size={16} className="rotate-90" />
                        )}
                    </div>
                </div>
                {errors.formPublicId && (
                    <p className="text-[10px] text-destructive font-bold mt-1 uppercase">
                        {errors.formPublicId.message}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center gap-2 mb-1.5 mt-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block cursor-pointer flex items-center gap-1" onClick={() => setIsModoAcessoModalOpen(true)}>
                        Modo de Acesso <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors" />
                    </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(["RESTRITO_HASH", "PUBLICO", "HIBRIDO"] as const).map((modo) => (
                        <button
                            key={modo}
                            type="button"
                            onClick={() => setValue("modoAcesso", modo)}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-lg border transition-all gap-2 text-center",
                                modoAcesso === modo
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted"
                            )}
                        >
                            {modo === "RESTRITO_HASH" && <ShieldCheck size={20} />}
                            {modo === "PUBLICO" && <Globe size={20} />}
                            {modo === "HIBRIDO" && <Users size={20} />}
                            <div className="text-[10px] font-bold uppercase tracking-wider">
                                {modo === "RESTRITO_HASH"
                                    ? "Restrito"
                                    : modo === "PUBLICO"
                                        ? "Público"
                                        : "Híbrido"}
                            </div>
                        </button>
                    ))}
                </div>
                <input type="hidden" {...register("modoAcesso")} />
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Descrição
                </label>
                <textarea
                    {...register("descricao")}
                    rows={3}
                    className="w-full rounded-md bg-background border border-input p-3 text-sm font-medium outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Início
                    </label>
                    <input
                        type="datetime-local"
                        {...register("dataInicio")}
                        className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm font-medium outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Fim
                    </label>
                    <input
                        type="datetime-local"
                        {...register("dataFim")}
                        className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm font-medium outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all"
                    />
                </div>
            </div>

            <ModoAcessoInfoDialog isOpen={isModoAcessoModalOpen} onClose={() => setIsModoAcessoModalOpen(false)} />
            <TipoPesquisaInfoDialog isOpen={isTipoInfoModalOpen} onClose={() => setIsTipoInfoModalOpen(false)} />
        </div>
    );
};
