import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = (await auth()) as any;
        if (!session?.user?.organizationId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        const { id: enqueteId } = await params;

        // Buscar a enquete para validar e pegar dados básicos
        const enquete = await prisma.enquete.findUnique({
            where: { id: enqueteId },
            include: { segmentos: true }
        });

        if (!enquete) return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 });

        // Buscar todos os VotoLivres que ainda não foram consolidados
        // Otimização: Apenas trazer os IDs, categoria, texto original e chaves.
        const votosLivres = await (prisma as any).votoLivre.findMany({
            where: {
                resposta: { enqueteId },
                consolidadoEmId: null
            }
        });

        // Agrupar em RAM (Clusterização Fonética)
        // Usaremos o join '-' das chaves fonéticas como fingerprint do Cluster
        const clustersIndex = new Map<string, {
            id: string, // fingerprint
            categoriaId: string,
            categoriaNome: string,
            votos: typeof votosLivres,
            textoMaisComum: string,
            sugestoesTextuais: Record<string, number>,
            totalVotos: number
        }>();

        const getSegmentName = (catId: string) =>
            enquete.segmentos.find(s => s.id === catId)?.nome || "Desconhecida";

        for (const vl of votosLivres) {
            // Se não tiver chaves fonéticas (ex: lixo), agrupa por texto original cru
            let fingerprint = vl.chavesFoneticas && vl.chavesFoneticas.length > 0
                ? `${vl.categoriaId}::${vl.chavesFoneticas.join('-')}`
                : `${vl.categoriaId}::RAW-${vl.textoOriginal.toLowerCase().trim()}`;

            if (!clustersIndex.has(fingerprint)) {
                clustersIndex.set(fingerprint, {
                    id: fingerprint,
                    categoriaId: vl.categoriaId,
                    categoriaNome: getSegmentName(vl.categoriaId),
                    votos: [],
                    textoMaisComum: "",
                    sugestoesTextuais: {},
                    totalVotos: 0
                });
            }

            const cluster = clustersIndex.get(fingerprint)!;
            cluster.votos.push(vl);
            cluster.totalVotos += 1;

            // Computando o texto exato escrito mais popular no grupo pra sugerir nome pra entidade
            const txt = vl.textoOriginal.trim();
            if (txt) {
                const lowerTxt = txt.toLowerCase();
                // guardamos a grafia original do primeiro que entrou nesse formato (TitleCase preferencial)
                const storedKey = Object.keys(cluster.sugestoesTextuais).find(k => k.toLowerCase() === lowerTxt) || txt;
                cluster.sugestoesTextuais[storedKey] = (cluster.sugestoesTextuais[storedKey] || 0) + 1;
            }
        }

        // Finalizar os clusters map => array
        let clusters = Array.from(clustersIndex.values()).map(c => {
            // Achar o texto mais votado dentro das grafias
            let topText = "";
            let maxVotes = -1;
            for (const [txt, count] of Object.entries(c.sugestoesTextuais)) {
                if (count > maxVotes) {
                    maxVotes = count;
                    topText = txt;
                }
            }

            return {
                id: c.id,
                categoriaId: c.categoriaId,
                categoriaNome: c.categoriaNome,
                totalVotos: c.totalVotos,
                sugestaoNome: topText,
                variacoesGrafica: Object.entries(c.sugestoesTextuais).map(([k, v]: [string, any]) => ({ texto: k, quantidade: v })),
                votoLivreIds: c.votos.map((v: any) => v.id)
            };
        });

        // Ordernar do maior formigueiro para o menor
        clusters.sort((a, b) => b.totalVotos - a.totalVotos);

        return NextResponse.json(clusters);

    } catch (error: any) {
        console.error("[API_TOP_OF_MIND_GRUPOS]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
