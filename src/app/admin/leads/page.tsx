"use client";

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Loader2,
  FileDown,
  MoreVertical,
  Pencil,
  Power,
  Tag as TagIcon,
  UserX,
  UserCheck
} from 'lucide-react';
import { ResourceLoader } from '@/components/ui/ResourceLoader';
import { Button } from '@/components/ui/Button';
import { useLeads, useDeleteLead, LeadWithTags } from '@/hooks/use-leads';
import { useTags } from '@/hooks/use-tags';
import { cn } from '@/lib/utils';
import { LeadForm } from '@/components/admin/lead-form';
import { Modal } from '@/components/ui/Modal';
import { TagsManager } from '@/components/admin/tags-manager';
import { ImportLeadsWizard } from '@/components/admin/import-leads-wizard';

import { PageHeader } from '@/components/admin/PageHeader';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  // ... rest of state ...
  const [tagFilter, setTagFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [optOutFilter, setOptOutFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTagsManagerOpen, setIsTagsManagerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadWithTags | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useLeads({
    search: searchTerm,
    tagIds: tagFilter !== "all" ? [tagFilter] : undefined,
    optOut: optOutFilter === "yes" ? true : optOutFilter === "no" ? false : undefined,
  });

  const { data: tags = [] } = useTags();
  const deleteMutation = useDeleteLead();

  const handleEdit = (lead: LeadWithTags) => {
    setSelectedLead(lead);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedLead(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedLead(null);
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

  if (isLoading) {
    return <ResourceLoader icon="users" label="Leads" />;
  }

  if (showForm) {
    return (
      <LeadForm
        lead={selectedLead}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section - Premium Standard */}
      <PageHeader
        title="Base de Leads"
        description="Gestão de eleitores e segmentações"
        badgeText="Audiência"
      >
        <Button
          variant="outline"
          onClick={() => setIsTagsManagerOpen(true)}
          className="bg-card hover:bg-card/80 border-border h-10 px-4 font-bold uppercase tracking-widest text-[10px] shadow-sm flex items-center gap-2"
        >
          <TagIcon className="h-3.5 w-3.5" />
          Gerenciar Tags
        </Button>
      </PageHeader>

      {/* Filters and Actions Bar */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, whats ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 h-10 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-ring focus:border-primary transition-all font-medium outline-none shadow-sm"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="h-10 px-3 bg-background border border-input rounded-md text-xs font-bold text-foreground min-w-[150px] outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all shadow-sm appearance-none"
            >
              <option value="all">Tags: Todas</option>
              {tags.map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>

            <select
              value={optOutFilter}
              onChange={(e) => setOptOutFilter(e.target.value)}
              className="h-10 px-3 bg-background border border-input rounded-md text-xs font-bold text-foreground min-w-[150px] outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all shadow-sm appearance-none"
            >
              <option value="all">Filtro de Status: Todos</option>
              <option value="no">Apenas Ativos</option>
              <option value="yes">Opt-out (Descadastro)</option>
            </select>

            <div className="flex items-center gap-2 md:pl-2">
              <Button
                variant="outline"
                onClick={() => setIsImportOpen(true)}
                className="gap-2 h-10 px-4 font-bold uppercase tracking-widest text-[10px] shadow-sm"
              >
                <FileDown className="h-4 w-4" />
                Importar CSV
              </Button>
              <Button
                onClick={handleAddNew}
                className="gap-2 h-10 px-6 font-bold uppercase tracking-widest text-[10px] shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Novo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex justify-between items-center px-2">
        <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Lista de Leads</h3>
        <span className="text-[10px] text-muted-foreground font-bold bg-muted px-2 py-1 rounded-md border border-border">{leads.length} total</span>
      </div>

      {/* Main Table Content */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Perfil do Eleitor</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tags / Segmentos</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/30 shadow-inner">
                        <Users size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-foreground font-bold">Base de dados vazia</p>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">Importe respondentes ou cadastre manualmente para iniciar.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border shadow-sm group-hover:bg-background transition-colors">
                          <Users size={16} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground text-sm tracking-tight leading-none group-hover:text-primary transition-colors">{lead.nome}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{lead.sexo || 'Indefinido'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-muted-foreground/80 tracking-tight">{lead.whatsapp}</p>
                        {lead.email && <p className="text-[10px] text-muted-foreground/50 font-medium truncate max-w-[180px]">{lead.email}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.map(({ tag }: any) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border border-border/50 bg-muted/30 text-muted-foreground"
                          >
                            {tag.nome}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {lead.optOut ? (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
                          Opt-out
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-primary/10 text-primary border border-primary/20 shadow-sm">
                          Ativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-l border-transparent group-hover:border-border transition-all">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(lead)}
                          className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:bg-muted hover:text-primary transition-all"
                          title="Editar Cadastro"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(lead.id)}
                          className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          title="Remover Registro"
                        >
                          <Power size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TagsManager
        isOpen={isTagsManagerOpen}
        onClose={() => setIsTagsManagerOpen(false)}
      />

      <ImportLeadsWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Excluir Lead?"
        description="Esta ação removerá permanentemente este lead e todo o seu histórico. Confirmar?"
        type="danger"
        confirmLabel="Sim, Excluir"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

