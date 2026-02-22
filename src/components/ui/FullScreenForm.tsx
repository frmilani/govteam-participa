"use client";

import React, { useEffect, useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { cn } from "@/lib/utils";

interface FullScreenFormProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    onSave?: () => void;
    saveLabel?: string;
    isLoading?: boolean;
    footer?: React.ReactNode;
}

export function FullScreenForm({
    isOpen,
    onClose,
    title,
    description,
    children,
    onSave,
    saveLabel = 'Salvar Alterações',
    isLoading = false,
    footer
}: FullScreenFormProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isMounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-background animate-in slide-in-from-bottom-4 duration-500 ease-out flex flex-col">
            {/* Header */}
            <header className="h-24 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-6 lg:px-12 shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-6 w-full max-w-7xl mx-auto">
                    <button
                        onClick={onClose}
                        className="h-11 w-11 rounded-xl flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95 shadow-sm border border-border"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-foreground tracking-tight leading-tight uppercase">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="hidden sm:flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl h-11 px-8 font-bold text-muted-foreground text-[10px] uppercase tracking-widest"
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        {onSave && (
                            <Button
                                onClick={onSave}
                                isLoading={isLoading}
                                className="rounded-xl h-11 px-10 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                            >
                                {saveLabel}
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-muted/20 pb-24">
                <div className="max-w-4xl mx-auto py-12 px-6 lg:px-12">
                    <div className="bg-card rounded-3xl border border-border shadow-2xl p-8 lg:p-12 relative overflow-hidden">
                        {/* Subtle background glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

                        <div className="relative z-10">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile/Sticky Footer */}
            <footer className="sm:hidden p-6 border-t border-border bg-card/80 backdrop-blur-md flex gap-3 shrink-0 fixed bottom-0 left-0 right-0 z-20">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 rounded-xl h-12 font-bold text-[10px] uppercase tracking-widest"
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                {onSave && (
                    <Button
                        onClick={onSave}
                        isLoading={isLoading}
                        className="flex-[2] rounded-xl h-12 font-bold uppercase tracking-widest text-[10px]"
                    >
                        {saveLabel}
                    </Button>
                )}
            </footer>

            {footer && (
                <footer className="hidden sm:block p-6 border-t border-border bg-card/50 shrink-0 mt-auto">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-end">
                        {footer}
                    </div>
                </footer>
            )}
        </div>
    );
}
