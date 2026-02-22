"use client";

import React, { use, useState } from 'react';
import {
    ChevronLeft,
    Play,
    RotateCcw,
    BarChart3,
    CheckCircle2,
    AlertCircle,
    Clock,
    Send,
    Eye,
    MessageSquare,
    Users,
    Loader2,
    Pause,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCampanha, useStartCampanha, usePauseCampanha, useCancelCampanha } from '@/hooks/use-campanhas';
import { ResourceLoader } from '@/components/ui/ResourceLoader';
import { PageHeader } from '@/components/admin/PageHeader';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function CampanhaDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const { data: campanha, isLoading, refetch } = useCampanha(id);
    const startMutation = useStartCampanha();
    const pauseMutation = usePauseCampanha();
    const cancelMutation = useCancelCampanha();
    const [confirmModal, setConfirmModal] = useState<{ open: boolean, title: string, description: string, onConfirm: () => void, type: 'info' | 'warning' | 'danger' }>({
        open: false,
        title: "",
        description: "",
        onConfirm: () => { },
        type: 'info'
    });
    const [alertModal, setAlertModal] = useState<{ open: boolean, title: string, description: string, type: 'danger' | 'success' }>({
        open: false,
        title: "",
        description: "",
        type: 'danger'
    });

    if (isLoading) return <ResourceLoader icon="trophy" label="Carregando Campanha..." />;
    if (!campanha) return <div>Campanha não encontrada.</div>;

    const handleStart = async () => {
        setConfirmModal({
            open: true,
            title: "Iniciar Campanha?",
            description: "Deseja iniciar o processamento da fila de disparos agora?",
            type: 'info',
            onConfirm: async () => {
                try {
                    await startMutation.mutateAsync(id);
                    refetch();
                } catch (error: any) {
                    setAlertModal({ open: true, title: "Erro ao Iniciar", description: error.message, type: 'danger' });
                }
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
    };

    const handlePause = async () => {
        setConfirmModal({
            open: true,
            title: "Pausar Campanha?",
            description: "Deseja pausar os disparos temporariamente?",
            type: 'warning',
            onConfirm: async () => {
                try {
                    await pauseMutation.mutateAsync(id);
                    refetch();
                } catch (error: any) {
                    setAlertModal({ open: true, title: "Erro ao Pausar", description: error.message, type: 'danger' });
                }
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
    };

    const handleCancel = async () => {
        setConfirmModal({
            open: true,
            title: "CANCELAR CAMPANHA?",
            description: "Deseja CANCELAR definitivamente esta campanha? Esta ação não pode ser desfeita.",
            type: 'danger',
            onConfirm: async () => {
                try {
                    await cancelMutation.mutateAsync(id);
                    refetch();
                } catch (error: any) {
                    setAlertModal({ open: true, title: "Erro ao Cancelar", description: error.message, type: 'danger' });
                }
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'RASCUNHO': return { label: 'Rascunho', color: 'bg-muted text-muted-foreground', icon: Clock };
            case 'AGENDADA': return { label: 'Agendada', color: 'bg-primary/10 text-primary', icon: Clock };
            case 'PAUSADA': return { label: 'Pausada', color: 'bg-amber-500/10 text-amber-500', icon: Pause };
            case 'EM_ANDAMENTO': return { label: 'Em Andamento', color: 'bg-primary/10 text-primary', icon: Play };
            case 'CONCLUIDA': return { label: 'Concluída', color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle2 };
            case 'CANCELADA': return { label: 'Cancelada', color: 'bg-destructive/10 text-destructive', icon: AlertCircle };
            default: return { label: status, color: 'bg-muted text-muted-foreground', icon: Clock };
        }
    };

    const statusInfo = getStatusInfo(campanha.status);
    const StatusIcon = statusInfo.icon;

    const stats = [
        { label: 'Total Leads', value: campanha.totalLeads, icon: Users, color: 'text-foreground/70' },
        { label: 'Enviados', value: campanha.totalEnviados, icon: Send, color: 'text-primary' },
        { label: 'Visualizados', value: campanha.totalVisualizados, icon: Eye, color: 'text-blue-500' },
        { label: 'Votos', value: campanha.totalRespondidos, icon: MessageSquare, color: 'text-emerald-500' },
        { label: 'Falhas', value: campanha.totalFalhados, icon: AlertCircle, color: 'text-destructive' },
    ];

    const progress = campanha.totalLeads > 0
        ? Math.round(((campanha.totalEnviados + campanha.totalFalhados) / campanha.totalLeads) * 100)
        : 0;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 min-h-screen">
            <Link href="/admin/campanhas">
                <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground font-bold uppercase text-[10px] tracking-widest">
                    <ChevronLeft size={16} className="mr-2" />
                    Voltar para Lista
                </Button>
            </Link>

            <PageHeader
                title={campanha.nome}
                description={`Enquete: ${campanha.enquete?.titulo}`}
                badgeText="Painel de Monitoramento"
            >
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="rounded-2xl border-border h-12 px-6 font-black uppercase text-xs tracking-widest"
                    >
                        <RotateCcw size={18} className="mr-2" />
                        Atualizar
                    </Button>
                    {(campanha.status === 'RASCUNHO' || campanha.status === 'PAUSADA') && (
                        <button
                            onClick={handleStart}
                            disabled={startMutation.isPending}
                            className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {startMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                            {campanha.status === 'PAUSADA' ? 'Retomar Disparos' : 'Iniciar Disparos'}
                        </button>
                    )}

                    {campanha.status === 'EM_ANDAMENTO' && (
                        <>
                            <Button
                                onClick={handlePause}
                                variant="outline"
                                disabled={pauseMutation.isPending}
                                className="border-amber-500/50 text-amber-600 hover:bg-amber-50 rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-xs flex items-center gap-2"
                            >
                                {pauseMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Pause size={18} />}
                                Pausar
                            </Button>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                disabled={cancelMutation.isPending}
                                className="border-destructive/50 text-destructive hover:bg-destructive/5 rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-xs flex items-center gap-2"
                            >
                                {cancelMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                Cancelar
                            </Button>
                        </>
                    )}

                    {campanha.status === 'AGENDADA' && (
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            disabled={cancelMutation.isPending}
                            className="border-destructive/50 text-destructive hover:bg-destructive/5 rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-xs flex items-center gap-2"
                        >
                            {cancelMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                            Cancelar Agendamento
                        </Button>
                    )}
                </div>
            </PageHeader>

            {/* Progress Card */}
            <div className="bg-card rounded-[40px] border border-border p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", statusInfo.color)}>
                            <StatusIcon size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status Atual</span>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-tighter">{statusInfo.label}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Progresso do Envio</span>
                        <div className="text-2xl font-black text-foreground tracking-tighter">{progress}%</div>
                    </div>
                </div>

                <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-card rounded-[32px] border border-border p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                        <div className="h-10 w-10 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{stat.label}</span>
                        <div className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                {/* Campaign Info */}
                <div className="bg-card rounded-[40px] border border-border p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 size={20} className="text-primary" />
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Detalhes da Campanha</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Configuração de Mensagens</span>
                            <div className="bg-muted/10 rounded-2xl p-4 text-xs font-medium text-muted-foreground whitespace-pre-wrap italic border border-border/50">
                                {Array.isArray(campanha.mensagens)
                                    ? `${campanha.mensagens.length} mensagem(ns) configurada(s) na sequência.`
                                    : "Mensagens configuradas em formato JSON."}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Criada em</span>
                                <span className="text-sm font-bold text-foreground">
                                    {format(new Date(campanha.criadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Intervalo (Random)</span>
                                <span className="text-sm font-bold text-foreground">{campanha.intervaloMin}s - {campanha.intervaloMax}s</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Tracking Links */}
                <div className="bg-card rounded-[40px] border border-border p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Users size={20} className="text-primary" />
                            <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Últimos Leads (Amostra)</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {campanha.trackingLinks?.map((link: any) => (
                            <div key={link.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl hover:bg-muted/20 transition-all border border-transparent hover:border-border">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center text-xs font-black text-primary border border-border">
                                        {link.lead?.nome?.substring(0, 1) || 'L'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-foreground">{link.lead?.nome || 'Lead s/ Nome'}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground">{link.lead?.whatsapp}</div>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    link.status === 'RESPONDIDO' ? "bg-emerald-500/10 text-emerald-500" :
                                        link.status === 'ENVIADO' ? "bg-primary/10 text-primary" :
                                            link.status === 'VISUALIZADO' ? "bg-amber-500/10 text-amber-500" :
                                                "bg-muted text-muted-foreground"
                                )}>
                                    {link.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                title={confirmModal.title}
                description={confirmModal.description}
                type={confirmModal.type}
                confirmLabel="Confirmar"
                onConfirm={confirmModal.onConfirm}
                isLoading={startMutation.isPending || pauseMutation.isPending || cancelMutation.isPending}
            />

            <Modal
                isOpen={alertModal.open}
                onClose={() => setAlertModal(prev => ({ ...prev, open: false }))}
                title={alertModal.title}
                description={alertModal.description}
                type={alertModal.type}
                confirmLabel="Entendi"
                onConfirm={() => setAlertModal(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
}
