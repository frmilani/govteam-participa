"use client";

import React, { useState } from "react";
import { Sparkles, ChevronRight, TrendingUp, Info, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Insight {
    text: string;
    type: "positive" | "negative" | "info";
}

interface AiInsightsCardProps {
    insights: Insight[];
}

export function AiInsightsCard({ insights }: AiInsightsCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextInsight = () => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
    };

    const typeConfig = {
        positive: { icon: <TrendingUp size={14} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        negative: { icon: <AlertCircle size={14} />, color: "text-rose-400", bg: "bg-rose-500/10" },
        info: { icon: <Info size={14} />, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    };

    if (!insights || insights.length === 0) return null;
    const current = insights[currentIndex];
    if (!current) return null;

    return (
        <div className="relative overflow-hidden bg-card rounded-xl p-8 shadow-sm border border-border flex flex-col group h-full transition-all duration-300 hover:border-primary/20">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Sparkles className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground tracking-tight leading-none">Insights Estratégicos</h4>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 block">Powered by Sentinela AI</span>
                        </div>
                    </div>

                    <div className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border tabular-nums">
                        {currentIndex + 1} de {insights.length}
                    </div>
                </div>

                <div className="flex-1 relative min-h-[100px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="space-y-4"
                        >
                            <div className={cn(
                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                typeConfig[current.type].bg,
                                typeConfig[current.type].color
                            )}>
                                {typeConfig[current.type].icon}
                                {current.type === 'positive' ? 'Crescimento' : current.type === 'negative' ? 'Atenção' : 'Informativo'}
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed font-medium italic">
                                "{current.text}"
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {insights.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-300",
                                    i === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                                )}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextInsight}
                        className="flex items-center gap-2 text-[10px] font-bold text-primary hover:text-primary/80 transition-all uppercase tracking-widest group/btn"
                    >
                        Próximo Insight
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
