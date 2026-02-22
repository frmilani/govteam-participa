"use client";

import React from "react";
import { motion } from "framer-motion";

interface FunnelStep {
    label: string;
    value: string | number;
    percentage?: string;
    color: string;
}

interface Funnel3DProps {
    data: FunnelStep[];
    title?: string;
}

export function Funnel3D({ data, title }: Funnel3DProps) {
    // Cores padrão premium se não fornecidas
    const defaultColors = [
        "#6366F1", // Indigo
        "#3B82F6", // Blue
        "#0EA5E9", // Sky
        "#06B6D4", // Cyan
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
            {title && (
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-8">
                    {title}
                </h3>
            )}

            <div className="flex flex-1 items-center justify-between gap-8 h-full">
                {/* SVG Funnel Container */}
                <div className="relative w-1/2 aspect-[3/4] flex items-center justify-center">
                    <svg
                        viewBox="0 0 200 300"
                        className="w-full h-full drop-shadow-2xl"
                        style={{ filter: "drop-shadow(0px 20px 30px rgba(99, 102, 241, 0.2))" }}
                    >
                        <defs>
                            {data.map((step, i) => (
                                <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={step.color || defaultColors[i % 4]} stopOpacity="0.8" />
                                    <stop offset="50%" stopColor={step.color || defaultColors[i % 4]} stopOpacity="1" />
                                    <stop offset="100%" stopColor={step.color || defaultColors[i % 4]} stopOpacity="0.9" />
                                </linearGradient>
                            ))}

                            {/* Glossy Overlay Gradient */}
                            <linearGradient id="glossy" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                                <stop offset="50%" stopColor="white" stopOpacity="0" />
                                <stop offset="100%" stopColor="black" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>

                        {data.map((step, i) => {
                            const totalSteps = data.length;
                            const stepHeight = 280 / totalSteps;
                            const gap = 8;

                            // Calcular larguras para o efeito de cone (frustum)
                            // Começa largo no topo, estreito na base
                            const topWidth = 180 - (i * (140 / totalSteps));
                            const bottomWidth = 180 - ((i + 1) * (140 / totalSteps));
                            const centerX = 100;

                            const startY = i * stepHeight + 10;
                            const endY = (i + 1) * stepHeight - gap + 10;

                            // Coordenadas para o trapézio
                            const x1 = centerX - topWidth / 2;
                            const x2 = centerX + topWidth / 2;
                            const x3 = centerX + bottomWidth / 2;
                            const x4 = centerX - bottomWidth / 2;

                            // Curvatura para o efeito 3D (elipse parcial na base e topo)
                            const curveHeight = 8;

                            return (
                                <motion.g
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.15, duration: 0.5 }}
                                >
                                    {/* Sombra interna para profundidade */}
                                    <path
                                        d={`M ${x1} ${startY} L ${x2} ${startY} L ${x3} ${endY} L ${x4} ${endY} Z`}
                                        fill={`url(#grad-${i})`}
                                    />

                                    {/* Borda lateral iluminada */}
                                    <path
                                        d={`M ${x1} ${startY} L ${x4} ${endY}`}
                                        stroke="white"
                                        strokeOpacity="0.1"
                                        strokeWidth="1"
                                    />

                                    {/* Overlay de brilho */}
                                    <path
                                        d={`M ${x1} ${startY} L ${x2} ${startY} L ${x3} ${endY} L ${x4} ${endY} Z`}
                                        fill="url(#glossy)"
                                    />

                                    {/* Divisória curvinha no topo para efeito 3D */}
                                    <path
                                        d={`M ${x1} ${startY} Q ${centerX} ${startY + curveHeight} ${x2} ${startY}`}
                                        fill="black"
                                        fillOpacity="0.05"
                                    />
                                </motion.g>
                            );
                        })}
                    </svg>
                </div>

                {/* Labels and Values */}
                <div className="flex-1 flex flex-col justify-between py-4">
                    {data.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                            className="flex items-center gap-4 mb-4 last:mb-0"
                        >
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-none">
                                    {step.value}
                                </span>
                                <span className="text-sm font-medium text-slate-400">
                                    {step.label}
                                </span>
                            </div>

                            {step.percentage && (
                                <div className="ml-auto bg-slate-100 dark:bg-slate-800 rounded-md px-2 py-1 flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                        {step.percentage}
                                    </span>
                                    <div className="w-8 h-1 bg-indigo-500/20 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="h-full bg-indigo-500"
                                            style={{ width: step.percentage }}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
