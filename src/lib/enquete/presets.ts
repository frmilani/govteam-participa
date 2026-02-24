import { EnqueteFormData } from "@/components/admin/enquete/EnqueteFormSchema";

export type PresetValues = Partial<EnqueteFormData>;

export const PRESETS: Record<string, PresetValues> = {
    "premiacao": {
        modoColeta: "recall-assistido",
        incluirQualidade: true,
        modoDistribuicao: "grupo",
        usarPremiacao: true,
        configPesquisa: {
            blocosAdicionais: {
                nps: false,
                priorizacao: false,
                aprovacao: false,
                textoLivre: false
            }
        }
    },
    "politica": {
        modoColeta: "top-of-mind",
        incluirQualidade: false,
        modoDistribuicao: "todas",
        usarPremiacao: false,
        configPesquisa: {
            blocosAdicionais: {
                nps: false,
                priorizacao: false,
                aprovacao: false,
                textoLivre: false
            }
        }
    },
    "politicas-publicas": {
        modoColeta: "lista-sugerida",
        incluirQualidade: true,
        modoDistribuicao: "todas",
        usarPremiacao: false,
        configPesquisa: {
            blocosAdicionais: {
                nps: true,
                priorizacao: true,
                aprovacao: false,
                textoLivre: true
            }
        }
    },
    "corporativo": {
        modoColeta: "recall-assistido",
        incluirQualidade: true,
        modoDistribuicao: "todas",
        usarPremiacao: false,
        configPesquisa: {
            blocosAdicionais: {
                nps: true,
                priorizacao: false,
                aprovacao: false,
                textoLivre: true
            }
        }
    },
    "custom": {
        // Sem hook forçado para valores restritivos
    }
};

export const applyPreset = (
    tipoId: string,
    setValue: (name: any, value: any, options?: any) => void
) => {
    const preset = PRESETS[tipoId];
    if (!preset) return;

    Object.entries(preset).forEach(([key, value]) => {
        setValue(key as any, value, { shouldDirty: true, shouldValidate: true });
    });
};
