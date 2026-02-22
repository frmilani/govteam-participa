"use client";

import React, { useState } from 'react';
import { Layers, Plus, Search, Loader2, Pencil, Trash2, Copy, ShieldQuestion } from 'lucide-react';
import { ResourceLoader } from '@/components/ui/ResourceLoader';
import { Button } from '@/components/ui/Button';
import { useTemplates, useDeleteTemplate, useDuplicateTemplate, TemplateQualidade } from '@/hooks/use-templates';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/admin/PageHeader';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { TemplateQualidadeForm } from './TemplateQualidadeForm';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function TemplatesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const { data: templates = [], isLoading } = useTemplates();
    const deleteMutation = useDeleteTemplate();
    const duplicateMutation = useDuplicateTemplate();
    const { showToast } = useToast();

    const handleEdit = (id: string) => {
        setSelectedTemplateId(id);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setSelectedTemplateId(null);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedTemplateId(null);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Tem certeza que deseja apagar este template de qualidade? Todas as pesquisas e categorias vinculadas perderão esta herança.")) return;
        try {
            await deleteMutation.mutateAsync(id);
            showToast("Template apagado com sucesso!", "success");
        } catch (error) {
            showToast("Erro ao excluir template", "error");
        }
    };

    const handleDuplicate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await duplicateMutation.mutateAsync(id);
            showToast("Template clonado com sucesso!", "success");
        } catch (error) {
            showToast("Erro ao duplicar template", "error");
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <ResourceLoader icon="shield-question" label="Templates de Qualidade" />;
    }

    if (showForm) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <TemplateQualidadeForm
                    templateId={selectedTemplateId}
                    onClose={handleCloseForm}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Templates de Qualidade"
                description="Padrões de questionários armadilha para atestar veracidade das enquetes."
                badgeText="Controle de Tráfego"
            >
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleAddNew}
                        className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} />
                        Novo Template
                    </Button>
                </div>
            </PageHeader>

            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar pelo nome do template..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {filteredTemplates.length === 0 ? (
                <div className="bg-card rounded-lg border-2 border-dashed border-border p-20 text-center space-y-6">
                    <div className="inline-flex h-20 w-20 rounded-2xl bg-muted text-muted-foreground items-center justify-center shadow-inner">
                        <ShieldQuestion size={40} />
                    </div>
                    <div className="max-w-xs mx-auto space-y-2">
                        <h3 className="text-lg font-bold text-foreground">Ainda não há templates</h3>
                        <p className="text-muted-foreground font-medium text-xs leading-relaxed">
                            Você pode criar templates padronizados para injetar em setores específicos da pesquisa, avaliando não apenas top of mind, mas os pilares de qualidade.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[500px]">Template</TableHead>
                                <TableHead className="text-center">Perguntas</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTemplates.map((template) => (
                                <TableRow key={template.id} className="group cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(template.id)}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                                                <Layers size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground">{template.nome}</div>
                                                <div className="text-xs text-muted-foreground">ID: {template.id.slice(-6).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider border border-border">
                                            {template._count?.perguntas || 0} PERGUNTAS
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"
                                                onClick={(e) => handleDuplicate(template.id, e)}
                                                title="Duplicar"
                                            >
                                                <Copy size={14} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
                                                onClick={(e) => handleDelete(template.id, e)}
                                                title="Excluir Template"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"
                                                onClick={(e) => { e.stopPropagation(); handleEdit(template.id); }}
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
