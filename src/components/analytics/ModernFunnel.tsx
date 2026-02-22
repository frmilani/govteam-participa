"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface FunnelStage {
    id: string;
    label: string;
    value: string | number;
    color: string;
    darkColor?: string; // Optional to handle if missing
    percentage?: string;
    calculatedPercentage?: string;
}

interface ModernFunnelProps {
    data: FunnelStage[];
    title?: string;
}

// Utility to parse human-readable values to numbers
const parseValue = (val: string | number): number => {
    if (typeof val === 'number') return val;
    let clean = val.toUpperCase().replace(',', '.');
    let multiplier = 1;
    if (clean.includes('K')) {
        multiplier = 1000;
        clean = clean.replace('K', '');
    } else if (clean.includes('M')) {
        multiplier = 1000000;
        clean = clean.replace('M', '');
    }
    return parseFloat(clean) * multiplier;
};

const AnimatedNumber = ({ value, duration = 1.2 }: { value: string | number; duration?: number }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const stringVal = String(value);
    const isK = stringVal.toUpperCase().includes('K');
    const isM = stringVal.toUpperCase().includes('M');
    const numericValue = parseValue(value);

    useEffect(() => {
        let start = 0;
        const end = numericValue;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const current = progress * end;

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [numericValue, duration]);

    const formatted = useMemo(() => {
        if (isM) return (displayValue / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'M';
        if (isK) return (displayValue / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'K';
        return Math.floor(displayValue).toLocaleString('pt-BR');
    }, [displayValue, isK, isM]);

    return <>{formatted}</>;
};

export const ModernFunnel: React.FC<ModernFunnelProps> = ({ data, title }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Constants for layout
    const width = 850;
    const centerX = 300;
    const ribbonHeight = 85;
    const gap = 18;
    const spineWidth = 52;
    const initialWidth = 340;

    // Calculate heights based on data length
    const totalStages = data.length;
    // Increase SVG height slightly to accommodate shadows or large labels
    const svgHeight = totalStages * (ribbonHeight + gap) + 120;
    // Narrowing factor adjusts based on how many stages we have to prevent disappearing
    const narrowingFactor = 280 / (totalStages + 1);

    const processedData = useMemo(() => {
        return data.map((stage, i) => {
            let perc = stage.percentage;
            if (!perc && i > 0) {
                const current = parseValue(stage.value);
                const prev = parseValue(data[i - 1].value);
                if (prev > 0) {
                    perc = ((current / prev) * 100).toFixed(2) + '%';
                }
            }
            return {
                ...stage,
                calculatedPercentage: perc,
                // Fallback for darkColor if not provided in the data source
                darkColor: stage.darkColor || stage.color
            };
        });
    }, [data]);

    const stagesCoords = useMemo(() => {
        return processedData.map((_, index) => {
            const y = index * (ribbonHeight + gap) + 40;
            const topWidth = initialWidth - (index * narrowingFactor);
            const bottomWidth = initialWidth - (index * narrowingFactor) - 20;
            return {
                y,
                centerY: y + ribbonHeight / 2,
                xLT: centerX - topWidth / 2,
                xRT: centerX + topWidth / 2,
                xLB: centerX - bottomWidth / 2,
                xRB: centerX + bottomWidth / 2,
            };
        });
    }, [processedData, narrowingFactor]);

    return (
        <div className="bg-card rounded-lg p-8 border border-border shadow-sm flex flex-col h-full font-sans select-none items-center justify-center">

            {title && (
                <div className="w-full max-w-4xl mb-8 self-center px-4">
                    <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Dashboard de Inteligência e Conversão
                    </p>
                </div>
            )}

            <div className="relative w-full max-w-4xl">
                <svg viewBox={`0 0 ${width} ${svgHeight}`} className="w-full h-auto overflow-visible">
                    <defs>
                        {processedData.map((stage) => (
                            <linearGradient key={`grad-${stage.id}`} id={`grad-${stage.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={stage.color} stopOpacity="1" />
                                <stop offset="100%" stopColor={stage.color} stopOpacity="0.85" />
                            </linearGradient>
                        ))}
                    </defs>

                    {/* Spine */}
                    <motion.path
                        initial={{ scaleY: 0, originY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        d={`M ${centerX - spineWidth / 2} 10 H ${centerX + spineWidth / 2} V ${svgHeight - 80} L ${centerX} ${svgHeight - 30} L ${centerX - spineWidth / 2} ${svgHeight - 80} Z`}
                        fill="currentColor"
                        className="text-foreground/20"
                    />

                    {/* Connectors (Behind ribbons) */}
                    {stagesCoords.map((current, index) => {
                        if (index === stagesCoords.length - 1) return null;
                        const next = stagesCoords[index + 1];
                        return (
                            <motion.path
                                key={`back-link-${processedData[index].id}`}
                                initial={{ opacity: 0, pathLength: 0 }}
                                animate={{ opacity: 1, pathLength: 1 }}
                                transition={{ duration: 0.7, delay: index * 0.1 }}
                                d={`M ${current.xRT} ${current.y} L ${current.xRB} ${current.y + ribbonHeight} L ${next.xLB} ${next.y + ribbonHeight} L ${next.xLT} ${next.y} Z`}
                                fill={processedData[index].darkColor}
                                fillOpacity={0.8}
                            />
                        );
                    })}

                    {/* Stage Panels */}
                    {stagesCoords.map((coords, index) => {
                        const stage = processedData[index];
                        const { y, centerY, xLT, xRT, xLB, xRB } = coords;
                        const isHovered = hoveredIndex === index;

                        return (
                            <motion.g
                                key={stage.id}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="cursor-pointer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                {/* Glow Effect on Hover - REMOVED for clean look */}


                                {/* Main Ribbon Body */}
                                <motion.path
                                    animate={{
                                        scale: isHovered ? 1.04 : 1,
                                        filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    // Exact copy of reference 'd' attribute
                                    d={`M ${xLT} ${y} Q ${centerX} ${y - 8} ${xRT} ${y} L ${xRB} ${y + ribbonHeight} Q ${centerX} ${y + ribbonHeight + 8} ${xLB} ${y + ribbonHeight} Z`}
                                    fill={`url(#grad-${stage.id})`}
                                    style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
                                />

                                {/* Value Text - Centered on ribbon with robust scaling */}
                                <motion.g
                                    initial={{ x: centerX, y: centerY }}
                                    animate={{
                                        x: centerX,
                                        y: centerY,
                                        scale: isHovered ? 1.25 : 1
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className="pointer-events-none"
                                >
                                    <text
                                        x={0}
                                        y={0}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="white"
                                        className="text-[40px] font-bold tracking-tight"
                                    >
                                        <AnimatedNumber value={stage.value} />
                                    </text>
                                </motion.g>

                                {/* Label & Percentage Group - Right side */}
                                <motion.g
                                    animate={{ x: isHovered ? 15 : 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    {/* Circle Anchor */}
                                    <motion.circle
                                        cx={xRT + 40}
                                        cy={centerY}
                                        r={isHovered ? 7 : 5}
                                        fill={isHovered ? stage.color : "#FFFFFF"} // White center normally
                                        stroke={stage.color} // Always colored border like reference image seems to imply or subtle
                                        className={!isHovered ? "stroke-slate-300 dark:stroke-slate-600" : ""}
                                        style={{ stroke: isHovered ? stage.color : undefined }}
                                        strokeWidth={isHovered ? 4 : 2.5}
                                    />

                                    {/* Connecting Line */}
                                    <motion.line
                                        x1={xRT + 48}
                                        y1={centerY}
                                        x2={xRT + 95}
                                        y2={centerY}
                                        className="stroke-slate-300 dark:stroke-slate-600"
                                        style={{ stroke: isHovered ? stage.color : undefined }}
                                        strokeWidth="2.5"
                                    />

                                    {/* Text Block */}
                                    <foreignObject x={xRT + 110} y={centerY - 35} width="300" height="70">
                                        <motion.div className="flex flex-col justify-center h-full">
                                            <h3 className={cn(
                                                "text-2xl font-black tracking-tight transition-colors duration-200",
                                                isHovered ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {stage.label}
                                            </h3>
                                            {stage.calculatedPercentage && (
                                                <motion.div
                                                    animate={{
                                                        opacity: isHovered ? 1 : 0.6,
                                                        x: isHovered ? 4 : 0
                                                    }}
                                                    className={cn(
                                                        "text-[10px] font-bold mt-1 tracking-[0.2em] uppercase flex items-center gap-2",
                                                        isHovered ? "text-primary" : "text-muted-foreground/50"
                                                    )}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        {isHovered && (
                                                            <motion.span
                                                                initial={{ width: 0, opacity: 0 }}
                                                                animate={{ width: 'auto', opacity: 1 }}
                                                                exit={{ width: 0, opacity: 0 }}
                                                                className="overflow-hidden whitespace-nowrap"
                                                            >
                                                                Conversão
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                    <span>{stage.calculatedPercentage}</span>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    </foreignObject>
                                </motion.g>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};
