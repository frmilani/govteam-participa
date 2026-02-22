"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import {
  useCreateEstabelecimento,
  useUpdateEstabelecimento,
  usePresignedUrl,
  Estabelecimento
} from '@/hooks/use-estabelecimentos';
import { useSegmentos } from '@/hooks/use-segmentos';
import {
  Store,
  Type,
  FileText,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Tag,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  Check,
  Building2,
  Info,
  X,
  User,
  Landmark,
  BarChart3,
  MoreHorizontal,
  ChevronDown,
  Braces,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TIPO_ENTIDADE_OPTIONS,
  METADADOS_FIELDS,
  TipoEntidade,
  isEmpresaType,
} from '@/lib/entidades/tipo-entidade-config';

// Mapa de ícones por nome (Lucide)
const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  User,
  FileText,
  Tag,
  BarChart3,
  Landmark,
  MoreHorizontal,
};

const TIPO_ENTIDADE_VALUES = TIPO_ENTIDADE_OPTIONS.map((t) => t.value) as [TipoEntidade, ...TipoEntidade[]];

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  website: z.string().url("URL inválida").or(z.literal("")).optional().nullable(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().url("URL inválida").or(z.literal("")).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  alias: z.string().optional().nullable(),
  segmentoIds: z.array(z.string()).min(1, "Selecione pelo menos um segmento"),
  // E1.2: Campos de tipo e metadados
  tipo: z.enum(TIPO_ENTIDADE_VALUES).default('EMPRESA'),
  metadados: z.record(z.string(), z.any()).optional().nullable(),
  // Campo auxiliar para JSON livre (tipo OUTRO)
  metadadosJson: z.string().optional().nullable(),
});

type FormSchema = typeof formSchema;

type FormData = z.infer<FormSchema>;

interface EstabelecimentoFormModalProps {
  onClose: () => void;
  estabelecimento?: Estabelecimento | null;
}

