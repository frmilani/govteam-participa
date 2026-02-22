/**
 * E1.3 — Helpers de label contextual para as abas do EnqueteForm
 * O label da aba "Entidades" muda de acordo com o tipoPesquisa da enquete.
 */

/** Mapa de tipoPesquisa → label da aba de entidades */
const ENTIDADES_TAB_LABEL_MAP: Record<string, string> = {
    premiacao: 'Empresas Participantes',
    politica: 'Candidatos',
    'politicas-publicas': 'Serviços e Propostas',
    corporativo: 'Dimensões Avaliadas',
    custom: 'Entidades',
};

/**
 * Retorna o label contextual da aba de entidades baseado no tipo de pesquisa.
 * Default: "Empresas Participantes" (backward compat com enquetes sem tipoPesquisa)
 */
export function getEntidadesTabLabel(tipoPesquisa?: string | null): string {
    if (!tipoPesquisa) return 'Empresas Participantes';
    return ENTIDADES_TAB_LABEL_MAP[tipoPesquisa] ?? 'Entidades';
}

/**
 * Determina se a aba de entidades deve aparecer em modo collapsed
 * para o tipo de pesquisa informado.
 */
export function isEntidadesTabCollapsed(tipoPesquisa?: string | null, modoColeta?: string | null): boolean {
    // Se estiver escondida, não precisa estar colapsada
    if (isEntidadesTabHidden(modoColeta)) return false;

    // Tipos conhecidos sempre têm a aba acessível
    const conhecidos = Object.keys(ENTIDADES_TAB_LABEL_MAP);
    if (!tipoPesquisa) return false;
    return !conhecidos.includes(tipoPesquisa);
}

/**
 * Determina se a aba de entidades deve ser completamente escondida da UI.
 * Regra: Em Modo "Top of Mind Puro", não há pré-cadastro de entidades,
 * logo a aba perde o propósito completo de configuração.
 */
export function isEntidadesTabHidden(modoColeta?: string | null): boolean {
    return modoColeta === 'top-of-mind';
}

const CATEGORIAS_TAB_LABEL_MAP: Record<string, string> = {
    premiacao: 'Categorias',
    politica: 'Cargos Eletivos',
    'politicas-publicas': 'Áreas Temáticas',
    corporativo: 'Dimensões',
    custom: 'Categorias',
};

export function getCategoriasTabLabel(tipoPesquisa?: string | null): string {
    if (!tipoPesquisa) return 'Categorias';
    return CATEGORIAS_TAB_LABEL_MAP[tipoPesquisa] ?? 'Categorias';
}
