import React from 'react';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';

interface StrategySelectorProps {
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
}

export function StrategySelector({ register, watch }: StrategySelectorProps) {
    const currentStrategy = watch('strategy');

    return (
        <div className="grid grid-cols-1 gap-6 p-6 bg-muted/20 border border-border rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-[4rem] -mr-4 -mt-4 pointer-events-none" />

            <div className="space-y-2 relative z-10">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block">Estratégia de Envio</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'DIRECT', label: 'Direto', desc: 'Envia a mensagem com o link diretamente.' },
                        { id: 'SOFT_BLOCK', label: 'Soft Block', desc: 'Adiciona opção "Não quero mais" para evitar denúncias.' },
                        { id: 'OPT_IN', label: 'Dupla Confirmação', desc: 'Pergunta antes de enviar o link. Melhora engajamento.' }
                    ].map((strat) => (
                        <label key={strat.id} className={cn(
                            "relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]",
                            currentStrategy === strat.id
                                ? "bg-card border-primary shadow-lg shadow-primary/10"
                                : "bg-card/50 border-transparent hover:border-primary/20"
                        )}>
                            <input
                                type="radio"
                                value={strat.id}
                                {...register('strategy')}
                                className="sr-only"
                            />
                            <span className="text-xs font-black uppercase tracking-wider mb-1 block text-foreground">
                                {strat.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-snug">
                                {strat.desc}
                            </span>
                            {currentStrategy === strat.id && (
                                <div className="absolute top-3 right-3 text-primary">
                                    <CheckCircle2 size={16} className="fill-primary/20" />
                                </div>
                            )}
                        </label>
                    ))}
                </div>
            </div>

            {currentStrategy === 'OPT_IN' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block flex items-center gap-2">
                        <MessageSquare size={12} />
                        Mensagem de Abordagem (Pergunta Inicial)
                    </label>
                    <div className="relative">
                        <textarea
                            rows={2}
                            {...register('initialMessage')}
                            className="w-full rounded-xl bg-background border-input p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder-muted-foreground resize-none"
                            placeholder="Ex: Olá! Posso te enviar o link da pesquisa?"
                        />
                        <div className="absolute bottom-3 right-3 flex gap-2 pointer-events-none opacity-50">
                            <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded">{"{{nome}}"}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
