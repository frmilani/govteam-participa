"use client";

import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Search,
  Loader2,
  FileDown,
  Pencil,
  Power,
  Image as ImageIcon,
  Filter,
} from 'lucide-react';
import { ResourceLoader } from '@/components/ui/ResourceLoader';
import { Button } from '@/components/ui/Button';
import { useEstabelecimentos, useToggleEstabelecimento, Estabelecimento } from '@/hooks/use-estabelecimentos';
import { useSegmentos } from '@/hooks/use-segmentos';
import { cn } from '@/lib/utils';
import { TIPO_ENTIDADE_OPTIONS, getTipoLabel } from '@/lib/entidades/tipo-entidade-config';

import { EstabelecimentoForm } from '@/components/admin/estabelecimento-form';
import { ImportEstabelecimentosWizard } from '@/components/admin/import-estabelecimentos-wizard';
import { PageHeader } from '@/components/admin/PageHeader';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EstabelecimentosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentoFilter, setSegmentoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  // E1.2: Filtro por tipo de entidade (AC: 9)
  const [tipoFilter, setTipoFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<Estabelecimento | null>(null);

  const [localSearch, setLocalSearch] = useState("");
  // Adiciona um debounce para evitar que o input perca foco a cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const { data: estabelecimentos = [], isLoading } = useEstabelecimentos({
    search: searchTerm,
    segmentoId: segmentoFilter !== "all" ? segmentoFilter : undefined,
    ativo: statusFilter === "ativo" ? true : statusFilter === "inativo" ? false : undefined,
    tipo: tipoFilter !== "all" ? tipoFilter : undefined,
  });

  const { data: segmentos = [] } = useSegmentos();
  const toggleMutation = useToggleEstabelecimento();

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (est: Estabelecimento) => {
    setSelectedEstabelecimento(est);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedEstabelecimento(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEstabelecimento(null);
  };

  if (isLoading) {
    return <ResourceLoader icon="store" label="Estabelecimentos" />;
  }

  // Se está mostrando o formulário, renderiza apenas ele
  if (showForm) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <EstabelecimentoForm
          estabelecimento={selectedEstabelecimento}
          onClose={handleCloseForm}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section - Premium Standard */}
      <PageHeader
        title="Participantes"
        description="Gestão de empresas e estabelecimentos concorrentes"
        badgeText="Mapeamento do Mercado"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsImportOpen(true)}
            className="bg-card hover:bg-card/80 border-border h-10 px-4 font-bold uppercase tracking-widest text-[10px] shadow-sm flex items-center gap-2"
          >
            <FileDown size={14} />
            Importar CSV
          </Button>
          <Button
            onClick={handleAddNew}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
          >
            <Plus size={14} />
            Novo Estabelecimento
          </Button>
        </div>
      </PageHeader>

      <ImportEstabelecimentosWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      {/* Filters Bar */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, responsável ou email..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <select
              value={segmentoFilter}
              onChange={(e) => setSegmentoFilter(e.target.value)}
              className="h-10 px-3 bg-background border border-input rounded-md text-sm min-w-[200px]"
            >
              <option value="all">Todos os Segmentos</option>
              {segmentos.map((seg) => (
                <option key={seg.id} value={seg.id}>{seg.nome}</option>
              ))}
            </select>

            {/* E1.2: Filtro por tipo de entidade (AC: 9) */}
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="h-10 px-3 bg-background border border-input rounded-md text-sm min-w-[180px] flex items-center gap-1"
            >
              <option value="all">Todos os Tipos</option>
              {TIPO_ENTIDADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-background border border-input rounded-md text-sm min-w-[150px]"
            >
              <option value="all">Todos Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {estabelecimentos.length === 0 ? (
        <div className="bg-card rounded-lg border-2 border-dashed border-border p-20 text-center space-y-6">
          <div className="inline-flex h-20 w-20 rounded-2xl bg-muted text-muted-foreground items-center justify-center shadow-inner">
            <Store size={40} />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-lg font-bold text-foreground">Base Vazia</h3>
            <p className="text-muted-foreground font-medium text-xs leading-relaxed">Nenhum estabelecimento encontrado com os filtros atuais.</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Estabelecimento</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estabelecimentos.map((est) => (
                <TableRow key={est.id} className="group cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                        {est.logoUrl ? (
                          <img
                            src={est.logoUrl}
                            alt={est.nome}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{est.nome}</div>
                        {/* E1.2: Badge de tipo (AC: 9) */}
                        {est.tipo && est.tipo !== 'EMPRESA' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[9px] font-bold uppercase tracking-wider border border-amber-500/20 mr-1">
                            {getTipoLabel(est.tipo)}
                          </span>
                        )}
                        {(est.alias || est.descricao) && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{est.alias || est.descricao}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {est.segmentos && est.segmentos.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {est.segmentos.map((s: any) => (
                          <span key={s.segmento.id} className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            {s.segmento.nome}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                      est.ativo ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
                    )}>
                      {est.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(est.id)}
                        className={cn(
                          "h-8 w-8 p-0 rounded-md transition-colors",
                          est.ativo ? "text-emerald-500 hover:text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50"
                        )}
                        title={est.ativo ? "Desativar" : "Ativar"}
                      >
                        <Power size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(est)}
                      >
                        <Pencil size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
