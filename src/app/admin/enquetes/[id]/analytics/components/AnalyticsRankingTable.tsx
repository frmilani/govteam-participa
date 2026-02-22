"use client";

import { useAnalyticsRanking } from "@/hooks/use-analytics";
import { Loader2, Download, AlertCircle } from "lucide-react";
import { useState } from "react";

export function AnalyticsRankingTable({ enqueteId, categoriaId }: { enqueteId: string, categoriaId?: string }) {
    const { data: ranking, isLoading, error } = useAnalyticsRanking(enqueteId, categoriaId);

    if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (error) return <div className="p-4 text-destructive border rounded">Erro ao carregar o ranking</div>;

    if (!ranking || ranking.length === 0) {
        return <div className="text-center p-8 text-muted-foreground bg-muted/20 border rounded-xl">Nenhum voto acumulado para exibir nesta visão.</div>;
    }

    if (ranking[0].insuficiente) {
        return (
            <div className="flex bg-orange-100 text-orange-800 p-6 rounded-xl border border-orange-200">
                <AlertCircle className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-bold">Privacidade — Regra da Urna Trancada</h4>
                    <p className="text-sm mt-1 mb-0">{ranking[0].mensagem}</p>
                </div>
            </div>
        );
    }

    const totalDeVotosSomados = ranking.reduce((acc: number, item: any) => acc + item.votos, 0);

    const exportarCSV = () => {
        try {
            const Parser = require('json2csv').Parser;
            const fields = ['posicao', 'id', 'nome', 'votos', 'percentual'];
            const opts = { fields };
            const parser = new Parser(opts);
            const dadosCSV = ranking.map((item: any, i: number) => ({
                posicao: i + 1,
                id: item.id,
                nome: item.nome,
                votos: item.votos,
                percentual: ((item.votos / totalDeVotosSomados) * 100).toFixed(1) + '%'
            }));
            const csv = parser.parse(dadosCSV);

            // Download file
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', `ranking_enquete_${enqueteId}.csv`);
            a.click();
        } catch (err) {
            console.error("Erro exportando CSV:", err);
            alert("Não foi possível exportar os dados no formato CSV.");
        }
    };

    return (
        <div className="bg-card text-card-foreground shadow border rounded-xl overflow-hidden mt-6">
            <div className="p-6 border-b flex justify-between items-center bg-muted/20">
                <div>
                    <h3 className="text-lg font-bold">Ranking de Entidades</h3>
                    <p className="text-sm text-muted-foreground">{totalDeVotosSomados} Votos Totais Contruídos neste Recorte</p>
                </div>
                <button
                    onClick={exportarCSV}
                    className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-primary/90 transition-colors text-sm"
                >
                    <Download className="w-4 h-4" /> Exportar CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted text-muted-foreground font-semibold">
                        <tr>
                            <th className="px-6 py-4">Posição</th>
                            <th className="px-6 py-4">Entidade Votada</th>
                            <th className="px-6 py-4">Votos Calculados</th>
                            <th className="px-6 py-4">% Total do Recorte</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y font-medium text-base">
                        {ranking.map((item: any, index: number) => {
                            let rowStyle = "";
                            let posBadge = `${index + 1}º`;

                            if (index === 0) {
                                rowStyle = "bg-yellow-50/50 hover:bg-yellow-50";
                                posBadge = "🥇 1ºLugar";
                            } else if (index === 1) {
                                rowStyle = "bg-gray-50/50 hover:bg-gray-50";
                                posBadge = "🥈 2ºLugar";
                            } else if (index === 2) {
                                rowStyle = "bg-orange-50/20 hover:bg-orange-50/40";
                                posBadge = "🥉 3ºLugar";
                            }

                            const perc = ((item.votos / totalDeVotosSomados) * 100).toFixed(1);

                            return (
                                <tr key={item.id} className={`hover:bg-muted/30 transition-colors ${rowStyle}`}>
                                    <td className="px-6 py-4 font-bold">{posBadge}</td>
                                    <td className="px-6 py-4 font-semibold text-primary">{item.nome}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-base">{item.votos} Votos</td>
                                    <td className="px-6 py-4 text-muted-foreground font-semibold">
                                        {perc}%
                                        <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${perc}%` }}></div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
