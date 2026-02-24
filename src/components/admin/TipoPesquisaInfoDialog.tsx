import React, { useState, useEffect } from 'react';
import { Modal } from "@/components/ui/Modal";
import {
    Trophy, Landmark, Building2, Briefcase, Sparkles,
    Target, Users, Layout, Zap, ArrowRight, Settings2,
    ArrowLeft, Search, ShieldCheck, Globe, Star, ListChecks, BarChart3, HelpCircle,
    ShieldAlert, GitMerge, Puzzle, MessageSquare, MousePointer2, UserCheck, Shuffle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConceptDetails {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    journey: {
        step: string;
        desc: string;
    }[];
    vantage: string[];
    specialist?: string;
}

const CONCEPTS: Record<string, ConceptDetails> = {
    'recall-assistido': {
        title: "Recall Assistido",
        description: "O sistema 'ajuda' o eleitor a lembrar, apresentando listas de nomes baseadas em pesquisas anteriores ou bancos de dados.",
        icon: Search,
        color: "text-primary",
        journey: [
            { step: "Acesso", desc: "Eleitor entra na categoria (ex: Melhor Pizzaria)." },
            { step: "Busca", desc: "O sistema mostra as pizzarias mais citadas do banco." },
            { step: "Seleção", desc: "O eleitor clica no nome desejado (reduz erro de digitação)." },
            { step: "Voto", desc: "Confirmação instantânea do voto computado." }
        ],
        vantage: ["Reduz abstenção por esquecimento", "Padroniza nomes no banco de dados", "Experiência mais rápida"],
        specialist: "Use este modo para enquetes onde a memória do usuário é limitada."
    },
    'hibrido': {
        title: "Modo Híbrido",
        description: "Combina a facilidade da URL pública (orgânico) com o rigor dos convites únicos por WhatsApp (campanha).",
        icon: Globe,
        color: "text-purple-500",
        journey: [
            { step: "Captação", desc: "Postagens sociais geram tráfego via URL pública." },
            { step: "Fidelização", desc: "Envios massivos geram tráfego via Links Únicos." },
            { step: "Cruzamento", desc: "O motor identifica se o lead já votou via link privado." },
            { step: "Unificação", desc: "Todos os dados são consolidados em um dashboard." }
        ],
        vantage: ["Volume (Público) + Qualidade (Privado)", "Controle de duplicidade inteligente", "Aumenta o alcance da pesquisa"],
        specialist: "Use este modo para enquetes onde a mobilização social é o principal objetivo."
    },
    'top-of-mind': {
        title: "Top of Mind Puro",
        description: "A essência da lembrança espontânea. O eleitor não recebe sugestões, ele precisa escrever o que vier à mente.",
        icon: Target,
        color: "text-blue-500",
        journey: [
            { step: "Estímulo", desc: "Pergunta aberta: 'Qual o primeiro nome que vem à mente?'" },
            { step: "Esforço", desc: "O eleitor acessa seu nível de lembrança profunda." },
            { step: "Escrita", desc: "Digitação manual do nome/marca." },
            { step: "Registro", desc: "Captura da resposta bruta para análise semântica." }
        ],
        vantage: ["Mede força real de marca", "Elimina viés de indução", "Dados mais 'limpos' metodologicamente"],
        specialist: "Use este modo para enquetes onde a pureza metodológica é essencial."
    },
    'lista-sugerida': {
        title: "Lista Sugerida",
        description: "Ideal para avaliações técnicas onde as opções são fixas e conhecidas (Ex: Secretarias do Governo).",
        icon: ListChecks,
        color: "text-amber-500",
        journey: [
            { step: "Apresentação", desc: "Toda a grade de opções é exibida de uma vez." },
            { step: "Comparação", desc: "Eleitor visualiza o conjunto completo de itens." },
            { step: "Avaliação", desc: "Classifica ou seleciona dentro do grupo fechado." }
        ],
        vantage: ["Perfeito para gestão pública", "Garante 100% de cobertura dos itens", "Facilita rankings de desempenho"]
    },
    'nps-priorizaca': {
        title: "NPS & Priorização",
        description: "Métricas de satisfação e urgência. Entenda não só 'quem', mas 'quão bem' ou 'quão urgente'.",
        icon: BarChart3,
        color: "text-emerald-500",
        journey: [
            { step: "Métrica", desc: "Escala de 0 a 10 para lealdade (Net Promoter Score)." },
            { step: "Atribuição", desc: "Voter define pesos para diferentes pilares (Atendimento, Preço)." },
            { step: "Ordenação", desc: "Arraste e solte para definir prioridades de investimento." }
        ],
        vantage: ["Visão estratégica de gestão", "Gera índices de satisfação reais", "Ajuda na tomada de decisão orçamentária"]
    },
    'qualidade': {
        title: "Validação & Qualidade",
        description: "Mecanismos para garantir que as respostas venham de humanos reais e engajados, filtrando robôs e padrões suspeitos.",
        icon: ShieldAlert,
        color: "text-red-500",
        journey: [
            { step: "Monitoramento", desc: "Sistema analisa o padrão de navegação e tempo de resposta." },
            { step: "Armadilha", desc: "Perguntas de controle são inseridas aleatoriamente (ex: 'Marque a cor azul')." },
            { step: "Validação", desc: "Respostas contraditórias ou rápidas demais são sinalizadas." },
            { step: "Confiabilidade", desc: "Gera um score de qualidade para cada voto no dashboard." }
        ],
        vantage: ["Previne ataques de bots", "Identifica eleitores desatentos", "Garante a integridade estatística"],
        specialist: "Essencial em pesquisas com premiações para evitar fraudes ou automação."
    },
    'distribuicao': {
        title: "Estratégias de Distribuição",
        description: "O motor de distribuição define o 'fôlego' da sua pesquisa. Escolha como as categorias serão entregues para equilibrar volume de dados e engajamento do eleitor.",
        icon: GitMerge,
        color: "text-cyan-500",
        journey: [
            { step: "Identidade", desc: "O motor identifica o perfil e as permissões do eleitor." },
            { step: "Sorteio", desc: "Define quais categorias exibir (Tudo, Aleatório ou Rotativo)." },
            { step: "Cota de Telas", desc: "Apresenta o número exato de categorias configurado." },
            { step: "Equilíbrio", desc: "O sistema garante que todas as categorias recebam amostras iguais." }
        ],
        vantage: ["Evita fadiga (votações muito longas)", "Garante amostragem equitativa", "Controle total da experiência"],
        specialist: "Uma distribuição bem planejada pode dobrar a sua conversão final."
    },
    'todas': {
        title: "Tudo desta vez (Fluxo Completo)",
        description: "O modo clássico onde o eleitor percorre todas as categorias da pesquisa em uma única sessão, sem omissões.",
        icon: Layout,
        color: "text-slate-600",
        journey: [
            { step: "Identificação", desc: "Eleitor acessa a pesquisa e inicia a grade completa." },
            { step: "Sequência", desc: "Percorre a categoria 1, depois a 2, e assim por diante até o fim." },
            { step: "Revisão", desc: "Visualiza um resumo de todos os seus votos antes de enviar." },
            { step: "Conclusão", desc: "Voto computado para toda a grade de uma só vez." }
        ],
        vantage: ["Máximo volume de dados por eleitor", "Visão holística da pesquisa", "Simplicidade operacional"],
        specialist: "Recomendado para pesquisas curtas (até 15 categorias) para evitar abandonos no meio do trajeto."
    },
    'grupo': {
        title: "Distribuição por Grupo (Campanhas)",
        description: "Controle granular e estratégico. O eleitor vota apenas em um conjunto específico de categorias definido na estratégia da campanha.",
        icon: Users,
        color: "text-orange-500",
        journey: [
            { step: "Segmentação", desc: "Categorias são agrupadas logicamente (ex: Gastronomia, Saúde)." },
            { step: "Link Único", desc: "O eleitor recebe um convite direto para o seu grupo de afinidade." },
            { step: "Foco", desc: "A interface exibe apenas as categorias daquele bloco específico." },
            { step: "Amostragem", desc: "Garante que grupos estratégicos recebam atenção e volume dirigidos." }
        ],
        vantage: ["Evita fadiga do eleitor", "Permite campanhas segmentadas", "Aumenta a precisão por área de atuação"],
        specialist: "Ideal para grandes premiações onde você quer que o eleitor foque apenas no que ele realmente conhece."
    },
    'individual': {
        title: "Foco Individual (Single Target)",
        description: "A jornada é reduzida a uma única categoria. Máxima agilidade e taxa de conversão absoluta para alvos específicos.",
        icon: MousePointer2,
        color: "text-blue-600",
        journey: [
            { step: "Estímulo", desc: "A campanha foca em uma única pergunta (ex: 'Quem é o melhor profissional?')." },
            { step: "Acesso Direto", desc: "O link leva o eleitor direto para a tela de voto daquela categoria única." },
            { step: "Decisão", desc: "Voto rápido e direto em poucos segundos." },
            { step: "Encerramento", desc: "Finalização imediata garantindo o registro do dado." }
        ],
        vantage: ["Taxa de conversão máxima", "Ideal para Social Media e Anúncios", "Experiência extremamente veloz"],
        specialist: "Use para 'repescagens' ou quando certas categorias precisam de um reforço de votos urgente."
    },
    'aleatorio': {
        title: "Sorteio Aleatório (Amostragem)",
        description: "O sistema sorteia um número fixo de categorias (X de N) para cada eleitor de forma equilibrada e balanceada.",
        icon: Zap,
        color: "text-amber-500",
        journey: [
            { step: "Definição", desc: "Você configura que cada eleitor votará em uma cota fixa (ex: 5 categorias)." },
            { step: "Sorteio", desc: "O motor seleciona aleatoriamente e de forma inteligente categorias do banco." },
            { step: "Interação", desc: "O eleitor responde apenas àquelas que foram sorteadas para ele." },
            { step: "Cobertura", desc: "Ao final, todas as categorias terão recebido votos proporcionais e justos." }
        ],
        vantage: ["Reduz tempo de pesquisa", "Mantém engajamento elevado", "Metodologia estatisticamente válida"],
        specialist: "A solução perfeita para bancos de dados gigantescos com dezenas ou centenas de categorias."
    },
    'rotativo': {
        title: "Rotativo Demográfico",
        description: "O 'estado da arte' da distribuição científica. O sistema alterna as categorias entre os votantes para garantir que todas tenham a mesma exposição.",
        icon: Shuffle,
        color: "text-cyan-600",
        journey: [
            { step: "Cálculo", desc: "O motor identifica qual categoria tem menos votos no momento atual." },
            { step: "Entrega", desc: "Prioriza a exibição dessa categoria para o próximo eleitor." },
            { step: "Alternância", desc: "Rotaciona as categorias para evitar o viés da primeira opção." },
            { step: "Equilíbrio", desc: "Ao final, todas as categorias terão exatamente a mesma base de votos." }
        ],
        vantage: ["Elimina o viés posicional", "Garante precisão estatística", "Amostragem perfeita em tempo real"],
        specialist: "O modo mais recomendado para pesquisas eleitorais ou científicas."
    },
    'blocos': {
        title: "Blocos Adicionais",
        description: "Módulos extras que enriquecem a pesquisa, coletando sentimentos, prioridades e feedbacks qualitativos pós-voto.",
        icon: Puzzle,
        color: "text-indigo-500",
        journey: [
            { step: "Conversão", desc: "Após os votos principais, o eleitor entra na fase de experiência." },
            { step: "Sentiment", desc: "Exibição de NPS, Termômetro de Aprovação ou Rank de Prioridades." },
            { step: "Open Text", desc: "Espaço para elogios, críticas ou sugestões abertas." },
            { step: "Valor Agregado", desc: "Finalização com dados qualitativos profundos para o cliente." }
        ],
        vantage: ["Coleta feedback detalhado", "Mede lealdade e satisfação real", "Gera insights para ações de marketing"],
        specialist: "Estes blocos aparecem no final da jornada para não distrair do objetivo principal de voto."
    }
};

interface TipoPesquisaInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'main' | keyof typeof CONCEPTS;
}

