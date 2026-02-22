"use client";

import React, { useState, useMemo } from 'react';
import {
    Search,
    ChevronRight,
    ChevronLeft,
    ChevronsRight,
    ChevronsLeft,
    CheckCircle2,
    Circle,
    X,
    Plus
} from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface TransferItem {
    id: string;
    label: string;
    description?: string;
}

interface TransferListProps {
    items: TransferItem[];
    value: string[];
    onChange: (value: string[]) => void;
    leftTitle?: string;
    rightTitle?: string;
    searchPlaceholder?: string;
}

export function TransferList({
    items,
    value,
    onChange,
    leftTitle = "Disponíveis",
    rightTitle = "Selecionados",
    searchPlaceholder = "Buscar itens..."
}: TransferListProps) {
    const [leftSearch, setLeftSearch] = useState("");
    const [rightSearch, setRightSearch] = useState("");

    const selectedItems = useMemo(() =>
        items.filter(item => value.includes(item.id)),
        [items, value]
    );

    const availableItems = useMemo(() =>
        items.filter(item => !value.includes(item.id)),
        [items, value]
    );

    const filteredAvailable = availableItems.filter(item =>
        item.label.toLowerCase().includes(leftSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(leftSearch.toLowerCase())
    );

    const filteredSelected = selectedItems.filter(item =>
        item.label.toLowerCase().includes(rightSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(rightSearch.toLowerCase())
    );

    const handleAdd = (id: string) => {
        onChange([...value, id]);
    };

    const handleRemove = (id: string) => {
        onChange(value.filter(v => v !== id));
    };

    const handleAddAll = () => {
        const newIds = filteredAvailable.map(i => i.id);
        onChange([...value, ...newIds]);
    };

    const handleRemoveAll = () => {
        const idsToRemove = filteredSelected.map(i => i.id);
        onChange(value.filter(v => !idsToRemove.includes(v)));
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center h-[600px] md:h-[500px] w-full">
            {/* Left List: Available */}
            <div className="flex-1 min-w-0 flex flex-col h-full bg-muted/20 border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="p-3 bg-card border-b border-border space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{leftTitle}</h4>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                            {filteredAvailable.length} de {availableItems.length}
                        </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={leftSearch}
                            onChange={(e) => setLeftSearch(e.target.value)}
                            className="w-full pl-9 pr-4 h-9 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-ring focus:border-primary transition-all font-medium outline-none placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {filteredAvailable.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleAdd(item.id)}
                            className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-background hover:shadow-sm hover:border-border border border-transparent transition-all group text-left"
                        >
                            <div className="h-4 w-4 rounded-full border border-muted-foreground/30 group-hover:border-primary transition-colors shrink-0 flex items-center justify-center">
                                <Plus size={10} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                                {item.description && (
                                    <p className="text-[10px] text-muted-foreground font-medium truncate">{item.description}</p>
                                )}
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </button>
                    ))}
                    {filteredAvailable.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground/40">
                            <Circle className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Nenhum item disponível</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Center Actions */}
            <div className="flex flex-row md:flex-col gap-2 justify-center px-2 shrink-0">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddAll}
                    disabled={filteredAvailable.length === 0}
                    title="Incluir todos visíveis"
                    className="h-8 w-8 rounded-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                    <ChevronsRight size={16} className="rotate-90 md:rotate-0" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveAll}
                    disabled={filteredSelected.length === 0}
                    title="Remover todos visíveis"
                    className="h-8 w-8 rounded-md hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                >
                    <ChevronsLeft size={16} className="rotate-90 md:rotate-0" />
                </Button>
            </div>

            {/* Right List: Selected */}
            <div className="flex-1 min-w-0 flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="p-3 bg-muted/10 border-b border-border space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">{rightTitle}</h4>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                            {filteredSelected.length} de {selectedItems.length}
                        </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={rightSearch}
                            onChange={(e) => setRightSearch(e.target.value)}
                            className="w-full pl-9 pr-4 h-9 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-ring focus:border-primary transition-all font-medium outline-none placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {filteredSelected.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="w-full flex items-center gap-3 p-2.5 rounded-md bg-primary/5 border border-primary/10 hover:bg-destructive/5 hover:border-destructive/20 group transition-all text-left"
                        >
                            <CheckCircle2 className="h-4 w-4 text-primary group-hover:hidden" />
                            <div className="h-4 w-4 hidden group-hover:flex shrink-0 items-center justify-center">
                                <X className="h-4 w-4 text-destructive" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground group-hover:text-destructive transition-colors truncate">{item.label}</p>
                                {item.description && (
                                    <p className="text-[10px] text-muted-foreground font-medium truncate">{item.description}</p>
                                )}
                            </div>
                        </button>
                    ))}
                    {filteredSelected.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground/40">
                            <Circle className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Nenhum selecionado</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
