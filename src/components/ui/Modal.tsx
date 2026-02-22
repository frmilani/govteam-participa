"use client";

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, HelpCircle, CheckCircle2, Info } from 'lucide-react';
import { Button } from './Button';
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: React.ReactNode;
    type?: 'info' | 'danger' | 'warning' | 'success';
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    isLoading?: boolean;
    maxWidth?: string;
    disableConfirm?: boolean;
    confirmVariant?: 'primary' | 'danger' | 'outline' | 'ghost' | 'secondary';
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    type = 'info',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    isLoading = false,
    maxWidth = 'max-w-xl',
    disableConfirm = false,
    confirmVariant
}: ModalProps) {
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
        }
    }, [isOpen]);

    if (!isMounted || !isOpen) return null;

    const icons = {
        info: <Info className="text-blue-500" size={24} />,
        danger: <AlertCircle className="text-red-500" size={24} />,
        warning: <HelpCircle className="text-amber-500" size={24} />,
        success: <CheckCircle2 className="text-emerald-500" size={24} />,
    };

    const typeColors = {
        info: 'bg-blue-50',
        danger: 'bg-red-50',
        warning: 'bg-amber-50',
        success: 'bg-emerald-50',
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={cn(
                "relative w-full bg-card rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-border",
                maxWidth
            )}>
                <div className="p-8 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className={cn(
                        "flex items-start justify-between gap-4 mb-6 shrink-0",
                        !title && "mb-0 absolute top-4 right-4 z-[110]"
                    )}>
                        {title && (
                            <div className="flex items-start gap-4">
                                <div className={cn("h-10 w-10 rounded-md flex items-center justify-center shrink-0 border border-border/50", typeColors[type])}>
                                    {icons[type]}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">{title}</h3>
                                    {description && (
                                        <p className="text-sm text-muted-foreground font-medium mt-1 leading-relaxed">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className={cn(
                                "p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all",
                                !title && "bg-card/80 backdrop-blur-sm border border-border shadow-sm"
                            )}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2 min-h-0">
                        {children}
                    </div>

                    {/* Footer / Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 shrink-0 border-t border-border mt-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 py-5 border-border text-muted-foreground font-semibold"
                            disabled={isLoading}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            variant={confirmVariant || (type === 'danger' ? 'danger' : 'primary')}
                            onClick={onConfirm}
                            isLoading={isLoading}
                            disabled={disableConfirm}
                            className="flex-1 py-5 font-bold uppercase tracking-wider text-xs"
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
