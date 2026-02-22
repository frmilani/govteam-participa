'use client';

import { Activity, Bell, FileText, UserPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActivityItem {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    message: string;
    timestamp: string;
    category: 'lead' | 'system' | 'enquete' | 'campaign';
}

interface ActivityFeedProps {
    activities: ActivityItem[];
}

const iconMap = {
    lead: UserPlus,
    system: Zap,
    enquete: FileText,
    campaign: Bell,
};

const colorMap = {
    success: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    error: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    Atividade Recente
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    Hoje
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {activities.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-8">
                        <Zap className="w-8 h-8 mb-2 opacity-20" />
                        <p>Nenhuma atividade recente registrada.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {activities.map((activity, i) => {
                            const Icon = iconMap[activity.category] || Zap;
                            return (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors group"
                                >
                                    <div className={cn(
                                        "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border",
                                        colorMap[activity.type]
                                    )}>
                                        <Icon size={14} />
                                    </div>
                                    <div className="min-w-0 flex-1 pt-0.5">
                                        <p className="text-sm font-medium text-foreground leading-none group-hover:text-primary transition-colors">
                                            {activity.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wide">
                                            {activity.category} • {activity.timestamp}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-border/50 bg-muted/20">
                <Button variant="ghost" size="sm" className="w-full h-8 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground">
                    Ver Log Completo
                </Button>
            </div>
        </div>
    );
}
