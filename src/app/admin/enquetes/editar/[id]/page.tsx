"use client";

import { useRouter, useParams } from "next/navigation";
import { EnqueteForm } from "@/components/admin/enquete-form";
import { useEnquete } from "@/hooks/use-enquetes";
import { Loader2, MessageSquare } from "lucide-react";
import { ResourceLoader } from "@/components/ui/ResourceLoader";

export default function EditarEnquetePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { data: enquete, isLoading, error } = useEnquete(id);

    const handleClose = () => {
        router.push("/admin/enquetes");
    };

    if (isLoading) {
        return <ResourceLoader icon="clipboard-list" label="Enquete" />;
    }

    if (error || !enquete) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 p-8 rounded-lg text-center space-y-4">
                <h2 className="text-xl font-bold text-destructive">Erro ao carregar enquete</h2>
                <p className="text-muted-foreground">A enquete solicitada não foi encontrada ou houve um problema na conexão.</p>
                <button
                    onClick={handleClose}
                    className="bg-primary text-white px-6 py-2 rounded-md font-bold text-sm"
                >
                    Voltar para Lista
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <EnqueteForm enquete={enquete} onClose={handleClose} />
        </div>
    );
}
