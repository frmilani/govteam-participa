"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FormRenderer, FormElement } from "@frmilani/form-renderer";
import { ThemeProvider, ThemeConfig } from "@/components/form-engine/ThemeProvider";
import { useParams } from 'next/navigation';
import { ProgressBar } from '@/components/voting/ProgressBar';
import { GamifiedGate } from '@/components/voting/GamifiedGate';
import { User, Ticket, Clock, Lock, AlertCircle } from 'lucide-react';
import { WelcomeScreen } from '@/components/voting/WelcomeScreen';
import { ThankYouScreen } from '@/components/voting/ThankYouScreen';
import { VoteTemplateProvider } from '@/components/voting/VoteTemplateContext';
import { getTemplateConfig } from '@/lib/vote-templates';

// ─── STAGE ─────────────────────────────────────────────────────────────────────
type VoteStage = 'welcome' | 'gate' | 'form' | 'thanks';

// ─── FIELD ID CONVENTION ───────────────────────────────────────────────────────
// Voted field:   __vote__{categoriaId}
// Quality field: __qual__{categoriaId}__{perguntaId}
const VOTE_PREFIX = '__vote__';
const QUAL_PREFIX = '__qual__';

function voteFieldId(catId: string) { return `${VOTE_PREFIX}${catId}`; }
function qualFieldId(catId: string, pId: string) { return `${QUAL_PREFIX}${catId}__${pId}`; }

// ─── BUILD RESEARCH STEPS ──────────────────────────────────────────────────────
/**
 * Converts research config categories into FormRenderer step elements.
 * Each category becomes one `step` with:
 *   - An optional h2 header (category name)
 *   - A vote field (text for top-of-mind, radio-group for recall/lista)
 *   - Quality question fields that appear after the vote field
 */
function buildResearchSteps(researchConfig: any): FormElement[] {
  const { modoColeta, categorias = [] } = researchConfig;
  const steps: FormElement[] = [];

  for (const cat of categorias) {
    const perguntas = cat.templateQualidade?.perguntas ?? [];
    const stepChildren: FormElement[] = [];
    const catKey = cat.id.replace(/-/g, '_');

    // Header with category name (static — no name needed)
    stepChildren.push({
      id: `hdr_${catKey}`,
      type: 'h3',
      content: cat.nome,
      submitData: false,
    } as FormElement);

    // Vote field — name = "vote_{catId}" for react-hook-form binding
    const voteId = voteFieldId(cat.id);
    const voteName = `vote_${catKey}`;

    if (modoColeta === 'top-of-mind') {
      stepChildren.push({
        id: voteId,
        name: voteName,
        type: 'text',
        label: 'Qual marca ou empresa você mais lembra?',
        placeholder: 'Ex: Mercado Silva, Clínica Dr. João...',
        required: true,
      } as FormElement);
    } else if (modoColeta === 'recall-assistido') {
      stepChildren.push({
        id: voteId,
        name: voteName,
        type: 'text',
        label: 'Busque ou digite o nome',
        placeholder: 'Digite para buscar...',
        required: true,
      } as FormElement);
    } else {
      // lista-sugerida
      stepChildren.push({
        id: voteId,
        name: voteName,
        type: 'radio-group',
        label: 'Selecione sua preferência',
        required: true,
        options: [],
      } as FormElement);
    }

    // Quality questions — name = "qual_{catKey}_{pKey}"
    for (const p of perguntas) {
      const pKey = p.id.replace(/-/g, '_');
      const fid = qualFieldId(cat.id, p.id);
      const fname = `qual_${catKey}_${pKey}`;

      const opcoesParsed: string[] = Array.isArray(p.opcoes)
        ? p.opcoes
        : typeof p.opcoes === 'string'
          ? (p.opcoes as string).split(',').map((s: string) => s.trim())
          : [];

      if (p.tipo === 'rating-5') {
        stepChildren.push({
          id: fid,
          name: fname,
          type: 'rating',
          label: p.texto,
          ratingMax: 5,
          ratingIcon: 'star',
          ratingShowLabels: true,
          ratingLowLabel: 'Péssimo',
          ratingHighLabel: 'Excelente',
          required: p.obrigatorio ?? false,
        } as FormElement);
      } else if (p.tipo === 'rating-10') {
        stepChildren.push({
          id: fid,
          name: fname,
          type: 'nps',
          label: p.texto,
          ratingLowLabel: 'Péssimo',
          ratingHighLabel: 'Excelente',
          required: p.obrigatorio ?? false,
        } as FormElement);
      } else if (p.tipo === 'sim-nao') {
        stepChildren.push({
          id: fid,
          name: fname,
          type: 'radio-group',
          label: p.texto,
          required: p.obrigatorio ?? false,
          options: [
            { label: 'Sim', value: 'Sim' },
            { label: 'Não', value: 'Não' },
          ],
        } as FormElement);
      } else if (p.tipo === 'likert' && opcoesParsed.length > 0) {
        stepChildren.push({
          id: fid,
          name: fname,
          type: 'radio-group',
          label: p.texto,
          required: p.obrigatorio ?? false,
          options: opcoesParsed.map((o: string) => ({ label: o, value: o })),
        } as FormElement);
      } else {
        // texto livre
        stepChildren.push({
          id: fid,
          name: fname,
          type: 'text',
          label: p.texto,
          required: p.obrigatorio ?? false,
          placeholder: 'Sua resposta...',
        } as FormElement);
      }
    }

    steps.push({
      id: `__step__cat__${cat.id}`,
      type: 'step',
      label: cat.nome,
      children: stepChildren,
    } as FormElement);
  }

  return steps;
}