export function EstabelecimentoForm({
  onClose,
  estabelecimento
}: EstabelecimentoFormModalProps) {
  const { data: segmentos = [] } = useSegmentos();
  const createMutation = useCreateEstabelecimento();
  const updateMutation = useUpdateEstabelecimento();
  const presignedUrlMutation = usePresignedUrl();

  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nome: '',
      descricao: '',
      endereco: '',
      telefone: '',
      whatsapp: '',
      website: '',
      instagram: '',
      facebook: '',
      logoUrl: '',
      alias: '',
      segmentoIds: [],
      tipo: 'EMPRESA',
      metadados: null,
      metadadosJson: '{}',
    }
  });

  const selectedLogoUrl = watch('logoUrl');
  const selectedSegmentoIds = watch('segmentoIds') || [];
  const selectedTipo = watch('tipo') as TipoEntidade;
  const isEmpresa = isEmpresaType(selectedTipo);

  // Campos de metadados do tipo selecionado
  const metadadoFields = METADADOS_FIELDS[selectedTipo] || [];

  useEffect(() => {
    if (estabelecimento) {
      const meta = estabelecimento.metadados as Record<string, unknown> | null | undefined;
      reset({
        nome: estabelecimento.nome,
        descricao: estabelecimento.descricao || '',
        endereco: estabelecimento.endereco || '',
        telefone: estabelecimento.telefone || '',
        whatsapp: estabelecimento.whatsapp || '',
        website: estabelecimento.website || '',
        instagram: estabelecimento.instagram || '',
        facebook: estabelecimento.facebook || '',
        logoUrl: estabelecimento.logoUrl || '',
        alias: estabelecimento.alias || '',
        segmentoIds: estabelecimento.segmentos.map(s => s.segmento.id),
        tipo: (estabelecimento.tipo as TipoEntidade) || 'EMPRESA',
        metadados: meta || null,
        metadadosJson: meta ? JSON.stringify(meta, null, 2) : '{}',
      });
    } else {
      reset({
        nome: '',
        descricao: '',
        endereco: '',
        telefone: '',
        whatsapp: '',
        website: '',
        instagram: '',
        facebook: '',
        logoUrl: '',
        alias: '',
        segmentoIds: [],
        tipo: 'EMPRESA',
        metadados: null,
        metadadosJson: '{}',
      });
    }
  }, [estabelecimento, reset]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecione uma imagem.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB.");
      return;
    }

    try {
      setUploading(true);
      const { uploadUrl, publicUrl } = await presignedUrlMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!uploadResponse.ok) throw new Error("Falha no upload do arquivo");
      setValue('logoUrl', publicUrl, { shouldDirty: true });
    } catch (error) {
      console.error(error);
      alert("Erro ao fazer upload da logo.");
    } finally {
      setUploading(false);
    }
  };

  const toggleSegmento = (id: string) => {
    const current = [...selectedSegmentoIds];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setValue('segmentoIds', current, { shouldDirty: true, shouldValidate: true });
  };

  const handleTipoChange = (tipo: TipoEntidade) => {
    setValue('tipo', tipo, { shouldDirty: true });
    // Ao trocar tipo, navega para aba básica
    setActiveTab('basic');
  };

  // Task 5: Montar metadados no submit
  const onSubmit = async (data: FormData) => {
    try {
      let metadados: Record<string, unknown> | null = null;

      if (selectedTipo === 'OUTRO') {
        // JSON livre
        try {
          metadados = data.metadadosJson ? JSON.parse(data.metadadosJson) : null;
          setJsonError(null);
        } catch {
          setJsonError("JSON inválido. Verifique a sintaxe.");
          return;
        }
      } else if (metadadoFields.length > 0) {
        // Campos estruturados — montar objeto de metadados
        const rawMeta = data.metadados as Record<string, unknown> | null;
        if (rawMeta) {
          metadados = Object.fromEntries(
            metadadoFields.map((f) => [f.key, rawMeta[f.key] ?? ''])
          );
        }
      }

      const payload: Record<string, unknown> = {
        nome: data.nome,
        descricao: data.descricao,
        alias: data.alias,
        logoUrl: data.logoUrl,
        segmentoIds: data.segmentoIds,
        tipo: data.tipo,
        metadados,
      };

      // AC: 10 — Campos de empresa apenas quando tipo é EMPRESA
      if (isEmpresaType(data.tipo)) {
        payload.endereco = data.endereco;
        payload.telefone = data.telefone;
        payload.whatsapp = data.whatsapp;
        payload.website = data.website;
        payload.instagram = data.instagram;
        payload.facebook = data.facebook;
      }

      if (estabelecimento) {
        await updateMutation.mutateAsync({ id: estabelecimento.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  // Tabs dinâmicas: aba "Contato" visível só para EMPRESA
  const tabs = [
    { id: 'basic', label: 'Básico', icon: Info },
    ...(isEmpresa ? [{ id: 'contact', label: 'Contato', icon: Phone }] : []),
    ...(metadadoFields.length > 0 || selectedTipo === 'OUTRO'
      ? [{ id: 'metadata', label: 'Dados Específicos', icon: Braces }]
      : []),
    { id: 'categories', label: 'Categorias', icon: Tag },
  ];

  const selectedTipoOption = TIPO_ENTIDADE_OPTIONS.find(t => t.value === selectedTipo);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <Button
          variant="ghost"
          onClick={onClose}
          className="h-10 w-10 p-0 rounded-md hover:bg-muted text-muted-foreground"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {estabelecimento ? 'Editar Participante' : 'Nova Entidade'}
          </h1>
          <p className="text-muted-foreground font-medium text-[10px] uppercase tracking-wider mt-1">
            {estabelecimento ? `Atualizando ${selectedTipoOption?.label ?? 'entidade'}` : 'Cadastro de participante'}
          </p>
        </div>
        {/* Badge do tipo atual */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          {selectedTipoOption && ICON_MAP[selectedTipoOption.icon] && React.createElement(ICON_MAP[selectedTipoOption.icon], { size: 13, className: "text-primary" })}
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
            {selectedTipoOption?.label}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Task 3 / AC: 1 — Seletor visual de Tipo de Entidade */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Store size={12} className="text-primary" />
            Tipo de Entidade
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {TIPO_ENTIDADE_OPTIONS.map((option) => {
              const IconComp = ICON_MAP[option.icon];
              const isSelected = selectedTipo === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTipoChange(option.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition-all duration-200",
                    isSelected
                      ? "bg-primary/10 border-primary/40 text-primary shadow-sm ring-1 ring-primary/20"
                      : "bg-background border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {IconComp && <IconComp size={18} />}
                  <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">{option.label}</span>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-primary flex items-center justify-center">
                      <Check size={8} className="text-primary-foreground" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Descrição do tipo selecionado */}
          {selectedTipoOption && (
            <p className="mt-2 text-[10px] text-muted-foreground font-medium">
              {selectedTipoOption.description}
            </p>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-border bg-muted/30 p-1 gap-1 overflow-x-auto rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-background text-primary shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                )}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-card rounded-lg border border-border shadow-sm p-6">

          {/* Tab: Basic */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Logo Upload */}
              <div className="p-4 bg-muted/50 rounded-lg border border-border shadow-sm group">
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 rounded-lg bg-card border border-dashed border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/50 transition-all shadow-inner">
                    {selectedLogoUrl ? (
                      <>
                        <img src={selectedLogoUrl as string} alt="Logo" className="absolute inset-0 w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setValue('logoUrl', '')}
                          className="absolute inset-0 bg-destructive/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="text-white" size={20} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground/40 group-hover:text-primary transition-colors">
                        {uploading ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={20} />}
                        <span className="text-[8px] font-bold uppercase tracking-widest">Logo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-tight">Imagem / Logo</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Exibida nos resultados e no formulário de votação. PNG ou JPG até 2MB.</p>
                    <div className="pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-md px-3 font-bold text-[10px] uppercase tracking-wider"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? 'Enviando...' : 'Fazer Upload'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Store size={12} className="text-primary" />
                    Nome {selectedTipoOption?.label}
                  </label>
                  <input
                    {...register('nome')}
                    placeholder={`Ex: ${selectedTipo === 'CANDIDATO' ? 'João Silva' : selectedTipo === 'PROPOSTA' ? 'Melhoria do Transporte Público' : 'Pizzaria do Zé'}`}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-bold text-sm shadow-sm"
                  />
                  {errors.nome && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.nome.message}</p>}
                </div>

                {/* Alias */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Type size={12} className="text-primary" />
                    Apelidos de Busca
                  </label>
                  <p className="text-[10px] text-muted-foreground font-medium tracking-tight">Separe apelidos por vírgula para facilitar a busca do eleitor.</p>
                  <input
                    {...register('alias')}
                    placeholder="Ex: Zé da Pizza, O Rei da Pizza"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
                  />
                </div>

                {/* Descricao */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={12} className="text-primary" />
                    Slogan / Especialidade
                  </label>
                  <input
                    {...register('descricao')}
                    placeholder="Ex: A melhor massa da cidade desde 1990"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
                  />
                </div>

                {/* Endereço — apenas EMPRESA (AC: 2, 10) */}
                {isEmpresa && (
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={12} className="text-primary" />
                      Endereço Completo
                    </label>
                    <input
                      {...register('endereco')}
                      placeholder="Rua, Número, Bairro - Cidade"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Contact — apenas EMPRESA (AC: 2, 10) */}
          {activeTab === 'contact' && isEmpresa && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Telefone de Contato
                  </label>
                  <input
                    {...register('telefone')}
                    placeholder="(00) 0000-0000"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    WhatsApp Comercial
                  </label>
                  <input
                    {...register('whatsapp')}
                    placeholder="(00) 90000-0000"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="my-6 border-t border-border/50" />

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={12} className="text-primary" /> Website Oficial
                  </label>
                  <input
                    {...register('website')}
                    placeholder="https://suaempresa.com.br"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
                  />
                  {errors.website && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.website.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Instagram size={12} className="text-primary" /> Perfil Instagram
                    </label>
                    <input
                      {...register('instagram')}
                      placeholder="@usuario"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Facebook size={12} className="text-primary" /> Página Facebook
                    </label>
                    <input
                      {...register('facebook')}
                      placeholder="fb.com/pagina"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
                    />
                    {errors.facebook && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.facebook.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Metadados específicos por tipo (AC: 3-8) */}
          {activeTab === 'metadata' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Braces size={14} className="text-primary" />
                  Dados Específicos — {selectedTipoOption?.label}
                </h4>
                <p className="text-[10px] text-muted-foreground font-medium">
                  Campos adicionais para este tipo de entidade, armazenados como metadados estruturados.
                </p>
              </div>

              {/* AC: 8 — Tipo OUTRO: editor JSON livre */}
              {selectedTipo === 'OUTRO' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Braces size={12} className="text-primary" />
                    Metadados JSON Livre
                  </label>
                  <textarea
                    {...register('metadadosJson')}
                    rows={10}
                    placeholder={'{\n  "campoPersonalizado": "valor"\n}'}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-mono text-sm shadow-sm resize-y"
                    spellCheck={false}
                  />
                  {jsonError && (
                    <p className="text-[10px] text-destructive font-bold uppercase mt-1">{jsonError}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">Insira qualquer estrutura JSON válida para metadados personalizados.</p>
                </div>
              ) : (
                /* AC: 3-7 — Campos estruturados por tipo */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {metadadoFields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          {...register(`metadados.${field.key}` as any)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
                        />
                      ) : (
                        <input
                          type={field.type}
                          {...register(`metadados.${field.key}` as any)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-ring focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Categories */}
          {activeTab === 'categories' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">Relacionar Categorias</h4>
                <p className="text-[10px] text-muted-foreground font-medium">Selecione as categorias onde este participante poderá ser votado.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {segmentos
                  .filter(s => s.paiId)
                  .map(s => {
                    const isSelected = selectedSegmentoIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSegmento(s.id)}
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-tight transition-all",
                          isSelected
                            ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-muted"
                        )}
                      >
                        {s.nome}
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </button>
                    );
                  })}
              </div>
              {errors.segmentoIds && <p className="text-[10px] text-destructive font-bold mt-2 uppercase">{errors.segmentoIds.message}</p>}
            </div>
          )}
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="px-4 font-medium"
            disabled={createMutation.isPending || updateMutation.isPending || uploading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="md"
            isLoading={createMutation.isPending || updateMutation.isPending || uploading}
            className="px-6 font-bold uppercase tracking-wider text-xs"
          >
            {estabelecimento ? 'Salvar Alterações' : `Cadastrar ${selectedTipoOption?.label ?? 'Entidade'}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
