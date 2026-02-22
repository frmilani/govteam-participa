"use client";

import React, { useState } from 'react';
import {
  X,
  Plus,
  Loader2,
  Trash2,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/use-tags';
import { cn } from '@/lib/utils';

interface TagsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TagsManager({ isOpen, onClose }: TagsManagerProps) {
  const { data: tags = [], isLoading } = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#4F46E5");
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    try {
      await createMutation.mutateAsync({ nome: newTagName, cor: newTagColor });
      setNewTagName("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir tag");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Etiquetas de Sistema</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Segmentação e organização de leads</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="h-10 w-10 p-0 rounded-xl hover:bg-muted text-muted-foreground transition-all">
            <X size={18} />
          </Button>
        </div>

        {/* Create New Tag */}
        <div className="p-6 bg-muted/30 border-b border-border space-y-4 shadow-inner">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Criar Nova Tag</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Ex: VIP, Influencer..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="bg-background h-11 font-bold border-border"
              />
            </div>
            <div className="relative group">
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-11 h-11 p-1 rounded-xl border border-border cursor-pointer bg-background group-hover:border-primary transition-colors"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={!newTagName.trim() || createMutation.isPending}
              className="h-11 w-11 p-0 rounded-xl shadow-lg shadow-primary/20"
            >
              {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
            </Button>
          </div>
        </div>

        {/* Tags List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tags Existentes</span>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">{tags.length} total</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="animate-spin text-primary size-8 opacity-20" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Carregando...</p>
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
              <Palette className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nenhuma tag definida</p>
            </div>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:bg-muted/30 hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/10 ring-2 ring-background ring-offset-1"
                    style={{ backgroundColor: tag.cor }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground tracking-tight">{tag.nome}</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">
                      {tag._count.leads} vínculos ativos
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tag.id)}
                    disabled={deleteMutation.isPending || tag._count.leads > 0}
                    className={cn(
                      "h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
                      tag._count.leads > 0 ? "hidden" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    )}
                    title="Excluir Tag"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/20 flex justify-end">
          <Button onClick={onClose} className="px-8 h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-sm">
            Fechar Painel
          </Button>
        </div>
      </div>
    </div>
  );
}
