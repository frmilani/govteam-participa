import React from "react";
import { useFormContext } from "react-hook-form";
import {
    Smartphone,
    Calendar,
    Square,
    ArrowRight,
    FileText,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VoteTemplateProvider } from "@/components/voting/VoteTemplateContext";
import { getTemplateConfig } from "@/lib/vote-templates";
import { EnqueteFormData } from "./EnqueteFormSchema";

interface EnquetePreviewProps {
    activeTab: string;
}

export const EnquetePreview: React.FC<EnquetePreviewProps> = ({
    activeTab,
}) => {
    const { watch } = useFormContext<EnqueteFormData>();

    const templateName = watch("configVisual.template");
    const primaryColor = watch("configVisual.primaryColor");
    const logoUrl = watch("configVisual.logoUrl");
    const bannerUrl = watch("configVisual.bannerUrl");
    const titulo = watch("titulo");
    const descricao = watch("descricao");
    const dataInicio = watch("dataInicio");
    const dataFim = watch("dataFim");
    const regulamento = watch("regulamento");
    const thanksTitle = watch("paginaAgradecimento.titulo");
    const thanksMessage = watch("paginaAgradecimento.mensagem");

    const template = getTemplateConfig(templateName);

    return (
        <div className="hidden xl:block w-80 shrink-0">
            <div className="sticky top-6">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <Smartphone size={16} className="text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Preview em Tempo Real
                    </span>
                </div>
                <VoteTemplateProvider
                    templateName={templateName}
                    primaryColor={primaryColor}
                    logoUrl={logoUrl}
                    bannerUrl={bannerUrl}
                >
                    <div
                        className={cn(
                            "w-full aspect-[9/18.5] rounded-[2.5rem] border-[6px] border-foreground shadow-2xl overflow-hidden relative",
                            template.pageBg
                        )}
                    >
                        {/* Remove scrollbars for the frame */}
                        <style>{`
                  .no-scrollbar::-webkit-scrollbar { display: none; }
                  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>

                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-foreground rounded-b-xl z-20" />
                        <div className="h-full overflow-y-auto no-scrollbar relative">
                            {activeTab !== "thanks" ? (
                                <div className="flex flex-col h-full bg-background">
                                    {/* Immersive Banner Area matching WelcomeScreen */}
                                    <div
                                        className={cn(
                                            "relative flex-shrink-0 flex flex-col items-center pt-6 pb-20 px-4 text-center",
                                            template.mood === "elegant"
                                                ? "min-h-[45%] bg-foreground"
                                                : "min-h-[35%]"
                                        )}
                                    >
                                        {bannerUrl && (
                                            <img
                                                src={bannerUrl}
                                                alt="Banner"
                                                className="absolute inset-0 w-full h-full object-cover opacity-60"
                                            />
                                        )}
                                        <div className={template.bannerOverlay} />

                                        {/* Badge at the top */}
                                        <div className="relative z-10 mb-6">
                                            <div className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-full text-[7px] font-bold uppercase tracking-wider shadow-lg">
                                                {titulo || "MELHORES DO ANO 2025"}
                                            </div>
                                        </div>

                                        {/* Logo centered */}
                                        {logoUrl && (
                                            <div className="relative z-10">
                                                <img
                                                    src={logoUrl}
                                                    alt="Logo"
                                                    className="h-14 mx-auto object-contain drop-shadow-lg"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Lower Action Card matching WelcomeScreen (Title/Description now inside) */}
                                    <div className="flex-1 p-6 flex flex-col -mt-16 rounded-t-[2rem] relative z-20 bg-background shadow-2xl border-t border-border">
                                        {/* Title and Description inside white card */}
                                        <div className="text-center space-y-2 mb-6">
                                            <h1
                                                className={cn(
                                                    "text-lg font-bold tracking-tight text-foreground leading-tight",
                                                    template.mood === "elegant" && "font-serif"
                                                )}
                                            >
                                                {titulo || "Participa"}
                                            </h1>
                                            <p className="text-muted-foreground text-[10px] font-medium leading-relaxed px-4 line-clamp-2">
                                                {descricao ||
                                                    "Participe da escolha das empresas e categorias que mais se destacaram!"}
                                            </p>
                                        </div>

                                        {/* Date Range Preview */}
                                        <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/30 mb-6">
                                            <Calendar size={10} className="text-muted-foreground" />
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                                {dataInicio
                                                    ? new Date(dataInicio).toLocaleDateString("pt-BR")
                                                    : "Início"}{" "}
                                                •{" "}
                                                {dataFim
                                                    ? new Date(dataFim).toLocaleDateString("pt-BR")
                                                    : "Fim"}
                                            </span>
                                        </div>

                                        {/* Agreement Preview */}
                                        <div className="mb-8 flex items-start gap-2 p-4 rounded-lg bg-muted/20 border border-border">
                                            <div className="mt-0.5 text-muted-foreground/30">
                                                <Square size={16} strokeWidth={2.5} />
                                            </div>
                                            <p className="text-[9px] font-bold text-foreground leading-snug">
                                                Concordo com a{" "}
                                                <span className="underline text-primary">
                                                    política de privacidade
                                                </span>
                                                {regulamento ? (
                                                    <>
                                                        {" "}
                                                        e{" "}
                                                        <span className="underline text-primary">
                                                            regulamento
                                                        </span>
                                                    </>
                                                ) : (
                                                    " e termos de uso"
                                                )}
                                                .
                                            </p>
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            <div
                                                className={cn(
                                                    "w-full h-11 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-white shadow-lg",
                                                    template.useDarkMode ? "opacity-90" : ""
                                                )}
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                Iniciar Votação <ArrowRight className="ml-2 w-3 h-3" />
                                            </div>

                                            {/* Regulation Tag Preview at bottom */}
                                            {regulamento && (
                                                <div className="flex justify-center">
                                                    <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[7px] font-bold uppercase tracking-wider">
                                                        <FileText size={10} />
                                                        Visualizar Regulamento
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center p-6 text-center bg-background">
                                    <div className="space-y-4">
                                        <div
                                            className={cn(
                                                "inline-flex h-16 w-16 rounded-xl items-center justify-center shadow-lg",
                                                template.iconContainerBg
                                            )}
                                            style={{ boxShadow: `0 10px 20px ${primaryColor}40` }}
                                        >
                                            <CheckCircle2 size={32} className="text-white" />
                                        </div>
                                        <h2
                                            className={cn(
                                                "text-lg font-bold tracking-tight text-foreground"
                                            )}
                                        >
                                            {thanksTitle || "Obrigado!"}
                                        </h2>
                                        <p
                                            className={cn(
                                                "text-[10px] font-medium leading-relaxed text-muted-foreground"
                                            )}
                                        >
                                            {thanksMessage || "Sua opinião foi registrada com sucesso."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </VoteTemplateProvider>
            </div>
        </div>
    );
};