/**
 * Finds the first `steps` element in the tree and appends our research steps to it.
 * If no `steps` element is found, wraps everything in a new `steps` element.
 */
function injectStepsIntoSchema(
  elements: FormElement[],
  researchSteps: FormElement[]
): FormElement[] {
  if (researchSteps.length === 0) return elements;

  // Deep-clone the elements to avoid mutation
  const cloned: FormElement[] = JSON.parse(JSON.stringify(elements));

  // Try to find a 'steps' container recursively
  function findAndInject(els: FormElement[]): boolean {
    for (const el of els) {
      if (el.type === 'steps') {
        el.children = [...(el.children ?? []), ...researchSteps];
        return true;
      }
      if (el.children && el.children.length > 0) {
        if (findAndInject(el.children)) return true;
      }
    }
    return false;
  }

  const injected = findAndInject(cloned);

  if (!injected) {
    // No steps element found: wrap everything + research steps in a steps container
    const allStepChildren: FormElement[] = elements.map((el, idx) => ({
      id: `__auto_step__${idx}`,
      type: 'step' as any,
      label: `Página ${idx + 1}`,
      children: [el],
    }));
    return [{
      id: '__auto_steps__',
      type: 'steps',
      children: [...allStepChildren, ...researchSteps],
    } as FormElement];
  }

  return cloned;
}

/**
 * Parses the form submit data and separates:
 * - demographic answers (regular form fields)
 * - votos (vote per category)
 * - votosLivres (free text votes for top-of-mind)
 * - qualidades (quality answers)
 *
 * Field names in the submitted data:
 *   vote field:    "vote_{catId_underscored}"
 *   quality field: "qual_{catId_underscored}_{pergId_underscored}"
 */
