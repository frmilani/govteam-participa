"use client";

import React, { useState } from 'react';
import {
  ArrowLeft,
  Info,
  Tag as TagIcon,
  Share2,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useCreateLead, useUpdateLead, useCheckDuplicate, LeadWithTags } from '@/hooks/use-leads';
import { useTags } from '@/hooks/use-tags';
import { Sexo, TipoPessoa } from '@prisma/client';
import { formatCPF, formatCNPJ, formatPhone, isValidCPF, isValidCNPJ } from '@/lib/utils';

const leadFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal("")),
  sexo: z.nativeEnum(Sexo).nullable().optional(),
  telefone: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  tagIds: z.array(z.string()),
  tipoPessoa: z.nativeEnum(TipoPessoa),
  cpf: z.string().nullable().optional().refine((val) => !val || isValidCPF(val), "CPF inválido"),
  cnpj: z.string().nullable().optional().refine((val) => !val || isValidCNPJ(val), "CNPJ inválido"),
}).superRefine((data, ctx) => {
  if (data.tipoPessoa === TipoPessoa.FISICA && !data.cpf) {
    // CPF opcional ou obrigatorio? User said "cpf e cnpj campos nao obrigatorios", but logic implies if fisica show cpf key.
    // "Vamos adicionar 3 campos não obrigatórios" -> confirmed optional.
  }
  if (data.tipoPessoa === TipoPessoa.JURIDICA && data.cnpj && !isValidCNPJ(data.cnpj)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "CNPJ inválido",
      path: ["cnpj"],
    });
  }
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  lead?: LeadWithTags | null;
  onClose: () => void;
}

