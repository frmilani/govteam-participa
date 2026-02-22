import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Plus, Copy, X, Activity } from 'lucide-react';
import { UseFormWatch } from 'react-hook-form';

interface TemplateManagerProps {
    templateFields: any[];
    activeTemplateIndex: number;
    setActiveTemplateIndex: (index: number) => void;
    watch: UseFormWatch<any>;
    appendTemplate: (data: any) => void;
    removeTemplate: (index: number) => void;
    handleTemplateWeightChange: (index: number, value: number) => void;
    rebalanceWeightsAfterAction: (newCount: number) => void;
}

export function TemplateManager({
    templateFields,
    activeTemplateIndex,
    setActiveTemplateIndex,
    watch,
    appendTemplate,
    removeTemplate,
    handleTemplateWeightChange,
    rebalanceWeightsAfterAction
}: TemplateManagerProps) {
    const templates = watch("templates") || [];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Modelos de Mensagem (A/B)</h3>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">Crie até 5 variações para rotacionar no disparo.</p>
                </div>
                {templateFields.length < 5 && (
                    <Button
                        type="button"
                        onClick={() => {
                            appendTemplate({ messages: [{ type: 'text', content: "", mediaUrl: "", delayAfter: 5 }], weight: 0 });
                            rebalanceWeightsAfterAction(templateFields.length + 1);
                            setActiveTemplateIndex(templateFields.length);
                        }}
                        variant="outline"
                        size="sm"
                        className="font-bold text-[10px] uppercase tracking-wider gap-2 h-8 border-primary/30 text-primary hover:bg-primary/5"
                    >
                        <Plus size={14} />
                        Novo Modelo
                    </Button>
                )}
            </div>

            {/* Template Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {templateFields.map((field, index) => (
                    <div key={field.id} className="relative group shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTemplateIndex(index)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 border",
                                activeTemplateIndex === index
                                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                    : "bg-background text-muted-foreground border-border hover:border-primary/30"
                            )}
                        >
                            <span>Modelo {index + 1} ({watch(`templates.${index}.weight`) || 0}%)</span>
                            <div className="flex items-center gap-1 ml-1">
                                <div
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const currentValues = watch(`templates.${index}`);
                                        appendTemplate({
                                            messages: JSON.parse(JSON.stringify(currentValues.messages)),
                                            weight: currentValues.weight || 100
                                        });
                                    }}
                                    className="hover:bg-black/20 rounded p-0.5"
                                    title="Duplicar Modelo"
                                >
                                    <Copy size={10} />
                                </div>
                                {templateFields.length > 1 && (
                                    <div
                                        role="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (activeTemplateIndex >= index && activeTemplateIndex > 0) setActiveTemplateIndex(activeTemplateIndex - 1);
                                            removeTemplate(index);
                                            rebalanceWeightsAfterAction(templateFields.length - 1);
                                        }}
                                        className="hover:bg-black/20 rounded p-0.5"
                                        title="Excluir Modelo"
                                    >
                                        <X size={10} />
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>
                ))}
            </div>

            {/* Template Weight Calibration */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Peso do Modelo {activeTemplateIndex + 1}</span>
                    </div>
                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{watch(`templates.${activeTemplateIndex}.weight`) || 0}%</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="99"
                    value={watch(`templates.${activeTemplateIndex}.weight`) || 0}
                    onChange={(e) => handleTemplateWeightChange(activeTemplateIndex, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[9px] text-muted-foreground font-medium italic">
                    Define a proporção de envios que utilizarão este modelo específico em relação aos outros.
                </p>
            </div>
        </div>
    );
}
