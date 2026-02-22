"use client";

import React from 'react';
import { Palette, RefreshCw, CheckCircle2, Loader2, Download, ExternalLink, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface DesignSystem {
    id: string;
    name?: string;
    version?: string;
    colors: Record<string, string>;
    spacing?: {
        radius?: string;
    };
    isPublic?: boolean;
}

export function ThemeManagementClient() {
    const { showToast } = useToast();
    const { theme: activeTheme, availableThemes, loading, error, refresh, applyTheme } = useDesignSystem();

    const handleExport = (system: DesignSystem) => {
        try {
            const blob = new Blob([JSON.stringify(system, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${system.name?.toLowerCase().replace(/\s+/g, '-') || 'theme'}-design-system.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('JSON exportado com sucesso!');
        } catch (error) {
            console.error('Error exporting design system:', error);
            showToast('Erro ao exportar design system', 'error');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header section - Selection Focused */}
            <div className="relative overflow-hidden bg-card rounded-2xl border border-border p-10 shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            <Palette size={12} />
                            Visual Identity
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">
                            Design Systems
                        </h1>
                        <p className="text-muted-foreground text-base max-w-2xl leading-relaxed font-medium">
                            Selecione a identidade visual que será aplicada ao sistema de premiação.
                            Estes sistemas são sincronizados em tempo real com o <span className="text-primary font-bold">Synkra Hub</span>.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={refresh}
                            disabled={loading}
                            className="gap-2 h-12 px-6 shadow-sm border-primary/20 hover:bg-primary/5 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            Sincronizar Hub
                        </Button>
                        <a href="http://localhost:3000/admin/design-system" target="_blank" rel="noopener noreferrer">
                            <Button variant="primary" className="gap-2 h-12 px-6 shadow-lg shadow-primary/20 transition-all font-black text-[10px] uppercase tracking-widest">
                                <ExternalLink size={16} />
                                Criar no Hub
                            </Button>
                        </a>
                    </div>
                </div>
                {/* Background Decorative Element */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px] pointer-events-none" />
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-6 rounded-2xl border border-destructive/20 font-bold flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    Erro ao carregar identidades: {error}
                </div>
            )}

            {/* Design Systems Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {availableThemes.map((system) => {
                    const isActive = system.id === activeTheme?.id;

                    return (
                        <div
                            key={system.id}
                            className={cn(
                                "group relative flex flex-col bg-card rounded-3xl border transition-all duration-500 overflow-hidden cursor-pointer",
                                isActive
                                    ? "border-primary shadow-xl shadow-primary/10 scale-[1.02]"
                                    : "border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-black/5"
                            )}
                            onClick={() => applyTheme(system)}
                        >
                            {/* Visual Preview */}
                            <div className="relative h-36 bg-muted/20 overflow-hidden">
                                {/* Color Swatches Abstract Pattern */}
                                <div className="absolute inset-0 flex items-center justify-center gap-3">
                                    <div className="w-12 h-12 rounded-xl rotate-12 shadow-lg transition-transform group-hover:scale-110 duration-700" style={{ backgroundColor: system.colors?.primary || 'var(--primary)' }} />
                                    <div className="w-9 h-9 rounded-lg -rotate-12 shadow-md opacity-80" style={{ backgroundColor: system.colors?.secondary || 'var(--secondary)' }} />
                                    <div className="w-7 h-7 rounded-md rotate-45 shadow-sm opacity-60" style={{ backgroundColor: system.colors?.accent || 'var(--accent)' }} />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                                {isActive && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-lg animate-in zoom-in duration-500">
                                        <CheckCircle2 size={10} strokeWidth={3} />
                                        Ativo
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 pt-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                                            {system.name || 'Sem nome'}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-muted/80 px-2 py-0.5 rounded">
                                                v{system.version || '1.0.0'}
                                            </span>
                                            {system.isPublic !== false ? (
                                                <span className="flex items-center gap-1.5 text-emerald-500 text-[9px] font-black uppercase tracking-wider">
                                                    <Globe size={10} />
                                                    Público
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-muted-foreground/60 text-[9px] font-black uppercase tracking-wider">
                                                    <Lock size={10} />
                                                    Privado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-6">
                                    {/* Small swatches */}
                                    {['primary', 'secondary', 'accent', 'background'].map((c) => (
                                        <div
                                            key={c}
                                            className="h-4 w-4 rounded-full border border-border/50 shadow-xs"
                                            style={{ backgroundColor: (system.colors as any)?.[c] || '#ddd' }}
                                        />
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-6 border-t border-border">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            applyTheme(system);
                                            showToast('Identidade aplicada com sucesso!');
                                        }}
                                        disabled={isActive}
                                        variant={isActive ? "outline" : "primary"}
                                        className={cn(
                                            "flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
                                            isActive && "bg-emerald-500/5 text-emerald-500 border-emerald-500/20 opacity-100 cursor-default"
                                        )}
                                    >
                                        {isActive ? "Identidade Ativa" : "Aplicar Tema"}
                                    </Button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleExport(system);
                                        }}
                                        className="h-12 w-12 flex items-center justify-center bg-muted/50 text-muted-foreground rounded-xl hover:bg-muted hover:text-foreground transition-all shadow-sm border border-border/50"
                                        title="Exportar Configuração"
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {!loading && availableThemes.length === 0 && (
                    <div className="col-span-full bg-card rounded-3xl border border-dashed border-border p-20 text-center">
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="w-24 h-24 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto text-muted-foreground/20">
                                <Palette size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-foreground tracking-tight">Cofre de Identidades Vazio</h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                                    Não foram detectados Design Systems compatíveis no Hub. Use o botão acima para criar um novo.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
