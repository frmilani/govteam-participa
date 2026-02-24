import React from 'react';
import { Modal } from "@/components/ui/Modal";
import { ShieldCheck, Shield, Globe, Users, Lock } from "lucide-react";

interface ModoAcessoInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ModoAcessoInfoDialog({ isOpen, onClose }: ModoAcessoInfoDialogProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Modos de Acesso: Regras e Privacidade"
            description="Como funcionam os diferentes níveis de restrição e segurança de voto."
            maxWidth="max-w-3xl"
            confirmLabel="Entendi"
            onConfirm={onClose}
        >
            <div className="space-y-8 py-4">
                {/* Hero Section */}
                <div className="bg-foreground rounded-lg p-6 text-background relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-background/10 flex items-center justify-center border border-background/20 backdrop-blur-sm">
                            <ShieldCheck className="w-6 h-6 text-background" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold tracking-tight">Segurança do Voto</h4>
                            <p className="text-background/60 text-[10px] font-bold uppercase tracking-[0.2em]">Tecnologia Anti-Fraude</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-lg border border-border bg-muted/20 space-y-3 shadow-sm">
                        <div className="h-9 w-9 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h5 className="font-bold text-foreground text-sm uppercase tracking-wider">Urna Trancada</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            Com o acesso Restrito, a proteção impede o acesso via URL pública. Somente contas com Hash único conseguem visualizar o formulário.
                        </p>
                    </div>

                    <div className="p-5 rounded-lg border border-border bg-muted/20 space-y-3 shadow-sm">
                        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h5 className="font-bold text-foreground text-sm uppercase tracking-wider">Convites Únicos</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            Links com acesso restrito só podem ser enviados via Campanhas do módulo de disparo, gerando credenciais únicas por Lead que se auto-destroem após o voto.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-2">Tipos de Acessos</h5>

                    <div className="space-y-2">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border shadow-sm">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 flex justify-center items-center shrink-0 border border-emerald-500/30">
                                <ShieldCheck size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-xs font-bold text-foreground uppercase tracking-tight">Restrito</span>
                                    <span className="text-[10px] font-bold text-emerald-600 tabular-nums uppercase border border-emerald-600/30 bg-emerald-600/10 px-2 py-0.5 rounded-full">Alta Segurança</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-1">
                                    Link único por lead enviado pelo sistema de campanhas. Desativa o acesso à URL Pública.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border shadow-sm">
                            <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-600 flex justify-center items-center shrink-0 border border-blue-500/30">
                                <Globe size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-xs font-bold text-foreground uppercase tracking-tight">Público</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-1">
                                    Ideal para Votações Abertas. Qualquer pessoa com acesso à URL consegue votar livremente usando os próprios dados.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border shadow-sm">
                            <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-600 flex justify-center items-center shrink-0 border border-purple-500/30">
                                <Users size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-xs font-bold text-foreground uppercase tracking-tight">Híbrido</span>
                                    <span className="text-[10px] font-bold text-amber-600 tabular-nums uppercase border border-amber-600/30 bg-amber-600/10 px-2 py-0.5 rounded-full">Atenção à Duplicidade</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-1">
                                    Aceita votos orgânicos pela URL pública ao mesmo tempo em que recebe votos engajados pelos Envios de Campanhas (Limites menos restritos).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </Modal>
    );
}
