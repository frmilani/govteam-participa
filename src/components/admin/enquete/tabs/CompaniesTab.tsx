import React from "react";
import { useFormContext } from "react-hook-form";
import { TransferList } from "@/components/ui/TransferList";
import { EnqueteFormData } from "../EnqueteFormSchema";

interface CompaniesTabProps {
    allEstabelecimentos: Array<{
        id: string;
        nome: string;
        descricao?: string | null;
        segmentos: {
            segmento: {
                id: string;
            }
        }[];
    }>;
}

export const CompaniesTab: React.FC<CompaniesTabProps> = ({
    allEstabelecimentos,
}) => {
    const { watch, setValue } = useFormContext<EnqueteFormData>();
    const selectedEstabelecimentoIds = watch("estabelecimentoIds") || [];
    const selectedSegmentoIds = watch("segmentoIds") || [];

    // Filter establishments based on selected segments
    const filteredEstabelecimentos = React.useMemo(() => {
        // If no segments selected, show nothing (or could show all, but per requirements we limit)
        if (selectedSegmentoIds.length === 0) return [];

        return allEstabelecimentos.filter(est =>
            // Check if establishment has at least one segment that matches the selected segments
            est.segmentos.some(segRel => selectedSegmentoIds.includes(segRel.segmento.id))
        );
    }, [allEstabelecimentos, selectedSegmentoIds]);

    // Handle clearing invalid selections if segments change? 
    // Ideally we might want to warn user or auto-remove. For now, let's just restrict the *available* list.
    // However, if an item is already selected but its segment is removed, it remains "selected" in the data but hidden from "available".
    // This is often acceptable behavior (legacy selection), but UI should probably flag it or we auto-remove.
    // Let's stick to filtering "Available" items first.

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {selectedSegmentoIds.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/30">
                    <p className="text-muted-foreground text-sm">
                        Selecione primeiro as <strong>Categorias</strong> na aba anterior para visualizar as empresas disponíveis.
                    </p>
                </div>
            ) : filteredEstabelecimentos.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/30">
                    <p className="text-muted-foreground text-sm">
                        Nenhuma empresa encontrada vinculada às categorias selecionadas.
                    </p>
                </div>
            ) : (
                <TransferList
                    items={filteredEstabelecimentos.map((e) => ({
                        id: e.id,
                        label: e.nome,
                        description: e.descricao || undefined,
                    }))}
                    value={selectedEstabelecimentoIds}
                    onChange={(val) =>
                        setValue("estabelecimentoIds", val, { shouldDirty: true })
                    }
                    leftTitle={`Empresas Disponíveis (${filteredEstabelecimentos.length})`}
                    rightTitle="Empresas na Enquete"
                    searchPlaceholder="Buscar empresa..."
                />
            )}

            {selectedSegmentoIds.length > 0 && (
                <p className="text-[10px] text-muted-foreground text-right">
                    Exibindo apenas empresas das {selectedSegmentoIds.length} categorias selecionadas.
                </p>
            )}
        </div>
    );
};
