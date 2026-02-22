import { prisma } from "@/lib/prisma";

function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function mulberry32(seed: number) {
    return () => {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Fisher-Yates shuffle with custom PRNG
function shuffleArray<T>(array: T[], randomFunc: () => number): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(randomFunc() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export class DistribuicaoService {
    /**
     * Resolve as categorias a serem exibidas para um usuário com base no modo de distribuição.
     */
    static async resolverCategorias(enqueteId: string, categorias: any[], campanhaId?: string, leadId?: string) {

        const enquete = await prisma.enquete.findUnique({
            where: { id: enqueteId }
        }) as any;

        if (!enquete) return categorias;

        let modoDistribuicao = enquete.modoDistribuicao || "todas";
        let campanha: any = null;
        let resolved: any[] = [];

        if (campanhaId) {
            campanha = await prisma.campanha.findUnique({
                where: { id: campanhaId },
                select: { segmentacao: true }
            }) as any;

            // Allow campaign config to override distribution mode if it is defined inside segmentacao.distribuicao
            const segMode = campanha?.segmentacao?.modoDistribuicao;
            if (segMode) {
                modoDistribuicao = segMode;
            }
        }

        switch (modoDistribuicao) {
            case "grupo":
            case "por grupo": {
                // Filtra categorias pelo grupoIds da campanha.
                const grupoIds = campanha?.segmentacao?.grupoIds || [];
                if (grupoIds.length > 0) {
                    const filtered = categorias.filter(c => grupoIds.includes(c.id) || grupoIds.includes(c.paiId));
                    resolved = filtered.length > 0 ? filtered : categorias;
                } else {
                    resolved = categorias;
                }
                break;
            }

            case "individual": {
                const catId = campanha?.segmentacao?.categoriaId;
                if (!catId) {
                    throw new Error("Campanha com modo individual não definiu categoriaId em sua segmentacao");
                }
                resolved = categorias.filter(c => c.id === catId);
                break;
            }

            case "aleatorio": {
                const maxCat = enquete.maxCategoriasPorEleitor || categorias.length;
                if (maxCat >= categorias.length) {
                    resolved = categorias;
                    break;
                }

                const seedStr = leadId ? `${leadId}_${enqueteId}` : Math.random().toString();
                const randomFunc = mulberry32(hashCode(seedStr));

                resolved = shuffleArray(categorias, randomFunc).slice(0, maxCat);
                break;
            }

            case "rotativo": {
                const maxCat = enquete.maxCategoriasPorEleitor || 1;
                if (maxCat >= categorias.length) {
                    resolved = categorias;
                    break;
                }

                // Busca as contagens de distribuição
                // Uses prisma client as any to safely query ungenerated DistribuicaoRotativa
                const contagens = await (prisma as any).distribuicaoRotativa.findMany({
                    where: { enqueteId }
                });

                const contagemMap = new Map<string, number>();
                for (const c of contagens) {
                    contagemMap.set(c.categoriaId, c.totalAcessos);
                }

                // Ordenar por menos acessos, fallback = id
                const sorted = [...categorias].sort((a, b) => {
                    const countA = contagemMap.get(a.id) || 0;
                    const countB = contagemMap.get(b.id) || 0;
                    if (countA === countB) return a.id.localeCompare(b.id);
                    return countA - countB;
                });

                const selected = sorted.slice(0, maxCat);

                // Incrementa para os que foram selecionados
                await Promise.all(selected.map(cat =>
                    (prisma as any).distribuicaoRotativa.upsert({
                        where: {
                            enqueteId_categoriaId: {
                                enqueteId,
                                categoriaId: cat.id
                            }
                        },
                        update: {
                            totalAcessos: { increment: 1 }
                        },
                        create: {
                            enqueteId,
                            categoriaId: cat.id,
                            totalAcessos: 1
                        }
                    })
                ));

                resolved = selected;
                break;
            }

            case "todas":
            default:
                resolved = categorias;
        }

        console.log(`[DISTRIBUICAO] modo=${modoDistribuicao} enqueteId=${enqueteId} categorias=[${resolved.map(c => c.id).join(',')}] leadId=${leadId || 'anonimo'}`);
        return resolved;
    }
}
