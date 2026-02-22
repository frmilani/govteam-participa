"use client";

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useEstabelecimentos } from '@/hooks/use-estabelecimentos';
import { Check, ChevronsUpDown, Store, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomEstablishmentFieldProps {
  field: {
    id: string;
    config?: {
      segmentFilter?: string;
    };
  };
  error?: string;
}

export function CustomEstablishmentField({ field, error }: CustomEstablishmentFieldProps) {
  const { setValue, watch } = useFormContext();
  const selectedValue = watch(field.id);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: estabelecimentos = [], isLoading } = useEstabelecimentos({
    segmentoId: field.config?.segmentFilter,
    search: searchTerm,
    ativo: true
  });

  const selectedEstablishment = estabelecimentos.find(e => e.id === selectedValue);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium transition-all hover:bg-white hover:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
          error && "border-red-500 focus:ring-red-500/10",
          isOpen && "border-indigo-500 ring-2 ring-indigo-500/20 bg-white"
        )}
      >
        <div className="flex items-center gap-3 truncate">
          {selectedEstablishment ? (
            <>
              <div className="h-6 w-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative">
                {selectedEstablishment.logoUrl ? (
                  <img src={selectedEstablishment.logoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <Store size={12} className="text-slate-400" />
                )}
              </div>
              <span className="text-slate-900 font-bold">{selectedEstablishment.nome}</span>
            </>
          ) : (
            <span className="text-slate-400">Selecione um estabelecimento...</span>
          )}
        </div>
        <ChevronsUpDown size={16} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                autoFocus
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando...</span>
              </div>
            ) : estabelecimentos.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-slate-400">Nenhum estabelecimento encontrado.</p>
              </div>
            ) : (
              <div className="grid gap-1">
                {estabelecimentos.map((est) => (
                  <button
                    key={est.id}
                    type="button"
                    onClick={() => {
                      setValue(field.id, est.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group",
                      selectedValue === est.id
                        ? "bg-indigo-50 text-indigo-600"
                        : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative group-hover:border-indigo-200 transition-colors">
                        {est.logoUrl ? (
                          <img src={est.logoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <Store size={16} className="text-slate-300" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-sm leading-tight">{est.nome}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                          {est.segmentos?.[0]?.segmento?.nome || 'Sem Categoria'}
                        </p>
                      </div>
                    </div>
                    {selectedValue === est.id && <Check size={16} className="shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-[11px] font-bold text-red-500 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}

      {/* Backdrop invisível para fechar ao clicar fora */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
