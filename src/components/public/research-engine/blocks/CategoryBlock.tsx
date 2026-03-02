"use client";

import React from "react";
import { useResearchStore } from "../useResearchStore";
import { AutocompleteRecall } from "./AutocompleteRecall";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Pergunta {
    id: string;
    texto: string;
    tipo: "rating-5" | "rating-10" | "likert" | "sim-nao" | "texto";
    opcoes?: string[] | null;
    obrigatorio?: boolean;
}

interface Categoria {
    id: string;
    nome: string;
    templateQualidade?: {
        id: string;
        nome: string;
        perguntas: Pergunta[];
    } | null;
}

interface CategoryBlockProps {
    categoria: Categoria;
    modoColeta: string;
    enqueteId: string;
    /** Cor primária herdada do tema da votação */
    primaryColor?: string;
}

// ─── Subcomponentes de Qualidade ───────────────────────────────────────────────

const StarRating: React.FC<{ value: string; onChange: (v: string) => void; max?: number; primaryColor: string }> = ({
    value, onChange, max = 5, primaryColor
}) => {
    const current = parseInt(value || "0");
    const [hovered, setHovered] = React.useState(0);

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: max }, (_, i) => i + 1).map(n => {
                const active = n <= (hovered || current);
                return (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(String(n))}
                        onMouseEnter={() => setHovered(n)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform active:scale-90 hover:scale-110"
                        aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
                    >
                        <Star
                            className="w-7 h-7 transition-all duration-150"
                            style={{
                                fill: active ? primaryColor : 'transparent',
                                color: active ? primaryColor : '#d1d5db',
                            }}
                        />
                    </button>
                );
            })}
            {current > 0 && (
                <span className="ml-2 text-xs font-semibold text-slate-400">{current}/{max}</span>
            )}
        </div>
    );
};

const ScaleRating: React.FC<{ value: string; onChange: (v: string) => void; primaryColor: string }> = ({
    value, onChange, primaryColor
}) => {
    const current = parseInt(value || "0");
    return (
        <div className="space-y-2">
            <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                    const active = n === current;
                    return (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onChange(String(n))}
                            className="w-9 h-9 rounded-lg text-sm font-bold transition-all duration-150 border-2 hover:scale-110 active:scale-95"
                            style={{
                                backgroundColor: active ? primaryColor : 'transparent',
                                borderColor: active ? primaryColor : '#e2e8f0',
                                color: active ? 'white' : '#64748b',
                            }}
                        >
                            {n}
                        </button>
                    );
                })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                <span>Péssimo</span>
                <span>Excelente</span>
            </div>
        </div>
    );
};

const LikertOptions: React.FC<{ opcoes: string[]; value: string; onChange: (v: string) => void; primaryColor: string; perguntaId: string }> = ({
    opcoes, value, onChange, primaryColor, perguntaId
}) => (
    <div className="flex flex-wrap gap-2">
        {opcoes.map(opcao => {
            const active = value === opcao;
            return (
                <button
                    key={opcao}
                    type="button"
                    onClick={() => onChange(opcao)}
                    className="px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-150 hover:scale-105 active:scale-95"
                    style={{
                        backgroundColor: active ? primaryColor : 'transparent',
                        borderColor: active ? primaryColor : '#e2e8f0',
                        color: active ? 'white' : '#64748b',
                    }}
                >
                    {opcao}
                </button>
            );
        })}
    </div>
);

const SimNao: React.FC<{ value: string; onChange: (v: string) => void; primaryColor: string }> = ({
    value, onChange, primaryColor
}) => (
    <div className="flex gap-3">
        {["Sim", "Não"].map(opt => {
            const active = value === opt;
            return (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(opt)}
                    className="px-8 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-150 hover:scale-105 active:scale-95 min-w-[80px]"
                    style={{
                        backgroundColor: active ? primaryColor : 'transparent',
                        borderColor: active ? primaryColor : '#e2e8f0',
                        color: active ? 'white' : '#64748b',
                    }}
                >
                    {opt}
                </button>
            );
        })}
    </div>
);

