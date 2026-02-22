'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Share2, Home, Sparkles, Trophy, Star } from 'lucide-react';
import { useVoteTemplate } from './VoteTemplateContext';

interface ThankYouScreenProps {
    enquete: any;
    isEmbedded?: boolean;
    customMessage?: {
        titulo: string;
        mensagem: string;
    };
}

// Confetti particle component
const ConfettiParticle = ({ delay, x }: { delay: number; x: number }) => (
    <motion.div
        className="absolute w-3 h-3 rounded-full"
        style={{
            left: `${x}%`,
            background: ['#c9a962', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
        }}
        initial={{ y: -20, opacity: 1, scale: 0 }}
        animate={{
            y: ['0vh', '100vh'],
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
            rotate: [0, 360, 720]
        }}
        transition={{
            duration: 3,
            delay,
            ease: "easeOut"
        }}
    />
);

export const ThankYouScreen: React.FC<ThankYouScreenProps> = ({ enquete, isEmbedded = false, customMessage }) => {
    const { template, animations, primaryColor, classes, buttonStyles } = useVoteTemplate();
    const configVisual = enquete.configVisual || {};

    // Use custom message if provided, otherwise fallback to enquete config, then to default
    const thanksConfig = customMessage || enquete.paginaAgradecimento || {
        titulo: "Voto Confirmado!",
        mensagem: "Obrigado por contribuir para o crescimento do nosso comércio local. Sua opinião é fundamental!",
        showShareButtons: true
    };

    const [luckyNumbers, setLuckyNumbers] = React.useState<string[]>([]);
    const [loadingNumbers, setLoadingNumbers] = React.useState(false);

    React.useEffect(() => {
        if (enquete.usarNumerosSorte) {
            const loadLuckyNumbers = async () => {
                setLoadingNumbers(true);
                try {
                    const savedLead = localStorage.getItem(`vote_lead_${enquete.id}`);
                    if (!savedLead) {
                        // Maybe it was cleared on submission, check fallback from submission result if we had it
                        setLoadingNumbers(false);
                        return;
                    }
                    const lead = JSON.parse(savedLead);

                    const res = await fetch(`/api/leads/${lead.id}/lucky-numbers?enqueteId=${enquete.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setLuckyNumbers(data.numbers || []);
                    }
                } catch (e) {
                    console.error("Erro ao carregar números da sorte", e);
                } finally {
                    setLoadingNumbers(false);
                }
            };
            loadLuckyNumbers();
        }
    }, [enquete.id, enquete.usarNumerosSorte]);

    const isPremium = template.mood === 'elegant';
    const isModern = template.mood === 'energetic';

    const handleShare = async () => {
        const shareUrl = window.location.href;
        let shareText = `Acabei de votar no ${enquete.titulo}! Participe você também.`;

        if (luckyNumbers.length > 0) {
            shareText += ` Ganhei os números da sorte: ${luckyNumbers.join(', ')} 🍀`;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: enquete.titulo,
                    text: shareText,
                    url: shareUrl
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert("Link copiado para a área de transferência!");
        }
    };

    return (
        <motion.div
            className={isEmbedded ? 'w-full h-full lg:static lg:bg-transparent lg:z-auto flex items-center justify-center p-4 md:p-8 lg:p-12' : classes.overlay}
            {...animations.pageEnter}
        >
            {/* Confetti effect for Modern theme */}
            {isModern && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <ConfettiParticle key={i} delay={i * 0.1} x={Math.random() * 100} />
                    ))}
                </div>
            )}

            <motion.div
                className={`w-full overflow-y-auto no-scrollbar md:h-auto md:max-w-2xl ${classes.card} 
                    h-full rounded-none md:rounded-[2.5rem] flex flex-col shadow-2xl`}
                {...animations.cardEnter}
            >
                {/* Banner with success theme */}
                <div className={`${classes.banner} flex-shrink-0 relative`}>
                    {configVisual.bannerUrl ? (
                        <motion.img
                            src={configVisual.bannerUrl}
                            alt="Banner"
                            className="w-full h-full object-cover"
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                    ) : (
                        <div
                            className="w-full h-full"
                            style={{
                                background: isPremium
                                    ? `linear-gradient(135deg, ${primaryColor}44 0%, ${primaryColor}88 100%)`
                                    : isModern
                                        ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)'
                                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            }}
                        />
                    )}
                    <div className={classes.bannerOverlay} />

                    {/* Logo in banner */}
                    {configVisual.logoUrl && (
                        <motion.div
                            className="absolute top-6 left-1/2 -translate-x-1/2"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <img src={configVisual.logoUrl} alt="Logo" className="h-12 object-contain drop-shadow-lg" />
                        </motion.div>
                    )}
                </div>

                {/* Content with floating success icon */}
                <div className={`flex-1 p-8 md:p-12 ${classes.cardInner} flex flex-col relative`}>
                    {/* Success Icon - Positioned at top of content, not absolute to banner */}
                    <motion.div
                        className="flex justify-center -mt-16 mb-6 relative z-10"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.3
                        }}
                    >
                        <motion.div
                            className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl
                                ${isPremium
                                    ? 'bg-gradient-to-br from-[#c9a962] to-[#a88b4a] ring-4 ring-[#c9a962]/20'
                                    : ''
                                }`}
                            style={{
                                background: isPremium
                                    ? undefined
                                    : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                                // Initial shadow state (simulating ring + glow)
                                boxShadow: isPremium ? undefined : `0 0 0 4px ${primaryColor}33, 0 10px 40px ${primaryColor}40`
                            }}
                            animate={{
                                boxShadow: [
                                    // Keyframe 1: Normal glow
                                    isPremium
                                        ? '0 0 0 4px rgba(201,169,98,0.2), 0 10px 40px rgba(201,169,98,0.3)'
                                        : `0 0 0 4px ${primaryColor}33, 0 10px 40px ${primaryColor}40`,
                                    // Keyframe 2: Intense glow (breathing)
                                    isPremium
                                        ? '0 0 0 4px rgba(201,169,98,0.2), 0 20px 60px rgba(201,169,98,0.4)'
                                        : `0 0 0 4px ${primaryColor}33, 0 20px 60px ${primaryColor}60`,
                                    // Keyframe 3: Back to normal
                                    isPremium
                                        ? '0 0 0 4px rgba(201,169,98,0.2), 0 10px 40px rgba(201,169,98,0.3)'
                                        : `0 0 0 4px ${primaryColor}33, 0 10px 40px ${primaryColor}40`
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <CheckCircle2
                                    size={48}
                                    className="text-white"
                                    strokeWidth={2.5}
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                <Trophy className="w-6 h-6" style={{ color: primaryColor }} />
                            </motion.div>
                            <span className={classes.successBadge}>Sucesso</span>
                            <motion.div animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                                <Star className="w-6 h-6" style={{ color: primaryColor }} />
                            </motion.div>
                        </div>
                        <h2 className={`text-4xl md:text-5xl font-black ${classes.heading} leading-tight`}>
                            {thanksConfig.titulo}
                        </h2>
                    </motion.div>

                    {/* Message */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <p className={`${classes.text} font-medium leading-relaxed text-lg max-w-md mx-auto`}>
                            {thanksConfig.mensagem}
                        </p>
                    </motion.div>

                    {/* RF-012: Lucky Numbers Section */}
                    {enquete.usarNumerosSorte && (luckyNumbers.length > 0 || loadingNumbers) && (
                        <motion.div
                            className={`p-6 rounded-[2rem] border-2 mb-8 ${isPremium
                                ? 'bg-gradient-to-br from-[#faf6f0] to-[#f5efe6] border-[#d4c5b0]/50 shadow-lg'
                                : 'bg-slate-50 border-slate-100'
                                }`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="flex flex-col items-center text-center">
                                <Sparkles className="w-6 h-6 text-amber-500 mb-2 animate-pulse" />
                                <h3 className={`text-sm font-black uppercase tracking-widest ${isPremium ? 'text-[#5a4d40]' : 'text-slate-900'}`}>
                                    Seus Números da Sorte
                                </h3>
                                <p className="text-[10px] font-bold text-muted-foreground mt-1 mb-4 uppercase tracking-tighter">
                                    Baseados no sorteio da Federal
                                </p>

                                {loadingNumbers ? (
                                    <div className="h-10 w-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                                ) : (
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {luckyNumbers.map((num, idx) => (
                                            <motion.div
                                                key={idx}
                                                className={`px-6 py-3 rounded-2xl text-xl font-black shadow-md border`}
                                                style={{
                                                    backgroundColor: isPremium ? 'white' : primaryColor,
                                                    borderColor: isPremium ? '#d4c5b0' : 'transparent',
                                                    color: isPremium ? '#c9a962' : 'white'
                                                }}
                                                whileHover={{ y: -5, scale: 1.1 }}
                                            >
                                                {num}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                <p className="text-[9px] font-medium text-muted-foreground mt-4 leading-relaxed max-w-xs">
                                    Guarde estes números! Eles são sua chance de ganhar prêmios incríveis. O sorteio acontece conforme o regulamento.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <motion.div
                        className="mt-auto space-y-4 max-w-sm mx-auto w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        {thanksConfig.showShareButtons && (
                            <motion.div
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    className={`w-full h-14 font-bold uppercase tracking-widest transition-all duration-300 rounded-2xl border-2`}
                                    style={{
                                        borderColor: isPremium ? '#d4c5b0' : `${primaryColor}30`,
                                        color: isPremium ? '#5a4d40' : undefined,
                                        // We use style for hover effect support if needed via JS or just rely on class for basic
                                    }}
                                >
                                    <Share2 className="mr-2 w-5 h-5" />
                                    Compartilhar Link
                                </Button>
                            </motion.div>
                        )}

                        <motion.div
                            whileHover={animations.buttonHover}
                            whileTap={animations.buttonTap}
                        >
                            <Button
                                onClick={() => window.location.href = '/'}
                                className={`w-full h-14 font-black uppercase tracking-widest text-white transition-all duration-300 ${buttonStyles.primary.className}`}
                                style={{ background: buttonStyles.primary.background }}
                            >
                                <Home className="mr-2 w-5 h-5" />
                                Voltar para o Início
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        className={`mt-10 pt-6 border-t text-center ${isPremium ? 'border-[#d4c5b0]/30' : 'border-slate-100'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        <p className={`text-xs font-medium ${classes.muted}`}>
                            Participação confirmada • Hub de Spokes
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};
