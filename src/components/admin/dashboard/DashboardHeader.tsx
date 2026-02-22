'use client';

import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
    userName: string; // First name
    role: string;
    organizationName: string;
}

export function DashboardHeader({ userName, role, organizationName }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
            >
                {/* Badges */}
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Operacional
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
                        {role || "Admin"}
                    </span>
                </div>

                {/* Welcome Text */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Olá, <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">{userName}</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm max-w-lg leading-relaxed">
                        Bem-vindo ao Command Center do <span className="font-semibold text-foreground">{organizationName}</span>.
                        Aqui está o resumo da sua operação hoje.
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Link href="/admin/enquetes/nova">
                    <Button
                        size="lg"
                        className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4 stroke-[3]" />
                        Nova Enquete
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
}
