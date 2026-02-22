/**
 * E1.2 — Configuração de tipos de entidade para o Motor Universal de Pesquisa
 * Define labels, ícones, e campos de metadados por tipo de entidade.
 */

export type TipoEntidade =
    | 'EMPRESA'
    | 'CANDIDATO'
    | 'PROPOSTA'
    | 'MARCA'
    | 'DIMENSAO'
    | 'SERVICO_PUBLICO'
    | 'OUTRO';

export interface MetadadoField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'textarea';
    placeholder?: string;
}

export const TIPO_ENTIDADE_OPTIONS: {
    value: TipoEntidade;
    label: string;
    icon: string;
    description: string;
}[] = [
        {
            value: 'EMPRESA',
            label: 'Empresa',
            icon: 'Building2',
            description: 'Estabelecimento comercial, loja ou prestador de serviços',
        },
        {
            value: 'CANDIDATO',
            label: 'Candidato',
            icon: 'User',
            description: 'Candidato político ou profissional em disputa eleitoral',
        },
        {
            value: 'PROPOSTA',
            label: 'Proposta',
            icon: 'FileText',
            description: 'Proposta de lei, projeto ou iniciativa avaliada',
        },
        {
            value: 'MARCA',
            label: 'Marca',
            icon: 'Tag',
            description: 'Marca ou produto reconhecido no mercado',
        },
        {
            value: 'DIMENSAO',
            label: 'Dimensão',
            icon: 'BarChart3',
            description: 'Eixo ou dimensão avaliativa em pesquisa corporativa',
        },
        {
            value: 'SERVICO_PUBLICO',
            label: 'Serviço Público',
            icon: 'Landmark',
            description: 'Serviço prestado pelo poder público à população',
        },
        {
            value: 'OUTRO',
            label: 'Outro',
            icon: 'MoreHorizontal',
            description: 'Entidade de tipo personalizado com metadados livres',
        },
    ];

/**
 * Campos de metadados por tipo (não-EMPRESA).
 * EMPRESA usa os campos root do modelo (telefone, endereco, etc.)
 */
export const METADADOS_FIELDS: Partial<Record<TipoEntidade, MetadadoField[]>> = {
    CANDIDATO: [
        { key: 'partido', label: 'Partido', type: 'text', placeholder: 'Ex: PT, PL, MDB' },
        { key: 'numeroCandidato', label: 'Número do Candidato', type: 'text', placeholder: 'Ex: 13, 17, 55' },
        { key: 'cargo', label: 'Cargo', type: 'text', placeholder: 'Ex: Prefeito, Vereador' },
        { key: 'coligacao', label: 'Coligação', type: 'text', placeholder: 'Nome da coligação' },
    ],
    PROPOSTA: [
        { key: 'areaOrcamentaria', label: 'Área Orçamentária', type: 'text', placeholder: 'Ex: Saúde, Educação' },
        { key: 'impactoEstimado', label: 'Impacto Estimado', type: 'text', placeholder: 'Ex: 10.000 beneficiados' },
        { key: 'prazoExecucao', label: 'Prazo de Execução', type: 'text', placeholder: 'Ex: 24 meses' },
    ],
    SERVICO_PUBLICO: [
        { key: 'secretaria', label: 'Secretaria Responsável', type: 'text', placeholder: 'Ex: Secretaria de Saúde' },
        { key: 'localAtendimento', label: 'Local de Atendimento', type: 'text', placeholder: 'Ex: CRAS, UBS, Prefeitura' },
    ],
    DIMENSAO: [
        { key: 'areaCorporativa', label: 'Área Corporativa', type: 'text', placeholder: 'Ex: RH, TI, Financeiro' },
        { key: 'peso', label: 'Peso / Ponderação', type: 'number', placeholder: 'Ex: 1.5' },
    ],
    MARCA: [
        { key: 'segmentoMercado', label: 'Segmento de Mercado', type: 'text', placeholder: 'Ex: Varejo, Tecnologia' },
        { key: 'paisOrigem', label: 'País de Origem', type: 'text', placeholder: 'Ex: Brasil, EUA' },
    ],
};

/**
 * Verifica se o tipo usa campos "de empresa" (root fields)
 */
export function isEmpresaType(tipo?: string | null): boolean {
    return !tipo || tipo === 'EMPRESA';
}

/**
 * Retorna o label amigável para um tipo
 */
export function getTipoLabel(tipo?: string | null): string {
    if (!tipo) return 'Empresa';
    return TIPO_ENTIDADE_OPTIONS.find((t) => t.value === tipo)?.label ?? tipo;
}
