import React from 'react';
import { Smartphone, MoreVertical, MessageSquare, ChevronRight, Mic, Video as VideoIcon, ExternalLink } from 'lucide-react';

import { WhatsAppAudioPlayer } from '../molecules/WhatsAppAudioPlayer';

interface WhatsAppPreviewProps {
    strategy: string;
    initialMessage?: string;
    messages: any[];
    activeTemplateIndex: number;
    avatarUrl?: string;
}

export function WhatsAppPreview({ strategy, initialMessage, messages, activeTemplateIndex, avatarUrl }: WhatsAppPreviewProps) {
    const chatRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages, strategy]);

    const formatWhatsAppText = (text: string) => {
        if (!text) return "";
        const formatted = text
            .replace(/{{nome}}/g, "João")
            .replace(/{{link}}/g, "pdst.com.br/r/xY2z")
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/~(.*?)~/g, '<del>$1</del>')
            .replace(/```(.*?)```/g, '<code class="bg-slate-100 px-1 rounded font-mono text-[9px]">$1</code>')
            .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 rounded font-mono text-[9px]">$1</code>')
            .replace(/\n/g, '<br/>');
        return formatted;
    };

    return (
        <div className="w-full relative">
            <div className="flex items-center gap-2 mb-4 px-2">
                <Smartphone size={16} className="text-muted-foreground" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Preview WhatsApp (M{activeTemplateIndex + 1})
                </span>
            </div>

            <div className="w-full aspect-[9/18.5] rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden relative bg-[#E5DDD5]">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-b-xl z-20" />

                {/* WhatsApp Header */}
                <div className="bg-[#075E54] p-4 pt-6 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0 overflow-hidden border border-white/20 shadow-sm">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-white text-[10px] font-bold leading-none">Prêmio Destaque</p>
                        <p className="text-[#9DE1FE] text-[8px] leading-none mt-1 uppercase font-black tracking-tighter">Online</p>
                    </div>
                    <MoreVertical size={14} className="text-white opacity-60" />
                </div>

                {/* Chat Area */}
                <div ref={chatRef} className="p-4 space-y-4 h-[calc(100%-110px)] overflow-y-auto no-scrollbar scroll-smooth">
                    <div className="flex justify-center">
                        <span className="bg-[#D1E9FF] text-[#128C7E] text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">Hoje</span>
                    </div>

                    {/* Opt-in Initial Message Preview */}
                    {strategy === 'OPT_IN' && (
                        <div className="relative max-w-[85%] bg-white p-2.5 rounded-lg rounded-tl-none shadow-sm animate-in slide-in-from-left-4 duration-500 border-l-2 border-primary/30">
                            <div className="absolute top-0 -left-2 h-4 w-4 bg-white clip-path-whatsapp-tail" />
                            <div
                                className="text-[10px] font-medium text-slate-800 whitespace-pre-wrap break-words leading-tight italic"
                                dangerouslySetInnerHTML={{ __html: formatWhatsAppText(initialMessage || "Olá {{nome}}! Posso te enviar o link da pesquisa?") }}
                            />
                            <div className="mt-3 pt-2 border-t border-slate-50 flex flex-col gap-1.5">
                                <div className="py-1.5 rounded-md bg-slate-50 border border-slate-100 text-center text-[#06B6D4] text-[9px] font-bold flex items-center justify-center gap-1.5 shadow-sm">
                                    <ExternalLink size={10} className="text-[#06B6D4]" />
                                    Sim
                                </div>
                                <div className="py-1.5 rounded-md bg-slate-50 border border-slate-100 text-center text-[#06B6D4] text-[9px] font-bold flex items-center justify-center gap-1.5 shadow-sm">
                                    <ExternalLink size={10} className="text-[#06B6D4]" />
                                    Não
                                </div>
                            </div>
                            <div className="text-right mt-1.5">
                                <span className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter">14:00</span>
                            </div>
                        </div>
                    )}

                    {strategy === 'OPT_IN' && (
                        <div className="flex justify-center">
                            <span className="text-[7px] text-slate-400 font-black uppercase tracking-[0.2em]">Aguardando Resposta...</span>
                        </div>
                    )}

                    {messages.map((msg: any, idx: number) => (
                        <React.Fragment key={idx}>
                            {msg.type === 'audio' && msg.mediaUrl ? (
                                <div className="relative max-w-[90%] animate-in slide-in-from-left-4 duration-500">
                                    <WhatsAppAudioPlayer
                                        url={msg.mediaUrl}
                                        timestamp={`14:${idx < 10 ? `0${idx}` : idx}`}
                                        avatarUrl={avatarUrl}
                                    />
                                    <div className="absolute top-0 -left-2 h-4 w-4 bg-white clip-path-whatsapp-tail" />
                                </div>
                            ) : (
                                <div className="relative max-w-[85%] bg-white p-2.5 rounded-lg rounded-tl-none shadow-sm animate-in slide-in-from-left-4 duration-500">
                                    {/* Message Bubble Tail */}
                                    <div className="absolute top-0 -left-2 h-4 w-4 bg-white clip-path-whatsapp-tail" />

                                    {msg.type !== 'text' && msg.mediaUrl && (
                                        <div className="mb-2 rounded overflow-hidden bg-slate-100 aspect-video flex items-center justify-center border border-slate-100">
                                            {msg.type === 'image' ? (
                                                <img src={msg.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <VideoIcon size={24} className="text-slate-400" />
                                            )}
                                        </div>
                                    )}

                                    <div
                                        className="text-[10px] font-medium text-slate-800 whitespace-pre-wrap break-words leading-tight"
                                        dangerouslySetInnerHTML={{ __html: formatWhatsAppText(msg.content || "") }}
                                    />

                                    {/* Soft Block Button Preview */}
                                    {strategy === 'SOFT_BLOCK' && idx === messages.length - 1 && (
                                        <div className="mt-3 pt-2 border-t border-slate-50">
                                            <div className="py-1.5 rounded-md bg-slate-50 border border-slate-100 text-center text-[#06B6D4] text-[9px] font-bold flex items-center justify-center gap-1.5 shadow-sm">
                                                <ExternalLink size={10} className="text-[#06B6D4]" />
                                                Não quero mais receber
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-right mt-1">
                                        <span className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter">
                                            14:{idx < 10 ? `0${idx}` : idx}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {msg.delayAfter > 0 && idx < messages.length - 1 && (
                                <div className="flex justify-center">
                                    <span className="text-[7px] text-slate-400 font-black uppercase tracking-[0.2em]">{msg.delayAfter}s de intervalo</span>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                    {messages.length === 0 && (
                        <p className="text-[9px] text-center text-slate-400 italic mt-10">Escreva uma mensagem para ver o preview.</p>
                    )}
                </div>

                {/* WhatsApp Input */}
                <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                    <div className="flex-1 h-9 bg-white rounded-full border border-slate-200 shadow-sm flex items-center px-3 gap-2">
                        <MessageSquare size={14} className="text-slate-400" />
                        <div className="h-3 w-px bg-slate-100" />
                        <div className="flex-1 bg-slate-50 h-5 rounded" />
                    </div>
                    <div className="h-9 w-9 rounded-full bg-[#128C7E] flex items-center justify-center text-white shadow-lg">
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>

            <style jsx>{`
                .clip-path-whatsapp-tail {
                    clip-path: polygon(100% 0, 0 0, 100% 100%);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
