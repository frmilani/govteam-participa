"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color?: "indigo" | "emerald" | "amber" | "rose" | "sky";
}

export function KpiCard({ title, value, change, icon, color = "indigo" }: KpiCardProps) {
    const isPositive = change !== undefined && change >= 0;

    const colorStyles = {
        indigo: "border-indigo-500/10 bg-indigo-500/[0.02] text-indigo-500",
        emerald: "border-emerald-500/10 bg-emerald-500/[0.02] text-emerald-500",
        amber: "border-amber-500/10 bg-amber-500/[0.02] text-amber-500",
        rose: "border-rose-500/10 bg-rose-500/[0.02] text-rose-500",
        sky: "border-sky-500/10 bg-sky-500/[0.02] text-sky-500",
    };

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md group",
            colorStyles[color]
        )}>
            {/* Background Icon */}
            <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500 group-hover:scale-110">
                {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 100 })}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block mb-1">
                        {title}
                    </span>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold tracking-tight tabular-nums text-foreground group-hover:text-primary transition-colors">
                            {value}
                        </h3>

                        {change !== undefined && (
                            <div className={cn(
                                "flex items-center gap-0.5 text-[11px] font-bold",
                                isPositive ? "text-emerald-500" : "text-rose-500"
                            )}>
                                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {Math.abs(change)}%
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 w-8 rounded-full bg-current opacity-20" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter opacity-40">Global Insights</span>
                </div>
            </div>
        </div>
    );
}
