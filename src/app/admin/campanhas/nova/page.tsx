"use client";

import { CampanhaForm } from "@/components/admin/campanha-form";
import { useRouter } from "next/navigation";

export default function NovaCampanhaPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto py-6">
            <CampanhaForm onClose={() => router.push("/admin/campanhas")} />
        </div>
    );
}
