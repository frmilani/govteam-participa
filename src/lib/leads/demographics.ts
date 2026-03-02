export const DEMOGRAPHIC_MAPPING: Record<string, string[]> = {
    'bairro': ['bairro', 'zona', 'setor', 'localidade'],
    'faixaEtaria': ['faixa etária', 'faixa etaria', 'idade', 'anos', 'nascimento'],
    'profissao': ['profissão', 'profissao', 'ocupação', 'ocupacao', 'trabalho'],
    'escolaridade': ['escolaridade', 'instrução', 'estudo', 'formação'],
    'rendaFamiliar': ['renda', 'salário', 'ganho', 'familiar'],
    'sexo': ['sexo', 'gênero', 'genero'],
    'cidade': ['cidade', 'município', 'municipio', 'naturalidade'],
    'estado': ['estado', 'uf', 'região'],
    'estadoCivil': ['estado civil', 'civil', 'conjugal']
};

export const PII_BLACKLIST = [
    'cpf',
    'whatsapp',
    'email',
    'nome',
    'telefone',
    'rg',
    'senha',
    'password'
];

/**
 * Filtra as respostas do formulário para encontrar apenas dados demográficos válidos.
 * Pode usar o schema do formulário para mapear IDs genéricos para nomes legíveis.
 */
export function extractDemographicsParams(
    dados: Record<string, any>,
    allElements: any[] = []
): Record<string, any> {
    const demograficos: Record<string, any> = {};

    if (!dados || typeof dados !== 'object') return demograficos;

    // 1. Tentar mapear usando o schema (Mapeamento Inteligente por Label/Name)
    if (allElements.length > 0) {
        for (const element of allElements) {
            const val = dados[element.id];
            if (val === undefined || val === null || val === '') continue;

            // Procurar correspondência de label ou name nos elementos do form
            const searchTerms = [
                (element.label || '').toLowerCase(),
                (element.name || '').toLowerCase(),
                (element.id || '').toLowerCase()
            ];

            // Proteção contra PII
            if (searchTerms.some(term => PII_BLACKLIST.some(pii => term.includes(pii)))) continue;

            // Checar contra o nosso mapping
            for (const [standardKey, keywords] of Object.entries(DEMOGRAPHIC_MAPPING)) {
                if (searchTerms.some(term => keywords.some(k => term.includes(k)))) {
                    demograficos[standardKey] = val;
                    break;
                }
            }
        }
    }

    // 2. Fallback: Mapeamento direto pelas chaves do objeto dados (compatibilidade legado)
    for (const [key, value] of Object.entries(dados)) {
        if (value === undefined || value === null || value === '') continue;
        if (demograficos[key]) continue; // Já mapeado pelo schema

        const lowerKey = key.toLowerCase();
        if (PII_BLACKLIST.some(pii => lowerKey.includes(pii))) continue;

        for (const [standardKey, keywords] of Object.entries(DEMOGRAPHIC_MAPPING)) {
            if (keywords.some(k => lowerKey.includes(k))) {
                demograficos[standardKey] = value;
                break;
            }
        }
    }

    return demograficos;
}
