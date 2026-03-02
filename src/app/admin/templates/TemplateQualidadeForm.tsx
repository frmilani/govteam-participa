import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, GripVertical, ShieldQuestion, Loader2, Save } from 'lucide-react';
import { useTemplate, useSaveTemplate } from '@/hooks/use-templates';
import { templateQualidadeSchema, TemplateQualidadeFormData } from '@/lib/templates-qualidade/template-validators';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
    templateId: string | null;
    onClose: () => void;
}

export function TemplateQualidadeForm({ templateId, onClose }: Props) {
    const { showToast } = useToast();
    const { data: initialData, isLoading } = useTemplate(templateId || undefined);
    const saveMutation = useSaveTemplate();

    const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TemplateQualidadeFormData>({
        resolver: zodResolver(templateQualidadeSchema) as any,
        defaultValues: {
            nome: "",
            perguntas: []
        }
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "perguntas"
    });

    useEffect(() => {
        if (initialData) {
            reset({
                nome: initialData.nome,
                perguntas: initialData.perguntas?.map(p => ({
                    ...p,
                    opcoes: p.opcoes || []
                })) as any || []
            });
        } else {
            // Defaults to at least one question
            if (fields.length === 0) {
                append({ texto: "", tipo: "rating-5", obrigatorio: false, ordem: 0 });
            }
        }
    }, [initialData, reset]);

    const onSubmit = async (data: TemplateQualidadeFormData) => {
        try {
            await saveMutation.mutateAsync({
                id: templateId || undefined,
                data: {
                    ...data,
                    perguntas: data.perguntas.map((p, index) => ({
                        ...p,
                        ordem: index
                    }))
                }
            });
            showToast(templateId ? "Template atualizado!" : "Template criado!", "success");
            onClose();
        } catch (error: any) {
            showToast(error.message || "Erro ao salvar o template", "error");
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (dragIndex !== dropIndex) {
            move(dragIndex, dropIndex);
        }
    };

    if (isLoading && templateId) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-pulse space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold">Carregando Template...</p>
            </div>
        );
    }

    // Monitora alterações dos tipos em tempo real para ajustar a exibição do input "opcoes"
    const formValues = watch("perguntas");

    return (
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-100px)]">
            <PageHeader
                title={templateId ? "Editar Template" : "Novo Template Qualidade"}
                description="Agrupe e estruture os comportamentos armadilhas para validação."
                badgeText="Form Builder"
                className="shrink-0"
            >
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="h-10 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={saveMutation.isPending}
                        className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {templateId ? 'Salvar Alterações' : 'Criar Template'}
                    </Button>
                </div>
            </PageHeader>

            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 pb-20 max-w-4xl pt-4">
                    <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                                Nome de Identificação (Para uso interno) <span className="text-destructive">*</span>
                            </label>
                            <Input
                                {...register("nome")}
                                placeholder="Exemplo: Bundle Hospitais Qualidade"
                                className="h-11 font-bold border-border/50 bg-background/50"
                            />
                            {errors.nome && <p className="text-destructive text-xs mt-1">{errors.nome.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h3 className="font-bold text-card-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                                <ShieldQuestion className="w-4 h-4 text-primary" /> Array de Questões Armadilha
                            </h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ texto: "", tipo: "rating-5", obrigatorio: false, ordem: fields.length })}
                                className="h-8 text-[10px] font-bold uppercase"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Pergunta
                            </Button>
                        </div>

                        {errors.perguntas?.root && <p className="text-destructive text-xs">{errors.perguntas.root.message}</p>}

                        {fields.map((field, index) => {
                            const currentTipo = formValues?.[index]?.tipo || "rating-5";

                            return (
                                <div
                                    key={field.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, index)}
                                    className="p-4 bg-muted/20 border border-border rounded-lg shadow-sm flex gap-4 items-start group relative transition-all animate-in slide-in-from-bottom-2"
                                >
                                    <div className="mt-2 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Texto <span className="text-destructive">*</span></label>
                                                <Input
                                                    {...register(`perguntas.${index}.texto`)}
                                                    placeholder="Qual o nível de excelência percebido..."
                                                    className="h-9 text-sm"
                                                />
                                                {errors.perguntas?.[index]?.texto && <p className="text-destructive text-xs mt-1">{errors.perguntas[index]?.texto?.message}</p>}
                                            </div>
                                            <div className="w-48">
                                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Modelo de Input</label>
                                                <select
                                                    {...register(`perguntas.${index}.tipo`)}
                                                    className="w-full h-9 rounded-md border border-input text-sm px-3 bg-background"
                                                >
                                                    <option value="rating-5">Estrelas (5)</option>
                                                    <option value="rating-10">Escala de Nota (10)</option>
                                                    <option value="likert">Likert (Custom)</option>
                                                    <option value="sim-nao">Sim / Não</option>
                                                    <option value="texto">Texto Curto Aberto</option>
                                                </select>
                                                {errors.perguntas?.[index]?.tipo && <p className="text-destructive text-xs mt-1">{errors.perguntas[index]?.tipo?.message}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    {...register(`perguntas.${index}.obrigatorio`)}
                                                    className="w-4 h-4 text-primary rounded border-input outline-none ring-0"
                                                />
                                                Resposta Obrigatória
                                            </label>

                                            {currentTipo === "likert" && (
                                                <div className="flex-1 bg-card/50 p-3 rounded-md border border-input animate-in fade-in">
                                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Opções do Formulário (separadas por vírgula)</label>
                                                    <Input
                                                        placeholder="Ex: Muito Ruim, Ruim, Regular, Bom, Excelente"
                                                        className="h-8 text-xs bg-background"
                                                        {...register(`perguntas.${index}.opcoes` as const, {
                                                            setValueAs: (v) => typeof v === 'string' ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : v
                                                        })}
                                                        defaultValue={formValues?.[index]?.opcoes?.join(', ') || ""}
                                                    />
                                                    {errors.perguntas?.[index]?.opcoes && <p className="text-destructive text-xs mt-1">{errors.perguntas[index]?.opcoes?.message}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}

                        {fields.length === 0 && (
                            <div className="text-center p-8 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                                Nenhuma pergunta adicionada ao template. Pelo menos uma é exigida para salvamento.
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </form>
    );
}
