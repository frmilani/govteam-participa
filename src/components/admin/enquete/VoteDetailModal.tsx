import { Modal } from "@/components/ui/Modal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Smartphone,
    CreditCard,
    Ticket,
    Clock,
    Globe,
    ShieldAlert,
    CheckCircle2,
    Ban,
    Hash,
    MapPin,
    Cpu,
    Mail,
    Instagram
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    vote: any | null;
}

export function VoteDetailModal({ isOpen, onClose, vote }: VoteDetailModalProps) {
    if (!vote) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "VALID": return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-none px-3 py-1">Válido</Badge>;
            case "SUSPICIOUS": return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-none px-3 py-1">Suspeito</Badge>;
            case "INVALID": return <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-none px-3 py-1">Inválido</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes do Voto"
            description={`ID: ${vote.id}`}
            maxWidth="max-w-4xl"
        >
            <div className="space-y-8 py-4">
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/30 p-4 rounded-lg border border-border flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Data do Voto</p>
                            <p className="font-medium text-sm">
                                {format(new Date(vote.respondidoEm), "dd MMM yyyy, HH:mm:ss", { locale: ptBR })}
                            </p>
                        </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg border border-border flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Endereço IP</p>
                            <p className="font-mono text-sm">{vote.ipAddress || "Não registrado"}</p>
                        </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg border border-border flex items-center gap-4">
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center",
                            vote.fraudScore > 70 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"
                        )}>
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status de Risco</p>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(vote.status)}
                                <span className="text-xs font-bold text-muted-foreground">Score: {vote.fraudScore}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border my-6" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Voter Info */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                <User className="w-4 h-4" /> Dados do Eleitor
                            </h4>
                            <div className="bg-card border border-border rounded-lg p-5 space-y-4 shadow-sm">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Nome Completo</label>
                                    <p className="text-base font-bold text-foreground">{vote.lead?.nome || "Anônimo"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <CreditCard className="w-3 h-3" /> CPF / DOC
                                        </label>
                                        <p className="font-mono text-sm">{vote.lead?.cpf || "-"}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <Smartphone className="w-3 h-3" /> WhatsApp
                                        </label>
                                        <p className="font-mono text-sm">{vote.lead?.whatsapp || "-"}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> E-mail
                                        </label>
                                        <p className="text-xs truncate" title={vote.lead?.email}>{vote.lead?.email || "-"}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <Instagram className="w-3 h-3" /> Instagram
                                        </label>
                                        <p className="text-xs truncate" title={vote.lead?.instagram}>{vote.lead?.instagram || "-"}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-border/50">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                        <Ticket className="w-3 h-3" /> Cupons Acumulados
                                    </label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Badge variant="secondary" className="text-sm px-3 py-1 font-mono font-bold">
                                            {vote.lead?.cupons || 0}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground font-medium">tickets gerados</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technical Details */}
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                <Cpu className="w-4 h-4" /> Metadados Técnicos
                            </h4>
                            <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-3 text-xs font-mono text-muted-foreground break-all">
                                <div>
                                    <span className="font-bold block mb-1">User Agent:</span>
                                    {vote.userAgent || "-"}
                                </div>
                                <div>
                                    <span className="font-bold block mb-1">Hash de Rastreio:</span>
                                    {vote.trackingLink?.hash || "Link Público"}
                                </div>
                                {vote.fraudReason && (
                                    <div className="text-destructive font-bold bg-destructive/10 p-2 rounded border border-destructive/20">
                                        ALERTA: {vote.fraudReason}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Middle & Right Column: Choices & Lucky Numbers */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Lucky Numbers */}
                        {vote.lead?.numerosSorte && vote.lead.numerosSorte.length > 0 && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-5">
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 mb-4">
                                    <Ticket className="w-4 h-4" /> Números da Sorte Gerados
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {vote.lead.numerosSorte.map((num: any) => (
                                        <span key={num.numero} className="px-3 py-1.5 bg-white dark:bg-background border border-amber-300 dark:border-amber-800 rounded-md font-mono font-bold text-amber-700 dark:text-amber-500 shadow-sm">
                                            {num.numero}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Votes */}
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                <CheckCircle2 className="w-4 h-4" /> Escolhas Realizadas ({vote.votos?.length || 0})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {vote.votos?.map((v: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                                        <div className="h-8 w-8 bg-muted rounded flex items-center justify-center font-bold text-muted-foreground text-xs">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium text-sm">{v.estabelecimento?.nome || "Escolha desconhecida"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
