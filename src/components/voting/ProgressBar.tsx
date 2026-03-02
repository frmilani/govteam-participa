'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useVoteTemplateOptional } from './VoteTemplateContext';
import { TemplateConfig } from '@/lib/vote-templates';

// Votable field types from Hub's ElementType
// Includes research engine injected types: text (top-of-mind), rating (rating-5), nps (rating-10)
const VOTABLE_TYPES = [
    'text',
    'select',
    'radio-group',
    'checkbox-group',
    'top-of-mind',
    'multiselect',
    'radio-blocks',
    'radio-tabs',
    'checkbox-blocks',
    'checkbox-tabs',
    'rating',
    'nps',
];

interface ProgressBarProps {
    elements: any[];
    formData: any;
    minCompleteness?: number;
    primaryColor?: string;
    template?: TemplateConfig;
    variant?: 'sticky' | 'card';
}

// Recursively collect votable fields from nested elements
const collectVotableFields = (elements: any[]): any[] => {
    const result: any[] = [];
    for (const el of elements) {
        if (VOTABLE_TYPES.includes(el.type)) {
            result.push(el);
        }
        if (el.children && Array.isArray(el.children)) {
            result.push(...collectVotableFields(el.children));
        }
    }
    return result;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
    elements,
    formData,
    minCompleteness = 70,
    primaryColor: propPrimaryColor,
    template: propTemplate,
    variant = 'sticky'
}) => {
    const contextValue = useVoteTemplateOptional();
    const primaryColor = propPrimaryColor || contextValue.primaryColor;
    const template = propTemplate || contextValue.template;

    const isPremium = template.mood === 'elegant';
    const isModern = template.mood === 'energetic';
    const isBold = template.mood === 'bold';
    const isNeon = template.mood === 'neon';

    const isNatural = template.mood === 'natural';
    const isAcid = template.mood === 'tech-acid';
    const isSwiss = template.mood === 'swiss';

    const votingFields = collectVotableFields(elements);
    const total = votingFields.length;

    if (total === 0) return null;

    const answered = votingFields.filter(el => {
        const value = formData[el.id] || formData[el.name];
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
        if (typeof value === 'string') return value.length > 0;
        return value !== undefined && value !== null;
    }).length;

    const percentage = Math.round((answered / total) * 100);
    const isComplete = percentage >= minCompleteness;

    // CARD VARIANT STYLES
    if (variant === 'card') {
        return (
            <motion.div
                className={`w-full max-w-4xl mx-auto mb-4 p-4 md:p-6 lg:p-7 
                    ${isBold ? 'rounded-xl border-4 border-black shadow-[8px_8px_0_0_#000] bg-white' : ''}
                    ${isNeon ? 'rounded-none border border-cyan-500/50 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)] bg-zinc-900/95 backdrop-blur-md' : ''}
                    ${isNatural ? 'rounded-[3rem] border border-white/40 shadow-xl bg-[#f2efe9]/80 backdrop-blur-sm' : ''}
                    ${isAcid ? 'rounded-none border-2 border-black bg-[#F2F2F2] shadow-[8px_8px_0_0_rgba(204,255,0,0.5)]' : ''}
                    ${isSwiss ? 'rounded-[1.5rem] border-2 border-black bg-white shadow-[8px_8px_0_0_#000]' : ''}
                    ${!isBold && !isNeon && !isNatural && !isAcid && !isSwiss ? `rounded-[2rem] shadow-xl ${isPremium ? 'bg-[#f8f5f0] border border-[#d4c5b0]/30' : 'bg-white border border-slate-100'}` : ''}
                `}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isPremium ? 'text-[#998a75]' : isNeon ? 'text-cyan-600' : isNatural ? 'text-[#8fa394]' : isAcid ? 'text-black' : isSwiss ? 'text-black' : 'text-slate-400'}`}>
                            Progresso da Votação
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                            <motion.span
                                className={`text-3xl font-black ${isComplete
                                    ? 'text-emerald-500'
                                    : isPremium ? 'text-[#2c2520]' : isNeon ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : isNatural ? 'text-[#4A5D4F]' : isAcid ? 'text-black drop-shadow-[2px_2px_0_#CCFF00]' : isSwiss ? 'text-black tracking-tighter' : 'text-slate-900'
                                    }`}
                                key={percentage}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                {percentage}%
                            </motion.span>
                            {isComplete ? (
                                <motion.span
                                    className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider 
                                        ${isBold ? 'bg-emerald-400 text-black border-2 border-black shadow-[2px_2px_0_0_#000]' : ''}
                                        ${isNeon ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/50 rounded-none' : ''}
                                        ${isNatural ? 'bg-[#acc196]/30 text-[#4A5D4F]' : ''}
                                        ${isAcid ? 'bg-[#CCFF00] text-black border border-black rounded-none shadow-[2px_2px_0_0_#000]' : ''}
                                        ${isSwiss ? 'bg-black text-white border-2 border-black rounded-md' : ''}
                                        ${!isBold && !isNeon && !isNatural && !isAcid && !isSwiss ? 'bg-emerald-100 text-emerald-600' : ''}
                                    `}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    ✓ Voto Válido!
                                </motion.span>
                            ) : (
                                <span className={`text-[10px] font-medium ${isPremium ? 'text-[#998a75]' : isNeon ? 'text-cyan-700' : isNatural ? 'text-[#8fa394]' : isAcid || isSwiss ? 'text-black' : 'text-slate-400'}`}>
                                    (Mínimo {minCompleteness}%)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Track */}
                <div className={`h-4 w-full relative overflow-hidden 
                    ${isBold ? 'rounded-lg border-2 border-black bg-white' : ''}
                    ${isNeon ? 'rounded-none border border-cyan-900/50 bg-black/50' : ''}
                    ${isNatural ? 'rounded-full h-4 bg-[#e3e6e3] shadow-inner' : ''}
                    ${isAcid ? 'rounded-none h-4 border border-black bg-[#E6E6E6]' : ''}
                    ${isSwiss ? 'rounded-lg h-4 border-2 border-black bg-white' : ''}
                    ${!isBold && !isNeon && !isNatural && !isAcid && !isSwiss ? `rounded-full h-3 ${isPremium ? 'bg-[#e8dece]' : 'bg-slate-100'}` : ''}
                `}>
                    {/* Minimum Threshold Marker */}
                    <div
                        className={`absolute top-0 bottom-0 z-20 
                            ${isBold ? 'w-1 bg-black' : ''}
                            ${isNeon ? 'w-[1px] bg-cyan-500/50 shadow-[0_0_5px_#06b6d4]' : ''}
                            ${isNatural ? 'w-1 bg-[#acc196]/50 rounded-full' : ''}
                            ${!isBold && !isNeon && !isNatural ? `w-0.5 ${isPremium ? 'bg-[#c9a962]/50' : 'bg-slate-300'}` : ''}
                        `}
                        style={{ left: `${minCompleteness}%` }}
                    />
                    {/* Progress Fill */}
                    <motion.div
                        className={`h-full relative ${isComplete ? 'bg-emerald-500' : ''} ${!isBold && !isNeon && 'rounded-full'}`}
                        style={{
                            background: isComplete
                                ? (isBold ? '#10b981' : isNeon ? '#10b981' : isNatural ? '#4A5D4F' : 'linear-gradient(135deg, #10b981, #059669)')
                                : isPremium ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`
                                    : isNeon ? '#06b6d4'
                                        : isNatural ? '#4A5D4F'
                                            : isAcid ? '#CCFF00'
                                                : isSwiss ? '#000'
                                                    : primaryColor,
                            boxShadow: isNeon ? '0 0 10px rgba(6,182,212,0.5)' : 'none'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        {/* Glow effect (disabled for bold) */}
                        {!isBold && (
                            <motion.div
                                className={`absolute inset-0 ${!isNeon ? 'rounded-full' : ''}`}
                                style={{ boxShadow: isComplete ? '0 0 20px rgba(16, 185, 129, 0.5)' : `0 0 15px ${isNeon ? '#06b6d4' : primaryColor}60` }}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    // DEFAULT STICKY VARIANT
    return (
        <motion.div
            className={`w-full sticky top-0 z-50 p-4 md:p-5 
                ${isBold ? 'bg-white border-b-4 border-black' : ''}
                ${isNeon ? 'bg-black/90 border-b border-cyan-500/50 backdrop-blur-md shadow-[0_5px_20px_-10px_rgba(6,182,212,0.2)]' : ''}
                ${isNatural ? 'bg-[#E6E8E6]/90 border-b border-white/20 backdrop-blur-md shadow-sm' : ''}
                ${isAcid ? 'bg-[#E6E6E6] border-b-2 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.1)]' : ''}
                ${isSwiss ? 'bg-white border-b-2 border-black' : ''}
                ${!isBold && !isNeon && !isNatural && !isAcid && !isSwiss ? `${isPremium ? 'bg-gradient-to-r from-[#faf6f0] via-[#f5efe6] to-[#faf6f0] border-b border-[#d4c5b0]/30' : isModern ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100' : 'bg-white border-b border-slate-100 shadow-sm'}` : ''}
            `}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-end mb-3">
                    <div>

                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isPremium ? 'text-[#998a75]' : isNeon ? 'text-cyan-600' : isNatural ? 'text-[#8fa394]' : isAcid || isSwiss ? 'text-black' : 'text-slate-400'}`}>
                            Progresso da Votação
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                            <motion.span
                                className={`text-3xl font-black ${isComplete
                                    ? 'text-emerald-500'
                                    : isPremium ? 'text-[#2c2520]' : isNeon ? 'text-cyan-400' : isNatural ? 'text-[#4A5D4F]' : isAcid || isSwiss ? 'text-black' : 'text-slate-900'
                                    }`}
                                key={percentage}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {percentage}%
                            </motion.span>
                            {isComplete ? (
                                <motion.span
                                    className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider 
                                        ${isBold ? 'bg-emerald-400 text-black border-2 border-black shadow-[2px_2px_0_0_#000]' : ''}
                                        ${isNeon ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/50 rounded-none' : ''}
                                        ${isNatural ? 'bg-[#acc196]/30 text-[#4A5D4F]' : ''}
                                        ${isAcid ? 'bg-[#CCFF00] text-black border border-black rounded-none shadow-[2px_2px_0_0_#000]' : ''}
                                        ${isSwiss ? 'bg-black text-white border-2 border-black rounded-md' : ''}
                                        ${!isBold && !isNeon && !isNatural && !isAcid && !isSwiss ? 'bg-emerald-100 text-emerald-600' : ''}
                                    `}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                >
                                    ✓ Voto Válido!
                                </motion.span>
                            ) : (
                                <span className={`text-xs font-medium ${isPremium ? 'text-[#998a75]' : isNeon ? 'text-cyan-700' : isNatural ? 'text-[#8fa394]' : isAcid || isSwiss ? 'text-black' : 'text-slate-400'}`}>
                                    (Mínimo {minCompleteness}%)
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-sm font-bold ${isPremium ? 'text-[#5a4d40]' : isNeon ? 'text-zinc-400' : isNatural ? 'text-[#4A5D4F]' : isAcid || isSwiss ? 'text-black' : 'text-slate-600'}`}>
                            {answered} <span className={isPremium ? 'text-[#998a75]' : isNeon ? 'text-zinc-600' : isNatural ? 'text-[#8fa394]' : isAcid || isSwiss ? 'text-black' : 'text-slate-400'}>de</span> {total}
                        </span>
                        <span className={`block text-[10px] font-medium ${isPremium ? 'text-[#998a75]' : isNeon ? 'text-zinc-600' : isNatural ? 'text-[#8fa394]' : isAcid || isSwiss ? 'text-black' : 'text-slate-400'}`}>
                            categorias
                        </span>
                    </div>
                </div>

                {/* Progress Track */}
                <div className={`w-full relative overflow-hidden 
                    ${isBold ? 'h-4 rounded-lg border-2 border-black bg-white' : ''}
                    ${isNeon ? 'h-2 rounded-none bg-zinc-800' : ''}
                    ${isNatural ? 'h-4 rounded-full bg-[#e3e6e3] shadow-inner' : ''}
                    ${isAcid ? 'h-4 rounded-none border border-black bg-[#E6E6E6]' : ''}
                    ${isSwiss ? 'h-4 rounded-lg border-2 border-black bg-white' : ''}
                    ${!isBold && !isNeon && !isNatural && !isAcid && !isSwiss ? `h-3 rounded-full ${isPremium ? 'bg-[#e8dece]' : isModern ? 'bg-gradient-to-r from-slate-100 to-slate-200' : 'bg-slate-100'}` : ''}
                `}>
                    {/* Minimum Threshold Marker */}
                    <div
                        className={`absolute top-0 bottom-0 z-20 
                            ${isBold ? 'w-1 bg-black' : ''}
                            ${isNeon ? 'w-[1px] bg-cyan-500/50 shadow-[0_0_5px_#06b6d4]' : ''}
                            ${isNatural ? 'w-1 bg-[#acc196]/50 rounded-full' : ''}
                            ${!isBold && !isNeon && !isNatural ? `w-0.5 ${isPremium ? 'bg-[#c9a962]/50' : 'bg-slate-300'}` : ''}
                        `}
                        style={{ left: `${minCompleteness}%` }}
                    />

                    {/* Progress Fill */}
                    <motion.div
                        className={`h-full relative ${isComplete ? 'bg-emerald-500' : ''} ${!isBold && !isNeon && 'rounded-full'}`}
                        style={{
                            background: isComplete
                                ? (isBold ? '#10b981' : isNeon ? '#10b981' : isNatural ? '#4A5D4F' : 'linear-gradient(135deg, #10b981, #059669)')
                                : isPremium ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`
                                    : isModern ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`
                                        : isNeon ? '#06b6d4'
                                            : isNatural ? '#4A5D4F'
                                                : isAcid ? '#CCFF00'
                                                    : isSwiss ? '#000'
                                                        : primaryColor,
                            boxShadow: isNeon ? '0 0 10px rgba(6,182,212,0.5)' : 'none'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        {/* Glow effect (disabled for bold) */}
                        {!isBold && (
                            <motion.div
                                className={`absolute inset-0 ${!isNeon ? 'rounded-full' : ''}`}
                                style={{
                                    boxShadow: isComplete
                                        ? '0 0 20px rgba(16, 185, 129, 0.5)'
                                        : `0 0 15px ${isNeon ? '#06b6d4' : primaryColor}60`
                                }}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
