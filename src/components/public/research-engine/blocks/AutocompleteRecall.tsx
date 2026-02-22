"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AutocompleteRecallProps {
    enqueteId: string;
    categoriaId: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export function AutocompleteRecall({ enqueteId, categoriaId, value, onChange, placeholder }: AutocompleteRecallProps) {
    const [inputValue, setInputValue] = useState(value || "");
    const [debouncedValue, setDebouncedValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce the input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue);
            onChange(inputValue); // Salva o input literal "free text" no estado real
        }, 400);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, onChange]);

    // Handle clicking outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch suggestions
    const { data: suggestions = [], isFetching } = useQuery({
        queryKey: ["autocomplete", enqueteId, categoriaId, debouncedValue],
        queryFn: async () => {
            if (!debouncedValue || debouncedValue.length < 2) return [];
            const res = await fetch(`/api/public/enquetes/${enqueteId}/autocomplete/${categoriaId}?q=${encodeURIComponent(debouncedValue)}`);
            if (!res.ok) throw new Error("Erro na busca");
            return res.json();
        },
        enabled: debouncedValue.length >= 2,
    });

    const handleSelectSuggestion = (sug: { id: string; nome: string }) => {
        setInputValue(sug.nome);
        onChange(sug.nome); // Pode salvar o ID depois, mas na regra o fallback pode ser ID ou Nome
        setShowDropdown(false);
    };

    const hasSuggestions = suggestions.length > 0;

    return (
        <div className="relative w-full" ref={containerRef}>
            <input
                type="text"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={placeholder || "Busque a entidade ou pessoa..."}
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowDropdown(true);
                }}
                onFocus={() => {
                    if (inputValue.length >= 2) setShowDropdown(true);
                }}
                autoComplete="off"
            />

            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </span>

            {showDropdown && (debouncedValue.length >= 2) && (
                <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {hasSuggestions ? (
                        <ul className="max-h-60 overflow-y-auto">
                            {suggestions.map((sug: any) => (
                                <li
                                    key={sug.id}
                                    className="px-4 py-2 text-sm text-foreground hover:bg-muted cursor-pointer transition-colors border-b last:border-0"
                                    onClick={() => handleSelectSuggestion(sug)}
                                >
                                    {sug.nome}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                            {isFetching ? "Procurando..." : "Nenhuma sugestão encontrada. Pressione Entrar para usar este texto livremente."}
                        </div>
                    )}
                    {hasSuggestions && (
                        <div className="bg-mutedpx-4 px-4 py-2 border-t text-[10px] text-muted-foreground">
                            Dica: Você pode procurar opções com erros e buscaremos pelo som (ex: "far" achar Farmácia)
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
