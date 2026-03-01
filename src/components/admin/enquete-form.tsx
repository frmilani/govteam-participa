"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Palette,
  ShieldCheck,
  Globe,
  Users,
  Store,
  Tag,
  FileText,
  Trophy,
  Award,
  Eye,
  Save,
  ArrowLeft,
  Microscope
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateEnquete, useCreateEnquete } from "@/hooks/use-enquetes";
import { useQuery } from "@tanstack/react-query";
import { useSegmentos } from "@/hooks/use-segmentos";
import {
  useEstabelecimentos,
  usePresignedUrl,
} from "@/hooks/use-estabelecimentos";
import { apiFetch } from "@/lib/api-client";
import { PageHeader } from '@/components/admin/PageHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
// E1.3: Label contextual e collapsed state da aba de entidades
import { getEntidadesTabLabel, isEntidadesTabCollapsed, getCategoriasTabLabel, isEntidadesTabHidden } from "@/lib/enquete/tab-labels";

// Atomic Design Components
import { enqueteFormSchema, EnqueteFormData } from "./enquete/EnqueteFormSchema";
import { BasicTab } from "./enquete/tabs/BasicTab";
import { SegmentsTab } from "./enquete/tabs/SegmentsTab";
import { CompaniesTab } from "./enquete/tabs/CompaniesTab";
import { SecurityTab } from "./enquete/tabs/SecurityTab";
import { PrizesTab } from "./enquete/tabs/PrizesTab";
import { LegalTab } from "./enquete/tabs/LegalTab";
import { ResultsTab } from "./enquete/tabs/ResultsTab";
import { VisualTab } from "./enquete/tabs/VisualTab";
import { ThanksTab } from "./enquete/tabs/ThanksTab";
import { EnquetePreview } from "./enquete/EnquetePreview";
import { ResearchTab } from "./enquete/tabs/ResearchTab";

interface EnqueteFormProps {
  enquete?: any | null;
  onClose: () => void;
}

