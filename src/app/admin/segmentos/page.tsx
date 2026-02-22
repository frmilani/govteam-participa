"use client";

import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Loader2,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { ResourceLoader } from '@/components/ui/ResourceLoader';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Sidebar } from '@/components/admin/sidebar';
import { SegmentoItem } from '@/components/admin/segmento-item';
import { SegmentoForm } from '@/components/admin/segmento-form-modal';
import { useSegmentos, useDeleteSegmento, Segmento } from '@/hooks/use-segmentos';
import { PageHeader } from '@/components/admin/PageHeader';

export default function SegmentosPage() {
  const { data: segmentos = [], isLoading, isError } = useSegmentos();
  const deleteMutation = useDeleteSegmento();

  const [showForm, setShowForm] = useState(false);
  const [selectedSegmento, setSelectedSegmento] = useState<Segmento | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [parentFilter, setParentFilter] = useState<string>("all");

  const handleEdit = (segmento: Segmento) => {
    setSelectedSegmento(segmento);
    setParentIdForNew(null);
    setShowForm(true);
  };

  const handleAddNew = (parentId: string | null = null) => {
    setSelectedSegmento(null);
    setParentIdForNew(parentId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedSegmento(null);
    setParentIdForNew(null);
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

  const filteredSegmentos = useMemo(() => {
    let result = [...segmentos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.nome.toLowerCase().includes(term) ||
        s.slug.toLowerCase().includes(term) ||
        s.filhos?.some(f => f.nome.toLowerCase().includes(term))
      );
    }

    if (parentFilter !== "all") {
      result = result.filter(s => s.id === parentFilter || s.paiId === parentFilter);
    }

    return result;
  }, [segmentos, searchTerm, parentFilter]);

  if (isLoading) {
    return <ResourceLoader icon="tags" label="Segmentos" />;
  }

  if (showForm) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SegmentoForm
          onClose={handleCloseForm}
          segmento={selectedSegmento}
          parentSegmentos={segmentos.filter(s => !s.paiId)}
          defaultParentId={parentIdForNew}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section - Premium Standard */}
      <PageHeader
        title="Categorias de Votação"
        description="Segmentos e agrupamentos de participantes"
        badgeText="Estrutura do Prêmio"
      />

      {/* Filters and Actions Bar */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Busca por Texto */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 h-10 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-ring focus:border-primary transition-all font-medium outline-none shadow-sm"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Filtro por Categoria Pai */}
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="h-10 px-3 bg-background border border-input rounded-md text-xs font-bold text-foreground min-w-[200px] outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all shadow-sm appearance-none"
            >
              <option value="all">Todas as Categorias</option>
              <option value="main">Apenas Principais</option>
              {segmentos
                .filter(s => !s.paiId)
                .map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))
              }
            </select>

            {/* Botão Adicionar */}
            <Button
              onClick={() => handleAddNew()}
              className="gap-2 h-10 px-6 font-bold uppercase tracking-widest text-[10px] shadow-sm"
            >
              <Plus size={14} />
              Novo Segmento
            </Button>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex justify-between items-center px-2">
        <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Estrutura de Categorias</h3>
        <span className="text-[10px] text-muted-foreground font-bold bg-muted px-2 py-1 rounded-md border border-border">{filteredSegmentos.length} total</span>
      </div>

      {/* Main Content Card */}
      <div className="space-y-4">
        <div className="grid gap-2">
          {segmentos.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border shadow-inner">
              <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/30 mx-auto mb-6">
                <FolderTree size={40} />
              </div>
              <h4 className="text-lg font-bold text-foreground tracking-tight">
                Nenhuma categoria definida
              </h4>
              <p className="text-muted-foreground text-xs font-medium max-w-xs mx-auto mt-2 leading-relaxed">
                Organize seu prêmio criando segmentos principais e subcategorias para os participantes.
              </p>
              <Button
                size="md"
                className="mt-8 px-8 font-bold uppercase tracking-widest text-[10px]"
                onClick={() => handleAddNew()}
              >
                Começar agora
              </Button>
            </div>
          ) : (
            <div className="pb-8">
              {/* Table Header */}
              <div className="hidden sm:flex items-center px-3 py-2 border-b border-border/50 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/20 rounded-t-lg">
                <div className="flex-1 pl-12">Categoria</div>
                <div className="flex items-center gap-8 mr-6 ml-auto">
                  <div className="w-20 text-right">Categorias</div>
                  <div className="w-20 text-right">Estabelecimentos</div>
                </div>
                <div className="w-24 text-center mx-2">Ações</div>
              </div>
              <div className="space-y-1">
                {filteredSegmentos
                  .filter(s => {
                    if (parentFilter === "main") return !s.paiId;
                    if (parentFilter !== "all") return !s.paiId && (s.id === parentFilter || s.filhos?.some(f => f.paiId === parentFilter));
                    return !s.paiId;
                  })
                  .map((segmento) => (
                    <SegmentoItem
                      key={segmento.id}
                      segmento={segmento}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onAddSub={handleAddNew}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Excluir Categoria?"
        description="Esta ação removerá a categoria e todas as suas subcategorias permanentemente. Confirmar?"
        type="danger"
        confirmLabel="Sim, Excluir"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div >
  );
}
