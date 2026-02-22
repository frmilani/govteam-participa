"use client";

import React from "react";
import { useResearchStore } from "../useResearchStore";
import { AutocompleteRecall } from "./AutocompleteRecall";

interface Categoria {
    id: string;
    nome: string;
    templateQualidade?: {
        id: string;
        nome: string;
        perguntas: any[];
    } | null;
}

interface CategoryBlockProps {
    categoria: Categoria;
    modoColeta: string;
    enqueteId: string;
}

export const CategoryBlock: React.FC<CategoryBlockProps> = ({ categoria, modoColeta, enqueteId }) => {
    const { answers, setAnswer, qualityAnswers, setQualityAnswer } = useResearchStore();

    const handleVote = (value: string) => {
        setAnswer(categoria.id, value);
    };

    const handleQualityAnswer = (perguntaId: string, value: string) => {
        setQualityAnswer(categoria.id, perguntaId, value);
    };

    const hasAnswered = !!answers[categoria.id];

    return (
        <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
                <h3 className="text-lg font-bold text-foreground">{categoria.nome}</h3>
                <p className="text-sm text-muted-foreground mt-1">Selecione sua preferência ou resposta.</p>
            </div>

            <div className="pt-2">
                {modoColeta === "top-of-mind" && (
                    <input
                        type="text"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Digite o nome (Top of Mind Puro)..."
                        value={answers[categoria.id] || ""}
                        onChange={(e) => handleVote(e.target.value)}
                    />
                )}

                {modoColeta === "recall-assistido" && (
                    <AutocompleteRecall
                        enqueteId={enqueteId}
                        categoriaId={categoria.id}
                        value={answers[categoria.id] || ""}
                        onChange={(val) => handleVote(val)}
                        placeholder="Busque ou digite o nome da empresa/pessoa..."
                    />
                )}

                {modoColeta === "lista-sugerida" && (
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                                type="radio"
                                name={`cat-${categoria.id}`}
                                value="Opcao A"
                                checked={answers[categoria.id] === "Opcao A"}
                                onChange={(e) => handleVote(e.target.value)}
                                className="w-4 h-4 text-primary"
                            />
                            <span className="text-sm">Opção A (Mock Lista Sugerida)</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                                type="radio"
                                name={`cat-${categoria.id}`}
                                value="Opcao B"
                                checked={answers[categoria.id] === "Opcao B"}
                                onChange={(e) => handleVote(e.target.value)}
                                className="w-4 h-4 text-primary"
                            />
                            <span className="text-sm">Opção B (Mock Lista Sugerida)</span>
                        </label>
                    </div>
                )}
            </div>

            {hasAnswered && categoria.templateQualidade && categoria.templateQualidade.perguntas && categoria.templateQualidade.perguntas.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span className="bg-primary/10 text-primary p-1 rounded">📋</span>
                        Perguntas de Qualidade
                    </h4>
                    <div className="space-y-4">
                        {categoria.templateQualidade.perguntas.map((p: any) => (
                            <div key={p.id} className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">{p.texto}</label>
                                {/* Simplified mock quality inputs based on p.tipo but here just assume text for simplicity */}
                                <input
                                    type="text"
                                    className="w-full flex h-9 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Sua resposta de qualidade..."
                                    value={qualityAnswers[categoria.id]?.[p.id] || ""}
                                    onChange={(e) => handleQualityAnswer(p.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
