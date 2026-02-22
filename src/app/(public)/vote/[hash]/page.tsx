"use client";

import React, { useState, useEffect } from 'react';
import { FormRenderer, FormElement } from "@frmilani/form-renderer";
import { ThemeProvider, ThemeConfig } from "@/components/form-engine/ThemeProvider";
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/voting/ProgressBar';
import { GamifiedGate } from '@/components/voting/GamifiedGate';
import { User, Ticket, Clock, Lock, AlertCircle } from 'lucide-react';
import { WelcomeScreen } from '@/components/voting/WelcomeScreen';
import { ThankYouScreen } from '@/components/voting/ThankYouScreen';
import { VoteTemplateProvider } from '@/components/voting/VoteTemplateContext';
import { getTemplateConfig } from '@/lib/vote-templates';


export default function VotePage() {
  const params = useParams();
  const hash = params.hash as string;

  const [loading, setLoading] = useState(true);
  const [elements, setElements] = useState<FormElement[]>([]);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | undefined>(undefined);
  const [enquete, setEnquete] = useState<any>(null);
  const [error, setError] = useState('');

  // RF-011 States
  const [formData, setFormData] = useState<any>({});
  const [lead, setLead] = useState<any>(null);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [accessMode, setAccessMode] = useState<'public' | 'campaign' | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [surveyStatus, setSurveyStatus] = useState<{
    isValid: boolean,
    reason?: 'not_started' | 'expired' | 'paused',
    data?: any
  }>({ isValid: true });

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/tracking/${hash}/validate`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Erro ao carregar formulário");
          setLoading(false);
          return;
        }

        const savedLead = localStorage.getItem(`vote_lead_${hash}`);
        let currentLead = null;
        if (savedLead) {
          try {
            currentLead = JSON.parse(savedLead);
            setLead(currentLead);
          } catch (e) {
            console.error("Erro ao carregar lead salvo", e);
          }
        }

        // Helper to recursively inject context into elements
        const injectContext = (els: any[], orgId: string): any[] => {
          return els.map(el => {
            const newEl = { ...el };

            // Inject into dataSource endpoint
            if (newEl.dataSource && newEl.dataSource.endpoint) {
              const separator = newEl.dataSource.endpoint.includes('?') ? '&' : '?';
              // Check if organizationId is already present to avoid duplication
              if (!newEl.dataSource.endpoint.includes('organizationId=')) {
                newEl.dataSource.endpoint = `${newEl.dataSource.endpoint}${separator}organizationId=${orgId}`;
              }

              // Special case for Segmentos: Always filter only populated in public voting
              if (newEl.dataSource.endpoint.includes('/api/segmentos') && !newEl.dataSource.endpoint.includes('onlyPopulated=')) {
                const sep = newEl.dataSource.endpoint.includes('?') ? '&' : '?';
                newEl.dataSource.endpoint = `${newEl.dataSource.endpoint}${sep}onlyPopulated=true`;
              }
            }

            // Recursively handle children (columns, containers, etc.)
            if (newEl.children && Array.isArray(newEl.children)) {
              newEl.children = injectContext(newEl.children, orgId);
            }

            // Recursively handle steps (wizards) - usually steps are root elements but if nested
            // Note: FormRenderer structure might vary, but children is standard. 
            // If elements are steps (wizard), this map handles them if they are in the root array.

            return newEl;
          });
        };

        const rawElements = data.schema?.schema?.elements || [];
        const enqueteData = data.campanha?.enquete;

        // Inject Organization ID to allow public API access
        const processedElements = enqueteData?.organizationId
          ? injectContext(rawElements, enqueteData.organizationId)
          : rawElements;

        const theme = data.schema?.schema?.theme;
        const mode = data.type; // 'public' or 'campaign'

        // --- VALIDAÇÃO DE STATUS ---
        // ... (existing validation logic)
        const now = new Date();
        if (enqueteData.status === "PAUSADA") {
          setSurveyStatus({ isValid: false, reason: 'paused' });
          setLoading(false);
          return;
        }
        if (enqueteData.status === "ENCERRADA") {
          setSurveyStatus({ isValid: false, reason: 'expired' });
          setLoading(false);
          return;
        }
        if (enqueteData.dataInicio && now < new Date(enqueteData.dataInicio)) {
          setSurveyStatus({ isValid: false, reason: 'not_started', data: enqueteData.dataInicio });
          setLoading(false);
          return;
        }
        if (enqueteData.dataFim && now > new Date(enqueteData.dataFim)) {
          setSurveyStatus({ isValid: false, reason: 'expired' });
          setLoading(false);
          return;
        }
        // ---------------------------

        setElements(processedElements as FormElement[]);
        setThemeConfig(theme as ThemeConfig | undefined);
        setEnquete(enqueteData);
        setAccessMode(mode);

        // Lógica de Welcome vs Gate
        if (data.type === 'campaign' && data.lead) {
          setLead(data.lead);
          setIsGateOpen(false);
          setShowWelcome(false);
        } else {
          // No modo público ou se não tivermos lead identificado, mostramos o Welcome primeiro
          if (!currentLead) {
            setShowWelcome(true);
            setIsGateOpen(false);
          } else {
            setShowWelcome(false);
            setIsGateOpen(false);
          }
        }

        // Carregar progresso do localStorage
        const savedData = localStorage.getItem(`vote_draft_${hash}`);
        if (savedData) {
          try {
            setFormData(JSON.parse(savedData));
          } catch (e) {
            console.error("Erro ao carregar rascunho", e);
          }
        }

        const savedStep = localStorage.getItem(`vote_step_${hash}`);
        if (savedStep) {
          setActiveStepIndex(parseInt(savedStep, 10) || 0);
        }

        setLoading(false);

        // Telemetria: Registrar View
        if (data.formPublicId) {
          fetch(`/api/tracking/${hash}/view`, { method: 'POST' }).catch(() => { });
        }
      } catch (err) {
        console.error("[VotePage] Error:", err);
        setError("Erro ao conectar com o servidor");
        setLoading(false);
      }
    }

    if (hash) loadForm();
  }, [hash]);

  const handleFormChange = React.useCallback((newValues: any) => {
    setFormData(newValues);
    // Salvar no localStorage (debounced ou direto se leve)
    localStorage.setItem(`vote_draft_${hash}`, JSON.stringify(newValues));
  }, [hash]);

  const handleStart = () => {
    setShowWelcome(false);
    if (enquete?.exigirIdentificacao) {
      setIsGateOpen(true);
    }
  };

  const handleGateComplete = (leadData: any) => {
    setLead(leadData);
    localStorage.setItem(`vote_lead_${hash}`, JSON.stringify(leadData));
    setIsGateOpen(false);
  };

  const handleStepChange = (index: number) => {
    setActiveStepIndex(index);
    localStorage.setItem(`vote_step_${hash}`, index.toString());
  };

  /* New State for Custom Thank You Message */
  const [thankYouMessage, setThankYouMessage] = useState<{ titulo: string, mensagem: string } | undefined>(undefined);

  const handleSubmit = async (submitData: any) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hash,
          dados: submitData,
          leadId: lead?.id, // ID capturado no gate
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        // GENIUS MOVE: Transform "Duplicate Error" into "Friendly Confirmation"
        // If user already voted (409 Conflict or specific error message), show success screen anyway
        if (res.status === 409 ||
          result.error?.toLowerCase().includes('já votou') ||
          result.error?.toLowerCase().includes('duplicidade') ||
          result.error?.toLowerCase().includes('já participou')) {

          setThankYouMessage({
            titulo: "Voto Já Registrado! 🎉",
            mensagem: "Identificamos que você já participou desta votação. Fique tranquilo, seu voto está seguro conosco! Agradecemos muito sua colaboração."
          });

          // Clear local storage as if it was a success (session is over)
          localStorage.removeItem(`vote_draft_${hash}`);
          localStorage.removeItem(`vote_step_${hash}`);
          localStorage.removeItem(`vote_lead_${hash}`);

          setShowThankYou(true);
          setLoading(false);
          return;
        }

        alert(result.error || "Erro ao salvar voto");
        setLoading(false);
        return;
      }

      // Success Path
      localStorage.removeItem(`vote_draft_${hash}`);
      localStorage.removeItem(`vote_step_${hash}`);
      localStorage.removeItem(`vote_lead_${hash}`);

      setThankYouMessage(undefined); // Use default message from configuration
      setLoading(false);
      setAccessMode(null);
      setShowThankYou(true);

      if (result.redirectUrl) {
        // Optional redirect logic
      }
    } catch (err) {
      console.error("[VotePage] Submit Error:", err);
      alert("Erro ao enviar formulário. Tente novamente.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Carregando votação...</p>
        </div>
      </div>
    );
  }

  if (error || !surveyStatus.isValid) {
    const isPaused = surveyStatus.reason === 'paused';
    const isNotStarted = surveyStatus.reason === 'not_started';
    const isExpired = surveyStatus.reason === 'expired';

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-xl border border-slate-100 p-12 text-center">
          <div className={`${isNotStarted ? 'text-amber-500' : 'text-red-500'} mb-6`}>
            {isNotStarted ? <Clock size={64} className="mx-auto" /> :
              isPaused ? <Lock size={64} className="mx-auto" /> :
                <AlertCircle size={64} className="mx-auto" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            {isNotStarted ? "Em breve!" :
              isPaused ? "Pesquisa Pausada" :
                isExpired ? "Pesquisa Encerrada" : "Ops! Algo deu errado"}
          </h2>
          <p className="text-slate-500 font-medium mb-8 text-sm">
            {isNotStarted ? `Esta pesquisa começará em ${new Date(surveyStatus.data).toLocaleDateString()}.` :
              isPaused ? "Esta pesquisa está temporariamente pausada." :
                isExpired ? "O prazo para participação nesta pesquisa já se esgotou." :
                  (error || "Erro ao conectar com o servidor")}
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full h-12 rounded-2xl bg-indigo-600 font-bold uppercase tracking-widest text-xs">Voltar para Início</Button>
        </div>
      </div>
    );
  }

  const configVisual = enquete?.configVisual || {};
  const primaryColor = configVisual.primaryColor || '#4F46E5';
  const templateName = configVisual.template || 'default';
  const template = getTemplateConfig(templateName);
  const isPremium = template.mood === 'elegant';
  const isBold = template.mood === 'bold';
  const isNeon = template.mood === 'neon';
  const isAcid = template.mood === 'tech-acid';
  const isSwiss = template.mood === 'swiss';
  const isNatural = template.mood === 'natural';

  return (
    <VoteTemplateProvider
      templateName={templateName}
      primaryColor={primaryColor}
      logoUrl={configVisual.logoUrl}
      bannerUrl={configVisual.bannerUrl}
    >
      <ThemeProvider themeConfig={{
        cssVariables: {
          '--primary': primaryColor,
          '--theme-accent': template.accentColor || primaryColor,
          '--radius-lg': template.cardRadius,
          '--radius-md': template.inputRadius,
          '--radius-sm': template.buttonRadius,
          '--input-bg': isNeon ? '#000000' : '#ffffff',
          '--input-border': isNeon ? '#3f3f46' : '#d4c5b0',
          '--input-text': isNeon ? '#ecfeff' : '#1e293b',
          '--form-bg': 'transparent',
        },
        radius: template.cardRadius || themeConfig?.radius || '1rem'
      }}>
        {/* Scoped CSS for labels and scrollbars - User-requested 'Magic' & Professional styling */}
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar { display: none !important; }
          .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          
          .voting-form-container label, 
          .voting-form-container .form-label {
            color: ${isNeon ? '#d4d4d8' : '#1e293b'} !important; 
            font-weight: 700 !important;
            font-size: 1rem !important;
            border-left: 3px solid ${template.accentColor || primaryColor}${isNeon ? '' : '44'};
            padding-left: 12px;
            margin-bottom: 0.5rem !important;
            display: block;
            line-height: 1.4;
            transition: all 0.3s ease;
          }
          
          ${isPremium ? `
            .voting-form-container label {
              font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
              font-style: normal;
            }
          ` : ''}

          ${isNeon ? `
            .voting-form-container label {
              font-family: monospace, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border-left-width: 2px;
            }
          ` : ''}

          /* REINJEÇÃO DE VARIÁVEIS DO SHADCN/UI PARA DENTRO DO SCOPE DO FORMULÁRIO */
            --background: transparent; /* TRANSPARENTE PARA O CONTEÚDO GERAL */
            --foreground: ${isNeon ? '#ecfeff' : 'hsl(222.2 84% 4.9%)'};
            --card: transparent; /* TRANSPARENTE */
            --card-foreground: ${isNeon ? '#ecfeff' : 'hsl(222.2 84% 4.9%)'};
            --popover: ${isNeon ? '#18181b' : '#ffffff'};
            --popover-foreground: ${isNeon ? '#ecfeff' : 'hsl(222.2 84% 4.9%)'};
            --primary: hsl(${isPremium ? '38 41% 74%' : isNeon ? '189 94% 43%' : '262.1 83.3% 57.8%'}); 
            --primary-foreground: ${isNeon ? '#000000' : 'hsl(210 40% 98%)'};
            --secondary: hsl(210 40% 96.1%);
            --secondary-foreground: hsl(222.2 47.4% 11.2%);
            --muted: ${isNeon ? '#27272a' : 'hsl(210 40% 96.1%)'};
            --muted-foreground: ${isNeon ? '#a1a1aa' : 'hsl(215.4 16.3% 46.9%)'};
            --accent: hsl(210 40% 96.1%);
            --accent-foreground: hsl(222.2 47.4% 11.2%);
            --destructive: hsl(0 84.2% 60.2%);
            --destructive-foreground: hsl(210 40% 98%);
            --border: ${isNeon ? '#06b6d4' : 'hsl(38 27% 85%)'};
            --input: ${isNeon ? '#3f3f46' : 'hsl(38 27% 85%)'};
            --ring: hsl(${isPremium ? '38 48% 65%' : isNeon ? '189 94% 43%' : '262.1 83.3% 57.8%'});
            --radius: 0.75rem;
          }

          /* TORNAR O CARD WRAPPER PRINCIPAL DO FORMRENDERER TRANSPARENTE */
          .voting-form-container > div.rounded-xl.border.bg-card {
              background-color: transparent !important;
              border: none !important;
              box-shadow: none !important;
          }
          
          .voting-form-container .card-content-area {
              background: transparent !important;
          }

          /* === ESTILOS DOS CAMPOS (INPUTS, SELECTS) === */
          
          .voting-form-container input,
          .voting-form-container textarea,
          .voting-form-container .select-trigger,
          .voting-form-container [role="combobox"],
          .voting-form-container .bg-muted\/30 {
              background-color: ${isBold ? '#ffffff' : isNeon ? '#000000' : '#ffffff'} !important;
              border: ${isBold ? '3px solid #000000' : isNeon ? '1px solid #3f3f46' : '1px solid #d4c5b0'} !important;
              box-shadow: ${isBold ? '4px 4px 0px 0px #000000' : isNeon ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'} !important;
              border-radius: ${isBold ? '0.5rem' : isNeon ? '0' : '0.75rem'} !important;
              color: ${isNeon ? '#ecfeff' : '#1e293b'} !important;
              opacity: 1 !important;
              min-height: 3rem;
              display: flex;
              align-items: center;
              padding-left: 1rem;
              padding-right: 1rem;
              transition: all 0.2s ease;
          }

          /* CONTROLE DE FOCO */
          .voting-form-container input:focus,
          .voting-form-container textarea:focus,
          .voting-form-container .select-trigger:focus,
          .voting-form-container [role="combobox"]:focus,
          .voting-form-container [role="combobox"][aria-expanded="true"],
          .voting-form-container [role="combobox"][data-state="open"] {
              border-color: ${isBold ? '#000000' : isNeon ? '#06b6d4' : '#c9a962'} !important;
              box-shadow: ${isBold ? '2px 2px 0px 0px #000000' : isNeon ? '0 0 10px rgba(6,182,212,0.3)' : '0 0 0 1px #c9a962'} !important;
              transform: ${isBold ? 'translate(2px, 2px)' : 'none'};
              outline: none !important;
              --tw-ring-color: transparent !important;
              background-color: ${isNeon ? '#09090b' : '#ffffff'} !important;
          }

          /* HOVER NOS CAMPOS */
          .voting-form-container input:hover,
          .voting-form-container .select-trigger:hover,
          .voting-form-container [role="combobox"]:hover {
              border-color: ${isBold ? '#000000' : isNeon ? '#06b6d4' : '#c9a962'} !important;
          }

          /* BOTÕES DE NAVEGAÇÃO */
          .voting-form-container button:not([role="combobox"]):not(.select-trigger):not([aria-label="Clear"]) {
             background-color: ${isPremium ? '#c9a962' : isNeon ? '#06b6d4' : primaryColor} !important;
             color: ${isBold ? '#000000' : isNeon ? '#000000' : 'white'} !important;
             border-radius: ${isBold ? '0.5rem' : isNeon ? '0' : '0.5rem'} !important;
             box-shadow: ${isBold ? '4px 4px 0px 0px #000000' : isNeon ? '4px 4px 0px 0px #06b6d4' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'} !important;
             border: ${isBold ? '3px solid #000000' : 'none'} !important;
             font-weight: ${isBold || isNeon ? '900' : '700'} !important;
             text-transform: uppercase;
             letter-spacing: ${isBold ? '0.1em' : 'normal'};
             transition: all 0.1s;
          }
          
          .voting-form-container button:not([role="combobox"]):not(.select-trigger):not([aria-label="Clear"]):active {
             transform: ${isBold ? 'translate(2px, 2px)' : 'none'};
             box-shadow: ${isBold ? '2px 2px 0px 0px #000000' : 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'} !important;
          }
          
          /* BOTÃO CLEAR (X) */
          .voting-form-container button[aria-label="Clear"] {
             background-color: transparent !important;
             color: #94a3b8 !important;
             box-shadow: none !important;
             border: none !important;
          }

          /* LABELS E TEXTOS */
          .voting-form-container label {
             color: ${isNeon ? '#d4d4d8' : '#1e293b'} !important;
             font-weight: ${isBold ? '900' : '600'} !important;
             margin-bottom: 0.5rem !important;
          }

          /* Barra de rolagem personalizada para PCs */
          .voting-form-container::-webkit-scrollbar {
            width: 6px;
          }
          .voting-form-container::-webkit-scrollbar-track {
            background: transparent;
          }
          .voting-form-container::-webkit-scrollbar-thumb {
            background: ${isBold ? '#000000' : isNeon ? '#06b6d4' : '#d4c5b0'};
            border-radius: ${isNeon ? '0' : '10px'};
          }
        `}</style>

        {/* Main Viewport Wrapper */}
        <div className={`min-h-screen flex flex-col lg:flex-row ${template.pageGradient || template.pageBg}`}>

          {/* DESKTOP SIDEBAR (lg: visible - Always Persistent) */}
          <div className="hidden lg:flex lg:w-[400px] xl:w-[450px] lg:h-screen lg:sticky lg:top-0 lg:flex-col relative overflow-hidden shrink-0 border-r border-[#d4c5b0]/20 hidden-print">
            {/* Banner Background */}
            {configVisual.bannerUrl ? (
              <img src={configVisual.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale-[0.3]" />
            ) : (
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  background: isPremium
                    ? `linear-gradient(135deg, ${primaryColor}44 0%, ${primaryColor}88 100%)`
                    : `linear-gradient(135deg, ${primaryColor}11 0%, ${primaryColor}44 100%)`
                }}
              />
            )}
            <div className={`${template.bannerOverlay} absolute inset-0 bg-black/60`} />

            {/* Sidebar Content - Centered Alignment */}
            <div className="relative z-10 flex-1 flex flex-col p-12 justify-center items-center text-center">
              {configVisual.logoUrl && (
                <div className={`inline-block p-6 mb-8 rounded-3xl ${isPremium
                  ? 'bg-white/90 shadow-2xl ring-1 ring-[#d4c5b0]/30'
                  : 'bg-white shadow-lg'
                  }`}>
                  <img src={configVisual.logoUrl} alt="Logo" className="h-20 object-contain mx-auto" />
                </div>
              )}

              <div className="space-y-6">
                <div
                  className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mx-auto text-[#0a0908]"
                  style={{ backgroundColor: isPremium ? '#c9a962' : primaryColor }}
                >
                  {enquete.tituloBadge || 'Melhores do Ano 2025'}
                </div>

                <h1 className={`text-4xl xl:text-5xl font-black ${isPremium ? 'text-white font-serif' : 'text-white'} leading-[1.1]`}>
                  {enquete?.titulo || "Votação Online"}
                </h1>

                {enquete?.descricao && (
                  <p className="text-white/70 font-medium leading-relaxed text-sm max-w-sm mx-auto">
                    {enquete.descricao}
                  </p>
                )}
              </div>

              {/* User Mini-Profile */}
              {lead && (
                <div className="mt-12 w-full">
                  <div className={`p-6 rounded-3xl border ${isPremium
                    ? 'bg-white/10 border-white/20 backdrop-blur-md'
                    : 'bg-white/5 border-white/10'
                    } text-left`}>
                    <div className="flex items-center gap-4">
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center text-[#0a0908] shrink-0"
                        style={{ backgroundColor: isPremium ? '#c9a962' : primaryColor }}
                      >
                        <User size={24} strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Votando como</p>
                        <p className="text-lg font-black text-white truncate">{lead.nome}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 pt-4 border-t border-white/10">
                      <Ticket size={18} style={{ color: isPremium ? '#c9a962' : primaryColor }} />
                      <span className="text-sm font-black text-white">Você tem <span style={{ color: isPremium ? '#c9a962' : primaryColor }}>{lead.cupons || 0}</span> cupons extra</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="relative z-10 p-12 pt-0 text-center">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
                Hub de Spokes • 2026
              </p>
            </div>
          </div>

          {/* MAIN CONTENT AREA (lg: flex-1) - Houses all states on Desktop */}
          <div className="flex-1 flex flex-col relative w-full lg:min-h-screen">

            {/* RF-011: Welcome Screen */}
            {showWelcome && (
              <WelcomeScreen
                enquete={enquete}
                onStart={handleStart}
                isEmbedded={true}
              />
            )}

            {/* RF-011: Thank You Screen */}
            {showThankYou && (
              <ThankYouScreen
                enquete={enquete}
                isEmbedded={true}
                customMessage={thankYouMessage}
              />
            )}

            {/* RF-011: Identification Gate */}
            {isGateOpen && (
              <GamifiedGate
                enquete={enquete}
                organizationId={enquete.organizationId}
                onComplete={handleGateComplete}
                isEmbedded={true}
              />
            )}

            {/* MAIN VOTING FLOW */}
            {!showWelcome && !showThankYou && !isGateOpen && (
              <>
                {/* Mobile Progress Bar (Sticky) */}
                <div className="lg:hidden sticky top-0 z-50">
                  <ProgressBar
                    elements={elements}
                    formData={formData}
                    minCompleteness={enquete?.minCompleteness}
                    primaryColor={isPremium ? '#c9a962' : primaryColor}
                    template={template}
                    variant="sticky"
                  />
                </div>

                {/* MOBILE BANNER (lg: hidden) */}
                <div className={`lg:hidden ${template.bannerHeight} w-full relative overflow-hidden shrink-0`}>
                  {configVisual.bannerUrl ? (
                    <img src={configVisual.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: isPremium
                          ? `linear-gradient(135deg, ${primaryColor}44 0%, ${primaryColor}88 100%)`
                          : `linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #06b6d4 100%)`
                      }}
                    />
                  )}
                  <div className={template.bannerOverlay} />
                </div>

                <div className="flex-1 w-full max-w-4xl mx-auto -mt-16 lg:mt-0 p-4 md:p-8 lg:p-12 relative z-10 flex flex-col justify-start lg:justify-center min-h-0">

                  {/* DESKTOP PROGRESS BAR (CARD VARIANT) */}
                  <div className="hidden lg:block w-full mb-8">
                    <ProgressBar
                      elements={elements}
                      formData={formData}
                      minCompleteness={enquete?.minCompleteness}
                      primaryColor={isPremium ? '#c9a962' : primaryColor}
                      template={template}
                      variant="card"
                    />
                  </div>

                  {/* ThemeProvider wrapping the FormRenderer for deep variable injection */}
                  <ThemeProvider themeConfig={{
                    cssVariables: {
                      '--primary': primaryColor,
                      '--theme-accent': template.accentColor || primaryColor,
                      '--radius-lg': template.cardRadius,
                      '--radius-md': template.inputRadius,
                      '--radius-sm': template.buttonRadius,
                      '--input-bg': '#ffffff',
                      '--input-border': '#d4c5b0',
                      '--form-bg': 'transparent',
                    },
                    radius: template.cardRadius || '1rem'
                  }}>
                    {/* Main Form Card */}
                    <div className={`w-full ${template.cardBg} rounded-[2.5rem] md:rounded-[3rem] ${template.cardShadow} ${template.cardBorder} overflow-hidden shadow-2xl flex-shrink-0`}>

                      {/* Mobile/Tablet Header (lg: hidden) */}
                      <div className={`lg:hidden p-6 border-b ${isPremium ? 'border-[#d4c5b0]/30' : 'border-slate-100'} text-center md:text-left`}>
                        {configVisual.logoUrl && (
                          <div className="inline-block p-3 mb-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <img src={configVisual.logoUrl} alt="Logo" className="h-8 object-contain" />
                          </div>
                        )}
                        <h1 className={`text-xl font-black ${template.headingColor} ${isPremium ? 'font-serif' : ''} leading-tight`}>
                          {enquete?.titulo || "Votação Online"}
                        </h1>
                      </div>

                      {/* Form Content Area */}
                      <div className={`px-4 md:px-6 lg:px-10 pb-10 pt-2 voting-form-container overflow-visible`}>
                        {elements.length > 0 ? (
                          <FormRenderer
                            elements={elements}
                            onSubmit={handleSubmit}
                            onChange={handleFormChange}
                            initialValues={formData}
                            initialStepIndex={activeStepIndex}
                            onStepChange={handleStepChange}
                            isEmbedded={true}
                          />
                        ) : (
                          <div className="py-20 text-center">
                            <p className={`${template.mutedColor} font-bold uppercase tracking-widest text-[10px]`}>Nenhum campo configurado neste formulário.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </ThemeProvider>

                  {/* Page Footer */}
                  <div className="text-center mt-8 mb-6 lg:mt-12">
                    <p className={`text-[10px] font-bold ${template.mutedColor} uppercase tracking-[0.2em] op-50`}>
                      Sistema de Premiação Centralizado • Spokes
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </ThemeProvider>
    </VoteTemplateProvider>
  );
}
