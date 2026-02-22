import React from "react";
import { useFormContext } from "react-hook-form";
import { Award, Tag, Globe, Info, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { EnqueteFormData } from "../EnqueteFormSchema";

interface PrizesTabProps {
    enquete: any;
}

export const PrizesTab: React.FC<PrizesTabProps> = ({ enquete }) => {
    const { register, watch, setValue } = useFormContext<EnqueteFormData>();

    const usarPremiacao = watch("usarPremiacao");
    const usarNumerosSorte = watch("usarNumerosSorte");
    const digitosNumerosSorte = watch("digitosNumerosSorte");
    const premiacaoStatus = watch("premiacaoStatus");
    const configPremiacao = watch("configPremiacao") || [];
    const formPublicId = watch("formPublicId");

    return (
        <div className="space-y-8 max-w-2xl animate-in fade-in duration-300">
            <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                    <Award size={18} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                        Configuração da Premiação
                    </h4>
                </div>

                <div className="space-y-6">
                    <label className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors shadow-sm">
                        <input
                            type="checkbox"
                            {...register("usarPremiacao")}
                            className="h-5 w-5 rounded border-input text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                            <span className="text-sm font-black text-foreground">
                                Ativar Sistema de Premiação
                            </span>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                Habilita a gestão de prêmios e Números da Sorte para esta
                                enquete.
                            </p>
                        </div>
                    </label>

                    {usarPremiacao && (
                        <div className="space-y-6 pl-8 animate-in slide-in-from-left-2 duration-300">
                            {/* Números da Sorte Integration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-xl border border-border shadow-sm">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 font-bold text-xs text-foreground uppercase tracking-widest">
                                        <Tag size={14} className="text-primary" />
                                        Números da Sorte
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            {...register("usarNumerosSorte")}
                                            id="usar-sorte"
                                            className="h-4 w-4 rounded border-input"
                                        />
                                        <label
                                            htmlFor="usar-sorte"
                                            className="text-[11px] font-bold text-muted-foreground uppercase cursor-pointer"
                                        >
                                            Gerar automaticamente
                                        </label>
                                    </div>
                                    {usarNumerosSorte && (
                                        <div className="flex gap-4 pt-2">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value={4}
                                                    checked={digitosNumerosSorte === 4}
                                                    onChange={() => setValue("digitosNumerosSorte", 4)}
                                                />{" "}
                                                4 Dígitos
                                            </label>
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value={5}
                                                    checked={digitosNumerosSorte === 5}
                                                    onChange={() => setValue("digitosNumerosSorte", 5)}
                                                />{" "}
                                                5 Dígitos
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 font-bold text-xs text-foreground uppercase tracking-widest">
                                        <Globe size={14} className="text-primary" />
                                        Divulgação de Ganhadores
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            {
                                                id: "EM_CONFERENCIA",
                                                label: "Confere",
                                                icon: Info,
                                                activeClass:
                                                    "border-amber-500 bg-amber-500/10 text-amber-600",
                                                inactiveClass:
                                                    "text-amber-600/70 hover:bg-amber-500/5 shadow-sm",
                                            },
                                            {
                                                id: "PUBLICADO",
                                                label: "Ativo",
                                                icon: Globe,
                                                activeClass:
                                                    "border-emerald-500 bg-emerald-500/10 text-emerald-600",
                                                inactiveClass:
                                                    "text-emerald-600/70 hover:bg-emerald-500/5 shadow-sm",
                                            },
                                            {
                                                id: "CANCELADO",
                                                label: "Off",
                                                icon: X,
                                                activeClass:
                                                    "border-rose-500 bg-rose-500/10 text-rose-600",
                                                inactiveClass:
                                                    "text-rose-600/70 hover:bg-rose-500/5 shadow-sm",
                                            },
                                        ].map((status) => (
                                            <button
                                                key={status.id}
                                                type="button"
                                                onClick={() =>
                                                    setValue("premiacaoStatus", status.id as any)
                                                }
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-2 rounded-lg border transition-all gap-1 text-center min-h-[60px]",
                                                    premiacaoStatus === status.id
                                                        ? status.activeClass
                                                        : `border-border bg-card ${status.inactiveClass}`
                                                )}
                                            >
                                                <status.icon size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-tight">
                                                    {status.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-muted-foreground font-medium italic">
                                        * Respeita LGPD mascarando CPF e Nome.
                                    </p>

                                    {enquete && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                window.open(
                                                    `/ganhadores/${formPublicId}`,
                                                    "_blank"
                                                )
                                            }
                                            className="w-full h-8 mt-2 text-[10px] font-bold uppercase tracking-widest gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary"
                                        >
                                            <Eye size={12} />
                                            Visualizar Página Pública
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                        Quantidade de Premiados
                                    </label>
                                    <Input
                                        type="number"
                                        {...register("quantidadePremiados", { valueAsNumber: true })}
                                        className="w-20 text-center font-bold h-8"
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            setValue("quantidadePremiados", val);
                                            // Update prize config array
                                            const currentPrizes = watch("configPremiacao") || [];
                                            if (val > currentPrizes.length) {
                                                const newPrizes = [...currentPrizes];
                                                for (let i = currentPrizes.length; i < val; i++) {
                                                    newPrizes.push({ level: i + 1, description: "" });
                                                }
                                                setValue("configPremiacao", newPrizes);
                                            } else if (val < currentPrizes.length) {
                                                setValue("configPremiacao", currentPrizes.slice(0, val));
                                            }
                                        }}
                                    />
                                </div>

                                <div className="space-y-3">
                                    {configPremiacao.map((prize, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 items-start animate-in slide-in-from-top-1"
                                        >
                                            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black text-xs shrink-0 mt-1">
                                                {index + 1}º
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                                                    Descrição do Prêmio
                                                </label>
                                                <Input
                                                    placeholder={`Ex: Viagem para o Caribe, Carro 0km...`}
                                                    className="text-xs h-10 font-medium"
                                                    value={prize.description}
                                                    onChange={(e) => {
                                                        const config = [...(watch("configPremiacao") || [])];
                                                        config[index].description = e.target.value;
                                                        setValue("configPremiacao", config);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
