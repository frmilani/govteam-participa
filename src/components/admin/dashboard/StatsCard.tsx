'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        positive: boolean;
    };
    data?: { value: number }[];
    color?: string; // Hex color for chart and accent
}

export function StatsCard({
    title,
    value,
    icon,
    trend,
    data = [],
    color = "#8b5cf6"
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all group"
        >
            {/* Background Gradient & Pattern */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }}
            />

            <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                    <div
                        className="p-2 rounded-lg bg-background/50 border border-border/50 text-foreground shadow-sm group-hover:bg-background group-hover:border-border transition-colors"
                        style={{ color: color }}
                    >
                        {icon}
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>

                    {trend && (
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span
                                className={cn(
                                    "flex items-center gap-1 px-1.5 py-0.5 rounded-md",
                                    trend.positive
                                        ? "text-emerald-500 bg-emerald-500/10"
                                        : "text-rose-500 bg-rose-500/10"
                                )}
                            >
                                {trend.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(trend.value)}%
                            </span>
                            <span className="text-muted-foreground">{trend.label}</span>
                        </div>
                    )}
                </div>

                {/* Chart */}
                {data.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 opacity-50 group-hover:opacity-80 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip cursor={false} content={() => null} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={color}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#color-${title})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