export function TipoPesquisaInfoDialog({ isOpen, onClose, initialView = 'main' }: TipoPesquisaInfoDialogProps) {
    const [view, setView] = useState<'main' | keyof typeof CONCEPTS>(initialView);

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
        }
    }, [isOpen, initialView]);

    const renderMain = () => (
        <div className="space-y-8 py-4">
            {/* Hero Section */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-white/10 animate-in fade-in duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <Target className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-2xl font-black tracking-tight mb-2 uppercase">Escolha a Estratégia Ideal</h4>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
                            Configure sua pesquisa com <span className="text-primary font-bold">presets inteligentes</span>. Escolha o tipo para aplicar metodologias comprovadas de coleta e conversão.
                        </p>
                    </div>
                </div>
            </div>

            {/* Workflow Visualization */}
            <div className="relative p-6 bg-muted/40 rounded-2xl border border-border overflow-hidden">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">Fluxo de Metodologia</h5>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                    <div className="flex flex-col items-center gap-3 w-full md:w-32">
                        <div className="h-12 w-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary shadow-sm">
                            <Settings2 size={24} />
                        </div>
                        <span className="text-[9px] font-bold uppercase text-center text-foreground font-black">Segmentação</span>
                    </div>
                    <ArrowRight className="hidden md:block text-muted-foreground/30 animate-pulse" />
                    <div className="flex flex-col items-center gap-3 w-full md:w-32">
                        <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <Zap size={24} />
                        </div>
                        <span className="text-[9px] font-bold uppercase text-center text-primary font-black">Mecânica</span>
                    </div>
                    <ArrowRight className="hidden md:block text-muted-foreground/30" />
                    <div className="flex flex-col items-center gap-3 w-full md:w-32">
                        <div className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground">
                            <Layout size={24} />
                        </div>
                        <span className="text-[9px] font-bold uppercase text-center text-foreground font-black">Interação</span>
                    </div>
                    <ArrowRight className="hidden md:block text-muted-foreground/30" />
                    <div className="flex flex-col items-center gap-3 w-full md:w-32">
                        <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Target size={24} />
                        </div>
                        <span className="text-[9px] font-bold uppercase text-center text-emerald-600 font-black">Resultado</span>
                    </div>
                </div>
            </div>

            {/* Grid of Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Premiação */}
                <div className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Trophy size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-black text-foreground text-sm uppercase tracking-wider">Premiação</h5>
                                <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase">Engajamento</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                Ideal para "Destaques do Ano". Usa <button onClick={() => setView('recall')} className="text-primary font-bold hover:underline">Recall Assistido</button> e <button onClick={() => setView('hibrido')} className="text-primary font-bold hover:underline">Modo Híbrido</button> para volume social.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Política */}
                <div className="group p-6 rounded-2xl border border-border bg-card hover:border-blue-500/50 transition-all shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                            <Landmark size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-black text-foreground text-sm uppercase tracking-wider">Política</h5>
                                <span className="text-[8px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase">Rigor</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                Intenção de voto e aprovação. Utiliza <button onClick={() => setView('topmind')} className="text-blue-600 font-bold hover:underline">Top of Mind Puro</button> para garantir isenção.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Políticas Públicas */}
                <div className="group p-6 rounded-2xl border border-border bg-card hover:border-amber-500/50 transition-all shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                            <Building2 size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-black text-foreground text-sm uppercase tracking-wider">Pol. Públicas</h5>
                                <span className="text-[8px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-black uppercase">Diagnóstico</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                Gestão governamental. Aplica <button onClick={() => setView('lista')} className="text-amber-600 font-bold hover:underline">Lista Sugerida</button> e blocos de <button onClick={() => setView('nps')} className="text-amber-600 font-bold hover:underline">NPS</button> para serviços.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Corporativo */}
                <div className="group p-6 rounded-2xl border border-border bg-card hover:border-purple-500/50 transition-all shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                            <Briefcase size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-black text-foreground text-sm uppercase tracking-wider">Corporativo</h5>
                                <span className="text-[8px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded font-black uppercase">Gestão</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                Eventos e Clima. Requer identificação detalhada e <button onClick={() => setView('recall')} className="text-purple-600 font-bold hover:underline">Recall Controlado</button> para leads B2B.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderConcept = (id: keyof typeof CONCEPTS) => {
        const concept = CONCEPTS[id];
        return (
            <div className="py-6 space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                {/* Concept Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView('main')}
                        className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h4 className={cn("text-xl font-black uppercase tracking-tight", concept.color)}>{concept.title}</h4>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Conceito e Metodologia</p>
                    </div>
                </div>

                {/* Theory Section */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                            <p className="text-sm font-medium leading-relaxed text-foreground/80 italic">
                                "{concept.description}"
                            </p>
                        </div>

                        {/* Interactive Journey Diagram */}
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <MousePointer2 size={12} /> Jornada e Mecânismo
                            </h5>
                            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                                {concept.journey.map((step, idx) => (
                                    <div key={idx} className="relative">
                                        <div className={cn(
                                            "absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-card z-10",
                                            idx === concept.journey.length - 1 ? "bg-emerald-500 animate-pulse" : "bg-primary"
                                        )} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-foreground">{step.step}</span>
                                            <span className="text-[11px] text-muted-foreground font-medium">{step.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Vantagens */}
                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Star size={12} className="text-amber-500" /> Vantagens Técnicas
                        </h5>
                        <div className="space-y-2">
                            {concept.vantage.map((v, i) => (
                                <div key={i} className="p-3 bg-muted/30 border border-border rounded-xl flex gap-3 items-start">
                                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-[10px] font-bold text-foreground leading-tight">{v}</span>
                                </div>
                            ))}
                        </div>

                        {concept.specialist && (
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mt-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black text-primary uppercase">Dica do Especialista</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                                    {concept.specialist}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            description=""
            maxWidth="max-w-4xl"
            confirmLabel="Entendi"
            onConfirm={onClose}
        >
            {view === 'main' ? renderMain() : renderConcept(view as keyof typeof CONCEPTS)}
        </Modal>
    );
}
