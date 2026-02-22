import React from 'react';
import { Smartphone, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UseFieldArrayAppend, UseFieldArrayRemove, UseFieldArrayUpdate } from 'react-hook-form';

interface ConnectionManagerProps {
    whatsappInstances: any[];
    instanceFields: any[];
    appendInstance: UseFieldArrayAppend<any, any>;
    removeInstance: UseFieldArrayRemove;
    updateInstance: UseFieldArrayUpdate<any, any>;
}

export function ConnectionManager({ whatsappInstances, instanceFields, appendInstance, removeInstance, updateInstance }: ConnectionManagerProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-muted/30 p-6 rounded-xl border border-border">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Signal size={16} className="text-primary" />
                    Distribuição de Carga
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                    Selecione quais números do WhatsApp serão utilizados para enviar esta campanha.
                    O sistema irá distribuir os envios proporcionalmente ao peso configurado.
                </p>

                {whatsappInstances.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-border rounded-xl">
                        <Smartphone className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-bold text-muted-foreground">Nenhuma conexão configurada.</p>
                        <p className="text-xs text-muted-foreground mt-1">Vá em Configurações {'>'} WhatsApp para adicionar.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {whatsappInstances.map((instance) => {
                            const isSelected = instanceFields.some(f => f.instanceId === instance.id);
                            const fieldIndex = instanceFields.findIndex(f => f.instanceId === instance.id);
                            const currentWeight = fieldIndex >= 0 ? instanceFields[fieldIndex].weight : 100;

                            return (
                                <div key={instance.id} className={cn(
                                    "p-4 rounded-xl border transition-all",
                                    isSelected ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:border-primary/20"
                                )}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                                                instance.status === 'CONNECTED' ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                                            )}>
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground">{instance.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium">{instance.number || "Sem número"}</p>
                                            </div>
                                        </div>

                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        appendInstance({ instanceId: instance.id, weight: 100 });
                                                    } else {
                                                        removeInstance(fieldIndex);
                                                    }
                                                }}
                                            />
                                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    {isSelected && (
                                        <div className="animate-in slide-in-from-top-2 duration-200 pl-[52px]">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Peso de Distribuição</label>
                                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{currentWeight}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="100"
                                                value={currentWeight}
                                                onChange={(e) => updateInstance(fieldIndex, { instanceId: instance.id, weight: parseInt(e.target.value) })}
                                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                            <p className="text-[9px] text-muted-foreground mt-2 font-medium">
                                                Quanto maior o peso, mais mensagens serão enviadas por este número.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
