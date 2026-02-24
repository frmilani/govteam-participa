"use client";

import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon, Mic, Video as VideoIcon, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePresignedUrl } from '@/hooks/use-estabelecimentos';
import { cn } from '@/lib/utils';

interface MediaUploadProps {
    value: string;
    onChange: (value: string) => void;
    type: 'image' | 'video' | 'audio' | 'text';
}

export function MediaUpload({ value, onChange, type }: MediaUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const presignedUrlMutation = usePresignedUrl();

    if (type === 'text') return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit size (e.g., 10MB for media)
        if (file.size > 10 * 1024 * 1024) {
            alert("O arquivo deve ter no máximo 10MB.");
            return;
        }

        try {
            setUploading(true);

            // 1. Get presigned URL
            const { uploadUrl, publicUrl } = await presignedUrlMutation.mutateAsync({
                fileName: file.name,
                fileType: file.type
            });

            // 2. Upload to S3/MinIO
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadResponse.ok) throw new Error("Falha no upload do arquivo");

            // 3. Update parent
            onChange(publicUrl);
        } catch (error) {
            console.error(error);
            alert("Erro ao fazer upload da mídia.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'image': return <ImageIcon size={14} />;
            case 'audio': return <Mic size={14} />;
            case 'video': return <VideoIcon size={14} />;
            default: return <LinkIcon size={14} />;
        }
    };

    const getAccept = () => {
        switch (type) {
            case 'image': return "image/*";
            case 'audio': return "audio/*";
            case 'video': return "video/*";
            default: return "*/*";
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
                {getIcon()} Mídia do WhatsApp ({type})
            </label>

            <div className={cn(
                "relative group flex items-center gap-3 p-3 rounded-xl border transition-all",
                value ? "bg-emerald-50/30 border-emerald-100" : "bg-muted/10 border-border hover:border-primary/30"
            )}>
                <div className={cn(
                    "flex-1 flex items-center gap-3 min-w-0",
                    uploading && "opacity-50"
                )}>
                    <div className={cn(
                        "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border shadow-sm",
                        value ? "bg-emerald-100 border-emerald-200 text-emerald-600" : "bg-background border-border text-muted-foreground"
                    )}>
                        {uploading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : value ? (
                            <CheckCircle2 size={18} />
                        ) : (
                            getIcon()
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        {value ? (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Mídia Carregada</span>
                                <span className="text-[10px] text-muted-foreground truncate font-mono">{value}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">Nenhuma mídia</span>
                                <span className="text-[9px] text-muted-foreground tracking-tight">Faça upload ou cole uma URL direta</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept={getAccept()}
                        className="hidden"
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="h-8 rounded-lg px-3 font-bold text-[9px] uppercase tracking-wider bg-background"
                    >
                        {uploading ? "Enviando..." : "Upload"}
                    </Button>

                    {value && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange("")}
                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        >
                            <X size={14} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Manual URL input as fallback */}
            <div className="relative mt-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Ou cole a URL direta aqui..."
                    autoComplete="off"
                    className="w-full h-8 bg-transparent border-b border-border/30 text-[10px] px-1 pr-6 font-medium italic outline-none focus:border-primary/50 transition-colors"
                />
                <LinkIcon size={10} className="absolute right-1 top-2.5 text-muted-foreground/30 pointer-events-none" />
            </div>
        </div>
    );
}