export function EnqueteForm({ enquete, onClose }: EnqueteFormProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    | "basic"
    | "segments"
    | "research"
    | "companies"
    | "security"
    | "prizes"
    | "legal"
    | "results"
    | "visual"
    | "thanks"
  >("basic");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMutation = useCreateEnquete();
  const updateMutation = useUpdateEnquete();

  const { data: hubForms = [], isLoading: isLoadingHubForms } = useQuery({
    queryKey: ["hub-forms"],
    queryFn: async () => {
      const res = await apiFetch("/api/hub/forms");
      if (res.denied) throw new Error("HPAC_DENIED");
      if (!res.ok) throw new Error("Falha ao carregar formulários do Hub");
      return res.json() as Promise<
        Array<{ id: string; publicId: string; title: string }>
      >;
    },
  });

  const presignedUrlMutation = usePresignedUrl();

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { data: allSegmentos = [] } = useSegmentos({ onlyPopulated: true });
  const { data: allEstabelecimentos = [] } = useEstabelecimentos();

  const methods = useForm<EnqueteFormData>({
    resolver: zodResolver(enqueteFormSchema as any),
    defaultValues: {
      titulo: "",
      descricao: "",
      tipoPesquisa: "premiacao",
      formPublicId: "",
      modoAcesso: "HIBRIDO",
      configVisual: {
        primaryColor: "#4F46E5",
        logoUrl: "",
        bannerUrl: "",
        template: "default",
      },
      paginaAgradecimento: {
        titulo: "Obrigado por votar!",
        mensagem:
          "Sua participação é fundamental para o sucesso do nosso prêmio.",
        showShareButtons: true,
      },
      linkExpiracaoDias: 30,
      segmentoIds: [],
      estabelecimentoIds: [],

      // E2.2: Aba Pesquisa
      modoColeta: "recall-assistido",
      incluirQualidade: false,
      modoDistribuicao: "grupo",
      maxCategoriasPorEleitor: undefined,
      randomizarOpcoes: true,
      configPesquisa: {},

      securityLevel: "NONE",
      minCompleteness: 70,
      exigirIdentificacao: true,
      exigirCpf: false,
      usarNumerosSorte: false,
      digitosNumerosSorte: 5,
      usarPremiacao: false,
      quantidadePremiados: 0,
      configPremiacao: [],
      premiacaoStatus: "EM_CONFERENCIA",
      regulamento: "",
      politicaPrivacidade: "",
      termosLgpd: "",
      resultadosStatus: "EM_CONFERENCIA",
      configResultados: {
        exibirVotos: true,
        exibirPercentual: true,
      },
    },
  });

  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (enquete) {
      reset({
        titulo: enquete.titulo || "",
        descricao: enquete.descricao || "",
        tipoPesquisa: enquete.tipoPesquisa || "premiacao",
        formPublicId: enquete.formPublicId || "",
        modoAcesso: enquete.modoAcesso || "HIBRIDO",
        configVisual: {
          primaryColor: enquete.configVisual?.primaryColor || "#4F46E5",
          logoUrl: enquete.configVisual?.logoUrl || "",
          bannerUrl: enquete.configVisual?.bannerUrl || "",
          template: enquete.configVisual?.template || "default",
        },
        paginaAgradecimento: {
          titulo: enquete.paginaAgradecimento?.titulo || "Obrigado por votar!",
          mensagem:
            enquete.paginaAgradecimento?.mensagem ||
            "Sua participação é fundamental para o sucesso do nosso prêmio.",
          showShareButtons:
            enquete.paginaAgradecimento?.showShareButtons !== undefined
              ? enquete.paginaAgradecimento.showShareButtons
              : true,
        },
        linkExpiracaoDias: enquete.linkExpiracaoDias || 30,
        dataInicio: enquete.dataInicio
          ? new Date(enquete.dataInicio).toISOString().slice(0, 16)
          : "",
        dataFim: enquete.dataFim
          ? new Date(enquete.dataFim).toISOString().slice(0, 16)
          : "",
        segmentoIds: enquete.segmentos?.map((s: any) => s.id) || [],
        estabelecimentoIds: enquete.estabelecimentos?.map((e: any) => e.id) || [],

        // E2.2: Aba Pesquisa
        modoColeta: enquete.modoColeta || "recall-assistido",
        incluirQualidade: enquete.incluirQualidade !== undefined ? enquete.incluirQualidade : false,
        modoDistribuicao: enquete.modoDistribuicao || "grupo",
        maxCategoriasPorEleitor: enquete.maxCategoriasPorEleitor || undefined,
        randomizarOpcoes: enquete.randomizarOpcoes !== undefined ? enquete.randomizarOpcoes : true,
        configPesquisa: enquete.configPesquisa || {},

        securityLevel: enquete.securityLevel || "NONE",
        minCompleteness: enquete.minCompleteness || 70,
        exigirIdentificacao:
          enquete.exigirIdentificacao !== undefined
            ? enquete.exigirIdentificacao
            : true,
        exigirCpf: enquete.exigirCpf !== undefined ? enquete.exigirCpf : false,
        usarNumerosSorte: enquete.usarNumerosSorte || false,
        digitosNumerosSorte: enquete.digitosNumerosSorte || 5,
        usarPremiacao: enquete.usarPremiacao || false,
        quantidadePremiados: enquete.quantidadePremiados || 0,
        configPremiacao: enquete.configPremiacao || [],
        premiacaoStatus: enquete.premiacaoStatus || "EM_CONFERENCIA",
        regulamento: enquete.regulamento || "",
        politicaPrivacidade: enquete.politicaPrivacidade || "",
        termosLgpd: enquete.termosLgpd || "",
        resultadosStatus: enquete.resultadosStatus || "EM_CONFERENCIA",
        configResultados: {
          exibirVotos:
            enquete.configResultados?.exibirVotos !== undefined
              ? enquete.configResultados.exibirVotos
              : true,
          exibirPercentual:
            enquete.configResultados?.exibirPercentual !== undefined
              ? enquete.configResultados.exibirPercentual
              : true,
        },
      });
    }
  }, [enquete, reset]);

  const onSubmit = async (data: EnqueteFormData) => {
    try {
      console.log("Submitting form data:", data);
      setErrorMessage(null);
      const payload = {
        ...data,
        dataInicio: data.dataInicio
          ? new Date(data.dataInicio).toISOString()
          : null,
        dataFim: data.dataFim ? new Date(data.dataFim).toISOString() : null,
      };

      if (enquete) {
        await updateMutation.mutateAsync({ id: enquete.id, ...payload });
        showToast("Enquete atualizada com sucesso!", "success");
      } else {
        await createMutation.mutateAsync(payload as any);
        showToast("Enquete criada com sucesso!", "success");
      }
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar enquete:", error);
      const msg = error.message || "Erro ao salvar enquete. Tente novamente.";
      setErrorMessage(msg);
      showToast(msg, "error");
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);

    // Map fields to their respective tabs
    const fieldToTabMap: Record<string, string> = {
      titulo: 'basic',
      descricao: 'basic',
      formPublicId: 'basic',
      modoAcesso: 'basic',
      dataInicio: 'basic',
      dataFim: 'basic',
      linkExpiracaoDias: 'basic',

      segmentoIds: 'segments',
      estabelecimentoIds: 'companies',

      modoColeta: 'research',
      modoDistribuicao: 'research',
      maxCategoriasPorEleitor: 'research',
      incluirQualidade: 'research',
      configPesquisa: 'research',
      randomizarOpcoes: 'research',

      securityLevel: 'security',
      minCompleteness: 'security',
      exigirIdentificacao: 'security',
      exigirCpf: 'security',

      usarNumerosSorte: 'prizes',
      digitosNumerosSorte: 'prizes',
      usarPremiacao: 'prizes',
      quantidadePremiados: 'prizes',
      configPremiacao: 'prizes',
      premiacaoStatus: 'prizes',

      regulamento: 'legal',
      politicaPrivacidade: 'legal',
      termosLgpd: 'legal',

      resultadosStatus: 'results',
      configResultados: 'results',

      configVisual: 'visual',
      paginaAgradecimento: 'thanks'
    };

    const firstErrorKey = Object.keys(errors)[0];
    const firstError = errors[firstErrorKey];

    // Determine which tab has the error
    let targetTab = fieldToTabMap[firstErrorKey];

    // Handle nested objects
    if (!targetTab) {
      if (errors.configVisual) targetTab = 'visual';
      else if (errors.paginaAgradecimento) targetTab = 'thanks';
      else if (errors.configResultados) targetTab = 'results';
    }

    if (targetTab) {
      setActiveTab(targetTab as any);
    }

    // Recursively find the actual error message for nested fields
    let currentError = firstError;
    let currentKey = firstErrorKey;

    while (currentError && !currentError.message && !currentError.type && typeof currentError === 'object') {
      const nextKey = Object.keys(currentError)[0];
      if (!nextKey) break;
      currentError = currentError[nextKey];
      currentKey = nextKey; // Update key to point to the specific field
    }

    const fieldNameTranslation: Record<string, string> = {
      titulo: "Título",
      formPublicId: "Formulário do Hub",
      dataInicio: "Data Início",
      dataFim: "Data Fim",
      mensagem: "Mensagem",
      // Add more translations as needed
    };

    const friendlyFieldName = fieldNameTranslation[currentKey] || currentKey || firstErrorKey;
    const errorMsg = currentError?.message || "Campo obrigatório inválido.";

    const msg = `Erro em ${friendlyFieldName}: ${errorMsg}`;
    setErrorMessage(msg);
    showToast(msg, "error");
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof EnqueteFormData | string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo 2MB.");
      return;
    }

    const isLogo = field.toString().includes("logo");
    if (isLogo) setUploadingLogo(true);
    else setUploadingBanner(true);

    try {
      const response = await presignedUrlMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
      });

      // Validar se a resposta tem o formato esperado
      if (!response.uploadUrl || !response.publicUrl) {
        throw new Error("Formato de resposta inválido do servidor");
      }

      const { uploadUrl, publicUrl } = response;

      // Realizar o upload via PUT direto para o S3/MinIO
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error("Falha no upload para o storage");

      setValue(field as any, publicUrl, { shouldDirty: true });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erro ao enviar arquivo. Verifique o console para mais detalhes.");
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  // E1.3 — Label e collapsed state da aba de Entidades (AC: 2, 3, 4)
  const tipoPesquisa = watch('tipoPesquisa' as any) as string | undefined;
  const modoColeta = watch('modoColeta' as any) as string | undefined;
  const entidadesLabel = getEntidadesTabLabel(tipoPesquisa);
  const entidadesCollapsed = isEntidadesTabCollapsed(tipoPesquisa, modoColeta);
  const categoriasLabel = getCategoriasTabLabel(tipoPesquisa);
  // Estado local para permitir expandir manualmente aba collapsed (AC: 5)
  const [collapsedOverride, setCollapsedOverride] = useState<Set<string>>(new Set());

  const isTabHidden = (tabId: string) => {
    if (tabId === 'companies') return isEntidadesTabHidden(modoColeta);
    return false;
  };

  const isTabCollapsed = (tabId: string) => {
    if (isTabHidden(tabId)) return false;
    if (collapsedOverride.has(tabId)) return false;
    if (tabId === 'companies') return entidadesCollapsed;
    return false;
  };

  // Se a aba ativa for escondida (ex: mudou modo de coleta), volta para basic
  useEffect(() => {
    if (isTabHidden(activeTab)) {
      setActiveTab('basic');
    }
  }, [modoColeta, activeTab]);

  const handleTabClick = (tabId: string) => {
    if (isTabCollapsed(tabId)) {
      // Expand override — AC: 5
      setCollapsedOverride(prev => new Set([...prev, tabId]));
    }
    setActiveTab(tabId as any);
  };

  const tabs = [
    { id: "basic", label: "Dados Básicos", icon: FileText },
    // E2.1: Label contextual para Categorias
    { id: "segments", label: categoriasLabel, icon: Tag },
    // E2.2: Nova aba Pesquisa
    { id: "research", label: "Pesquisa", icon: Microscope },
    // E1.3: Label contextual (AC: 1, 2, 3, 6)
    { id: "companies", label: entidadesLabel, icon: Store },
    { id: "security", label: "Segurança", icon: ShieldCheck },
    { id: "prizes", label: "Premiação", icon: Trophy },
    { id: "legal", label: "Avisos Legais", icon: Award },
    { id: "results", label: "Resultados", icon: Globe },
    { id: "visual", label: "Identidade", icon: Palette },
    { id: "thanks", label: "Agradecimento", icon: Eye },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit as any, onError)} className="flex flex-col h-full gap-6">
          {/* Header Actions - Standardized with PageHeader */}
          <PageHeader
            title={enquete ? "Editar Enquete" : "Nova Enquete"}
            description="Configure todos os detalhes da sua premiação."
            badgeText="Configuração"
          >
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="h-10 font-bold uppercase tracking-wider text-xs text-muted-foreground hover:text-foreground"
                type="button"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-8 font-bold uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl flex items-center gap-2"
              >
                <Save size={16} />
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </PageHeader>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.filter(t => !isTabHidden(t.id)).map((tab) => {
              const collapsed = isTabCollapsed(tab.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  title={collapsed ? `Clique para expandir: ${tab.label}` : undefined}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap border",
                    // E1.3: Collapsed state (AC: 4, 5, 6)
                    collapsed
                      ? "opacity-40 cursor-pointer bg-card text-muted-foreground border-border hover:opacity-70"
                      : activeTab === tab.id
                        ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  <tab.icon size={14} />
                  {/* E1.3: Transição suave no label (AC: 6) */}
                  <span className="transition-all duration-300">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-bold flex items-center gap-2">
              <X size={18} />
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-12 items-start flex-1 min-h-0">
            {/* Form Content Area */}
            <div className="flex-1 w-full bg-card border border-border rounded-3xl p-8 shadow-sm">
              {activeTab === "basic" && (
                <BasicTab
                  isLoadingHubForms={isLoadingHubForms}
                  hubForms={hubForms}
                  enquete={enquete}
                />
              )}
              {activeTab === "segments" && (
                <SegmentsTab allSegmentos={allSegmentos as any[]} /> // Using any to bypass strict type check for now, assuming hook returns compatible structure
              )}
              {activeTab === "research" && <ResearchTab />}
              {activeTab === "companies" && (
                <CompaniesTab allEstabelecimentos={allEstabelecimentos} />
              )}
              {activeTab === "security" && <SecurityTab />}
              {activeTab === "prizes" && <PrizesTab enquete={enquete} />}
              {activeTab === "legal" && <LegalTab />}
              {activeTab === "results" && <ResultsTab enquete={enquete} />}
              {activeTab === "visual" && (
                <VisualTab
                  handleFileUpload={handleFileUpload}
                  logoInputRef={logoInputRef}
                  bannerInputRef={bannerInputRef}
                  uploadingLogo={uploadingLogo}
                  uploadingBanner={uploadingBanner}
                />
              )}
              {activeTab === "thanks" && <ThanksTab />}
            </div>

            {/* Persistent Preview Sidebar */}
            <EnquetePreview activeTab={activeTab} />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
