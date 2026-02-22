'use client';

import { MessageSquare, Send, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignWidgetProps {
    activeCampaigns: number;
    totalSent: number;
    deliveryRate: number;
    responseRate: number;
}

export function CampaignWidget({
    activeCampaigns,
    totalSent,
    deliveryRate,
    responseRate
}: CampaignWidgetProps) {
    return (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Send size={18} className="text-primary" />
                        Disparos WhatsApp
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        {activeCampaigns} campanhas em andamento
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", activeCampaigns > 0 ? "bg-emerald-400" : "bg-gray-400")}></span>
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", activeCampaigns > 0 ? "bg-emerald-500" : "bg-gray-500")}></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {activeCampaigns > 0 ? "Enviando" : "Parado"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-auto">
                <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">{totalSent.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enviados</p>
                </div>

                <div className="space-y-1 relative pl-4 border-l border-border/50">
                    <p className="text-2xl font-bold text-emerald-500">{deliveryRate}%</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <CheckCheck size={12} /> Entregues
                    </p>
                </div>

                <div className="space-y-1 relative pl-4 border-l border-border/50">
                    <p className="text-2xl font-bold text-blue-500">{responseRate}%</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare size={12} /> Respostas
                    </p>
                </div>
            </div>

            {/* Progress Bar background */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${Math.min(deliveryRate, 100)}%` }}
                />
            </div>
        </div>
    );
}