// ─── Renderer de uma pergunta individual ──────────────────────────────────────
const PerguntaRenderer: React.FC<{
    pergunta: Pergunta;
    categoriaId: string;
    primaryColor: string;
}> = ({ pergunta, categoriaId, primaryColor }) => {
    const { qualityAnswers, setQualityAnswer } = useResearchStore();
    const value = qualityAnswers[categoriaId]?.[pergunta.id] || "";
    const onChange = (v: string) => setQualityAnswer(categoriaId, pergunta.id, v);

    return (
        <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-slate-700 leading-snug">
                {pergunta.texto}
                {pergunta.obrigatorio && <span className="text-red-500 ml-1">*</span>}
            </label>

            {pergunta.tipo === "rating-5" && (
                <StarRating value={value} onChange={onChange} primaryColor={primaryColor} />
            )}

            {pergunta.tipo === "rating-10" && (
                <ScaleRating value={value} onChange={onChange} primaryColor={primaryColor} />
            )}

            {pergunta.tipo === "likert" && pergunta.opcoes && pergunta.opcoes.length > 0 && (
                <LikertOptions
                    opcoes={pergunta.opcoes}
                    value={value}
                    onChange={onChange}
                    primaryColor={primaryColor}
                    perguntaId={pergunta.id}
                />
            )}

            {pergunta.tipo === "sim-nao" && (
                <SimNao value={value} onChange={onChange} primaryColor={primaryColor} />
            )}

            {pergunta.tipo === "texto" && (
                <input
                    type="text"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder="Sua resposta..."
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
            )}
        </div>
    );
};

// ─── CategoryBlock principal ───────────────────────────────────────────────────
export const CategoryBlock: React.FC<CategoryBlockProps> = ({
    categoria, modoColeta, enqueteId, primaryColor = "#4F46E5"
}) => {
    const { answers, setAnswer } = useResearchStore();
    const ans = answers[categoria.id] || "";
    const hasAnswered = ans.length > 0;
    const perguntas = categoria.templateQualidade?.perguntas ?? [];

    return (
        <div className="space-y-5">
            {/* Título da categoria */}
            <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">{categoria.nome}</h3>
                <p className="text-[13px] text-slate-500">
                    {modoColeta === "top-of-mind"
                        ? "Digite o nome da marca mais lembrada"
                        : "Selecione sua preferência"}
                </p>
            </div>

            {/* Campo de voto */}
            <div>
                {modoColeta === "top-of-mind" && (
                    <input
                        type="text"
                        className="w-full h-12 rounded-xl border-2 bg-white px-4 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none"
                        style={{
                            borderColor: ans ? primaryColor : '#e2e8f0',
                            boxShadow: ans ? `0 0 0 3px ${primaryColor}20` : 'none',
                        }}
                        placeholder={`Ex: Mercado Silva, Dr. João...`}
                        value={ans}
                        onChange={e => setAnswer(categoria.id, e.target.value)}
                    />
                )}

                {modoColeta === "recall-assistido" && (
                    <AutocompleteRecall
                        enqueteId={enqueteId}
                        categoriaId={categoria.id}
                        value={ans}
                        onChange={v => setAnswer(categoria.id, v)}
                        placeholder="Busque ou digite o nome..."
                    />
                )}

                {modoColeta === "lista-sugerida" && (
                    <div className="space-y-2">
                        {/* Lista sugerida — placeholder, será implementado via API de categorias */}
                        <p className="text-[12px] text-slate-400 italic">Lista de opções a ser carregada...</p>
                    </div>
                )}
            </div>

            {/* Perguntas de qualidade — aparecem após votar */}
            {hasAnswered && perguntas.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                        <div
                            className="h-1 w-5 rounded-full"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Avalie {categoria.nome}
                        </span>
                    </div>

                    {perguntas.map(p => (
                        <PerguntaRenderer
                            key={p.id}
                            pergunta={p}
                            categoriaId={categoria.id}
                            primaryColor={primaryColor}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
