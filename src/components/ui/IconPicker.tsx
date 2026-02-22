'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button'; // Capitalized for Prêmio Destaque
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/Input'; // Capitalized for Prêmio Destaque
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
// Importa do novo arquivo de ícones criado
import { DynamicIcon, iconCategories, searchTermsMap, getIconLabel } from '@/lib/icons';
import { Search, ChevronDown, Check } from 'lucide-react';

interface IconPickerProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function IconPicker({ value, onChange, placeholder = 'Selecione um ícone' }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Lógica de busca aprimorada com suporte a PT-BR
    const filteredCategories = iconCategories
        .map((category) => ({
            ...category,
            icons: category.icons.filter((icon) => {
                const searchLower = search.toLowerCase();
                // 1. Busca pelo nome do ícone (ex: 'file-text')
                if (icon.toLowerCase().includes(searchLower)) return true;

                // 2. Busca pelo label legível (ex: 'File Text')
                if (getIconLabel(icon).toLowerCase().includes(searchLower)) return true;

                // 3. Busca nos termos mapeados em PT-BR (ex: 'arquivo', 'documento')
                const terms = searchTermsMap[icon];
                if (terms && terms.some(term => term.toLowerCase().includes(searchLower))) return true;

                return false;
            }),
        }))
        .filter((category) => category.icons.length > 0);

    const handleSelect = (iconName: string) => {
        onChange(iconName);
        setOpen(false);
        setSearch('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between px-3 font-normal"
                >
                    {value ? (
                        <div className="flex items-center gap-2">
                            <DynamicIcon name={value} className="h-4 w-4 shrink-0 opacity-70" />
                            <span className="truncate">{getIconLabel(value)}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <div className="p-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Buscar ícone (ex: 'usuário', 'config')..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9"
                            autoFocus
                        />
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    <div className="p-3 space-y-4">
                        {filteredCategories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
                                <Search className="h-8 w-8 mb-2 opacity-20" />
                                <p>Nenhum ícone encontrado para "{search}"</p>
                            </div>
                        ) : (
                            filteredCategories.map((category) => (
                                <div key={category.name}>
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                                        {category.name}
                                    </h4>
                                    <div className="grid grid-cols-6 gap-1">
                                        {category.icons.map((iconName) => (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => handleSelect(iconName)}
                                                className={cn(
                                                    'group relative flex h-10 w-10 items-center justify-center rounded-md transition-all',
                                                    'hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                                    value === iconName && 'bg-primary/10 text-primary ring-1 ring-primary/20'
                                                )}
                                                title={`${getIconLabel(iconName)} (${iconName})`}
                                            >
                                                <DynamicIcon name={iconName} className="h-5 w-5" />
                                                {value === iconName && (
                                                    <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                {value && (
                    <div className="border-t p-2 bg-muted/20 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground px-2">
                            Ícone: <span className="font-mono text-foreground">{value}</span>
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => { onChange(''); setOpen(false); }} className="h-6 text-[10px] uppercase">
                            Limpar
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
