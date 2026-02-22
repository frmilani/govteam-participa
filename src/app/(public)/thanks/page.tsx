"use client";

import React from 'react';
import { CheckCircle2, Share2, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ThanksPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 p-12 text-center animate-in zoom-in duration-500">
                <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <CheckCircle2 size={48} />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Voto Registrado!</h1>
                <p className="text-slate-500 font-medium mb-8">
                    Obrigado por participar do **Prêmio Destaque 2025**. Sua opinião é fundamental para valorizar o comércio local.
                </p>

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Compartilhe essa votação</p>
                    <div className="flex gap-2 justify-center">
                        <Button className="h-12 w-12 p-0 rounded-2xl bg-[#E1306C] hover:bg-[#C13584] border-none text-white">
                            <Instagram size={20} />
                        </Button>
                        <Button className="h-12 w-12 p-0 rounded-2xl bg-[#1877F2] hover:bg-[#0D65D9] border-none text-white">
                            <Facebook size={20} />
                        </Button>
                        <Button variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200 gap-2 font-bold text-sm">
                            <Share2 size={18} />
                            Outros
                        </Button>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-50">
                    <Link href="/" className="text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                        Voltar para o Início
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Powered by FormEngine Hub
            </p>
        </div>
    );
}
