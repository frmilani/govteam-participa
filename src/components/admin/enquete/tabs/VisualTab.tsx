import React from "react";
import { useFormContext } from "react-hook-form";
import { X, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EnqueteFormData } from "../EnqueteFormSchema";

interface VisualTabProps {
    handleFileUpload: (
        e: React.ChangeEvent<HTMLInputElement>,
        field: any
    ) => Promise<void>;
    logoInputRef: React.RefObject<HTMLInputElement | null>;
    bannerInputRef: React.RefObject<HTMLInputElement | null>;
    uploadingLogo: boolean;
    uploadingBanner: boolean;
}

export const VisualTab: React.FC<VisualTabProps> = ({
    handleFileUpload,
    logoInputRef,
    bannerInputRef,
    uploadingLogo,
    uploadingBanner,
}) => {
    const { register, watch, setValue } = useFormContext<EnqueteFormData>();

    const primaryColor = watch("configVisual.primaryColor");
    const logoUrl = watch("configVisual.logoUrl");
    const bannerUrl = watch("configVisual.bannerUrl");

    return (
        <div className="space-y-8 max-w-2xl animate-in fade-in duration-300">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-bold">
                        Cor Primária
                    </label>
                    <div className="flex gap-3">
                        <input
                            {...register("configVisual.primaryColor")}
                            type="color"
                            className="h-10 w-20 rounded-md border border-input cursor-pointer p-1 bg-card shadow-sm"
                        />
                        <Input
                            value={primaryColor}
                            onChange={(e) =>
                                setValue("configVisual.primaryColor", e.target.value)
                            }
                            className="flex-1 font-mono text-xs"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-bold">
                        Template Visual
                    </label>
                    <select
                        {...register("configVisual.template")}
                        className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm font-bold outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all appearance-none shadow-sm"
                    >
                        <option value="default">Layout Padrão</option>
                        <option value="premium">Elite Premium</option>
                        <option value="modern">Vibrante Moderno</option>
                        <option value="genz">Vibrante Gen Z (Neo-Pop)</option>
                        <option value="cyberpunk">Cyberpunk (Neon)</option>
                        <option value="organic">Orgânico (Natural)</option>
                        <option value="acid">Acid (Tech)</option>
                        <option value="swiss">Suíço (Grid)</option>
                        <option value="minimal">Foco Minimalista</option>
                    </select>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-bold">
                        Identidade Visual
                    </label>

                    {/* Logo Upload */}
                    <div className="p-4 bg-muted/50 rounded-lg border border-border shadow-sm group">
                        <div className="flex items-start gap-4">
                            <div className="relative h-20 w-20 rounded-lg bg-card border border-dashed border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/50 transition-all shadow-inner">
                                {logoUrl ? (
                                    <>
                                        <img
                                            src={logoUrl}
                                            alt="Logo"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setValue("configVisual.logoUrl", "")}
                                            className="absolute inset-0 bg-destructive/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="text-white" size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-muted-foreground/40 group-hover:text-primary transition-colors">
                                        {uploadingLogo ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <ImageIcon size={20} />
                                        )}
                                        <span className="text-[8px] font-bold uppercase tracking-widest">
                                            Logo
                                        </span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    onChange={(e) => handleFileUpload(e, "configVisual.logoUrl")}
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={uploadingLogo}
                                />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <h4 className="text-xs font-bold text-foreground uppercase tracking-tight">
                                    Logomarca da Prefeitura / Evento
                                </h4>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    Exibida no topo das páginas e nos cards de votação. Recomendado
                                    fundo transparente.
                                </p>
                                <div className="flex items-center gap-3 pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-md px-3 font-bold text-[10px] uppercase tracking-wider"
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={uploadingLogo}
                                    >
                                        {uploadingLogo ? "Enviando..." : "Fazer Upload"}
                                    </Button>
                                    <span className="text-[9px] text-muted-foreground">
                                        PNG ou WEBP • Máx 2MB
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Banner Upload */}
                    <div className="p-4 bg-muted/50 rounded-lg border border-border shadow-sm group">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-tight">
                                        Banner de Destaque
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Exibido na tela de boas-vindas. Define a atmosfera visual da
                                        campanha.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-muted-foreground block">
                                        Ideal: 1200x500px
                                    </span>
                                    <span className="text-[9px] text-muted-foreground block">
                                        PNG ou JPG • Máx 2MB
                                    </span>
                                </div>
                            </div>

                            <div className="relative w-full aspect-[21/9] rounded-lg bg-card border border-dashed border-border flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-all shadow-inner">
                                {bannerUrl ? (
                                    <>
                                        <img
                                            src={bannerUrl}
                                            alt="Banner"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setValue("configVisual.bannerUrl", "")}
                                            className="absolute inset-0 bg-destructive/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="text-white" size={24} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground/40 group-hover:text-primary transition-colors">
                                        {uploadingBanner ? (
                                            <Loader2 className="animate-spin" size={24} />
                                        ) : (
                                            <ImageIcon size={32} />
                                        )}
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            Clique ou arraste o banner
                                        </span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={bannerInputRef}
                                    onChange={(e) => handleFileUpload(e, "configVisual.bannerUrl")}
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={uploadingBanner}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-md px-4 font-bold text-[10px] uppercase tracking-wider"
                                    onClick={() => bannerInputRef.current?.click()}
                                    disabled={uploadingBanner}
                                >
                                    {uploadingBanner ? "Enviando..." : "Selecionar Imagem"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Manual URLs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            URL Manual Logo
                        </label>
                        <Input
                            {...register("configVisual.logoUrl")}
                            placeholder="https://"
                            className="text-[11px] h-8"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            URL Manual Banner
                        </label>
                        <Input
                            {...register("configVisual.bannerUrl")}
                            placeholder="https://"
                            className="text-[11px] h-8"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
