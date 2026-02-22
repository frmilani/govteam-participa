"use client";

import React, { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, AlertTriangle, Settings2, Sparkles } from "lucide-react";
import { useTemplates } from "@/hooks/use-templates";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SegmentoQualidade {
    id: string;
    nome: string;
    paiId: string | null;
    templateQualidadeId: string | null;
    templateQualidade?: { id: string; nome: string } | null;
    resolvedTemplate?: { id: string; nome: string; perguntas: any[] } | null;
}

interface SegmentoTreeNode extends SegmentoQualidade {
    children: SegmentoTreeNode[];
}

export const QualidadeInheritanceView: React.FC<{ enqueteId: string }> = ({ enqueteId }) => {
    const queryClient = useQueryClient();
    const { data: templates = [] } = useTemplates();

    const { data: segmentos = [], isLoading } = useQuery<SegmentoQualidade[]>({
        queryKey: ["arvore-qualidade", enqueteId],
        queryFn: async () => {
            const res = await fetch(`/api/enquetes/${enqueteId}/arvore-qualidade`);
            if (!res.ok) throw new Error("Failed to load arvore de qualidade");
            return res.json();
        }
    });

    const mutation = useMutation({
        mutationFn: async ({ id, templateQualidadeId }: { id: string; templateQualidadeId: string | null }) => {
            const res = await fetch(`/api/segmentos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateQualidadeId }),
            });
            if (!res.ok) throw new Error("Failed to update segmento");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["arvore-qualidade", enqueteId] });
        },
    });

    const handleTemplateChange = (segmentoId: string, templateId: string) => {
        mutation.mutate({ id: segmentoId, templateQualidadeId: templateId === "none" ? null : templateId });
    };

    const tree = useMemo(() => {
        function buildTree(items: SegmentoQualidade[], parentId: string | null = null): SegmentoTreeNode[] {
            return items
                .filter(s => s.paiId === parentId)
                .map(s => ({
                    ...s,
                    children: buildTree(items, s.id)
                }));
        }
        return buildTree(segmentos);
    }, [segmentos]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Carregando árvore de qualidade...
            </div>
        );
    }

    if (segmentos.length === 0) {
        return (
            <div className="p-4 border rounded-xl bg-card text-center text-sm text-muted-foreground">
                Nenhum segmento vinculado a esta pesquisa ainda.
            </div>
        );
    }

    const renderNode = (node: SegmentoTreeNode, isChild: boolean = false) => {
        const isOverride = isChild && node.templateQualidadeId;
        const isDirect = !isChild && node.templateQualidadeId;
        const isInherited = isChild && !node.templateQualidadeId && node.resolvedTemplate;
        const isUncovered = !node.resolvedTemplate;

        return (
            <div key={node.id} className={cn("flex flex-col gap-2 mt-2", isChild && "pl-6 border-l-2")}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-card/50 hover:bg-card/80 transition-colors gap-3">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{node.nome}</span>
                        <div className="flex items-center gap-2 mt-1">
                            {isUncovered && (
                                <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-500/10">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Sem template
                                </Badge>
                            )}
                            {isDirect && (
                                <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-500/10">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Template Direto
                                </Badge>
                            )}
                            {isInherited && (
                                <Badge variant="outline" title={`Herdado de: ${node.resolvedTemplate?.nome}`} className="text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Herdado
                                </Badge>
                            )}
                            {isOverride && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600/30 bg-blue-500/10">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Override Local
                                </Badge>
                            )}

                            {node.resolvedTemplate && (
                                <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={node.resolvedTemplate.nome}>
                                    {node.resolvedTemplate.nome}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            className="flex h-8 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={node.templateQualidadeId || "none"}
                            onChange={(e) => handleTemplateChange(node.id, e.target.value)}
                            disabled={mutation.isPending}
                        >
                            <option value="none">
                                {isChild ? "Herdar do Pai (Padrão)" : "Nenhum / Não aplicar"}
                            </option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {node.children && node.children.length > 0 && (
                    <div className="flex flex-col">
                        {node.children.map(child => renderNode(child, true))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold tracking-wide text-foreground flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                    Mapeamento de Templates de Qualidade
                </h4>
            </div>

            <div className="flex flex-col bg-card rounded-xl p-4 border space-y-2">
                {tree.map(node => renderNode(node, false))}
            </div>
        </div>
    );
};
