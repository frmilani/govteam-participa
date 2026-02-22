"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { CampanhaForm } from "@/components/admin/campanha-form";
import { useCampanha } from "@/hooks/use-campanhas";
import { ResourceLoader } from "@/components/ui/ResourceLoader";

export default function EditarCampanhaPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { data: campanha, isLoading } = useCampanha(id);

    if (isLoading) return <ResourceLoader icon="megaphone" label="Carregando Campanha..." />;

    return (
        <div className="container mx-auto py-6">
            <CampanhaForm campanha={campanha} onClose={() => router.push("/admin/campanhas")} />
        </div>
    );
}
