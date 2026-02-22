import React, { useRef } from 'react';
import { MessageFormattingToolbar } from './MessageFormattingToolbar';
import { UseFormRegisterReturn } from 'react-hook-form';

interface WhatsAppTextareaProps {
    registration: UseFormRegisterReturn;
    placeholder?: string;
    rows?: number;
    className?: string;
    setValue: (name: any, value: any) => void;
    name: string;
    watch: (name: string) => any;
}

export function WhatsAppTextarea({ registration, placeholder, rows = 3, className, setValue, name, watch }: WhatsAppTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleFormat = (type: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = watch(name) || "";
        const selectedText = text.substring(start, end);

        let before = text.substring(0, start);
        let after = text.substring(end);
        let newContent = "";
        let cursorOffset = 0;

        switch (type) {
            case 'bold':
                newContent = `*${selectedText}*`;
                cursorOffset = selectedText ? 0 : 1;
                break;
            case 'italic':
                newContent = `_${selectedText}_`;
                cursorOffset = selectedText ? 0 : 1;
                break;
            case 'strike':
                newContent = `~${selectedText}~`;
                cursorOffset = selectedText ? 0 : 1;
                break;
            case 'monospace':
                newContent = `\`\`\`${selectedText}\`\`\``;
                cursorOffset = selectedText ? 0 : 3;
                break;
            case 'list':
                newContent = `\n- ${selectedText}`;
                cursorOffset = 0;
                break;
            case 'list-ordered':
                newContent = `\n1. ${selectedText}`;
                cursorOffset = 0;
                break;
            case 'quote':
                newContent = `\n> ${selectedText}`;
                cursorOffset = 0;
                break;
            case 'code':
                newContent = `\`${selectedText}\``;
                cursorOffset = selectedText ? 0 : 1;
                break;
        }

        const finalValue = before + newContent + after;
        setValue(name, finalValue);

        // Restore focus and set cursor
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + newContent.length - cursorOffset;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleInsert = (value: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = watch(name) || "";

        let before = text.substring(0, start);
        let after = text.substring(end);
        const finalValue = before + value + after;

        setValue(name, finalValue);

        // Restore focus and set cursor
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + value.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const { ref: registerRef, ...rest } = registration;

    return (
        <div className="flex flex-col border border-border rounded-xl bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm relative">
            <MessageFormattingToolbar
                onFormat={handleFormat}
                onInsertEmoji={handleInsert}
                onInsertVariable={handleInsert}
            />
            <textarea
                {...rest}
                ref={(e) => {
                    registerRef(e);
                    textareaRef.current = e;
                }}
                rows={rows}
                placeholder={placeholder}
                className={`w-full p-4 text-sm font-medium bg-transparent outline-none resize-none placeholder:text-muted-foreground/50 ${className}`}
            />
        </div>
    );
}
