"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Play,
  Trash2,
  BarChart3,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
  Users,
  Edit3,
  Loader2,
  CheckCircle2,
  Layout,
  Smartphone,
  Check
} from "lucide-react";
import { ResourceLoader } from "@/components/ui/ResourceLoader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCampanhas, useStartCampanha, useDeleteCampanha } from "@/hooks/use-campanhas";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Modal } from "@/components/ui/Modal";

type CampanhaStatus = 'RASCUNHO' | 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

export default function CampanhasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampanhaStatus | "TODOS">("TODOS");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const { data: campanhas = [], isLoading } = useCampanhas({
    status: statusFilter === "TODOS" ? undefined : statusFilter as any,
    search: searchTerm
  });

  const startMutation = useStartCampanha();
  const deleteMutation = useDeleteCampanha();

  const handleAddNew = () => {
    router.push('/admin/campanhas/nova');
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/campanhas/editar/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      try {
        await deleteMutation.mutateAsync(idToDelete);
        setDeleteConfirmOpen(false);
        setIdToDelete(null);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getStatusBadge = (status: CampanhaStatus) => {
    switch (status) {
      case 'RASCUNHO':
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Rascunho</span>;
      case 'AGENDADA':
        return <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Agendada</span>;
      case 'EM_ANDAMENTO':
        return <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse border border-emerald-200">Em Andamento</span>;
      case 'CONCLUIDA':
        return <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Concluída</span>;
      default:
        return <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">{status}</span>;
    }
  };

  if (isLoading) {
    return <ResourceLoader icon="megaphone" label="Campanhas WhatsApp" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <PageHeader
        title={
          <span>
            WhatsApp <span className="text-primary">Campanhas</span>
          </span>
        }
        description="Gerencie disparos massivos, agende notificações e monitore o engajamento dos seus leads em tempo real."
        badgeText="Módulo de Disparos"
      >
        <Button
          onClick={handleAddNew}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          <Plus size={14} />
          Nova Campanha
        </Button>
      </PageHeader>

      {/* Filters Bar */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campanha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 h-10 bg-background border-input focus:ring-primary/20 font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 bg-background border border-input rounded-md text-xs font-bold text-foreground min-w-[150px] outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all shadow-sm appearance-none"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="RASCUNHO">Rascunho</option>
            <option value="AGENDADA">Agendado</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDA">Concluída</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {campanhas.length === 0 ? (
        <div className="bg-card rounded-lg border-2 border-dashed border-border p-20 text-center space-y-6">
          <div className="inline-flex h-20 w-20 rounded-2xl bg-muted text-muted-foreground items-center justify-center shadow-inner">
            <Megaphone size={40} />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-lg font-bold text-foreground">Nenhuma Campanha</h3>
            <p className="text-muted-foreground font-medium text-xs leading-relaxed">Inicie sua primeira campanha de disparos massivos para interagir com seus leads.</p>
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
            <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Lista de Campanhas</h3>
            <span className="text-[10px] text-muted-foreground font-bold bg-muted px-2 py-1 rounded-md border border-border">{campanhas.length} total</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {campanhas.map((campanha: any) => (
              <div
                key={campanha.id}
                className="group bg-card rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex items-start justify-between">
                    {getStatusBadge(campanha.status)}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => handleEdit(campanha.id)}
                        disabled={campanha.status === 'EM_ANDAMENTO' || campanha.status === 'CONCLUIDA'}
                        className="h-8 w-8 p-0 rounded-md hover:bg-muted text-muted-foreground hover:text-primary disabled:opacity-30"
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteClick(campanha.id)}
                        disabled={campanha.status === 'EM_ANDAMENTO'}
                        className="h-8 w-8 p-0 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-30"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">
                      {campanha.nome}
                    </h3>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase flex items-center gap-1">
                      <MessageSquare size={12} className="text-primary" />
                      {campanha.enquete.titulo}
                    </p>
                  </div>

                  {campanha.agendadoPara && campanha.status === 'AGENDADA' && (
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Agendado para</p>
                        <p className="text-xs font-bold text-primary">
                          {format(new Date(campanha.agendadoPara), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Público</span>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-primary" />
                        <span className="text-sm font-black text-foreground">{campanha._count?.trackingLinks || 0}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Respostas</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-sm font-black text-emerald-600">{campanha.totalRespondidos || 0}</span>
                      </div>
                    </div>
                  </div>

                  {campanha.status === 'EM_ANDAMENTO' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Progresso do Envio</span>
                        <span>{Math.min(100, Math.round(((campanha.totalEnviados + campanha.totalFalhados) / (campanha.totalLeads || campanha._count.trackingLinks || 1)) * 100))}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/50">
                        <div
                          className="bg-primary h-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.min(100, Math.round(((campanha.totalEnviados + campanha.totalFalhados) / (campanha.totalLeads || campanha._count.trackingLinks || 1)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted/40 border-t border-border flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-9 font-bold text-[10px] uppercase tracking-wider gap-2 shadow-sm"
                    onClick={() => router.push(`/admin/campanhas/${campanha.id}`)}
                  >
                    <BarChart3 size={14} className="text-primary" />
                    Monitor
                  </Button>

                  {campanha.status === 'RASCUNHO' || campanha.status === 'AGENDADA' ? (
                    <Button
                      onClick={() => startMutation.mutate(campanha.id)}
                      disabled={startMutation.isPending}
                      className="flex-1 h-9 font-bold text-[10px] uppercase tracking-wider gap-2 shadow-md"
                    >
                      {startMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="fill-current" />}
                      Lançar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled
                      className="flex-1 h-9 font-bold text-[10px] uppercase tracking-wider gap-2 opacity-30 cursor-not-allowed"
                    >
                      {campanha.status === 'CONCLUIDA' ? (
                        <>
                          <Check size={14} className="text-emerald-500" />
                          Concluída
                        </>
                      ) : (
                        <>
                          <Loader2 size={14} className="animate-spin text-primary" />
                          Em Andamento
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Excluir Campanha?"
        description="Esta ação removerá todos os logs de envio e dados desta campanha permanentemente. Confirmar exclusão?"
        type="danger"
        confirmLabel="Sim, Excluir"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
