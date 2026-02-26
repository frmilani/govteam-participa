"use client";

import React, { useState } from 'react';
import {
  X,
  Plus,
  Search,
  Play,
  Pause,
  Edit3,
  Trash2,
  BarChart3,
  ExternalLink,
  Loader2,
  Layout,
  Copy,
  Check,
  Eye,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Globe,
  Users,
  HelpCircle,
  Lock,
  Gift,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { ResourceLoader } from '@/components/ui/ResourceLoader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEnquetes, useUpdateEnquete, useDeleteEnquete, useDuplicateEnquete } from '@/hooks/use-enquetes';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type EnqueteStatus = 'RASCUNHO' | 'PUBLICADA' | 'PAUSADA' | 'ENCERRADA';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

import { EnqueteForm } from '@/components/admin/enquete-form';
import { Modal } from '@/components/ui/Modal';
import { ModoAcessoInfoDialog } from '@/components/admin/ModoAcessoInfoDialog';
import { PageHeader } from '@/components/admin/PageHeader';

export default function EnquetesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnqueteStatus | "TODOS">("TODOS");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [statusData, setStatusData] = useState<{ id: string, status: EnqueteStatus } | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ open: boolean, title: string, description: string, type: 'info' | 'danger' | 'warning' | 'success' }>({
    open: false,
    title: "",
    description: "",
    type: 'info'
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModoAcessoModalOpen, setIsModoAcessoModalOpen] = useState(false);

  const { data: enquetes = [], isLoading } = useEnquetes({
    status: statusFilter === "TODOS" ? undefined : statusFilter,
    search: searchTerm
  });

  const updateMutation = useUpdateEnquete();
  const deleteMutation = useDeleteEnquete();
  const duplicateMutation = useDuplicateEnquete();

  const handleAddNew = () => {
    router.push('/admin/enquetes/nova');
  };

  const handleEdit = (enquete: any) => {
    router.push(`/admin/enquetes/editar/${enquete.id}`);
  };

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDuplicateClick = async (id: string) => {
    try {
      await duplicateMutation.mutateAsync(id);
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      try {
        await deleteMutation.mutateAsync(idToDelete);
        setDeleteConfirmOpen(false);
        setIdToDelete(null);
      } catch (error: any) {
        console.error(error);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: EnqueteStatus) => {
    const enquete = enquetes.find((e: any) => e.id === id);
    if (!enquete) return;

    if (newStatus === 'ENCERRADA') {
      const now = new Date();
      const dataFim = enquete.dataFim ? new Date(enquete.dataFim) : null;

      if (dataFim && dataFim > now) {
        setStatusData({ id, status: newStatus });
        setStatusConfirmOpen(true);
      } else {
        performStatusChange(id, newStatus);
      }
      return;
    }

    performStatusChange(id, newStatus);
  };

  const performStatusChange = async (id: string, newStatus: EnqueteStatus) => {
    try {
      const payload: any = { id, status: newStatus };
      if (newStatus === 'ENCERRADA') {
        payload.dataFim = new Date().toISOString();
      }
      await updateMutation.mutateAsync(payload);
    } catch (error: any) {
      setAlertConfig({
        open: true,
        title: "Erro na Operação",
        description: error.message,
        type: 'danger'
      });
    }
  };

  const copyToClipboard = (hash: string) => {
    const url = `${window.location.origin}/vote/${hash}`;
    navigator.clipboard.writeText(url);
    setCopiedId(hash);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: EnqueteStatus) => {
    switch (status) {
      case 'RASCUNHO':
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Rascunho</span>;
      case 'PUBLICADA':
        return <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Publicada</span>;
      case 'PAUSADA':
        return <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Pausada</span>;
      case 'ENCERRADA':
        return <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Encerrada</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <ResourceLoader icon="clipboard-list" label="Enquetes" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section - Premium Standard */}
      <PageHeader
        title={
          <span>
            Gestão de <span className="text-primary">Enquetes</span>
          </span>
        }
        description="Gerencie suas campanhas de votação, monitore resultados em tempo real e orquestre a experiência dos participantes."
        badgeText="Módulo de Votação"
      >
        <Button
          onClick={handleAddNew}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          <Plus size={14} />
          Nova Enquete
        </Button>
      </PageHeader>

      {/* Filters and Actions Bar */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Busca por Texto */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar título, formulário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 h-10 bg-background border-input focus:ring-primary/20 font-medium"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Filtro por Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-10 px-3 bg-background border border-input rounded-md text-xs font-bold text-foreground min-w-[150px] outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all shadow-sm appearance-none"
            >
              <option value="TODOS">Todas Enquetes</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="PUBLICADA">Publicada</option>
              <option value="PAUSADA">Pausada</option>
              <option value="ENCERRADA">Encerrada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {enquetes.length === 0 ? (
        <div className="bg-card rounded-lg border-2 border-dashed border-border p-20 text-center space-y-6">
          <div className="inline-flex h-20 w-20 rounded-2xl bg-muted text-muted-foreground items-center justify-center shadow-inner">
            <Layout size={40} />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-lg font-bold text-foreground">Sistema Vazio</h3>
            <p className="text-muted-foreground font-medium text-xs leading-relaxed">Crie sua primeira enquete vinculando um formulário do Hub para começar a coletar votos.</p>
          </div>
          <Button
            onClick={handleAddNew}
            className="h-10 px-8 font-bold uppercase tracking-widest text-[10px]"
          >
            Começar agora
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Lista de Enquetes</h3>
            <span className="text-[10px] text-muted-foreground font-bold bg-muted px-2 py-1 rounded-md border border-border">{enquetes.length} total</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {enquetes.map((enquete: any) => (
              <div
                key={enquete.id}
                className="group bg-card rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex items-start justify-between">
                    {getStatusBadge(enquete.status)}
                    <div className="flex gap-1 opacity-100 transition-opacity">
                      <Link
                        href={`/admin/enquetes/${enquete.id}/resultados`}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                        title="Ver Resultados"
                      >
                        <BarChart3 size={18} />
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => handleEdit(enquete)}
                        className="h-8 w-8 p-0 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDuplicateClick(enquete.id)}
                        disabled={duplicateMutation.isPending}
                        className="h-8 w-8 p-0 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"
                        title="Duplicar Enquete"
                      >
                        {duplicateMutation.isPending && duplicateMutation.variables === enquete.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteClick(enquete.id)}
                        disabled={enquete.status !== 'RASCUNHO' && enquete.status !== 'ENCERRADA'}
                        className="h-8 w-8 p-0 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                        title={enquete.status !== 'RASCUNHO' && enquete.status !== 'ENCERRADA' ? 'Apenas rascunhos ou enquetes encerradas podem ser excluídas' : 'Excluir enquete'}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">
                      {enquete.titulo}
                    </h3>
                    {enquete.descricao && (
                      <div className="text-muted-foreground text-xs font-medium line-clamp-2 leading-relaxed">
                        {enquete.descricao}
                      </div>
                    )}
                  </div>

                  {enquete.status !== 'RASCUNHO' && (
                    <div className="bg-muted/50 p-3 rounded-lg border border-border space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Modo de Acesso: {enquete.modoAcesso === 'RESTRITO_HASH' ? 'Restrito' : enquete.modoAcesso === 'HIBRIDO' ? 'Híbrido' : 'Público'}</span>
                          <HelpCircle className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => setIsModoAcessoModalOpen(true)} />
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          {enquete.modoAcesso === 'RESTRITO_HASH' && <ShieldCheck size={14} className="text-emerald-500" />}
                          {enquete.modoAcesso === 'PUBLICO' && <Globe size={14} className="text-blue-500" />}
                          {enquete.modoAcesso === 'HIBRIDO' && <Users size={14} className="text-purple-500" />}
                        </div>
                      </div>

                      {enquete.modoAcesso !== 'RESTRITO_HASH' ? (
                        <>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mt-2 pt-2 border-t border-border/50">URL da Votação</span>
                          <div className="flex items-center gap-2">
                            <code className="text-[10px] font-bold text-primary bg-background px-2 py-1 rounded border border-border flex-1 truncate shadow-inner">
                              {typeof window !== 'undefined' ? `${window.location.origin}/vote/${enquete.formPublicId}` : `/vote/${enquete.formPublicId}`}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 bg-background border border-border rounded-md hover:bg-muted"
                              onClick={() => copyToClipboard(enquete.formPublicId)}
                            >
                              {copiedId === enquete.formPublicId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-muted-foreground" />}
                            </Button>
                            <Link
                              href={`/vote/${enquete.formPublicId}`}
                              target="_blank"
                              className="h-7 w-7 flex items-center justify-center bg-background border border-border rounded-md hover:bg-muted text-muted-foreground transition-colors"
                            >
                              <Eye size={14} />
                            </Link>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2 bg-background p-2 rounded border border-border">
                            <Lock size={12} className="text-emerald-500 shrink-0" />
                            <div>
                              <span className="text-[9px] font-bold text-foreground uppercase tracking-wider block">Acesso Bloqueado</span>
                              <p className="text-[8px] text-muted-foreground/80 font-medium uppercase tracking-widest mt-0.5">Disponível via convites de campanhas</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Início</span>
                      <span className="text-xs font-bold text-foreground">
                        {format(new Date(enquete.criadoEm), "dd 'de' MMM", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">ID Hub (Form Link)</span>
                      <span className="text-xs font-bold text-primary flex items-center gap-1 select-all cursor-pointer w-fit" title="Copiar ID para config" onClick={() => copyToClipboard(enquete.formPublicId)}>
                        {enquete.formPublicId}
                        <Copy size={10} className="text-muted-foreground" />
                      </span>
                    </div>
                    {enquete.usarPremiacao && (
                      <div
                        className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm"
                        title={`${enquete.quantidadePremiados} prêmio(s) configurado(s)`}
                      >
                        <Gift size={20} />
                        <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white shadow-sm ring-2 ring-background">
                          {enquete.quantidadePremiados}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/40 border-t border-border grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/enquetes/${enquete.id}/analytics`}
                    className="rounded-md bg-background border border-border h-9 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 px-2 hover:bg-muted transition-all text-muted-foreground hover:text-foreground shadow-sm w-full"
                  >
                    <BarChart3 size={14} className="text-primary shrink-0" />
                    <span className="truncate">Insights</span>
                  </Link>
                  {enquete.resultadosStatus === 'EM_CONFERENCIA' ? (
                    <Link
                      href={`/admin/enquetes/${enquete.id}/consolidacao`}
                      className="rounded-md bg-amber-500/10 border border-amber-500/20 h-9 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 px-2 hover:bg-amber-500/20 transition-all text-amber-700 shadow-sm w-full"
                    >
                      <RefreshCw size={14} className="shrink-0 animate-spin-slow" />
                      <span className="truncate">Consolidar Sala</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/enquetes/${enquete.id}/resultados`}
                      className="rounded-md bg-background border border-border h-9 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 px-2 hover:bg-muted transition-all text-muted-foreground hover:text-foreground shadow-sm w-full"
                    >
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span className="truncate">Resultados</span>
                    </Link>
                  )}
                  {enquete.status === 'RASCUNHO' ? (
                    <Button
                      onClick={() => handleStatusChange(enquete.id, 'PUBLICADA' as EnqueteStatus)}
                      disabled={updateMutation.isPending}
                      className="h-9 font-bold text-[10px] uppercase tracking-wider gap-2 shadow-sm col-span-2 w-full"
                    >
                      <Play size={14} className="fill-current shrink-0" />
                      <span className="truncate">Lançar Enquete</span>
                    </Button>
                  ) : enquete.status === 'PUBLICADA' ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(enquete.id, 'PAUSADA' as EnqueteStatus)}
                        disabled={updateMutation.isPending}
                        className="h-9 font-bold text-[10px] uppercase tracking-wider gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 shadow-sm w-full"
                      >
                        <Pause size={14} className="fill-current shrink-0" />
                        <span className="truncate">Pausar</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(enquete.id, 'ENCERRADA' as EnqueteStatus)}
                        disabled={updateMutation.isPending}
                        className="h-9 font-bold text-[10px] uppercase tracking-wider gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 shadow-sm w-full"
                      >
                        <X size={14} className="shrink-0" />
                        <span className="truncate">Encerrar</span>
                      </Button>
                    </>
                  ) : enquete.status === 'PAUSADA' ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(enquete.id, 'PUBLICADA' as EnqueteStatus)}
                        disabled={updateMutation.isPending}
                        className="h-9 font-bold text-[10px] uppercase tracking-wider gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm w-full"
                      >
                        <Play size={14} className="fill-current shrink-0" />
                        <span className="truncate">Retomar</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(enquete.id, 'ENCERRADA' as EnqueteStatus)}
                        disabled={updateMutation.isPending}
                        className="h-9 font-bold text-[10px] uppercase tracking-wider gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 shadow-sm w-full"
                      >
                        <X size={14} className="shrink-0" />
                        <span className="truncate">Encerrar</span>
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center bg-muted/50 rounded-md h-9 border border-border px-2 col-span-2 w-full">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">Status: Encerrada</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Excluir Enquete?"
        description="Esta ação removerá todos os dados desta enquete permanentemente. Confirmar exclusão?"
        type="danger"
        confirmLabel="Sim, Excluir"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <Modal
        isOpen={statusConfirmOpen}
        onClose={() => setStatusConfirmOpen(false)}
        title="Encerrar Antecipadamente?"
        description="Esta enquete ainda está dentro do prazo de vigência. Deseja realmente encerrá-la agora? A data de encerramento será atualizada para o momento atual."
        type="warning"
        confirmLabel="Sim, Encerrar Agora"
        onConfirm={() => {
          if (statusData) {
            performStatusChange(statusData.id, statusData.status);
          }
          setStatusConfirmOpen(false);
        }}
        isLoading={updateMutation.isPending}
      />

      <Modal
        isOpen={alertConfig.open}
        onClose={() => setAlertConfig({ ...alertConfig, open: false })}
        title={alertConfig.title}
        description={alertConfig.description}
        type={alertConfig.type}
        confirmLabel="Entendi"
        onConfirm={() => setAlertConfig({ ...alertConfig, open: false })}
      />
      <ModoAcessoInfoDialog isOpen={isModoAcessoModalOpen} onClose={() => setIsModoAcessoModalOpen(false)} />
    </div>
  );
}
