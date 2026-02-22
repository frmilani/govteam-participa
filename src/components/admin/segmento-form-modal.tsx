"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { IconPicker } from '@/components/ui/IconPicker';
import { useCreateSegmento, useUpdateSegmento, Segmento } from '@/hooks/use-segmentos';
import { ArrowLeft, Palette, Type, Folder, Link as LinkIcon, ClipboardList } from 'lucide-react';
import { useTemplates } from '@/hooks/use-templates';

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  paiId: z.string().nullable().optional(),
  templateQualidadeId: z.string().nullable().optional(),
  cor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida").optional(),
  icone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SegmentoFormProps {
  onClose: () => void;
  segmento?: Segmento | null;
  parentSegmentos?: Segmento[];
  defaultParentId?: string | null;
}

export function SegmentoForm({
  onClose,
  segmento,
  parentSegmentos = [],
  defaultParentId = ""
}: SegmentoFormProps) {
  const createMutation = useCreateSegmento();
  const updateMutation = useUpdateSegmento();

  const { data: templates = [] } = useTemplates();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      paiId: '',
      templateQualidadeId: '',
      cor: '#4F46E5',
      icone: 'folder-open'
    }
  });

  const selectedIcon = watch('icone');
  const selectedColor = watch('cor');

  useEffect(() => {
    if (segmento) {
      reset({
        nome: segmento.nome,
        paiId: segmento.paiId || '',
        templateQualidadeId: segmento.templateQualidadeId || '',
        cor: segmento.cor || '#4F46E5',
        icone: (!segmento.icone || segmento.icone === 'Folder') ? 'folder-open' : segmento.icone
      });
    } else {
      // Logic to inherit color from default parent
      const parent = parentSegmentos.find(p => p.id === defaultParentId);
      reset({
        nome: '',
        paiId: defaultParentId || '',
        cor: parent?.cor || '#4F46E5', // Inherit color from parent or default
        icone: 'folder-open'
      });
    }
  }, [segmento, reset, defaultParentId, parentSegmentos]);

  const onSubmit = async (data: FormData) => {
    try {
      if (segmento) {
        await updateMutation.mutateAsync({ id: segmento.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  // Extract register props to handle onChange manually
  const paiIdRegister = register('paiId');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <Button
          variant="ghost"
          onClick={onClose}
          className="h-10 w-10 p-0 rounded-lg hover:bg-muted text-muted-foreground transition-all"
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {segmento ? 'Editar Categoria' : 'Nova Categoria'}
          </h1>
          <p className="text-muted-foreground font-medium text-[10px] uppercase tracking-wider mt-0.5">
            {segmento ? 'Gestão de agrupamento e identidade' : 'Organize seus estabelecimentos por setor'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            {/* Coluna Principal: Nome e Pai */}
            <div className="space-y-8">
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Type size={14} className="text-primary" />
                  Identificação da Categoria
                </label>
                <input
                  {...register('nome')}
                  placeholder="Ex: Restaurantes, Saúde, Educação..."
                  className="w-full h-11 px-4 rounded-lg border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-bold text-sm shadow-sm placeholder:text-muted-foreground/50"
                />
                {errors.nome && <p className="text-[10px] text-destructive font-bold uppercase tracking-wider ml-1">{errors.nome.message}</p>}
              </div>

              {!segmento?.filhos?.length && (
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Folder size={14} className="text-primary" />
                    Hierarquia (Opcional)
                  </label>
                  <div className="relative group">
                    <select
                      {...paiIdRegister}
                      onChange={(e) => {
                        paiIdRegister.onChange(e); // Call original react-hook-form onChange
                        const newParentId = e.target.value;
                        const parent = parentSegmentos.find(p => p.id === newParentId);
                        if (parent?.cor) {
                          setValue('cor', parent.cor, { shouldDirty: true, shouldValidate: true });
                        }
                      }}
                      className="w-full h-11 px-4 rounded-lg border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-bold text-sm appearance-none cursor-pointer shadow-sm text-foreground"
                    >
                      <option value="">Nenhum (Categoria Principal)</option>
                      {parentSegmentos
                        .filter(p => p.id !== segmento?.id)
                        .map(p => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                      <Folder size={14} />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest pl-1">
                    Vincule a uma categoria existente para criar uma subcategoria.
                  </p>
                </div>
              )}

              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                  <ClipboardList size={14} className="text-primary" />
                  Perguntas de Qualidade
                </label>
                <div className="relative group">
                  <select
                    {...register('templateQualidadeId')}
                    className="w-full h-11 px-4 rounded-lg border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-bold text-sm appearance-none cursor-pointer shadow-sm text-foreground"
                  >
                    <option value="">Nenhum (Usar herança do pai)</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                    <ClipboardList size={14} />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest pl-1">
                  Vincule um template para habilitar auditoria qualitativa nesta categoria.
                </p>
              </div>
            </div>

            {/* Coluna Visual: Cor e Ícone */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Palette size={14} className="text-primary" />
                  Identidade Visual
                </label>

                <div className="p-6 bg-muted/30 rounded-xl border border-border space-y-8 shadow-inner">
                  {/* Cor */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Paleta de Cores</p>
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="color-picker"
                        className="h-12 w-12 shrink-0 rounded-xl border-4 border-background shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 ring-1 ring-border"
                        style={{ backgroundColor: selectedColor || '#4F46E5' }}
                      />
                      <input
                        id="color-picker"
                        type="color"
                        value={selectedColor || '#4F46E5'}
                        onInput={(e: any) => {
                          setValue('cor', e.target.value, { shouldDirty: true, shouldValidate: true });
                        }}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register('cor')}
                          placeholder="#000000"
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-mono font-bold text-sm uppercase shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ícone */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Símbolo Representativo</p>
                    <div className="p-1 bg-background rounded-lg border border-border shadow-sm">
                      <IconPicker
                        value={selectedIcon || 'Folder'}
                        onChange={(val) => setValue('icone', val)}
                      />
                    </div>
                    <input type="hidden" {...register('icone')} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="px-6 font-bold uppercase tracking-widest text-[10px] h-11"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="md"
            isLoading={createMutation.isPending || updateMutation.isPending}
            className="px-8 font-bold uppercase tracking-widest text-[10px] h-11 shadow-lg shadow-primary/20"
          >
            {segmento ? 'Atualizar Categoria' : 'Confirmar Cadastro'}
          </Button>
        </div>
      </form>
    </div>
  );
}
