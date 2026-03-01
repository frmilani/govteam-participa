"use client"

import { useState, useCallback, useEffect, createContext, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Modal } from "@/components/ui/Modal"
import { HPAC_DENIED_EVENT, type HpacDeniedEventDetail } from "@/lib/api-client"

interface AccessDeniedInfo {
    resource?: string
    action?: string
    reason?: string
}

interface AccessDeniedContextType {
    showAccessDenied: (info?: AccessDeniedInfo) => void
}

const AccessDeniedContext = createContext<AccessDeniedContextType>({
    showAccessDenied: () => { },
})

export function useAccessDenied() {
    return useContext(AccessDeniedContext)
}

const REASON_MESSAGES: Record<string, string> = {
    no_matching_policy: "Nenhuma política de acesso foi configurada para permitir esta ação.",
    conditions_not_met: "As condições de acesso não foram satisfeitas.",
    unit_out_of_scope: "Sua unidade não tem escopo para acessar este recurso.",
    resource_id_restricted: "Este item específico não está dentro do seu escopo de acesso.",
    explicit_deny: "O acesso a este recurso foi explicitamente negado pela política.",
    no_session: "Sua sessão expirou. Faça login novamente.",
    access_denied: "Nenhuma política de acesso foi configurada para permitir esta ação.",
}

const RESOURCE_LABELS: Record<string, string> = {
    'participa:enquete': 'Enquetes',
    'participa:campanha': 'Campanhas',
    'participa:lead': 'Leads',
    'participa:segmento': 'Segmentos',
    'participa:estabelecimento': 'Estabelecimentos',
    'participa:voto': 'Votos',

    // Fallback without prefix
    'enquete': 'Enquetes',
    'campanha': 'Campanhas',
    'lead': 'Leads',
    'segmento': 'Segmentos',
    'estabelecimento': 'Estabelecimentos',
    'voto': 'Votos',
}

const ACTION_LABELS: Record<string, string> = {
    list: 'listar',
    read: 'visualizar',
    create: 'criar',
    update: 'editar',
    delete: 'excluir',
    export: 'exportar',
    publish: 'publicar',
}

export function AccessDeniedProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [info, setInfo] = useState<AccessDeniedInfo>({})
    const router = useRouter()
    const pathname = usePathname()

    const showAccessDenied = useCallback((details?: AccessDeniedInfo) => {
        setInfo(details || {})
        setOpen(true)
    }, [])

    useEffect(() => {
        function handleHpacDenied(e: Event) {
            const detail = (e as CustomEvent<HpacDeniedEventDetail>).detail
            showAccessDenied({
                resource: detail?.resource,
                action: detail?.action,
                reason: detail?.reason,
            })
        }

        window.addEventListener(HPAC_DENIED_EVENT, handleHpacDenied)
        return () => window.removeEventListener(HPAC_DENIED_EVENT, handleHpacDenied)
    }, [showAccessDenied])

    const handleClose = useCallback(() => {
        setOpen(false)
        // If it was a 'read' action that failed, or if it's the first load,
        // redirecting to an empty page is safer so the user doesn't stay on a completely broken page.
        // We avoid redirecting if on the blank page itself to avoid a loop.
        if ((info.action === 'read' || !info.action) && pathname !== '/admin/blank') {
            router.push('/admin/blank')
        }
    }, [router, info, pathname])

    return (
        <AccessDeniedContext.Provider value={{ showAccessDenied }}>
            {children}
            <AccessDeniedModal open={open} onClose={handleClose} {...info} />
        </AccessDeniedContext.Provider>
    )
}

export function AccessDeniedModal({
    open,
    onClose,
    resource,
    action,
    reason,
}: {
    open: boolean
    onClose: () => void
    resource?: string
    action?: string
    reason?: string
}) {
    const resourceLabel = resource ? (RESOURCE_LABELS[resource] || resource) : undefined
    const actionLabel = action ? (ACTION_LABELS[action] || action) : undefined
    const reasonMessage = reason ? (REASON_MESSAGES[reason] || reason) : undefined

    const friendlySentence = resourceLabel && actionLabel
        ? `Você não tem permissão para ${actionLabel} em ${resourceLabel}.`
        : 'Você não tem permissão para realizar esta ação.'

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Permissão Insuficiente"
            type="danger"
            confirmVariant="danger"
            confirmLabel="Entendi"
            onConfirm={onClose}
        >
            <div className="space-y-4 py-4">
                <p className="text-foreground font-medium">
                    {friendlySentence}
                </p>

                {reasonMessage && (
                    <p className="text-sm bg-muted/50 p-3 rounded-lg border border-border/50">
                        {reasonMessage}
                    </p>
                )}

                {(resourceLabel || actionLabel) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {resourceLabel && (
                            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium">
                                {resourceLabel}
                            </span>
                        )}
                        {actionLabel && (
                            <span className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded-md font-medium capitalize">
                                {actionLabel}
                            </span>
                        )}
                    </div>
                )}

                <p className="text-sm text-muted-foreground mt-4">
                    Solicite ao administrador da sua organização que configure as políticas HPAC necessárias para o seu perfil de acesso.
                </p>
            </div>
        </Modal>
    )
}
