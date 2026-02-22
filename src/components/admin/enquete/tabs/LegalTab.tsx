import React from "react";
import { useFormContext } from "react-hook-form";
import { EnqueteFormData } from "../EnqueteFormSchema";

export const LegalTab: React.FC = () => {
    const { register } = useFormContext<EnqueteFormData>();

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Regulamento
                </label>
                <p className="text-[10px] text-muted-foreground mb-2">
                    Texto completo do regulamento do prêmio/enquete. Suporta HTML básico ou
                    texto.
                </p>
                <textarea
                    {...register("regulamento")}
                    rows={6}
                    className="w-full rounded-md bg-background border border-input p-3 text-sm font-medium outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                    placeholder="Insira o regulamento aqui..."
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Política de Privacidade
                </label>
                <p className="text-[10px] text-muted-foreground mb-2">
                    Detalhes sobre como os dados serão utilizados.
                </p>
                <textarea
                    {...register("politicaPrivacidade")}
                    rows={6}
                    className="w-full rounded-md bg-background border border-input p-3 text-sm font-medium outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                    placeholder="Insira a política de privacidade aqui..."
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Termos LGPD (Resumo)
                </label>
                <p className="text-[10px] text-muted-foreground mb-2">
                    Texto curto exibido no rodapé ou checkboxes de aceite.
                </p>
                <textarea
                    {...register("termosLgpd")}
                    rows={3}
                    className="w-full rounded-md bg-background border border-input p-3 text-sm font-medium outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                    placeholder="Ao participar, você concorda com..."
                />
            </div>
        </div>
    );
};
