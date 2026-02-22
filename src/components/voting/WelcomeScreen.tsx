'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ArrowRight, FileText, Lock, Sparkles, Calendar, CheckSquare, Square } from 'lucide-react';
import { useVoteTemplate } from './VoteTemplateContext';

interface WelcomeScreenProps {
    enquete: any;
    onStart: () => void;
    isEmbedded?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ enquete, onStart, isEmbedded = false }) => {
    const { template, animations, primaryColor, classes, buttonStyles } = useVoteTemplate();
    const configVisual = enquete.configVisual || {};
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState(false);
    const [legalContext, setLegalContext] = useState<'regulamento' | 'privacidade' | null>(null);

    const isPremium = template.mood === 'elegant';
    const isModern = template.mood === 'energetic';

    const handleStartClick = () => {
        if (!agreed) {
            setError(true);
            return;
        }
        onStart();
    };

    const formatDate = (date: any) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const dateRange = (enquete.dataInicio || enquete.dataFim) ? (
        <div className={`flex items-center justify-center gap-3 px-4 py-2 rounded-full mb-8 w-fit mx-auto shadow-lg ${isPremium
            ? 'bg-[#c9a962] text-[#0a0908] shadow-[#c9a962]/20'
            : 'bg-slate-100 border border-slate-200 text-slate-600'
            }`}>
            <Calendar size={14} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] leading-none">
                {enquete.dataInicio ? formatDate(enquete.dataInicio) : 'Início'}
                <span className={`mx-2 ${isPremium ? 'opacity-70' : 'opacity-40'}`}>até</span>
                {enquete.dataFim ? formatDate(enquete.dataFim) : 'Fim'}
            </span>
        </div>
    ) : null;

    return (
        <motion.div
            className={`${isEmbedded ? 'w-full h-full lg:static lg:bg-transparent lg:z-auto' : classes.overlay} flex items-center justify-center p-4 md:p-8 lg:p-12`}
            {...animations.pageEnter}
        >
            <AnimatePresence>
                {legalContext && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-4 md:inset-10 lg:inset-20 z-[100] bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col p-8 md:p-12 overflow-hidden border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-8 border-b pb-6">
                            <h2 className={`text-2xl font-black uppercase tracking-widest ${isPremium ? 'font-serif text-[#0a0908]' : 'text-slate-900'}`}>
                                {legalContext === 'regulamento' ? 'Regulamento' : 'Privacidade'}
                            </h2>
                            <button
                                onClick={() => setLegalContext(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <ArrowRight className="w-6 h-6 rotate-180" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar text-slate-600 leading-relaxed text-sm">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: legalContext === 'regulamento' ? enquete.regulamento : enquete.politicaPrivacidade
                                }}
                            />
                        </div>
                        <Button
                            className="mt-8 w-full h-14 uppercase font-black tracking-widest"
                            style={{ background: primaryColor }}
                            onClick={() => setLegalContext(null)}
                        >
                            Fechar e Voltar
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className={`w-full no-scrollbar md:max-w-xl lg:max-w-2xl ${classes.card} 
                    md:h-auto max-h-[95vh] md:max-h-[90vh] rounded-[2.5rem] md:rounded-[3.5rem] flex flex-col shadow-2xl relative overflow-hidden`}
                {...animations.cardEnter}
            >
                {/* Scrollable Container for content to prevent overflow in smaller Desktop heights */}
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                    {/* Hide Branding elements in Embedded mode to avoid redundancy with Sidebar */}
                    {!isEmbedded && (
                        <div className={`relative flex-shrink-0 flex flex-col items-center pt-10 pb-32 px-8 text-center ${isPremium ? 'min-h-[300px] md:min-h-[350px] bg-[#0a0908]' : 'min-h-[250px]'
                            }`}>
                            {configVisual.bannerUrl && (
                                <motion.img
                                    src={configVisual.bannerUrl}
                                    alt="Banner"
                                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 1.5 }}
                                />
                            )}
                            <div className={classes.bannerOverlay} />

                            {/* Badge at the very top */}
                            <motion.div
                                className="relative z-10 mb-8"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div
                                    className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg text-[#0a0908]"
                                    style={{
                                        backgroundColor: isPremium ? '#c9a962' : primaryColor,
                                        boxShadow: `0 10px 20px -5px ${isPremium ? '#c9a962' : primaryColor}40`
                                    }}
                                >
                                    {enquete.tituloBadge || 'Melhores do Ano 2025'}
                                </div>
                            </motion.div>

                            {/* Logo centered */}
                            {configVisual.logoUrl && (
                                <motion.div
                                    className="relative z-10"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <img src={configVisual.logoUrl} alt="Logo" className="h-40 md:h-48 object-contain drop-shadow-[0_10px_20_rgba(0,0,0,0.5)]" />
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Lower Card - Action Section (Now contains Title and Description) */}
                    <div className={`p-8 md:p-14 md:pb-10 ${classes.cardInner} flex flex-col bg-white ${!isEmbedded ? '-mt-24 rounded-t-[3.5rem] shadow-[0_-25px_50px_rgba(0,0,0,0.2)]' : 'flex-1'} relative z-20`}>

                        {!isEmbedded && (
                            <motion.div
                                className="text-center space-y-4 mb-10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h1 className={`text-4xl md:text-5xl font-black ${isPremium ? 'text-slate-900 font-serif' : 'text-slate-900'} leading-tight`}>
                                    {enquete.titulo?.split(' ').slice(0, -1).join(' ')} <span style={{ color: primaryColor }}>{enquete.titulo?.split(' ').slice(-1)}</span>
                                </h1>
                                <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                                    {enquete.descricao || "Participe da escolha das empresas e categorias que mais se destacaram em nossa cidade!"}
                                </p>
                            </motion.div>
                        )}

                        <div className="pt-2">
                            {dateRange}
                        </div>

                        {/* Agreement Checkbox */}
                        <motion.div
                            className="mb-10 mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <button
                                onClick={() => { setAgreed(!agreed); setError(false); }}
                                className={`flex items-start gap-4 p-6 rounded-2xl w-full text-left transition-all duration-300 border
                                ${error ? 'bg-red-50 border-red-200 shadow-sm shadow-red-100' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}
                            `}
                            >
                                <div
                                    className={`mt-0.5 shrink-0 ${agreed ? '' : 'text-slate-300'}`}
                                    style={{ color: agreed ? (isPremium ? '#c9a962' : primaryColor) : undefined }}
                                >
                                    {agreed ? <CheckSquare size={24} strokeWidth={2.5} /> : <Square size={24} strokeWidth={2.5} />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 leading-snug">
                                        Concordo com a <span role="button" tabIndex={0} className="underline cursor-pointer" style={{ color: isPremium ? '#c9a962' : primaryColor }} onClick={(e) => { e.stopPropagation(); setLegalContext('privacidade'); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setLegalContext('privacidade'); } }}>política de privacidade</span>{enquete.regulamento ? (
                                            <> e <span role="button" tabIndex={0} className="underline cursor-pointer" style={{ color: isPremium ? '#c9a962' : primaryColor }} onClick={(e) => { e.stopPropagation(); setLegalContext('regulamento'); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setLegalContext('regulamento'); } }}>regulamento</span></>
                                        ) : ' e termos de uso'} desta premiação.
                                    </p>
                                </div>
                            </button>
                        </motion.div>

                        {/* CTA Section */}
                        <div className="mt-auto pt-4 space-y-6">
                            <motion.div
                                whileHover={agreed ? animations.buttonHover : {}}
                                whileTap={agreed ? animations.buttonTap : {}}
                            >
                                <Button
                                    onClick={handleStartClick}
                                    className={`w-full h-18 text-base font-black uppercase tracking-[0.15em] text-white transition-all duration-300 
                                    ${buttonStyles.primary.className} 
                                    ${!agreed ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                                `}
                                    style={{
                                        background: buttonStyles.primary.background,
                                        height: '72px'
                                    }}
                                >
                                    Iniciar Votação
                                    <ArrowRight className="ml-3 w-6 h-6" />
                                </Button>
                            </motion.div>

                            {/* Regulation Tag - Now at the bottom */}
                            {enquete.regulamento && (
                                <motion.div
                                    className="flex justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                >
                                    <button
                                        onClick={() => setLegalContext('regulamento')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
                                        style={{
                                            border: `1px solid ${isPremium ? '#c9a962' : primaryColor}50`,
                                            backgroundColor: `${isPremium ? '#c9a962' : primaryColor}10`,
                                            color: isPremium ? '#c9a962' : primaryColor
                                        }}
                                    >
                                        <FileText size={14} />
                                        Visualizar Regulamento
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
