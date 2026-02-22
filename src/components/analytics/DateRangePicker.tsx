"use client";

import React, { useState, useMemo } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isWithinInterval,
    startOfToday,
    isAfter,
    isBefore,
    startOfDay,
    endOfDay,
    getDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface DateRangePickerProps {
    onSelect: (range: { from: Date; to: Date }) => void;
    onClose: () => void;
    initialRange?: { from: Date; to: Date };
}

export function DateRangePicker({ onSelect, onClose, initialRange }: DateRangePickerProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [leftMonth, setLeftMonth] = useState(initialRange?.from || new Date());
    const [rightMonth, setRightMonth] = useState(addMonths(leftMonth, 1));

    const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({
        from: initialRange?.from,
        to: initialRange?.to
    });

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Delay attaching the listener to avoid the triggering click closing it immediately
        const timer = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleDayClick = (day: Date) => {
        const clickedDay = startOfDay(day);

        if (!tempRange.from || (tempRange.from && tempRange.to)) {
            setTempRange({ from: clickedDay, to: undefined });
        } else if (tempRange.from && !tempRange.to) {
            if (isBefore(clickedDay, tempRange.from)) {
                setTempRange({ from: clickedDay, to: undefined });
            } else {
                setTempRange({ ...tempRange, to: endOfDay(clickedDay) });
            }
        }
    };

    const handleApply = () => {
        if (tempRange.from && tempRange.to) {
            onSelect({ from: tempRange.from, to: tempRange.to });
            onClose();
        }
    };

    const renderCalendar = (monthDate: Date) => {
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const days = eachDayOfInterval({ start, end });

        const firstDayOfWeek = getDay(start);
        const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
                        {format(monthDate, 'MMMM yyyy', { locale: ptBR })}
                    </h4>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                        <div key={i} className="text-[10px] font-bold text-muted-foreground text-center h-8 flex items-center justify-center">
                            {d}
                        </div>
                    ))}
                    {blanks.map((b) => <div key={`b-${b}`} className="h-8" />)}
                    {days.map((day) => {
                        const isSelected = (tempRange.from && isSameDay(day, tempRange.from)) || (tempRange.to && isSameDay(day, tempRange.to));
                        const isInRange = tempRange.from && tempRange.to && isWithinInterval(day, { start: tempRange.from, end: tempRange.to });
                        const isToday = isSameDay(day, startOfToday());

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => handleDayClick(day)}
                                className={cn(
                                    "h-8 w-8 text-[10px] font-medium rounded-lg flex items-center justify-center transition-all relative group",
                                    isSelected ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 z-10" :
                                        isInRange ? "bg-primary/10 text-primary rounded-none" :
                                            "text-foreground hover:bg-muted",
                                    isToday && !isSelected && "border border-primary/30"
                                )}
                            >
                                {format(day, 'd')}
                                {isInRange && !isSelected && (
                                    <div className="absolute inset-0 bg-primary/5 -z-1" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full mt-4 right-0 z-50 bg-card border border-border shadow-2xl rounded-2xl p-6 min-w-[600px] overflow-hidden"
        >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Selecionar Período Personalizado</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>

            <div className="flex gap-8">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <button onClick={() => {
                            setLeftMonth(subMonths(leftMonth, 1));
                            setRightMonth(subMonths(rightMonth, 1));
                        }} className="p-1 hover:bg-muted rounded-md tracking-tighter">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div />
                    </div>
                    {renderCalendar(leftMonth)}
                </div>
                <div className="w-px bg-border my-4" />
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <div />
                        <button onClick={() => {
                            setLeftMonth(addMonths(leftMonth, 1));
                            setRightMonth(addMonths(rightMonth, 1));
                        }} className="p-1 hover:bg-muted rounded-md tracking-tighter">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    {renderCalendar(rightMonth)}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Início</span>
                        <div className="text-xs font-bold text-foreground bg-muted px-3 py-1.5 rounded-lg border border-border min-w-[100px]">
                            {tempRange.from ? format(tempRange.from, 'dd/MM/yyyy') : '--/--/----'}
                        </div>
                    </div>
                    <div className="w-4 h-px bg-border mt-4" />
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Fim</span>
                        <div className="text-xs font-bold text-foreground bg-muted px-3 py-1.5 rounded-lg border border-border min-w-[100px]">
                            {tempRange.to ? format(tempRange.to, 'dd/MM/yyyy') : '--/--/----'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onClose} className="h-10 px-6 font-bold uppercase tracking-widest text-[10px] rounded-xl border-border">
                        Cancelar
                    </Button>
                    <Button
                        disabled={!tempRange.from || !tempRange.to}
                        onClick={handleApply}
                        className="h-10 px-8 font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20"
                    >
                        Aplicar Filtro
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
