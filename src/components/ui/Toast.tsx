"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto animate-in slide-in-from-right-10 fade-in duration-300"
                    >
                        <div className={`
                            min-w-[320px] max-w-md bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 p-4 flex items-start gap-4
                            ${toast.type === 'success' ? 'border-l-4 border-l-emerald-500' : ''}
                            ${toast.type === 'error' ? 'border-l-4 border-l-red-500' : ''}
                            ${toast.type === 'info' ? 'border-l-4 border-l-blue-500' : ''}
                        `}>
                            <div className="shrink-0 mt-0.5">
                                {toast.type === 'success' && <CheckCircle2 className="text-emerald-500" size={20} />}
                                {toast.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
                                {toast.type === 'info' && <Info className="text-blue-500" size={20} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-foreground leading-tight">
                                    {toast.type === 'success' ? 'Sucesso' : toast.type === 'error' ? 'Erro' : 'Aviso'}
                                </p>
                                <p className="text-sm text-muted-foreground font-medium mt-1">
                                    {toast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
