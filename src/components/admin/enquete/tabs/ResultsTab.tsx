import React from "react";
import { useFormContext } from "react-hook-form";
import { Info, Globe, X, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { EnqueteFormData } from "../EnqueteFormSchema";

interface ResultsTabProps {
    enquete: any;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({ enquete }) => {
    const { watch, setValue } = useFormContext<EnqueteFormData>();

    const resultadosStatus = watch("resultadosStatus");
    const formPublicId = watch("formPublicId");
    const exibirVotos = watch("configResultados.exibirVotos");
    const exibirPercentual = watch("configResultados.exibirPercentual");

    return (
        <div className="space-y-8 max-w-2xl animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-foreground">
                    Publicação de Resultados
                </h3>
                <p className="text-muted-foreground text-sm font-medium">
                    Controle como e quando os resultados serão exibidos publicamente.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Status de Publicação
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            {
                                id: "EM_CONFERENCIA",
                                label: "Em Conferência",
                                icon: Info,
                                activeClass: "border-amber-500 bg-amber-500/10 text-amber-600",
                                inactiveClass: "text-amber-600/70 hover:bg-amber-500/5",
                            },
                            {
                                id: "PUBLICADO",
                                label: "Publicado",
                                icon: Globe,
                                activeClass:
                                    "border-emerald-500 bg-emerald-500/10 text-emerald-600",
                                inactiveClass: "text-emerald-600/70 hover:bg-emerald-500/5",
                            },
                            {
                                id: "CANCELADO",
                                label: "Cancelado",
                                icon: X,
                                activeClass: "border-rose-500 bg-rose-500/10 text-rose-600",
                                inactiveClass: "text-rose-600/70 hover:bg-rose-500/5",
                            },
                        ].map((status) => (
                            <button
                                key={status.id}
                                type="button"
                                onClick={() => setValue("resultadosStatus", status.id as any)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-lg border transition-all gap-2 text-center",
                                    resultadosStatus === status.id
                                        ? status.activeClass
                                        : `border-border bg-card ${status.inactiveClass}`
                                )}
                            >
                                <status.icon size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {status.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {enquete && (
                    <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="space-y-0.5">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">
                                Link de Divulgação
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                                Link público para visualização dos rankings.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() =>
                                window.open(`/resultados/${formPublicId}`, "_blank")
                            }
                            className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] gap-2"
                        >
                            <Eye size={14} />
                            Abrir Resultados
                        </Button>
                    </div>
                )}

                <div className="p-6 bg-muted/30 rounded-xl border border-border space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Configurações de Exibição
                    </label>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                                type="checkbox"
                                checked={exibirVotos}
                                onChange={(e) =>
                                    setValue("configResultados.exibirVotos", e.target.checked)
                                }
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-bold text-foreground">
                                    Divulgar Quantidade de Votos
                                </span>
                                <p className="text-[10px] text-muted-foreground font-medium">
                                    Mostra o número absoluto de votos de cada ganhador.
                                </p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                                type="checkbox"
                                checked={exibirPercentual}
                                onChange={(e) =>
                                    setValue("configResultados.exibirPercentual", e.target.checked)
                                }
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-bold text-foreground">
                                    Divulgar Percentual
                                </span>
                                <p className="text-[10px] text-muted-foreground font-medium">
                                    Mostra a porcentagem de preferência de cada ganhador.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {resultadosStatus === "PUBLICADO" && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3 text-emerald-600">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold">Resultados Visíveis Publicamente</p>
                            <p className="text-[10px] font-medium opacity-90">
                                A página pública de rankings está ativa e pode ser consultada
                                por qualquer pessoa.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
