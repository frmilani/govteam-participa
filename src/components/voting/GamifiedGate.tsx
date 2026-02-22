'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Check, ShieldCheck, Ticket, User, Instagram, Mail, ArrowRight, Sparkles, Gift } from 'lucide-react';
import { isValidCPF } from '@/lib/utils';
import { useVoteTemplate } from './VoteTemplateContext';

interface GamifiedGateProps {
    enquete: any;
    organizationId: string;
    onComplete: (leadData: any) => void;
    isEmbedded?: boolean;
}

type GateStep = 'identification' | 'verification' | 'missions' | 'success';

export const GamifiedGate: React.FC<GamifiedGateProps> = ({
    enquete,
    organizationId,
    onComplete,
    isEmbedded = false
}) => {
    const { template, animations, primaryColor, classes, buttonStyles, isFullscreen } = useVoteTemplate();
    const isPremium = template.mood === 'elegant';
    const isModern = template.mood === 'energetic';
    const isBold = template.mood === 'bold';
    const isNeon = template.mood === 'neon';
    const isNatural = template.mood === 'natural';
    const isAcid = template.mood === 'tech-acid';
    const isSwiss = template.mood === 'swiss';

    const [step, setStep] = useState<GateStep>('identification');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nome: '',
        whatsapp: '',
        cpf: '',
        email: '',
        instagram: '',
        otpCode: ''
    });

    const [coupons, setCoupons] = useState(0);
    const [leadId, setLeadId] = useState<string | null>(null);

    const formatPhone = (value: string) => {
        const nums = value.replace(/\D/g, "");
        if (nums.length <= 2) return nums;
        if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
        return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
    };

    const formatCPF = (value: string) => {
        const nums = value.replace(/\D/g, "");
        if (nums.length <= 3) return nums;
        if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
        if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
        return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9, 11)}`;
    };

    const handleIdentification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const cleanPhone = formData.whatsapp.replace(/\D/g, "");
            const cleanCpf = formData.cpf.replace(/\D/g, "");

            if ((enquete.exigirCpf || cleanCpf.length > 0) && !isValidCPF(cleanCpf)) {
                throw new Error('Por favor, informe um CPF válido.');
            }

            const res = await fetch('/api/leads/partial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationId,
                    nome: formData.nome,
                    whatsapp: cleanPhone,
                    cpf: cleanCpf,
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao identificar');

            setLeadId(data.id);
            setCoupons(data.cupons);

            if (enquete.securityLevel === 'HIGH') {
                await fetch('/api/otp/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: cleanPhone,
                        organizationId
                    })
                });
                setStep('verification');
            } else {
                setStep('missions');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async () => {
        handleIdentification({ preventDefault: () => { } } as React.FormEvent);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const cleanPhone = formData.whatsapp.replace(/\D/g, "");
            const res = await fetch('/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: cleanPhone,
                    code: formData.otpCode,
                    organizationId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Código inválido');

            setCoupons(prev => prev + 2);
            setStep('missions');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const finishFlow = (finalCoupons: number) => {
        setStep('success');
        setTimeout(() => {
            onComplete({
                id: leadId,
                nome: formData.nome,
                whatsapp: formData.whatsapp.replace(/\D/g, ""),
                cupons: finalCoupons
            });
        }, 1500);
    };

    const handleMissions = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validação: Se clicou no botão principal, deve ter preenchido algo
        if (!formData.email && !formData.instagram) {
            setError('Por favor, preencha pelo menos um campo para ganhar cupons extras, ou clique em pular.');
            return;
        }

        setLoading(true);

        try {
            let finalCoupons = coupons;
            if (formData.email || formData.instagram) {
                const res = await fetch('/api/leads/partial', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        organizationId,
                        nome: formData.nome,
                        whatsapp: formData.whatsapp,
                        email: formData.email,
                        instagram: formData.instagram,
                    })
                });
                const data = await res.json();
                finalCoupons = data.cupons;
                setCoupons(finalCoupons);
            }

            finishFlow(finalCoupons);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step-specific icon styles
    const getIconStyle = () => {
        const baseStep = {
            identification: { bg: primaryColor, icon: <User size={28} strokeWidth={2.5} /> },
            verification: { bg: '#f59e0b', icon: <ShieldCheck size={28} strokeWidth={2.5} /> },
            missions: { bg: primaryColor, icon: <Gift size={28} strokeWidth={2.5} /> },
            success: { bg: '#10b981', icon: <Check size={28} strokeWidth={2.5} /> },
        };
        return baseStep[step];
    };

    const iconStyle = getIconStyle();

    // Input styles based on theme
    // For Gen Z, we want stronger borders
    // For Cyberpunk, we want sharp borders and tech feel
    // For Organic, we want super rounded
    const inputClassName = `${classes.input} text-base 
        ${isBold ? 'border-2 border-black shadow-[4px_4px_0_0_#000]' : ''}
        ${isNeon ? 'border border-cyan-500/50 bg-black/50 text-cyan-50 font-mono rounded-none focus:ring-1 focus:ring-cyan-500' : ''}
        ${isNatural ? 'rounded-2xl border-0 shadow-inner bg-white/50 backdrop-blur-sm' : ''}
        ${isAcid ? 'rounded-none border border-black bg-white focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] font-mono' : ''}
        ${isSwiss ? 'rounded-lg border-2 border-black bg-white focus:border-black focus:ring-0 font-sans tracking-tight' : ''}
    `;

    return (
        <motion.div
            className={`${isEmbedded ? 'w-full h-full lg:static lg:bg-transparent lg:z-auto' : classes.overlay} flex items-center justify-center p-4 md:p-8 lg:p-12`}
            {...animations.pageEnter}
        >
            {/* Modern theme gradient blobs */}
            {isModern && !isBold && !isNeon && !isNatural && !isAcid && !isSwiss && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute -top-1/3 -left-1/3 w-2/3 h-2/3 bg-gradient-to-br from-violet-500/40 to-transparent rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity }}
                        style={{ background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)` }}
                    />
                    <motion.div
                        className="absolute -bottom-1/3 -right-1/3 w-2/3 h-2/3 bg-gradient-to-tl from-fuchsia-500/40 to-transparent rounded-full blur-3xl"
                        animate={{
                            scale: [1.2, 1, 1.2],
                            rotate: [0, -90, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity }}
                        style={{ background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)` }}
                    />
                </div>
            )}

            <motion.div
                className={`w-full no-scrollbar md:max-w-xl ${classes.card} ${isEmbedded ? 'lg:my-12' : 'md:h-auto'} max-h-[95vh] md:max-h-[85vh] 
                    ${isBold ? 'rounded-xl border-4 border-black shadow-[8px_8px_0_0_#000]' : ''}
                    ${isNeon ? 'rounded-none border border-cyan-500/30 shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)] bg-zinc-900/95 backdrop-blur-xl' : ''}
                    ${isNatural ? 'rounded-[3rem] border border-white/40 shadow-xl bg-[#f2efe9]/80 backdrop-blur-md' : ''}
                    ${isAcid ? 'rounded-none border border-black bg-[#F2F2F2] shadow-[8px_8px_0_0_rgba(204,255,0,0.5)]' : ''}
                    ${isSwiss ? 'rounded-[1.5rem] border-2 border-black bg-white shadow-[8px_8px_0_0_#000]' : ''}
                    ${!isBold && !isNeon && !isNatural && !isAcid && !isSwiss ? 'rounded-[2.5rem] md:rounded-[3rem] shadow-2xl' : ''}
                    flex flex-col relative overflow-hidden`}
                {...animations.cardEnter}
            >
                <div className={`flex-1 overflow-y-auto no-scrollbar ${isEmbedded ? 'p-10 md:p-16' : 'p-8 md:p-14'} ${classes.cardInner} flex flex-col justify-center`}>
                    {/* Header */}
                    <motion.div
                        className={`text-center ${isEmbedded ? 'mb-8' : 'mb-10'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.div
                            className={`mx-auto w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-6 text-white
                                ${isBold ? 'rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000]' : ''}
                                ${isNeon ? 'rounded-none border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] bg-zinc-900' : ''}
                                ${isNatural ? 'rounded-full border border-white/50 shadow-lg bg-[#acc196]' : ''}
                                ${isAcid ? 'rounded-none border border-[#CCFF00] bg-black text-[#CCFF00] shadow-[4px_4px_0_0_#CCFF00]' : ''}
                                ${isSwiss ? 'rounded-xl border-2 border-black bg-black text-white shadow-[4px_4px_0_0_#000]' : ''}
                                ${!isBold && !isNeon && !isNatural && !isAcid && !isSwiss ? 'rounded-3xl shadow-xl' : ''}
                            `}
                            style={{
                                background: isPremium
                                    ? `linear-gradient(135deg, ${iconStyle.bg}, ${iconStyle.bg}cc)`
                                    : isModern
                                        ? `linear-gradient(135deg, ${iconStyle.bg}, ${iconStyle.bg}cc)`
                                        : isNeon
                                            ? undefined // Neon uses class
                                            : isNatural
                                                ? undefined // Natural uses class
                                                : isAcid || isSwiss
                                                    ? undefined // Acid/Swiss uses class
                                                    : iconStyle.bg,
                                boxShadow: isBold ? '4px 4px 0px 0px #000' : isNeon ? '0 0 15px rgba(6,182,212,0.4)' : isNatural ? '0 10px 30px -5px rgba(172,193,150,0.4)' : isAcid ? '4px 4px 0px 0px #CCFF00' : isSwiss ? '4px 4px 0px 0px #000' : `0 20px 40px ${iconStyle.bg}40`
                            }}
                            {...animations.iconFloat}
                        >
                            <div className={isNeon ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : isNatural ? 'text-[#4A5D4F]' : ''}>
                                {iconStyle.icon}
                            </div>
                        </motion.div>

                        <h2 className={`text-2xl md:text-3xl font-black ${classes.heading} mb-2`}>
                            {step === 'identification' && "Identifique-se"}
                            {step === 'verification' && "Verificação"}
                            {step === 'missions' && "Ganhe Mais!"}
                            {step === 'success' && "Tudo Pronto!"}
                        </h2>
                        <p className={`${classes.text} font-medium text-sm`}>
                            {step === 'identification' && "Preencha seus dados para votar e concorrer a prêmios."}
                            {step === 'verification' && `Digite o código enviado para ${formData.whatsapp}`}
                            {step === 'missions' && "Complete seu perfil e ganhe cupons extras!"}
                            {step === 'success' && "Sua participação foi confirmada."}
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {/* IDENTIFICATION STEP */}
                        {step === 'identification' && (
                            <motion.form
                                key="id-form"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                onSubmit={handleIdentification}
                                className={isEmbedded ? 'space-y-4' : 'space-y-5'}
                            >
                                <div className={isEmbedded ? 'space-y-3' : 'space-y-4'}>
                                    <div>
                                        <label className={`${classes.inputLabel} ${isEmbedded ? 'mb-1' : ''}`}>Nome Completo</label>
                                        <motion.div whileFocus={{ scale: 1.01 }}>
                                            <input
                                                placeholder="Seu nome completo"
                                                value={formData.nome}
                                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                                className={inputClassName}
                                                required
                                            />
                                        </motion.div>
                                    </div>

                                    <div>
                                        <label className={`${classes.inputLabel} ${isEmbedded ? 'mb-1' : ''}`}>WhatsApp</label>
                                        <input
                                            placeholder="(00) 00000-0000"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                                            className={inputClassName}
                                            maxLength={15}
                                            required
                                        />
                                    </div>

                                    {enquete.exigirCpf && (
                                        <div>
                                            <label className={`${classes.inputLabel} ${isEmbedded ? 'mb-1' : ''}`}>CPF</label>
                                            <input
                                                placeholder="000.000.000-00"
                                                value={formData.cpf}
                                                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                                                className={inputClassName}
                                                maxLength={14}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <motion.p
                                        className="text-xs text-red-500 font-bold text-center bg-red-50 p-2 rounded-xl"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <motion.div
                                    whileHover={animations.buttonHover}
                                    whileTap={animations.buttonTap}
                                >
                                    <Button
                                        isLoading={loading}
                                        className={`w-full ${isEmbedded ? 'h-14' : 'h-16'} text-base font-black uppercase tracking-widest text-white ${buttonStyles.primary.className} 
                                            ${isBold ? 'border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]' : ''}
                                            ${isAcid ? 'border border-black text-black hover:bg-[#CCFF00] hover:text-black' : ''}
                                            ${isSwiss ? 'border-2 border-black text-white hover:bg-white hover:text-black' : ''}
                                        `}
                                        style={{ background: buttonStyles.primary.background }}
                                    >
                                        Continuar <ArrowRight className="ml-3 w-5 h-5" />
                                    </Button>
                                </motion.div>
                            </motion.form>
                        )}

                        {/* VERIFICATION STEP */}
                        {step === 'verification' && (
                            <motion.form
                                key="verify-form"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                onSubmit={handleVerifyOtp}
                                className={isEmbedded ? 'space-y-4' : 'space-y-6'}
                            >
                                <div className={isEmbedded ? 'space-y-4' : 'space-y-6'}>
                                    <input
                                        placeholder="000000"
                                        className={`${inputClassName} text-center text-3xl font-black tracking-[0.5em] ${isEmbedded ? 'h-16' : 'h-20'}`}
                                        maxLength={6}
                                        value={formData.otpCode}
                                        onChange={(e) => setFormData({ ...formData, otpCode: e.target.value.replace(/\D/g, '') })}
                                        required
                                    />
                                </div>

                                {error && (
                                    <motion.p
                                        className="text-xs text-red-500 font-bold text-center bg-red-50 p-2 rounded-xl"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <motion.div
                                    whileHover={animations.buttonHover}
                                    whileTap={animations.buttonTap}
                                >
                                    <Button
                                        isLoading={loading}
                                        className={`w-full ${isEmbedded ? 'h-14' : 'h-16'} text-base font-black uppercase tracking-widest text-white ${buttonStyles.primary.className} 
                                            ${isBold ? 'border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]' : ''}
                                            ${isAcid ? 'border border-black text-black hover:bg-[#CCFF00]' : ''}
                                            ${isSwiss ? 'border-2 border-black text-white hover:bg-white hover:text-black' : ''}
                                        `}
                                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                                    >
                                        Verificar <ShieldCheck className="ml-3 w-5 h-5" />
                                    </Button>
                                </motion.div>

                                <button
                                    type="button"
                                    onClick={sendOtp}
                                    className={`w-full ${isEmbedded ? 'text-[10px]' : 'text-xs'} font-bold ${classes.muted} hover:underline transition-colors`}
                                    style={{ color: primaryColor }}
                                >
                                    Não recebeu? Reenviar código
                                </button>
                            </motion.form>
                        )}

                        {/* MISSIONS STEP */}
                        {step === 'missions' && (
                            <motion.form
                                key="missions-form"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                onSubmit={handleMissions}
                                className={isEmbedded ? 'space-y-4' : 'space-y-6'}
                            >
                                <div className={isEmbedded ? 'space-y-3' : 'space-y-4'}>
                                    {/* Email Mission */}
                                    <motion.div
                                        className={`flex items-center gap-4 ${isEmbedded ? 'p-4' : 'p-5'} ${isBold ? 'rounded-xl border-2 border-black shadow-[4px_4px_0_0_#000]' : 'rounded-2xl transition-all duration-300'}
                                            ${isPremium
                                                ? 'bg-[#f5efe6] border border-[#d4c5b0]/50'
                                                : isModern
                                                    ? 'bg-gradient-to-r from-slate-50 to-slate-100 border-0'
                                                    : 'bg-slate-50 border border-slate-100'
                                            }`}
                                        whileHover={isBold ? { x: 2, y: 2, boxShadow: '2px 2px 0 0 #000' } : { scale: 1.02, y: -2 }}
                                    >
                                        <div
                                            className={`${isEmbedded ? 'w-10 h-10' : 'w-12 h-12'} ${isBold ? 'rounded-lg border-2 border-black' : 'rounded-xl shadow-lg'} flex items-center justify-center text-white`}
                                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                                        >
                                            <Mail size={isEmbedded ? 18 : 22} />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                placeholder="seu@email.com"
                                                type="email"
                                                className={`w-full bg-transparent border-none outline-none ${classes.heading} text-base font-medium placeholder:text-slate-400`}
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <motion.div
                                            className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full"
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            +1 CUPOM
                                        </motion.div>
                                    </motion.div>

                                    {/* Instagram Mission */}
                                    <motion.div
                                        className={`flex items-center gap-4 ${isEmbedded ? 'p-4' : 'p-5'} ${isBold ? 'rounded-xl border-2 border-black shadow-[4px_4px_0_0_#000]' : 'rounded-2xl transition-all duration-300'}
                                            ${isPremium
                                                ? 'bg-[#f5efe6] border border-[#d4c5b0]/50'
                                                : isModern
                                                    ? 'bg-gradient-to-r from-slate-50 to-slate-100 border-0'
                                                    : 'bg-slate-50 border border-slate-100'
                                            }`}
                                        whileHover={isBold ? { x: 2, y: 2, boxShadow: '2px 2px 0 0 #000' } : { scale: 1.02, y: -2 }}
                                    >
                                        <div
                                            className={`${isEmbedded ? 'w-10 h-10' : 'w-12 h-12'} ${isBold ? 'rounded-lg border-2 border-black' : 'rounded-xl shadow-lg'} flex items-center justify-center text-white`}
                                            style={{ background: isModern ? 'linear-gradient(135deg, #ec4899, #db2777)' : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                                        >
                                            <Instagram size={isEmbedded ? 18 : 22} />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                placeholder="@seu_instagram"
                                                className={`w-full bg-transparent border-none outline-none ${classes.heading} text-base font-medium placeholder:text-slate-400`}
                                                value={formData.instagram}
                                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                            />
                                        </div>
                                        <motion.div
                                            className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full"
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                        >
                                            +1 CUPOM
                                        </motion.div>
                                    </motion.div>
                                </div>

                                <motion.div
                                    whileHover={animations.buttonHover}
                                    whileTap={animations.buttonTap}
                                >
                                    <Button
                                        isLoading={loading}
                                        className={`w-full ${isEmbedded ? 'h-14' : 'h-16'} text-base font-black uppercase tracking-widest text-white ${buttonStyles.primary.className} 
                                            ${isBold ? 'border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]' : ''}
                                            ${isAcid ? 'border border-black text-black hover:bg-[#CCFF00]' : ''}
                                            ${isSwiss ? 'border-2 border-black text-white hover:bg-white hover:text-black' : ''}
                                        `}
                                        style={{ background: buttonStyles.primary.background }}
                                    >
                                        <Sparkles className="mr-2 w-5 h-5" />
                                        Garantir Meus Cupons
                                    </Button>
                                </motion.div>

                                <button
                                    type="button"
                                    onClick={() => finishFlow(coupons)}
                                    className={`w-full ${isEmbedded ? 'text-[10px]' : 'text-sm'} font-bold ${classes.muted} hover:opacity-70 transition-opacity`}
                                >
                                    Pular e continuar sem cupons extras
                                </button>
                            </motion.form>
                        )}


                        {/* SUCCESS STEP */}
                        {step === 'success' && (
                            <motion.div
                                key="success-card"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="text-center py-8"
                            >
                                <motion.div
                                    className="mb-8 relative inline-block"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <div
                                        className={`w-28 h-28 ${isBold ? 'rounded-2xl border-4 border-black shadow-[8px_8px_0_0_rgba(16,185,129,0.4)]' : 'rounded-[2rem] shadow-2xl'} flex items-center justify-center text-white`}
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            boxShadow: isBold ? '8px 8px 0px 0px rgba(16, 185, 129, 0.4)' : '0 25px 50px rgba(16, 185, 129, 0.4)'
                                        }}
                                    >
                                        <Ticket size={52} />
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                        className={`absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full border-4 border-white flex items-center justify-center text-white font-black text-lg ${isBold ? 'shadow-[2px_2px_0_0_#000]' : 'shadow-lg'}`}
                                    >
                                        {coupons}
                                    </motion.div>
                                </motion.div>

                                <h3 className={`text-2xl font-black ${classes.heading} mb-2`}>Inscrição Confirmada!</h3>
                                <p className={`${classes.text} font-medium`}>
                                    Você possui <strong className="text-emerald-600">{coupons} cupons</strong> para o sorteio.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    <motion.div
                        className={`mt-auto pt-8 border-t ${isPremium ? 'border-[#d4c5b0]/30' : 'border-slate-100'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <ShieldCheck className="text-emerald-500 w-4 h-4" />
                                </motion.div>
                                <span className={`text-xs font-medium ${classes.muted}`}>Conexão Segura</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4" style={{ color: primaryColor }} />
                                <span className={`text-lg font-black ${classes.heading}`}>{coupons}</span>
                                <span className={`text-xs font-medium ${classes.muted}`}>cupons</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};
