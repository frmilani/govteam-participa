import React from "react";
import { useFormContext } from "react-hook-form";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnqueteFormData } from "../EnqueteFormSchema";

export const SecurityTab: React.FC = () => {
    const {
        register,
        watch,
        setValue,
    } = useFormContext<EnqueteFormData>();

    const exigirIdentificacao = watch("exigirIdentificacao");
    const securityLevel = watch("securityLevel");
    const minCompleteness = watch("minCompleteness");

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-foreground">Segurança e Lógica</h3>
                <p className="text-muted-foreground text-sm font-medium">
                    Configure regras de proteção e validação da enquete.
                </p>
            </div>

            <div className="space-y-4 pt-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 font-medium">
                        <input
                            type="checkbox"
                            {...register("exigirIdentificacao")}
                            id="exigirIdentificacao"
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                            <label
                                htmlFor="exigirIdentificacao"
                                className="text-sm font-bold text-foreground cursor-pointer block"
                            >
                                Exigir Identificação
                            </label>
                            <p className="text-[10px] text-muted-foreground">
                                Votos só computados após identificação.
                            </p>
                        </div>
                    </div>

                    {exigirIdentificacao && (
                        <div className="flex-1 flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 font-medium animate-in fade-in slide-in-from-left-2 transition-all">
                            <input
                                type="checkbox"
                                {...register("exigirCpf")}
                                id="exigirCpf"
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                                <label
                                    htmlFor="exigirCpf"
                                    className="text-sm font-bold text-foreground cursor-pointer block"
                                >
                                    Exigir CPF
                                </label>
                                <p className="text-[10px] text-muted-foreground">
                                    Torna o campo CPF visível e obrigatório.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Nível de Segurança
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setValue("securityLevel", "NONE")}
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-lg border transition-all",
                                securityLevel === "NONE"
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted"
                            )}
                        >
                            <ShieldCheck size={20} />
                            <div className="text-left">
                                <div className="text-[10px] font-bold uppercase tracking-wider">
                                    Padrão
                                </div>
                                <p className="text-[10px] font-medium leading-tight">
                                    Sem validação extra (OTP)
                                </p>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue("securityLevel", "HIGH")}
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-lg border transition-all",
                                securityLevel === "HIGH"
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted"
                            )}
                        >
                            <ShieldCheck size={20} />
                            <div className="text-left">
                                <div className="text-[10px] font-bold uppercase tracking-wider">
                                    Alta Segurança
                                </div>
                                <p className="text-[10px] font-medium leading-tight">
                                    Validação via WhatsApp (OTP)
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Percentual Mínimo de Conclusão
                        </label>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {minCompleteness}%
                        </span>
                    </div>
                    <input
                        type="range"
                        {...register("minCompleteness", { valueAsNumber: true })}
                        min="0"
                        max="100"
                        step="5"
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
            </div>
        </div>
    );
};
