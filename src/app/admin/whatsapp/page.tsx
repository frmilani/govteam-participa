"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Smartphone,
    Plus,
    Loader2,
    Trash2,
    QrCode,
    Wifi,
    WifiOff,
    RefreshCw,
    CheckCircle2,
    HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api-client';

interface WhatsappInstance {
    id: string;
    name: string;
    number: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
    qrcode?: string;
    updatedAt: string;
}

export default function WhatsappPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isConnectOpen, setIsConnectOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState<WhatsappInstance | null>(null);
    const [newInstanceName, setNewInstanceName] = useState('');
    const [newInstanceNumber, setNewInstanceNumber] = useState('');
    const [confirmDeleteInput, setConfirmDeleteInput] = useState('');
    const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
    const [currentQrCode, setCurrentQrCode] = useState<string | null>(null);

    // --- QUERIES ---
    const { data: instances = [], isLoading } = useQuery({
        queryKey: ['whatsapp-instances'],
        queryFn: async () => {
            const res = await apiFetch('/api/whatsapp/instances');
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Erro ao carregar instâncias");
            return res.json() as Promise<WhatsappInstance[]>;
        }
    });

    // --- MUTATIONS ---
    const addMutation = useMutation({
        mutationFn: async (data: { name: string, number: string }) => {
            const res = await apiFetch('/api/whatsapp/instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) {
                const errorData: any = await res.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || "Erro ao criar instância");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp-instances'] });
            setIsAddOpen(false);
            setNewInstanceName('');
            setNewInstanceNumber('');
            showToast("Instância criada e inicializada com sucesso!", "success");
        },
        onError: (err: any) => showToast(err.message, "error")
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/whatsapp/instances/${id}`, {
                method: 'DELETE'
            });
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Erro ao excluir instância");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp-instances'] });
            setIsDeleteOpen(false);
            setSelectedInstance(null);
            setConfirmDeleteInput('');
            showToast("Instância excluída com sucesso!", "success");
        },
        onError: (err: any) => showToast(err.message, "error")
    });

    const connectMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/whatsapp/instances/${id}/connect`, {
                method: 'POST'
            });
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) {
                const errorData: any = await res.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || "Erro ao solicitar conexão");
            }
            return res.json() as Promise<{ qrcode?: string }>;
        },
        onSuccess: (data) => {
            if (data.qrcode) setCurrentQrCode(data.qrcode);
            queryClient.invalidateQueries({ queryKey: ['whatsapp-instances'] });
        },
        onError: (err: any) => showToast(err.message, "error")
    });

    const statusMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/whatsapp/instances/${id}/status`);
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Erro ao verificar status");
            return res.json() as Promise<{ status: string, qrcode?: string }>;
        },
        onSuccess: (data, id) => {
            if (activeInstanceRef.current === id) {
                if (data.status === 'CONNECTED') {
                    setIsConnectOpen(false);
                    showToast("Conectado com sucesso!", "success");
                    queryClient.invalidateQueries({ queryKey: ['whatsapp-instances'] });
                }
                if (data.qrcode) {
                    setCurrentQrCode(data.qrcode);
                }
            }
        }
    });

    const disconnectMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/api/whatsapp/instances/${id}/disconnect`, {
                method: 'POST'
            });
            if (res.denied) throw new Error("HPAC_DENIED");
            if (!res.ok) throw new Error("Erro ao desconectar instância");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp-instances'] });
            setIsDisconnectOpen(false);
            setSelectedInstance(null);
            showToast("Instância desconectada com sucesso!", "success");
        },
        onError: (err: any) => showToast(err.message, "error")
    });

    // We need a ref to know which instance is currently being connected to avoid status updates from closing modal wrongly
    const activeInstanceRef = React.useRef<string | null>(null);

    useEffect(() => {
        activeInstanceRef.current = selectedInstance?.id || null;
        setCurrentQrCode(selectedInstance?.qrcode || null);
    }, [selectedInstance]);

    // --- EFFECTS ---
    // Polling de status a cada 3s
    useEffect(() => {
        let interval: NodeJS.Timeout;
        const id = activeInstanceRef.current;
        if (isConnectOpen && id) {
            interval = setInterval(() => {
                statusMutation.mutate(id);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isConnectOpen]);

    // Refresh de conexão a cada 20s se não conectar
    useEffect(() => {
        let interval: NodeJS.Timeout;
        const id = activeInstanceRef.current;
        if (isConnectOpen && id) {
            interval = setInterval(() => {
                // Forçar renovação do QR Code chamando connect novamente
                console.log("[UI] Renovando QR Code após 20s...");
                connectMutation.mutate(id);
            }, 20000);
        }
        return () => clearInterval(interval);
    }, [isConnectOpen]);


    // --- HANDLERS ---
    const handleAdd = () => {
        if (!newInstanceName || !newInstanceNumber) {
            showToast("Nome e Número são obrigatórios", "error");
            return;
        }
        addMutation.mutate({ name: newInstanceName, number: newInstanceNumber });
    };

    const handleConnectClick = (instance: WhatsappInstance) => {
        setSelectedInstance(instance);
        setIsConnectOpen(true);
        connectMutation.mutate(instance.id);
    };

    const handleDeleteClick = (instance: WhatsappInstance) => {
        setSelectedInstance(instance);
        setIsDeleteOpen(true);
    };

    const handleDisconnectClick = (instance: WhatsappInstance) => {
        setSelectedInstance(instance);
        setIsDisconnectOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedInstance && confirmDeleteInput === selectedInstance.number) {
            deleteMutation.mutate(selectedInstance.id);
        } else {
            showToast("O número digitado não confere", "error");
        }
    };

    const handleConfirmDisconnect = () => {
        if (selectedInstance) {
            disconnectMutation.mutate(selectedInstance.id);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title={
                    <span className="flex items-center gap-3">
                        <Smartphone className="h-8 w-8 text-primary" />
                        Conexões WhatsApp
                    </span>
                }
                description="Gerencie suas instâncias do WhatsApp para envio de campanhas."
            >
                <Button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nova Conexão
                </Button>
            </PageHeader>

            {/* Instance Grid */}
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : instances.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card rounded-[40px] border border-border/50 text-center space-y-4">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                        <Smartphone className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Nenhuma conexão encontrada</h3>
                        <p className="text-sm text-muted-foreground">Adicione uma nova instância para começar a disparar suas campanhas.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {instances.map((instance) => (
                        <div
                            key={instance.id}
                            className="group bg-card hover:bg-card/50 border border-border hover:border-primary/20 rounded-3xl p-6 transition-all duration-300 shadow-sm relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                                    instance.status === 'CONNECTED' ? "bg-emerald-500/10 text-emerald-500" :
                                        instance.status === 'CONNECTING' ? "bg-amber-500/10 text-amber-500" :
                                            "bg-destructive/10 text-destructive"
                                )}>
                                    <Smartphone size={24} />
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5",
                                    instance.status === 'CONNECTED' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                        instance.status === 'CONNECTING' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                            "bg-destructive/10 text-destructive border border-destructive/20"
                                )}>
                                    {instance.status === 'CONNECTED' ? <Wifi size={12} /> :
                                        instance.status === 'CONNECTING' ? <RefreshCw size={12} className="animate-spin" /> :
                                            <WifiOff size={12} />}
                                    {instance.status === 'CONNECTED' ? 'Conectado' :
                                        instance.status === 'CONNECTING' ? 'Conectando...' :
                                            'Desconectado'}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(instance)}
                                    className="text-destructive hover:bg-destructive/10 rounded-xl p-2 h-auto"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>

                            <h3 className="text-xl font-black text-foreground mb-1">{instance.name}</h3>
                            <p className="text-sm text-muted-foreground font-medium mb-6">{instance.number || 'Sem número verificado'}</p>

                            <div className="flex gap-2">
                                {instance.status === 'CONNECTED' ? (
                                    <Button
                                        onClick={() => handleDisconnectClick(instance)}
                                        variant="outline"
                                        className="flex-1 h-10 rounded-xl font-bold uppercase text-[10px] tracking-wider border-destructive text-destructive hover:bg-destructive/10"
                                    >
                                        Desconectar
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleConnectClick(instance)}
                                        className="bg-primary hover:bg-primary/90 text-white flex-1 h-10 rounded-xl font-bold uppercase text-[10px] tracking-wider"
                                    >
                                        Conectar
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            <Modal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Nova Conexão"
                description="Adicione uma nova instância do WhatsApp para disparos."
                confirmLabel="Criar"
                onConfirm={handleAdd}
                isLoading={addMutation.isPending}
            >
                <div className="space-y-4 py-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Nome da Conexão</label>
                        <Input
                            placeholder="Ex: Comercial 1"
                            value={newInstanceName}
                            onChange={(e) => setNewInstanceName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Número (Opcional)</label>
                        <Input
                            placeholder="5562999999999"
                            value={newInstanceNumber}
                            onChange={(e) => setNewInstanceNumber(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>

            {/* Connect Modal (QR Code) */}
            <Modal
                isOpen={isConnectOpen}
                onClose={() => setIsConnectOpen(false)}
                title={`Conectar: ${selectedInstance?.name}`}
                description="Escaneie o QR Code com seu WhatsApp para conectar."
                confirmLabel="Fechar"
                onConfirm={() => setIsConnectOpen(false)}
                cancelLabel="Cancelar"
            // Using props as-is, "Cancelar" will also close it. 
            // Ideally we want to hide "Confirmar" or change it if connected. 
            // But this modal structure forces buttons.
            >
                <div className="flex flex-col items-center justify-center p-8 space-y-6">
                    {connectMutation.isPending ? (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <Loader2 size={48} className="animate-spin text-primary" />
                            <p className="text-sm font-bold uppercase tracking-wider">Gerando QR Code...</p>
                        </div>
                    ) : currentQrCode ? (
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-border">
                            {/* Base64 Image */}
                            <img src={currentQrCode.startsWith('data:') ? currentQrCode : `data:image/png;base64,${currentQrCode}`} alt="QR Code WhatsApp" className="w-64 h-64 object-contain" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-destructive">
                            <WifiOff size={48} />
                            <p className="text-sm font-bold">Falha ao carregar QR Code</p>
                            {connectMutation.error && (
                                <p className="text-xs text-center px-4 break-words max-w-full">
                                    {(connectMutation.error as Error).message}
                                </p>
                            )}
                            <Button variant="outline" size="sm" onClick={() => { if (selectedInstance) connectMutation.mutate(selectedInstance.id) }}>Tentar Novamente</Button>
                        </div>
                    )}

                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Abra o WhatsApp no seu celular {'>'} Configurações {'>'} Aparelhos Conectados {'>'} <strong>Conectar Aparelho</strong></p>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">
                            <RefreshCw size={12} className="animate-spin" />
                            Aguardando conexão...
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setConfirmDeleteInput('');
                }}
                title="Excluir Conexão"
                description={`Para confirmar a exclusão da instância "${selectedInstance?.name}", digite o número ${selectedInstance?.number} abaixo:`}
                confirmLabel="Confirmar Exclusão"
                onConfirm={handleConfirmDelete}
                confirmVariant="danger"
                isLoading={deleteMutation.isPending}
                disableConfirm={confirmDeleteInput !== selectedInstance?.number}
            >
                <div className="py-4 space-y-4">
                    <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20 flex gap-3 items-start">
                        <Trash2 className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div className="text-xs text-destructive font-medium leading-relaxed">
                            Esta ação é irreversível. A instância será removida permanentemente do painel e da UazAPI.
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Confirmar Número</label>
                        <Input
                            placeholder={selectedInstance?.number || "Digite o número aqui"}
                            value={confirmDeleteInput}
                            onChange={(e) => setConfirmDeleteInput(e.target.value)}
                            className="text-center font-mono tracking-widest"
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isDisconnectOpen}
                onClose={() => setIsDisconnectOpen(false)}
                title="Desconectar Instância"
                description={`Tem certeza que deseja desconectar a instância "${selectedInstance?.name}"? Você precisará escanear o QR Code novamente para reconectar.`}
                confirmLabel="Sim, Desconectar"
                onConfirm={handleConfirmDisconnect}
                confirmVariant="danger"
                isLoading={disconnectMutation.isPending}
            >
                <div className="py-4">
                    <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex gap-3 items-start">
                        <HelpCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-600 font-medium leading-relaxed">
                            A desconexão encerrará a sessão ativa no WhatsApp deste aparelho.
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
