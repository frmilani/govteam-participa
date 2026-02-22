"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Trophy,
    Loader2,
    X,
    Award,
    Star,
    Shield,
    Search,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/form-engine/ThemeProvider';
import { VoteTemplateProvider, useVoteTemplate } from '@/components/voting/VoteTemplateContext';

function WinnersContent({ enquete, winners }: { enquete: any, winners: any[] }) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const { template, classes, isDarkMode } = useVoteTemplate();

    const filteredWinners = winners.filter((w: any) =>
        w.lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.numero.toString().includes(searchTerm) ||
        (w.prizeName && w.prizeName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className={cn("min-h-screen selection:bg-primary/20 transition-colors duration-500", classes.pageWrapper)}>
            {/* Header Section */}
            <div className={cn("relative overflow-hidden flex flex-col items-center justify-center py-20 px-6", classes.banner)}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                {/* Theme Overlay */}
                <div className={classes.bannerOverlay} />

                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn("inline-flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-full border mb-6", classes.badge)}
                    >
                        <Trophy className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Lista Oficial de Ganhadores</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm",
                            template.name === 'Premium' ? "text-[#c9a962]" : classes.heading
                        )}
                    >
                        {enquete.titulo}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed opacity-70", classes.text)}
                    >
                        Parabéns aos contemplados do Sorteio da Loteria Federal! <br />
                        Abaixo você confere a lista completa com os números premiados.
                    </motion.p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-6 py-12 relative z-20">
                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-12">
                    <div className={cn(
                        "relative group transition-all duration-300 p-0",
                        template.mood === 'bold' ? "" : (isDarkMode ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"),
                        classes.card,
                        "shadow-none hover:shadow-md h-12"
                    )}>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, número ou prêmio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cn(
                                classes.input,
                                "h-full pl-11 border-none shadow-none bg-transparent text-xs",
                                template.mood === 'bold' ? "placeholder:text-black/30" : ""
                            )}
                        />
                    </div>
                </div>

                {/* Winners List */}
                <div className="space-y-6">
                    {filteredWinners.length > 0 ? (
                        filteredWinners.map((winner: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn("relative transition-all duration-500 hover:scale-[1.01] group", classes.card, "p-0 overflow-visible shadow-none border-none bg-transparent")}
                                style={{
                                    filter: `drop-shadow(0 20px 40px ${isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)'})`
                                }}
                            >
                                {/* The Ticket Body with Side Cutouts */}
                                <div
                                    className={cn("relative flex flex-col md:flex-row items-stretch min-h-[170px]", classes.card, "p-0 border-none")}
                                    style={{
                                        WebkitMaskImage: 'radial-gradient(circle at 0px 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)',
                                        maskImage: 'radial-gradient(circle at 0px 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)',
                                        WebkitMaskComposite: 'source-over',
                                        maskComposite: 'intersect',
                                        borderRadius: '24px'
                                    }}
                                >
                                    {/* Left Side: The Number (Cupom Style) */}
                                    <div className="bg-primary/5 md:w-64 p-8 flex flex-col items-center justify-center relative z-10">
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 opacity-60">Nº da Sorte</div>
                                        <div className="flex gap-1.5">
                                            {winner.numero.toString().padStart(5, '0').split('').map((digit: string, dIdx: number) => (
                                                <span
                                                    key={dIdx}
                                                    className={cn(
                                                        "w-9 h-11 flex items-center justify-center text-xl font-black rounded-lg border-2 border-primary/20 bg-white/50 backdrop-blur-sm shadow-sm",
                                                        classes.heading
                                                    )}
                                                >
                                                    {digit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Perforation Line */}
                                    <div className="hidden md:block w-[3px] relative z-20">
                                        <div
                                            className="absolute inset-y-4 left-0 w-full opacity-30"
                                            style={{
                                                backgroundImage: `radial-gradient(circle, var(--primary) 1.5px, transparent 1.5px)`,
                                                backgroundSize: '1px 10px',
                                                backgroundRepeat: 'repeat-y'
                                            }}
                                        />
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="flex-1 p-8 pr-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden z-10">
                                        <div className="flex-1 text-center md:text-left min-w-0">
                                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                                                <h3 className={cn("text-2xl md:text-3xl font-black tracking-tight leading-none italic uppercase truncate", classes.heading)}>
                                                    {winner.lead.nome.replace(/(.{1,2})(.*)(.{1,1})/, '$1***$3')}
                                                </h3>
                                                {winner.lead.cpf && (
                                                    <span className="px-2 py-0.5 bg-black text-[9px] text-white font-mono rounded-full self-center md:self-auto">
                                                        CPF: {winner.lead.cpf.replace(/(\d{3})\.(\d{3})\.(.*)/, '$1.***.***-$3')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                                <div className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight shadow-md transition-transform group-hover:scale-105 duration-300", classes.badge)}>
                                                    <Trophy className="w-4 h-4" />
                                                    {winner.prizeName || "Prêmio Especial"}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Sorteio Validado
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side Info (Audit) */}
                                        <div className="hidden lg:flex flex-col items-center gap-4 pl-8 border-l border-dashed border-primary/10">
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map((star) => (
                                                    <Star key={star} className="w-5 h-5 fill-primary/10 text-primary/20" />
                                                ))}
                                            </div>
                                            <div className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] [writing-mode:vertical-lr] rotate-180">
                                                Auditado com Sucesso
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className={cn("py-24 text-center rounded-[40px] border p-12 shadow-sm", classes.card)}>
                            <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className={cn("text-2xl font-black", classes.heading)}>Nenhum ganhador correspondente</h3>
                            <p className={cn("font-medium mt-2 max-w-xs mx-auto", classes.muted)}>
                                Verifique se o termo pesquisado está correto ou se a lista ainda não foi totalmente processada.
                            </p>
                        </div>
                    )}
                </div>

                {/* LGPD Disclaimer */}
                <div className={cn("mt-16 p-10 border rounded-[40px] shadow-sm flex flex-col md:flex-row items-center gap-8 text-center md:text-left", classes.card)}>
                    <div className={cn("h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shrink-0 transition-transform hover:rotate-12")}>
                        <Shield className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h4 className={cn("text-xl font-black leading-tight mb-2", classes.heading)}>Privacidade Garantida (LGPD)</h4>
                        <p className={cn("text-sm font-medium leading-relaxed max-w-3xl", classes.muted)}>
                            Em conformidade com a Lei Geral de Proteção de Dados, ocultamos parte das informações pessoais dos ganhadores.
                            A verificação completa e entrega oficial do prêmio é garantida pela <span className="text-primary font-bold">{enquete.titulo}</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className={cn("max-w-5xl mx-auto px-6 text-center border-t border-border mt-10 pt-16 pb-24 opacity-60", classes.muted)}>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span>Powered by Synkra AIOS</span>
                    <span className="hidden md:inline opacity-30">|</span>
                    <span>Protocolo de Auditoria v2.5.0</span>
                </div>
            </footer>
        </div>
    );
}

export default function WinnersPublicPage() {
    const { slug } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['public-winners', slug],
        queryFn: async () => {
            const res = await axios.get(`/api/enquetes/public/${slug}/winners`);
            return res.data;
        },
        retry: false
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-8">Verificando Ganhadores Oficiais...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="h-24 w-24 bg-rose-500/10 rounded-[40px] flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-xl shadow-rose-500/10">
                    <X className="w-10 h-10" strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-black text-foreground mb-4 tracking-tight">Ops! Ganhadores não disponíveis</h1>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                    {(error as any)?.response?.data?.error || "A lista de ganhadores ainda não foi publicada para esta enquete."}
                </p>
                <Link href="/" className="mt-10 px-8 py-3 bg-card border border-border rounded-2xl text-foreground font-bold hover:bg-muted transition-all shadow-sm">
                    Voltar ao Início
                </Link>
            </div>
        );
    }

    const { enquete, winners } = data;

    return (
        <VoteTemplateProvider
            templateName={enquete.configVisual?.template}
            primaryColor={enquete.configVisual?.primaryColor}
            logoUrl={enquete.configVisual?.logoUrl}
            bannerUrl={enquete.configVisual?.bannerUrl}
        >
            <ThemeProvider themeConfig={enquete.configVisual}>
                <WinnersContent enquete={enquete} winners={winners} />
            </ThemeProvider>
        </VoteTemplateProvider>
    );
}
