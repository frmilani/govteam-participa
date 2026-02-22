"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Trophy,
    Search,
    Loader2,
    X,
    Eye,
    Award,
    Star,
    Crown,
    ChevronRight,
    ArrowLeft,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeProvider } from '@/components/form-engine/ThemeProvider';
import { VoteTemplateProvider, useVoteTemplate } from '@/components/voting/VoteTemplateContext';

function ResultsContent({ enquete, rankings }: { enquete: any, rankings: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const { template, classes, isDarkMode } = useVoteTemplate();

    const config = enquete.configResultados || { exibirVotos: true, exibirPercentual: true };

    const filteredRankings = rankings.filter((seg: any) =>
        seg.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seg.ranking?.some((r: any) => r.estabelecimento.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className={cn("min-h-screen selection:bg-primary/10 transition-colors duration-500", classes.pageWrapper)}>
            {/* Header / Hero Section */}
            <div className={cn("relative overflow-hidden flex flex-col items-center justify-center py-20 px-6", classes.banner)}>
                {/* Abstract Orbs / Background elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                {/* Theme Overlay (Gradient) */}
                <div className={classes.bannerOverlay} />

                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn("inline-flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-full border mb-6", classes.badge)}
                    >
                        <Award className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Apuração Oficial</span>
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
                        {enquete.descricao || "Confira os destaques eleitos pelo voto popular e celebre conosco o mérito e a excelência local."}
                    </motion.p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 py-12 relative z-20">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center mx-auto max-w-2xl mb-12">
                    <div className={cn(
                        "flex-1 relative group w-full transition-all duration-300",
                        template.mood === 'bold' ? "" : (isDarkMode ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"),
                        classes.card,
                        "shadow-none hover:shadow-md h-12"
                    )}>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar categoria ou estabelecimento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cn(
                                classes.input,
                                "h-full pl-11 border-none shadow-none bg-transparent text-xs",
                                template.mood === 'bold' ? "placeholder:text-black/30" : ""
                            )}
                        />
                    </div>
                    <div className={cn("shrink-0 h-12 px-5 flex items-center justify-center text-[9px] font-black uppercase tracking-[0.2em]", classes.badge)}>
                        {filteredRankings.length} Categorias
                    </div>
                </div>

                {/* Rankings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRankings.length > 0 ? (
                        filteredRankings.map((seg: any, idx: number) => {
                            const winner = seg.ranking?.[0];
                            return (
                                <motion.div
                                    key={seg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    onClick={() => setSelectedCategory(seg)}
                                    className={cn("group rounded-[40px] p-8 transition-all cursor-pointer overflow-hidden relative shadow-sm hover:shadow-2xl hover:-translate-y-2", classes.card)}
                                >
                                    {/* Winner Decoration */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <Badge variant="outline" className={cn("border-border text-[10px] font-black uppercase tracking-widest py-1 px-3", classes.muted)}>
                                            {seg.nome}
                                        </Badge>
                                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <Crown className="w-5 h-5" />
                                        </div>
                                    </div>

                                    {winner ? (
                                        <div className="space-y-6 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border text-xl font-black overflow-hidden shrink-0", isDarkMode ? "bg-white/5 border-white/10 text-white/40" : "bg-black/5 border-black/5 text-black/20")}>
                                                    {winner.estabelecimento.logoUrl ? (
                                                        <img src={winner.estabelecimento.logoUrl} alt={winner.estabelecimento.nome} className="w-full h-full object-contain p-2" />
                                                    ) : (
                                                        winner.estabelecimento.nome.charAt(0)
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className={cn("text-xl font-black truncate leading-tight", classes.heading)}>
                                                        {winner.estabelecimento.nome}
                                                    </h3>
                                                    <p className="text-primary text-xs font-black uppercase tracking-widest mt-1">Vencedor</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 pt-4 border-t border-border">
                                                {config.exibirVotos && (
                                                    <div className="flex-1">
                                                        <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1 block", classes.muted)}>Votos</span>
                                                        <p className={cn("text-lg font-black", classes.heading)}>{winner.votos}</p>
                                                    </div>
                                                )}
                                                {config.exibirPercentual && (
                                                    <div className="flex-1">
                                                        <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1 block", classes.muted)}>Preferência</span>
                                                        <p className="text-lg font-black text-primary">{winner.percentual}%</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={cn("p-4 rounded-2xl flex items-center justify-center gap-2 transition-all group-hover:bg-primary group-hover:text-primary-foreground", isDarkMode ? "bg-white/5" : "bg-black/5")}>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Ver Ranking Completo</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={cn("py-12 text-center font-bold uppercase tracking-widest text-xs italic opacity-50", classes.text)}>
                                            Sem dados de apuração
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })
                    ) : (
                        <div className={cn("col-span-full py-20 text-center rounded-[40px] border p-12 shadow-sm", classes.card)}>
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className={cn("text-xl font-black", classes.heading)}>Nenhum resultado encontrado</h3>
                            <p className={cn("font-medium mt-1", classes.muted)}>Tente ajustar seus termos de busca.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed View Modal */}
            <AnimatePresence>
                {selectedCategory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setSelectedCategory(null)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={cn("relative w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border", classes.card)}
                        >
                            <div className="p-8 md:p-12 overflow-y-auto">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex-1">
                                        <Badge className="bg-primary/10 text-primary border-none mb-4 px-3 py-1 font-black uppercase text-[10px] tracking-widest">
                                            {selectedCategory.nome}
                                        </Badge>
                                        <h2 className={cn("text-3xl font-black tracking-tight leading-tight italic uppercase", classes.heading)}>
                                            Ranking de Destaques
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-all border border-border"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {selectedCategory.ranking?.map((res: any) => (
                                        <div
                                            key={res.posicao}
                                            className={cn(
                                                "p-6 rounded-[32px] border transition-all flex items-center justify-between gap-4",
                                                res.posicao === 1
                                                    ? "bg-primary/5 border-primary shadow-xl shadow-primary/5 ring-4 ring-primary/5 ring-offset-background"
                                                    : "bg-muted/30 border-border"
                                            )}
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 shadow-sm",
                                                    res.posicao === 1 ? "bg-primary text-primary-foreground" : cn("bg-card text-muted-foreground border border-border", classes.card)
                                                )}>
                                                    {res.posicao}º
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className={cn("font-black truncate", classes.heading)}>{res.estabelecimento.nome}</h4>
                                                    {res.posicao === 1 && (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <Trophy className="w-3 h-3 text-primary" />
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Vencedor Oficial</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8 text-right shrink-0">
                                                {config.exibirVotos && (
                                                    <div>
                                                        <span className={cn("text-[9px] font-black uppercase tracking-widest block", classes.muted)}>Votos</span>
                                                        <span className={cn("font-black", classes.heading)}>{res.votos}</span>
                                                    </div>
                                                )}
                                                {config.exibirPercentual && (
                                                    <div>
                                                        <span className={cn("text-[9px] font-black uppercase tracking-widest block", classes.muted)}>Perc.</span>
                                                        <span className={cn("font-black", res.posicao === 1 ? "text-primary" : classes.muted)}>
                                                            {res.percentual}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={cn("mt-12 pt-8 border-t border-border flex items-center justify-between italic font-medium text-xs", classes.muted)}>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Apuração auditada Sistema Sentinela
                                    </div>
                                    <span>Atualizado em tempo real</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer Branding */}
            <footer className={cn("max-w-6xl mx-auto px-6 text-center border-t border-border mt-10 pt-16 pb-24 opacity-60", classes.muted)}>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span>Powered by Synkra AIOS</span>
                    <span className="hidden md:inline opacity-30">|</span>
                    <span>Sistema Premio Destaque v2.5.0</span>
                </div>
            </footer>
        </div>
    );
}

export default function PublicRankingsPage() {
    const { slug } = useParams();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['public-rankings', slug],
        queryFn: async () => {
            const res = await axios.get(`/api/enquetes/public/${slug}/resultados`);
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
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-8">Carregando Resultados Oficiais...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="h-24 w-24 bg-rose-500/10 rounded-[40px] flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-xl shadow-rose-500/10">
                    <X className="w-10 h-10" strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-black text-foreground mb-4 tracking-tight">Ops! Dados não disponíveis</h1>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                    {(error as any)?.response?.data?.error || "Os resultados desta enquete ainda não foram publicados ou o link está incorreto."}
                </p>
                <Link href="/" className="mt-10 px-8 py-3 bg-card border border-border rounded-2xl text-foreground font-bold hover:bg-muted transition-all shadow-sm">
                    Sair
                </Link>
            </div>
        );
    }

    const { enquete, rankings } = data;

    return (
        <VoteTemplateProvider
            templateName={enquete.configVisual?.template}
            primaryColor={enquete.configVisual?.primaryColor}
            logoUrl={enquete.configVisual?.logoUrl}
            bannerUrl={enquete.configVisual?.bannerUrl}
        >
            <ThemeProvider themeConfig={enquete.configVisual}>
                <ResultsContent enquete={enquete} rankings={rankings} />
            </ThemeProvider>
        </VoteTemplateProvider>
    );
}
