"use client";

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { FullScreenForm } from '@/components/ui/FullScreenForm';
import { Button } from '@/components/ui/Button';
import {
  FileUp,
  Table,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  Upload,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTags } from '@/hooks/use-tags';
import { useImportLeads } from '@/hooks/use-leads';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'result';

export function ImportLeadsWizard({ isOpen, onClose }: ImportWizardProps) {
  const [step, setStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importResults, setResult] = useState<{ created: number; errors: string[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: tags = [] } = useTags();
  const importLeadsMutation = useImportLeads();

  const requiredFields = ['nome', 'whatsapp'];
  const optionalFields = ['email', 'sexo', 'telefone', 'instagram', 'facebook', 'tags'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
          const data = results.data as any[];
          setCsvData(data);
          const firstRow = data[0];
          const headerKeys = Object.keys(firstRow);
          setHeaders(headerKeys);

          // Auto-mapping
          const newMapping: Record<string, string> = {};
          headerKeys.forEach(header => {
            const normalized = header.toLowerCase().trim();
            if (normalized === 'nome') newMapping.nome = header;
            if (normalized === 'whatsapp' || normalized === 'celular') newMapping.whatsapp = header;
            if (normalized === 'email') newMapping.email = header;
            if (normalized === 'sexo' || normalized === 'genero') newMapping.sexo = header;
            if (normalized === 'telefone' || normalized === 'fixo') newMapping.telefone = header;
            if (normalized === 'instagram' || normalized === 'insta') newMapping.instagram = header;
            if (normalized === 'facebook') newMapping.facebook = header;
            if (normalized === 'tags' || normalized === 'segmentos') newMapping.tags = header;
          });
          setMapping(newMapping);
          setStep('mapping');
        }
      },
      error: (error) => {
        alert("Erro ao ler CSV: " + error.message);
      }
    });
  };

  const handleImport = async () => {
    try {
      const leadsToImport = [];

      for (const row of csvData) {
        const nome = row[mapping.nome];
        const whatsapp = row[mapping.whatsapp];

        if (!nome || !whatsapp) continue;

        // Process tags
        const tagsRaw = String(row[mapping.tags] || "");
        const tagNames = tagsRaw.split(',').map(t => t.trim().toLowerCase());
        const tagIds = tagNames.map(name => {
          const found = tags.find(t => t.nome.toLowerCase() === name || t.id === name);
          return found?.id;
        }).filter(Boolean) as string[];

        leadsToImport.push({
          nome,
          whatsapp,
          email: row[mapping.email] || null,
          sexo: row[mapping.sexo] || null,
          telefone: row[mapping.telefone] || null,
          instagram: row[mapping.instagram] || null,
          facebook: row[mapping.facebook] || null,
          tagIds,
        });
      }

      if (leadsToImport.length > 0) {
        const results = await importLeadsMutation.mutateAsync(leadsToImport);
        setResult(results);
      } else {
        setResult({ created: 0, errors: ["Nenhum lead válido encontrado no arquivo."] });
      }

      setStep('result');
    } catch (error) {
      console.error(error);
      alert("Erro na importação.");
    }
  };

  const reset = () => {
    setStep('upload');
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[40px] bg-slate-50/50 hover:bg-white hover:border-primary/50 transition-all group">
            <div className="h-20 w-20 rounded-[32px] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <FileUp size={40} />
            </div>
            <h4 className="text-lg font-black text-foreground uppercase tracking-tight mb-2">Upload do Arquivo CSV</h4>
            <p className="text-sm text-muted-foreground font-medium mb-4 text-center max-w-xs">
              Selecione um arquivo .csv com os dados dos leads.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl mb-8 flex gap-2 w-full max-w-sm">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                <strong>Atenção:</strong> A primeira linha do seu arquivo CSV deve, obrigatoriamente, conter o título das colunas (ex: <i>Nome</i>, <i>WhatsApp</i>).
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-xs shadow-lg">
              Escolher Arquivo
            </Button>
          </div>
        );

      case 'mapping':
        return (
          <div className="space-y-6 text-left">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="text-blue-500 shrink-0" size={20} />
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                Relacione as colunas do seu arquivo com os campos do sistema.
                Os campos <strong>Nome</strong> e <strong>WhatsApp</strong> são obrigatórios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...requiredFields, ...optionalFields].map(field => (
                <div key={field} className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                    {field === 'nome' ? 'Nome (Obrigatório)' : field === 'whatsapp' ? 'WhatsApp (Obrigatório)' : field}
                  </label>
                  <select
                    value={mapping[field] || ""}
                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-slate-900 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                  >
                    <option value="">-- Não importar --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                <Table size={18} className="text-primary" />
                Prévia dos Dados ({csvData.length} registros)
              </h4>
            </div>

            <div className="border border-border rounded-3xl overflow-hidden shadow-inner bg-slate-50/50 dark:bg-slate-900/50">
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background dark:bg-slate-950 border-b border-border z-10">
                    <tr>
                      <th className="px-4 py-3 text-left font-black text-muted-foreground uppercase tracking-widest">Nome</th>
                      <th className="px-4 py-3 text-left font-black text-muted-foreground uppercase tracking-widest">WhatsApp</th>
                      <th className="px-4 py-3 text-left font-black text-muted-foreground uppercase tracking-widest">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-left">
                    {csvData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-4 py-3 font-bold text-foreground">{row[mapping.nome]}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row[mapping.whatsapp]}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row[mapping.tags]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvData.length > 10 && (
                <div className="p-3 text-center border-t border-border bg-background dark:bg-slate-950">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                    Exibindo apenas os 10 primeiros registros...
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="py-8 text-center space-y-6">
            <div className="inline-flex h-20 w-20 rounded-[32px] bg-emerald-50 text-emerald-500 items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h4 className="text-xl font-black text-foreground uppercase tracking-tight">Importação Concluída</h4>
              <p className="text-sm text-muted-foreground font-medium mt-2">
                {importResults?.created} leads foram importados com sucesso.
              </p>
            </div>

            {importResults?.errors && importResults.errors.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-left max-h-[150px] overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <X size={14} /> Erros encontrados ({importResults.errors.length}):
                </p>
                <ul className="space-y-1">
                  {importResults.errors.map((err, i) => (
                    <li key={i} className="text-[11px] text-red-700 font-medium">• {err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <FullScreenForm
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setTimeout(reset, 300);
      }}
      title="Importar Leads"
      description={
        step === 'mapping' ? 'Defina como as colunas do CSV serão tratadas.' :
          step === 'preview' ? 'Verifique se os dados estão corretos antes de importar.' :
            step === 'result' ? 'Confira o resultado do processamento em massa.' :
              'Importe múltiplos respondentes através de um arquivo CSV.'
      }
      saveLabel={
        step === 'upload' ? undefined :
          step === 'mapping' ? 'Ver Prévia' :
            step === 'preview' ? 'Iniciar Importação' :
              'Concluir'
      }
      onSave={step === 'upload' ? undefined : () => {
        if (step === 'mapping') setStep('preview');
        else if (step === 'preview') handleImport();
        else if (step === 'result') {
          onClose();
          setTimeout(reset, 300);
        }
      }}
      isLoading={importLeadsMutation.isPending}
      footer={step !== 'upload' && step !== 'result' ? (
        <Button
          variant="ghost"
          onClick={() => step === 'mapping' ? setStep('upload') : setStep('mapping')}
          className="h-12 rounded-xl font-bold text-slate-500"
        >
          <ChevronLeft size={18} className="mr-1" /> Voltar
        </Button>
      ) : undefined}
    >
      <div className="min-h-[400px]">
        {/* Progress Stepper */}
        {step !== 'result' && (
          <div className="flex items-center gap-2 mb-12 px-2 max-w-2xl mx-auto">
            {[
              { id: 'upload', icon: Upload, label: 'Upload' },
              { id: 'mapping', icon: Database, label: 'Mapeamento' },
              { id: 'preview', icon: Table, label: 'Revisão' }
            ].map((s, i, arr) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isPast = arr.findIndex(x => x.id === step) > i;

              return (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
                      isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" :
                        isPast ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                    )}>
                      {isPast ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
                        isActive ? "text-primary" : "text-slate-400"
                      )}>Passo {i + 1}</p>
                      <p className={cn(
                        "text-xs font-bold",
                        isActive ? "text-foreground" : "text-slate-400"
                      )}>{s.label}</p>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-px bg-slate-100 mx-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {renderContent()}
      </div>
    </FullScreenForm>
  );
}
