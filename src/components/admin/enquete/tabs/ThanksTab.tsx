import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { EnqueteFormData } from "../EnqueteFormSchema";

export const ThanksTab: React.FC = () => {
    const { register } = useFormContext<EnqueteFormData>();

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Título da Página <span className="text-red-500">*</span>
                </label>
                <Input
                    {...register("paginaAgradecimento.titulo")}
                    placeholder="Obrigado por votar!"
                    className="font-bold"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Mensagem <span className="text-red-500">*</span>
                </label>
                <textarea
                    {...register("paginaAgradecimento.mensagem")}
                    rows={4}
                    className="w-full rounded-md bg-background border border-input p-3 text-sm font-medium outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all"
                />
            </div>
            <div className="flex items-center gap-3 pt-2">
                <input
                    type="checkbox"
                    {...register("paginaAgradecimento.showShareButtons")}
                    id="showShareButtons"
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label
                    htmlFor="showShareButtons"
                    className="text-sm font-bold text-foreground cursor-pointer"
                >
                    Exibir botões sociais
                </label>
            </div>
        </div>
    );
};