function parseSubmitData(
  data: any,
  researchConfig: any | null
): {
  dados: any;
  votos: any[];
  votosLivres: any[];
  qualidades: any[];
} {
  const dados: any = {};
  const votos: any[] = [];
  const votosLivres: any[] = [];
  const qualidades: any[] = [];

  if (!researchConfig) {
    return { dados: data, votos, votosLivres, qualidades };
  }

  const modoColeta = researchConfig.modoColeta || 'top-of-mind';
  const categorias: any[] = researchConfig.categorias || [];

  // Build lookup maps: underscore_key → original ID
  const catKeyToId: Record<string, string> = {};
  const pergKeyToId: Record<string, Record<string, string>> = {};

  for (const cat of categorias) {
    const catKey = cat.id.replace(/-/g, '_');
    catKeyToId[catKey] = cat.id;
    pergKeyToId[catKey] = {};
    for (const p of (cat.templateQualidade?.perguntas ?? [])) {
      const pKey = p.id.replace(/-/g, '_');
      pergKeyToId[catKey][pKey] = p.id;
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('vote_')) {
      const catKey = key.slice('vote_'.length);
      const catId = catKeyToId[catKey];
      if (!catId) { dados[key] = value; continue; }

      const texto = String(value || '').trim();
      if (!texto) continue;

      if (modoColeta === 'top-of-mind' || modoColeta === 'recall-assistido') {
        votosLivres.push({ categoriaId: catId, texto });
      } else {
        votos.push({ categoriaId: catId, estabelecimentoId: texto });
      }
    } else if (key.startsWith('qual_')) {
      // qual_{catKey}_{pKey}
      const rest = key.slice('qual_'.length);
      // Find which catKey matches the beginning of rest
      const matchedCatKey = Object.keys(catKeyToId).find(ck => rest.startsWith(ck + '_'));
      if (!matchedCatKey) { dados[key] = value; continue; }

      const catId = catKeyToId[matchedCatKey];
      const pKey = rest.slice(matchedCatKey.length + 1);
      const pergId = pergKeyToId[matchedCatKey]?.[pKey];
      if (!pergId) { dados[key] = value; continue; }

      const valor = String(value ?? '').trim();
      if (!valor) continue;
      qualidades.push({ categoriaId: catId, perguntaId: pergId, valor });
    } else {
      dados[key] = value;
    }
  }

  return { dados, votos, votosLivres, qualidades };
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function VotePage() {
  const params = useParams();
  const hash = params.hash as string;

  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<VoteStage>('form');
  const [elements, setElements] = useState<FormElement[]>([]);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | undefined>(undefined);
  const [enquete, setEnquete] = useState<any>(null);
  const [researchConfig, setResearchConfig] = useState<any>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>({});
  const [lead, setLead] = useState<any>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [surveyStatus, setSurveyStatus] = useState<{
    isValid: boolean;
    reason?: 'not_started' | 'expired' | 'paused';
    data?: any;
  }>({ isValid: true });
  const [thankYouMessage, setThankYouMessage] = useState<{ titulo: string; mensagem: string } | undefined>(undefined);

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
          try { currentLead = JSON.parse(savedLead); setLead(currentLead); } catch (e) { /* */ }
        }

        const injectContext = (els: any[], orgId: string): any[] => {
          return els.map(el => {
            const newEl = { ...el };
            if (newEl.dataSource?.endpoint) {
              const sep = newEl.dataSource.endpoint.includes('?') ? '&' : '?';
              if (!newEl.dataSource.endpoint.includes('organizationId=')) {
                newEl.dataSource.endpoint = `${newEl.dataSource.endpoint}${sep}organizationId=${orgId}`;
              }
              if (newEl.dataSource.endpoint.includes('/api/segmentos') && !newEl.dataSource.endpoint.includes('onlyPopulated=')) {
                const s2 = newEl.dataSource.endpoint.includes('?') ? '&' : '?';
                newEl.dataSource.endpoint = `${newEl.dataSource.endpoint}${s2}onlyPopulated=true`;
              }
            }
            if (newEl.children && Array.isArray(newEl.children)) {
              newEl.children = injectContext(newEl.children, orgId);
            }
            return newEl;
          });
        };

        const rawElements = data.schema?.schema?.elements || [];
        const enqueteData = data.campanha?.enquete;
        const processedElements: FormElement[] = enqueteData?.organizationId
          ? injectContext(rawElements, enqueteData.organizationId)
          : rawElements;

        const theme = data.schema?.schema?.theme;
        const mode = data.type;

        const now = new Date();
        if (enqueteData.status === "PAUSADA") { setSurveyStatus({ isValid: false, reason: 'paused' }); setLoading(false); return; }
        if (enqueteData.status === "ENCERRADA") { setSurveyStatus({ isValid: false, reason: 'expired' }); setLoading(false); return; }
        if (enqueteData.dataInicio && now < new Date(enqueteData.dataInicio)) { setSurveyStatus({ isValid: false, reason: 'not_started', data: enqueteData.dataInicio }); setLoading(false); return; }
        if (enqueteData.dataFim && now > new Date(enqueteData.dataFim)) { setSurveyStatus({ isValid: false, reason: 'expired' }); setLoading(false); return; }

        setThemeConfig(theme as ThemeConfig | undefined);
        setEnquete(enqueteData);

        // Se o link já foi respondido, mostrar tela amigável imediatamente (E5.3)
        if (data.status === 'RESPONDIDO') {
          setThankYouMessage({
            titulo: "Voto Já Registrado! 🎉",
            mensagem: "Identificamos que você já participou desta votação. Fique tranquilo, seu voto está seguro!"
          });
          clearLocalStorage();
          setStage('thanks');
          setLoading(false);
          return;
        }

        // Load research config and inject into form schema
        const hasResearchEngine = !!((enqueteData as any).modoColeta);
        let finalElements = processedElements;

        if (hasResearchEngine) {
          try {
            const rcRes = await fetch(`/api/public/enquetes/${enqueteData.id}/research-config?trackingHash=${hash}`);
            if (rcRes.ok) {
              const rc = await rcRes.json();
              setResearchConfig(rc);

              if (rc.categorias && rc.categorias.length > 0) {
                const researchSteps = buildResearchSteps(rc);
                finalElements = injectStepsIntoSchema(processedElements, researchSteps);
              }
            }
          } catch (e) {
            console.warn('[VotePage] Research config load failed, classic mode.', e);
          }
        }

        setElements(finalElements);

        // Welcome vs Gate
        if (mode === 'campaign' && data.lead) {
          setLead(data.lead);
          setStage('form');
        } else {
          if (!currentLead) { setStage('welcome'); } else { setStage('form'); }
        }

        const savedData = localStorage.getItem(`vote_draft_${hash}`);
        if (savedData) { try { setFormData(JSON.parse(savedData)); } catch (e) { /* */ } }
        const savedStep = localStorage.getItem(`vote_step_${hash}`);
        if (savedStep) { setActiveStepIndex(parseInt(savedStep, 10) || 0); }

        setLoading(false);

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

  const handleFormChange = useCallback((newValues: any) => {
    setFormData(newValues);
    localStorage.setItem(`vote_draft_${hash}`, JSON.stringify(newValues));
  }, [hash]);

  const handleStart = () => {
    if (enquete?.exigirIdentificacao) { setStage('gate'); } else { setStage('form'); }
  };

  const handleGateComplete = (leadData: any) => {
    setLead(leadData);
    localStorage.setItem(`vote_lead_${hash}`, JSON.stringify(leadData));
    setStage('form');
  };

  const handleStepChange = (index: number) => {
    setActiveStepIndex(index);
    localStorage.setItem(`vote_step_${hash}`, index.toString());
  };

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(`vote_draft_${hash}`);
    localStorage.removeItem(`vote_step_${hash}`);
    localStorage.removeItem(`vote_lead_${hash}`);
  }, [hash]);

  const handleSubmit = useCallback(async (submitData: any) => {
    setLoading(true);

    const { dados, votos, votosLivres, qualidades } = parseSubmitData(submitData, researchConfig);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hash,
          dados,
          leadId: lead?.id,
          votos,
          votosLivres,
          qualidades,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 409 || result.error?.toLowerCase().includes('já votou') || result.error?.toLowerCase().includes('já participou')) {
          setThankYouMessage({ titulo: "Voto Já Registrado! 🎉", mensagem: "Identificamos que você já participou desta votação. Fique tranquilo, seu voto está seguro!" });
          clearLocalStorage();
          setStage('thanks');
          setLoading(false);
          return;
        }
        alert(result.error || "Erro ao salvar voto");
        setLoading(false);
        return;
      }

      clearLocalStorage();
      setThankYouMessage(undefined);
      setLoading(false);
      setStage('thanks');
    } catch (err) {
      console.error("[VotePage] Submit Error:", err);
      alert("Erro ao enviar formulário. Tente novamente.");
      setLoading(false);
    }
  }, [hash, lead, researchConfig, clearLocalStorage]);

  // ── LOADING ──
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

  // ── SURVEY STATUS ERRORS ──
  if (error || !surveyStatus.isValid) {
    const isPaused = surveyStatus.reason === 'paused';
    const isNotStarted = surveyStatus.reason === 'not_started';
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-xl border border-slate-100 p-12 text-center">
          <div className={`${isNotStarted ? 'text-amber-500' : 'text-red-500'} mb-6`}>
            {isNotStarted ? <Clock size={64} className="mx-auto" /> : isPaused ? <Lock size={64} className="mx-auto" /> : <AlertCircle size={64} className="mx-auto" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            {isNotStarted ? "Em breve!" : isPaused ? "Pesquisa Pausada" : surveyStatus.reason === 'expired' ? "Pesquisa Encerrada" : "Ops!"}
          </h2>
          <p className="text-slate-500 font-medium mb-8 text-sm">
            {isNotStarted ? `Esta pesquisa começará em ${new Date(surveyStatus.data).toLocaleDateString()}.` : isPaused ? "Esta pesquisa está temporariamente pausada." : surveyStatus.reason === 'expired' ? "O prazo já se esgotou." : (error || "Erro ao conectar.")}
          </p>
          <button type="button" onClick={() => window.location.href = '/'} className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-bold uppercase tracking-widest text-xs">Voltar para Início</button>
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

  return (
    <VoteTemplateProvider templateName={templateName} primaryColor={primaryColor} logoUrl={configVisual.logoUrl} bannerUrl={configVisual.bannerUrl}>
      <ThemeProvider themeConfig={{
        cssVariables: {
          '--primary': primaryColor, '--theme-accent': template.accentColor || primaryColor,
          '--radius-lg': template.cardRadius, '--radius-md': template.inputRadius, '--radius-sm': template.buttonRadius,
          '--input-bg': isNeon ? '#000000' : '#ffffff', '--input-border': isNeon ? '#3f3f46' : '#d4c5b0',
          '--input-text': isNeon ? '#ecfeff' : '#1e293b', '--form-bg': 'transparent',
        },
        radius: template.cardRadius || themeConfig?.radius || '1rem'
      }}>
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar { display: none !important; }
          .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          .voting-form-container label, .voting-form-container .form-label {
            color: ${isNeon ? '#d4d4d8' : '#1e293b'} !important; font-weight: 700 !important;
            font-size: 0.95rem !important; border-left: 3px solid ${template.accentColor || primaryColor}${isNeon ? '' : '44'};
            padding-left: 12px; margin-bottom: 0.35rem !important; display: block; line-height: 1.4;
          }
          ${isPremium ? `.voting-form-container label { font-family: ui-serif, Georgia, Cambria, serif !important; }` : ''}
          ${isNeon ? `.voting-form-container label { font-family: monospace !important; text-transform: uppercase; letter-spacing:0.05em; border-left-width:2px; }` : ''}
          --background: transparent; --foreground: ${isNeon ? '#ecfeff' : 'hsl(222.2 84% 4.9%)'};
          --card: transparent; --card-foreground: ${isNeon ? '#ecfeff' : 'hsl(222.2 84% 4.9%)'};
          --popover: ${isNeon ? '#18181b' : '#ffffff'}; --popover-foreground: ${isNeon ? '#ecfeff' : 'hsl(222.2 84% 4.9%)'};
          --primary: hsl(${isPremium ? '38 41% 74%' : isNeon ? '189 94% 43%' : '262.1 83.3% 57.8%'});
          --primary-foreground: ${isNeon ? '#000000' : 'hsl(210 40% 98%)'};
          --border: ${isNeon ? '#06b6d4' : 'hsl(38 27% 85%)'}; --input: ${isNeon ? '#3f3f46' : 'hsl(38 27% 85%)'};
          --ring: hsl(${isPremium ? '38 48% 65%' : isNeon ? '189 94% 43%' : '262.1 83.3% 57.8%'}); --radius: 0.75rem;
          }
          .voting-form-container > div.rounded-xl.border.bg-card { background-color: transparent !important; border: none !important; box-shadow: none !important; }
          
          /* Ajuste de espaçamento entre blocos de campos */
          .voting-form-container .space-y-8 > .col-span-12,
          .voting-form-container .grid > .col-span-12 {
            margin-bottom: -1rem !important;
          }

          .voting-form-container input, .voting-form-container textarea,
          .voting-form-container .select-trigger, .voting-form-container [role="combobox"] {
            background-color: ${isBold ? '#ffffff' : isNeon ? '#000000' : '#ffffff'} !important;
            border: ${isBold ? '3px solid #000000' : isNeon ? '1px solid #3f3f46' : '1px solid #d4c5b0'} !important;
            box-shadow: ${isBold ? '4px 4px 0px 0px #000000' : 'none'} !important;
            border-radius: ${isBold ? '0.5rem' : isNeon ? '0' : '0.75rem'} !important;
            color: ${isNeon ? '#ecfeff' : '#1e293b'} !important; min-height: 2.75rem;
            padding-left: 1rem; padding-right: 1rem; transition: all 0.2s ease;
          }
          .voting-form-container button:not([role="combobox"]):not(.select-trigger):not([aria-label="Clear"]) {
            background-color: ${isPremium ? '#c9a962' : isNeon ? '#06b6d4' : primaryColor} !important;
            color: ${isBold ? '#000000' : isNeon ? '#000000' : 'white'} !important;
            border-radius: ${isBold ? '0.5rem' : '0.5rem'} !important;
            box-shadow: ${isBold ? '4px 4px 0px 0px #000000' : '0 4px 6px -1px rgba(0,0,0,0.1)'} !important;
            font-weight: ${isBold || isNeon ? '900' : '700'} !important; text-transform: uppercase;
          }
          .voting-form-container button[aria-label="Clear"] { background-color: transparent !important; color: #94a3b8 !important; box-shadow: none !important; border: none !important; }
          .voting-form-container label { color: ${isNeon ? '#d4d4d8' : '#1e293b'} !important; font-weight: ${isBold ? '900' : '600'} !important; margin-bottom: 0.35rem !important; }

          /* ── Reset: labels de opções (radio/checkbox) NÃO devem ter border-left ── */
          .voting-form-container input[type="radio"] ~ label,
          .voting-form-container input[type="checkbox"] ~ label,
          .voting-form-container label:has(> input[type="radio"]),
          .voting-form-container label:has(> input[type="checkbox"]),
          .voting-form-container div.flex.items-center label,
          .voting-form-container div.flex.items-start label {
            border-left: none !important;
            padding-left: 0 !important;
            font-weight: 500 !important;
            font-size: 0.875rem !important;
            display: inline !important;
            margin-bottom: 0 !important;
          }

          /* Compactar Gap entre as opções de Radio/Checkbox */
          .voting-form-container .flex-col.gap-3 {
            gap: 0.4rem !important;
          }
          .voting-form-container .flex.items-center.gap-2 {
            gap: 0.4rem !important;
          }
        `}</style>

        <div className={`min-h-screen flex flex-col lg:flex-row ${template.pageGradient || template.pageBg}`}>

          {/* SIDEBAR Desktop */}
          <div className="hidden lg:flex lg:w-[400px] xl:w-[450px] lg:h-screen lg:sticky lg:top-0 lg:flex-col relative overflow-hidden shrink-0 border-r border-[#d4c5b0]/20">
            {configVisual.bannerUrl ? (
              <img src={configVisual.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale-[0.3]" />
            ) : (
              <div className="absolute inset-0 w-full h-full" style={{ background: `linear-gradient(135deg, ${primaryColor}11 0%, ${primaryColor}44 100%)` }} />
            )}
            <div className={`${template.bannerOverlay} absolute inset-0 bg-black/60`} />
            <div className="relative z-10 flex-1 flex flex-col p-12 justify-center items-center text-center">
              {configVisual.logoUrl && (
                <div className={`inline-block p-6 mb-8 rounded-3xl ${isPremium ? 'bg-white/90 shadow-2xl' : 'bg-white shadow-lg'}`}>
                  <img src={configVisual.logoUrl} alt="Logo" className="h-20 object-contain mx-auto" />
                </div>
              )}
              <div className="space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mx-auto text-[#0a0908]" style={{ backgroundColor: isPremium ? '#c9a962' : primaryColor }}>
                  {enquete.tituloBadge || 'Participa 2025'}
                </div>
                <h1 className={`text-4xl xl:text-5xl font-black ${isPremium ? 'text-white font-serif' : 'text-white'} leading-[1.1]`}>
                  {enquete?.titulo || "Votação Online"}
                </h1>
                {enquete?.descricao && <p className="text-white/70 font-medium leading-relaxed text-sm max-w-sm mx-auto">{enquete.descricao}</p>}
              </div>

              {lead && (
                <div className="mt-12 w-full">
                  <div className={`p-6 rounded-3xl border ${isPremium ? 'bg-white/10 border-white/20 backdrop-blur-md' : 'bg-white/5 border-white/10'} text-left`}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-[#0a0908] shrink-0" style={{ backgroundColor: isPremium ? '#c9a962' : primaryColor }}>
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
            <div className="relative z-10 p-12 pt-0 text-center">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Hub de Spokes • 2026</p>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col relative w-full lg:min-h-screen">

            {stage === 'welcome' && <WelcomeScreen enquete={enquete} onStart={handleStart} isEmbedded={true} />}
            {stage === 'thanks' && <ThankYouScreen enquete={enquete} isEmbedded={true} customMessage={thankYouMessage} />}
            {stage === 'gate' && <GamifiedGate enquete={enquete} organizationId={enquete.organizationId} onComplete={handleGateComplete} isEmbedded={true} />}

            {stage === 'form' && (
              <>
                {/* Mobile Progress Bar */}
                <div className="lg:hidden sticky top-0 z-50">
                  <ProgressBar elements={elements} formData={formData} minCompleteness={enquete?.minCompleteness} primaryColor={isPremium ? '#c9a962' : primaryColor} template={template} variant="sticky" />
                </div>

                {/* Mobile Banner */}
                <div className={`lg:hidden ${template.bannerHeight} w-full relative overflow-hidden shrink-0`}>
                  {configVisual.bannerUrl ? (
                    <img src={configVisual.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${primaryColor}44 0%, ${primaryColor}88 100%)` }} />
                  )}
                  <div className={template.bannerOverlay} />
                </div>

                <div className="flex-1 w-full max-w-4xl mx-auto -mt-16 lg:mt-0 p-4 md:p-8 lg:p-12 relative z-10 flex flex-col justify-start lg:justify-center min-h-0">

                  {/* Desktop Progress Bar */}
                  <div className="hidden lg:block w-full mb-8">
                    <ProgressBar elements={elements} formData={formData} minCompleteness={enquete?.minCompleteness} primaryColor={isPremium ? '#c9a962' : primaryColor} template={template} variant="card" />
                  </div>

                  <ThemeProvider themeConfig={{
                    cssVariables: {
                      '--primary': primaryColor, '--theme-accent': template.accentColor || primaryColor,
                      '--radius-lg': template.cardRadius, '--radius-md': template.inputRadius, '--radius-sm': template.buttonRadius,
                      '--input-bg': '#ffffff', '--input-border': '#d4c5b0', '--form-bg': 'transparent',
                    },
                    radius: template.cardRadius || '1rem'
                  }}>
                    <div className={`w-full ${template.cardBg} rounded-[2.5rem] md:rounded-[3rem] ${template.cardShadow} ${template.cardBorder} overflow-hidden shadow-2xl flex-shrink-0`}>

                      {/* Mobile Header */}
                      <div className={`lg:hidden p-6 border-b ${isPremium ? 'border-[#d4c5b0]/30' : 'border-slate-100'} text-center`}>
                        {configVisual.logoUrl && (
                          <div className="inline-block p-3 mb-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <img src={configVisual.logoUrl} alt="Logo" className="h-8 object-contain" />
                          </div>
                        )}
                        <h1 className={`text-xl font-black ${template.headingColor} leading-tight`}>{enquete?.titulo || "Votação"}</h1>
                      </div>

                      <div className="px-4 md:px-6 lg:px-10 pb-10 pt-2 voting-form-container overflow-visible">
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
                            <p className={`${template.mutedColor} font-bold uppercase tracking-widest text-[10px]`}>Nenhum campo configurado.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </ThemeProvider>

                  <div className="text-center mt-8 mb-6 lg:mt-12">
                    <p className={`text-[10px] font-bold ${template.mutedColor} uppercase tracking-[0.2em]`}>Sistema de Premiação Centralizado • Spokes</p>
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
