"use client";

import React, { useState, useMemo } from 'react';
import {
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  Plus
} from 'lucide-react';
import { Segmento } from '@/hooks/use-segmentos';
import { cn } from '@/lib/utils';
import { DynamicIcon } from '@/lib/icons';
import { Button } from '@/components/ui/Button';

// Utility to format numbers
const formatCount = (count?: number) => {
  if (count === undefined) return '-';
  return count > 999 ? '999+' : count;
};

interface SegmentoItemProps {
  segmento: Segmento;
  level?: number;
  parentColor?: string | null;
  onEdit: (segmento: Segmento) => void;
  onDelete: (id: string) => void;
  onAddSub?: (parentId: string) => void;
}

export function SegmentoItem({
  segmento,
  level = 0,
  parentColor = null,
  onEdit,
  onDelete,
  onAddSub
}: SegmentoItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = segmento.filhos && segmento.filhos.length > 0;

  const categoriesCount = segmento._count?.filhos || 0;
  const establishmentsCount = segmento._count?.estabelecimentos || 0;

  const recursiveEstCount = useMemo(() => {
    let count = establishmentsCount;
    if (segmento.filhos) {
      count += segmento.filhos.reduce((acc, child) => acc + (child._count?.estabelecimentos || 0), 0);
    }
    return count;
  }, [segmento.filhos, establishmentsCount]);

  return (
    <div className="group flex flex-col">
      <div
        className={cn(
          "flex items-center gap-3 py-2 px-3 border-b border-border/40 hover:bg-muted/40 transition-colors group/row",
          level === 0 ? "bg-card/30" : ""
        )}
      >
        {/* Indentation Spacer */}
        <div style={{ width: `${level * 24}px` }} className="shrink-0 h-px" />

        {/* Expand/Collapse & Icon Container */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            {hasChildren ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0.5 hover:bg-muted rounded text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-border/60 ml-0.5" />
            )}
          </div>

          <div
            className={cn(
              "h-8 w-8 rounded flex items-center justify-center shrink-0 transition-all",
              level === 0 ? "bg-muted/40 border border-border/40" : ""
            )}
          >
            <DynamicIcon
              name={segmento.icone || 'folder-open'}
              size={16}
              className={!segmento.cor ? "text-muted-foreground/40" : ""}
              style={{ color: segmento.cor || 'currentColor' }}
            />
          </div>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0 flex flex-col justify-center ml-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium truncate transition-colors text-sm",
              level === 0 ? "text-foreground font-semibold" : "text-muted-foreground group-hover/row:text-foreground"
            )}>
              {segmento.nome}
            </span>
            {level === 0 && (
              <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                Principal
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/60 font-mono bg-muted/30 px-1.5 py-0.5 rounded border border-border/30 truncate max-w-[150px]" title={segmento.slug}>
              {segmento.slug}
            </span>
          </div>
        </div>

        {/* Counters */}
        <div className="hidden sm:flex items-center gap-8 mr-6 ml-auto">
          {/* Categories */}
          <div className="flex flex-col items-end w-20">
            <span className="text-sm font-medium text-foreground/80">{categoriesCount > 0 ? categoriesCount : '-'}</span>
            <span className="text-[9px] text-muted-foreground uppercase opacity-70">Cats</span>
          </div>

          {/* Establishments */}
          <div className="flex flex-col items-end w-20">
            <span className={cn(
              "text-sm font-medium",
              recursiveEstCount > 0 ? "text-foreground/80" : "text-muted-foreground/50 ml-auto"
            )}>
              {recursiveEstCount > 0 ? recursiveEstCount : '-'}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase opacity-70">Estabs</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 w-24 opacity-0 group-hover/row:opacity-100 transition-opacity mx-2">
          {onAddSub && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddSub(segmento.id)}
              className={cn(
                "h-7 w-7 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded",
                level > 0 ? "invisible" : "" // Reserve space but hide if deep (though logic below handles rendering)
              )}
              title="Adicionar Sub"
            >
              <Plus size={14} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(segmento)}
            className="h-7 w-7 p-0 text-muted-foreground hover:bg-muted hover:text-foreground rounded"
          >
            <Pencil size={13} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(segmento.id)}
            className="h-7 w-7 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {segmento.filhos!.map((filho: Segmento) => (
            <SegmentoItem
              key={filho.id}
              segmento={filho}
              level={level + 1}
              parentColor={segmento.cor}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSub={onAddSub} // Pass down onAddSub if needed for recursive tree, though usually only top level adds subs in this UI? 
            // Actually the original code didn't pass onAddSub for children (level > 0 check was inside `level===0 && onAddSub`).
            // But usually you might want to add sub-subs? 
            // For now, let's keep it consistent: pass it, but the button renders only if condition meeting.
            // Original code: `{level === 0 && onAddSub && ...}` inside the JSX.
            // So passing it down is fine/safe.
            />
          ))}
        </div>
      )}
    </div>
  );
}
