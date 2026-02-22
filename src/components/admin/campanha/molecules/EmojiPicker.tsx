import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const emojis = [
        "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘",
        "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒",
        "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡",
        "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐",
        "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮",
        "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽"
    ];

    return (
        <div className="relative">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className={`h-8 w-8 p-0 hover:bg-background hover:text-primary transition-colors ${isOpen ? 'text-primary bg-background' : ''}`}
                title="Inserir Emoji"
            >
                <Smile size={14} />
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 p-2 bg-card border border-border rounded-xl shadow-2xl z-[70] w-64">
                        <div className="grid grid-cols-8 gap-1 h-48 overflow-y-auto no-scrollbar">
                            {emojis.map((emoji, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        onSelect(emoji);
                                        setIsOpen(false);
                                    }}
                                    className="h-7 w-7 flex items-center justify-center hover:bg-muted rounded transition-colors text-base"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
