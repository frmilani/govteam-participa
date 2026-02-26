import { metaphone } from "@oloko64/metaphone-ptbr-node";

const STOP_WORDS = new Set([
    "o", "a", "os", "as",
    "do", "da", "dos", "das", "de", "di",
    "no", "na", "nos", "nas", "em",
    "um", "uma", "uns", "umas",
    "e", "ou", "com", "para", "por", "sem", "ltda", "me", "cia"
]);

function removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function metaphonePtBr(text: string): string {
    if (!text) return "";
    try {
        const normalized = removeAccents(text.toLowerCase());
        const words = normalized.replace(/[^a-z0-9\s]/g, " ").trim().split(/\s+/);

        const metaphones = words
            .filter(word => !STOP_WORDS.has(word) && word.length > 0)
            .map(word => metaphone(word) || "")
            .filter(m => m.length > 0);

        // ORDENA as ocorrências metafonéticas em formato alfabético. 
        // Isso zera o problema de digitações como "Padaria Gazin" vs "Gazin Padaria"
        metaphones.sort();

        // Unifica o array sortido em uma string única 
        return metaphones.join(" ");
    } catch {
        return "";
    }
}

export function isFuzzyMatch(query: string, target: string): boolean {
    if (!query || !target) return false;

    // Exact match ou contains literal sem acento
    const qNorm = removeAccents(query.toLowerCase());
    const tNorm = removeAccents(target.toLowerCase());

    if (tNorm.includes(qNorm)) return true;

    // Metaphone match
    const qMeta = metaphonePtBr(query);
    const tMeta = metaphonePtBr(target);

    // Verifica se a string procurou pelo som completo do começo de palavra alvo
    // ou usou som mto parecido
    if (qMeta.length > 2 && tMeta.includes(qMeta)) return true;

    return false;
}
