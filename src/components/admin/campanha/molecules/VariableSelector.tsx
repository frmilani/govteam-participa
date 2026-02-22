import React, { useState } from 'react';
import { Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VariableSelectorProps {
    onSelect: (variable: string) => void;
}

export function VariableSelector({ onSelect }: VariableSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const variables = [
        { name: 'Nome do Lead', value: '{{nome}}' },
        { name: 'Link Único (Curto)', value: '{{link}}' },
        { name: 'Primeiro Nome', value: '{{primeiro_nome}}' },
        { name: 'Data de Hoje', value: '{{data}}' },
    ];

    return (
        <div className="relative">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-2 h-8 hover:bg-background hover:text-primary transition-colors text-[10px] font-black uppercase tracking-wider ${isOpen ? 'text-primary bg-background' : ''}`}
            >
                <Plus size={12} />
                Variáveis
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 p-1 bg-card border border-border rounded-xl shadow-2xl z-[70] w-48">
                        <div className="flex flex-col">
                            {variables.map((v, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        onSelect(v.value);
                                        setIsOpen(false);
                                    }}
                                    className="flex flex-col items-start px-3 py-2 hover:bg-muted rounded-lg transition-colors group"
                                >
                                    <span className="text-[10px] font-black text-foreground uppercase tracking-wider">{v.name}</span>
                                    <span className="text-[9px] font-bold text-primary opacity-60 group-hover:opacity-100">{v.value}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
