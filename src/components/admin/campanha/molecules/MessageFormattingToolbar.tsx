import React from 'react';
import {
    Bold,
    Italic,
    Strikethrough,
    Type,
    List,
    Quote,
    Code,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { EmojiPicker } from './EmojiPicker';
import { VariableSelector } from './VariableSelector';

interface FormattingToolbarProps {
    onFormat: (type: string) => void;
    onInsertEmoji: (emoji: string) => void;
    onInsertVariable: (variable: string) => void;
}

export function MessageFormattingToolbar({ onFormat, onInsertEmoji, onInsertVariable }: FormattingToolbarProps) {
    const tools = [
        { type: 'bold', icon: <Bold size={14} />, label: 'Negrito (*texto*)' },
        { type: 'italic', icon: <Italic size={14} />, label: 'Itálico (_texto_)' },
        { type: 'strike', icon: <Strikethrough size={14} />, label: 'Tachado (~texto~)' },
        { type: 'monospace', icon: <Type size={14} />, label: 'Monoespaçado (```texto```)' },
        { type: 'list', icon: <List size={14} />, label: 'Lista' },
        { type: 'quote', icon: <Quote size={14} />, label: 'Citação' },
        { type: 'code', icon: <Code size={14} />, label: 'Código Inline' },
    ];

    return (
        <div className="flex items-center justify-between p-1 bg-muted border-b border-border rounded-t-xl z-20 relative">
            <div className="flex items-center gap-0.5 overflow-x-visible">
                {tools.map((tool) => (
                    <Button
                        key={tool.type}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onFormat(tool.type)}
                        className="h-8 w-8 p-0 hover:bg-background hover:text-primary transition-colors text-muted-foreground"
                        title={tool.label}
                    >
                        {tool.icon}
                    </Button>
                ))}

                <div className="w-px h-4 bg-border mx-1 shrink-0" />

                <EmojiPicker onSelect={onInsertEmoji} />
                <VariableSelector onSelect={onInsertVariable} />
            </div>

            <div className="flex flex-col border-l border-border pl-1">
                <button type="button" className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    <ChevronUp size={12} />
                </button>
                <button type="button" className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    <ChevronDown size={12} />
                </button>
            </div>
        </div>
    );
}
