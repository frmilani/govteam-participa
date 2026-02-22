"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useResearchStore, ResearchProvider } from "./useResearchStore";
import { CategoryBlock } from "./blocks/CategoryBlock";
import { cn } from "@/lib/utils";

interface DynamicResearchEngineProps {
    enqueteId: string;
}

const ResearchEngineContent: React.FC<DynamicResearchEngineProps> = ({ enqueteId }) => {
    const { currentStep, nextStep, prevStep } = useResearchStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: config, isLoading, error } = useQuery({
        queryKey: ["research-config", enqueteId],
        queryFn: async () => {
            const res = await fetch(`/api/public/enquetes/${enqueteId}/research-config`);
            if (!res.ok) throw new Error("Failed to load config");
            return res.json();
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-20 bg-muted rounded w-3/4"></div>
                <div className="h-20 bg-muted rounded w-3/4"></div>
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="p-8 border rounded-xl bg-destructive/10 text-destructive text-center">
                Ocorreu um erro ao carregar as configurações desta pesquisa.
            </div>
        );
    }

    const { titulo, tipoPesquisa, modoColeta, randomizarOpcoes, modoDistribuicao, categorias = [] } = config;

    const isWizard = modoDistribuicao === "grupo";
    const numSteps = isWizard ? categorias.length : 1;
    const isLastStep = isWizard ? currentStep === categorias.length - 1 : true;

    const handleFinish = async () => {
        setIsSubmitting(true);
        // TODO: POST to real API in E4.3
        setTimeout(() => {
            setIsSubmitting(false);
            alert("Enviado com sucesso! (Mock final)");
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <header className="text-center space-y-2">
                <h1 className="text-2xl font-black md:text-3xl text-foreground tracking-tight">{titulo}</h1>
                <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold">{tipoPesquisa}</p>
            </header>

            {isWizard && (
                <div className="flex justify-center items-center py-4">
                    <span className="text-xs font-medium text-foreground bg-primary/10 px-3 py-1 rounded-full text-primary tracking-wide">
                        PASSO {currentStep + 1} DE {categorias.length}
                    </span>
                </div>
            )}

            <main className="space-y-6">
                {isWizard ? (
                    categorias.length > 0 && categorias[currentStep] ? (
                        <CategoryBlock categoria={categorias[currentStep]} modoColeta={modoColeta} enqueteId={enqueteId} />
                    ) : (
                        <div className="text-center text-muted-foreground p-8">Nenhuma categoria configurada.</div>
                    )
                ) : (
                    categorias.map((cat: any) => (
                        <CategoryBlock key={cat.id} categoria={cat} modoColeta={modoColeta} enqueteId={enqueteId} />
                    ))
                )}
            </main>

            <footer className={cn(
                "flex flex-col sm:flex-row items-center gap-4 mt-8 pt-8 border-t border-border",
                isWizard && currentStep > 0 ? "justify-between" : "justify-end"
            )}>
                {isWizard && currentStep > 0 && (
                    <button
                        onClick={prevStep}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-foreground hover:bg-muted font-medium transition-colors w-full sm:w-auto justify-center"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Voltar
                    </button>
                )}

                {isLastStep ? (
                    <button
                        onClick={handleFinish}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-transform active:scale-95 shadow-md w-full sm:w-auto justify-center"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        Finalizar Votação
                    </button>
                ) : (
                    <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold transition-transform active:scale-95 shadow-sm w-full sm:w-auto justify-center"
                    >
                        Próximo Passo
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </footer>
        </div>
    );
};

export const DynamicResearchEngine: React.FC<DynamicResearchEngineProps> = ({ enqueteId }) => {
    return (
        <ResearchProvider>
            <ResearchEngineContent enqueteId={enqueteId} />
        </ResearchProvider>
    );
};