export function LeadForm({ lead, onClose }: LeadFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'tags' | 'digital'>('basic');
  const { data: tags = [] } = useTags();
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const checkDuplicateMutation = useCheckDuplicate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      nome: lead?.nome || "",
      whatsapp: lead?.whatsapp || "",
      email: lead?.email || "",
      sexo: lead?.sexo || null,
      telefone: lead?.telefone || "",
      facebook: lead?.facebook || "",
      instagram: lead?.instagram || "",
      tagIds: lead?.tags.map((t: any) => t.tagId) || [],
      tipoPessoa: lead?.tipoPessoa || TipoPessoa.FISICA,
      cpf: lead?.cpf || "",
      cnpj: lead?.cnpj || "",
    },
  });

  const selectedTagIds = watch('tagIds');
  const watchedCpf = watch('cpf');
  const watchedCnpj = watch('cnpj');
  const watchedTipoPessoa = watch('tipoPessoa');

  React.useEffect(() => {
    if (watchedCpf && watchedCpf.length > 0 && watchedTipoPessoa !== TipoPessoa.FISICA) {
      setValue('tipoPessoa', TipoPessoa.FISICA);
    }
  }, [watchedCpf, watchedTipoPessoa, setValue]);

  React.useEffect(() => {
    if (watchedCnpj && watchedCnpj.length > 0 && watchedTipoPessoa !== TipoPessoa.JURIDICA) {
      setValue('tipoPessoa', TipoPessoa.JURIDICA);
    }
  }, [watchedCnpj, watchedTipoPessoa, setValue]);

  const onSubmit = async (data: LeadFormData) => {
    try {
      if (lead) {
        await updateMutation.mutateAsync({ id: lead.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTag = (tagId: string) => {
    const current = [...selectedTagIds];
    const index = current.indexOf(tagId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(tagId);
    }
    setValue('tagIds', current);
  };

  const tabs = [
    { id: 'basic', label: 'Básico', icon: Info },
    { id: 'tags', label: 'Segmentação', icon: TagIcon },
    { id: 'digital', label: 'Digital', icon: Share2 },
  ] as const;

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
            {lead ? 'Editar Perfil' : 'Novo Respondente'}
          </h1>
          <p className="text-muted-foreground font-medium text-[10px] uppercase tracking-wider mt-0.5">
            {lead ? 'Gerenciar dados e segmentações' : 'Cadastrar eleitor para votação'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tabs Navigation */}
        <div className="flex bg-muted/50 p-1.5 gap-1.5 overflow-x-auto rounded-xl border border-border/50 shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-background text-primary shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                )}
              >
                <Icon size={14} className={cn(activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-8 min-h-[420px] relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

          {activeTab === 'basic' && (
            <div className="space-y-8 max-w-3xl animate-in slide-in-from-left-4 duration-500 relative z-10">
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                    Nome Completo <span className="text-destructive">*</span>
                  </label>
                  <Input
                    {...register('nome')}
                    placeholder="Nome completo do respondente"
                    error={errors.nome?.message}
                    className="h-11 font-bold text-foreground border-border bg-background focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                    WhatsApp <span className="text-destructive">*</span>
                  </label>
                  <Input
                    {...register('whatsapp')}
                    onChange={(e) => {
                      e.target.value = formatPhone(e.target.value);
                      register('whatsapp').onChange(e);
                    }}
                    placeholder="Ex: (62) 99999-8888"
                    error={errors.whatsapp?.message}
                    className="h-11 font-bold text-foreground border-border bg-background focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                    E-mail
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="exemplo@email.com"
                    error={errors.email?.message}
                    className="h-11 font-medium text-foreground border-border bg-background focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                    Gênero
                  </label>
                  <div className="relative">
                    <select
                      {...register('sexo')}
                      className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm font-bold text-foreground focus:ring-1 focus:ring-ring focus:border-primary transition-all outline-none appearance-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="OUTRO">Outro</option>
                      <option value="NAO_INFORMAR">Não informar</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                      <Info size={14} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                    Telefone Alternativo
                  </label>
                  <Input
                    {...register('telefone')}
                    onChange={(e) => {
                      e.target.value = formatPhone(e.target.value);
                      register('telefone').onChange(e);
                    }}
                    placeholder="(00) 0000-0000"
                    className="h-11 font-bold text-foreground border-border bg-background focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t border-border/50">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                    Tipo de Pessoa
                  </label>
                  <div className="relative">
                    <select
                      {...register('tipoPessoa')}
                      className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm font-bold text-foreground focus:ring-1 focus:ring-ring focus:border-primary transition-all outline-none appearance-none"
                    >
                      <option value={TipoPessoa.FISICA}>Pessoa Física</option>
                      <option value={TipoPessoa.JURIDICA}>Pessoa Jurídica</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                      <Info size={14} />
                    </div>
                  </div>
                </div>

                {watch('tipoPessoa') === TipoPessoa.FISICA ? (
                  <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                      CPF
                    </label>
                    <Input
                      {...register('cpf')}
                      onChange={(e) => {
                        e.target.value = formatCPF(e.target.value);
                        setValue('cpf', e.target.value, { shouldValidate: true });
                      }}
                      placeholder="000.000.000-00"
                      error={errors.cpf?.message}
                      className="h-11 font-bold text-foreground border-border bg-background focus:ring-primary/20"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                      CNPJ
                    </label>
                    <Input
                      {...register('cnpj')}
                      onChange={(e) => {
                        e.target.value = formatCNPJ(e.target.value);
                        setValue('cnpj', e.target.value, { shouldValidate: true });
                      }}
                      placeholder="00.000.000/0000-00"
                      error={errors.cnpj?.message}
                      className="h-11 font-bold text-foreground border-border bg-background focus:ring-primary/20"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-500 relative z-10">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground tracking-tight">Segmentação de Audiência</h3>
                <p className="text-xs text-muted-foreground font-medium">Aplique tags para organizar seus leads em listas de envio e relatórios.</p>
              </div>

              <div className="flex flex-wrap gap-2.5 p-6 bg-muted/20 rounded-xl border border-dashed border-border">
                {tags.length === 0 ? (
                  <div className="w-full py-8 text-center text-muted-foreground text-xs font-medium">
                    Nenhuma tag cadastrada no sistema.
                  </div>
                ) : (
                  tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-primary/20"
                            : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:bg-muted"
                        )}
                        style={isSelected && tag.cor ? {
                          backgroundColor: tag.cor,
                          borderColor: tag.cor,
                          color: '#fff',
                          boxShadow: `0 4px 12px ${tag.cor}30`
                        } : {}}
                      >
                        {tag.nome}
                      </button>
                    );
                  })
                )}

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-2 group"
                >
                  <Plus size={14} className="group-hover:scale-110 transition-transform" />
                  Criar Nova Tag
                </button>
              </div>
            </div>
          )}

          {activeTab === 'digital' && (
            <div className="space-y-8 max-w-2xl animate-in slide-in-from-left-4 duration-500 relative z-10">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground tracking-tight">Presença Digital</h3>
                <p className="text-xs text-muted-foreground font-medium">Redes sociais utilizadas pelo respondente para engajamento.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                    Instagram Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">@</span>
                    <Input
                      {...register('instagram')}
                      placeholder="usuario"
                      className="h-11 pl-8 font-bold text-foreground border-border bg-background focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                    URL Facebook
                  </label>
                  <Input
                    {...register('facebook')}
                    placeholder="facebook.com/usuario"
                    className="h-11 font-bold text-foreground border-border bg-background focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2">
            <AlertCircle size={14} className="text-primary" />
            Campos marcados com * são obrigatórios
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 md:flex-initial px-6 font-bold uppercase tracking-widest text-[10px] h-11"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="md"
              isLoading={isSubmitting}
              className="flex-1 md:flex-initial px-8 font-bold uppercase tracking-widest text-[10px] h-11 shadow-lg shadow-primary/20"
            >
              {lead ? 'Atualizar Registro' : 'Confirmar Cadastro'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
