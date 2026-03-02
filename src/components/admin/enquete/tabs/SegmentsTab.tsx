import React from "react";
import { useFormContext } from "react-hook-form";
import { TransferList } from "@/components/ui/TransferList";
import { EnqueteFormData } from "../EnqueteFormSchema";

interface SegmentoWithChildren {
    id: string;
    nome: string;
    filhos?: SegmentoWithChildren[];
    _count?: {
        estabelecimentos: number;
    };
}

interface SegmentsTabProps {
    allSegmentos: SegmentoWithChildren[];
}

export const SegmentsTab: React.FC<SegmentsTabProps> = ({ allSegmentos }) => {
    const { watch, setValue } = useFormContext<EnqueteFormData>();
    const selectedSegmentoIds = watch("segmentoIds") || [];

    // Flatten all segments recursively, showing all (even those without establishments yet)
    const flattenSegments = React.useCallback((segments: SegmentoWithChildren[], parentName: string = ""): { id: string; label: string }[] => {
        let result: { id: string; label: string }[] = [];

        segments.forEach(seg => {
            const fullName = parentName ? `${parentName} > ${seg.nome}` : seg.nome;

            // Always include the segment (even without establishments yet)
            result.push({ id: seg.id, label: fullName });

            if (seg.filhos && seg.filhos.length > 0) {
                result = [...result, ...flattenSegments(seg.filhos, seg.nome)];
            }
        });

        return result;
    }, []);

    const selectableItems = React.useMemo(() => flattenSegments(allSegmentos), [allSegmentos, flattenSegments]);

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <TransferList
                items={selectableItems}
                value={selectedSegmentoIds}
                onChange={(val) => setValue("segmentoIds", val, { shouldDirty: true })}
                leftTitle={`Categorias Disponíveis (${selectableItems.length})`}
                rightTitle="Categorias na Enquete"
                searchPlaceholder="Buscar categoria..."
            />
            {selectableItems.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                    Nenhuma categoria com empresas cadastradas foi encontrada.
                </p>
            )}
        </div>
    );
};
