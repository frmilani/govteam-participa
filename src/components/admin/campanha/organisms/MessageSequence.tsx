import React from 'react';
import { useFieldArray, Control, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, Mic, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WhatsAppTextarea } from '../molecules/WhatsAppTextarea';
import { MediaUpload } from '../molecules/MediaUpload';



interface MessageSequenceProps {
    control: Control<any>;
    activeTemplateIndex: number;
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
}

export function MessageSequence({ control, activeTemplateIndex, register, watch, setValue }: MessageSequenceProps) {
    const { fields: messages, append, remove, swap } = useFieldArray({
        control,
        name: `templates.${activeTemplateIndex}.messages` as any
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Sequência do Modelo {activeTemplateIndex + 1}</h4>
                <Button
                    type="button"
                    onClick={() => append({ type: 'text', content: "", mediaUrl: "", delayAfter: 5 })}
                    variant="outline"
                    size="sm"
                    className="font-bold text-[10px] uppercase tracking-wider gap-2 h-8"
                >
                    <Plus size={14} />
                    Adicionar Mensagem
                </Button>
            </div>

            <div className="space-y-4">
                {messages.map((field, mIdx) => (
                    <div
                        key={field.id}
                        className="group relative bg-muted/10 border border-border rounded-xl transition-all hover:border-primary/30"
                    >
                        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/80 text-white text-[10px] font-black">
                                    {mIdx + 1}
                                </span>
                                <div className="flex gap-1">
                                    <button type="button" onClick={() => swap(mIdx, mIdx - 1)} disabled={mIdx === 0} className="hover:text-primary disabled:opacity-30 transition-opacity"><ChevronUp size={14} /></button>
                                    <button type="button" onClick={() => swap(mIdx, mIdx + 1)} disabled={mIdx === messages.length - 1} className="hover:text-primary disabled:opacity-30 transition-opacity"><ChevronDown size={14} /></button>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <select
                                    {...register(`templates.${activeTemplateIndex}.messages.${mIdx}.type` as any)}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-wider outline-none text-primary cursor-pointer"
                                >
                                    <option value="text">Texto</option>
                                    <option value="image">Imagem</option>
                                    <option value="video">Vídeo</option>
                                    <option value="audio">Áudio</option>
                                </select>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(mIdx)}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {watch(`templates.${activeTemplateIndex}.messages.${mIdx}.type` as any) !== 'text' && (
                                <MediaUpload
                                    type={watch(`templates.${activeTemplateIndex}.messages.${mIdx}.type` as any)}
                                    value={watch(`templates.${activeTemplateIndex}.messages.${mIdx}.mediaUrl` as any)}
                                    onChange={(url) => setValue(`templates.${activeTemplateIndex}.messages.${mIdx}.mediaUrl` as any, url, { shouldDirty: true })}
                                />
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <ImageIcon size={10} /> Conteúdo da Mensagem
                                </label>
                                <WhatsAppTextarea
                                    name={`templates.${activeTemplateIndex}.messages.${mIdx}.content`}
                                    registration={register(`templates.${activeTemplateIndex}.messages.${mIdx}.content` as any)}
                                    setValue={setValue}
                                    watch={watch}
                                    placeholder="Escreva sua mensagem aqui..."
                                />
                                <div className="flex gap-2 mt-2">
                                    <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded cursor-help" title="Nome do destinatário">{"{{nome}}"}</span>
                                    <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded cursor-help" title="Link da pesquisa">{"{{link}}"}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border/50">
                                <div className="flex items-center gap-3">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Plus size={10} /> Delay após envio
                                    </label>
                                    <input
                                        type="number"
                                        {...register(`templates.${activeTemplateIndex}.messages.${mIdx}.delayAfter` as any, { valueAsNumber: true })}
                                        className="w-16 h-7 bg-muted/50 border border-border rounded px-2 text-[10px] font-black outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <span className="text-[9px] font-bold text-muted-foreground">segundos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
