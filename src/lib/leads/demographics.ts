export const DEMOGRAPHIC_FIELDS_WHITELIST = [
    'bairro',
    'faixaEtaria',
    'profissao',
    'escolaridade',
    'rendaFamiliar',
    'tempoMoradia',
    'sexo',
    'genero',
    'estadoCivil',
    'cidade',
    'estado'
];

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
 * Filtra as respostas do formulário para encontrar apenas dados demográficos válidos
 * e ignora ativamente qualquer campo PII sensível.
 */
export function extractDemographicsParams(dados: Record<string, any>): Record<string, any> {
    const demograficos: Record<string, any> = {};

    if (!dados || typeof dados !== 'object') return demograficos;

    for (const [key, value] of Object.entries(dados)) {
        // Ignora campos sem valor ou strings vazias
        if (value === undefined || value === null || value === '') continue;

        const lowerKey = key.toLowerCase();

        // Proteção contra PII ativa
        const isPii = PII_BLACKLIST.some(pii => lowerKey.includes(pii));
        if (isPii) continue;

        // Se bater com a whitelist de dados que queremos enriquecer
        const isDemographic = DEMOGRAPHIC_FIELDS_WHITELIST.some(demo => lowerKey.includes(demo.toLowerCase()));
        if (isDemographic) {
            demograficos[key] = value;
        }
    }

    return demograficos;
}
