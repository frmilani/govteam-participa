"use client";

import { useRouter } from "next/navigation";
import { EnqueteForm } from "@/components/admin/enquete-form";

export default function NovaEnquetePage() {
    const router = useRouter();

    const handleClose = () => {
        router.push("/admin/enquetes");
    };

    return (
        <div className="animate-in fade-in duration-500">
            <EnqueteForm onClose={handleClose} />
        </div>
    );
}
