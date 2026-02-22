import { prisma } from "@/lib/prisma";

export class RankingsService {
  /**
   * Calcula o ranking de estabelecimentos para um segmento específico em uma enquete
   */
  static async getRankingBySegmento(enqueteId: string, segmentoId: string, limit: number = 10) {
    const votos = await prisma.votoEstabelecimento.groupBy({
      by: ['estabelecimentoId'],
      where: {
        segmentoId,
        resposta: {
          enqueteId,
          status: 'VALID',
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const totalVotosSegmento = await prisma.votoEstabelecimento.count({
      where: {
        segmentoId,
        resposta: {
          enqueteId,
          status: 'VALID',
        },
      },
    });

    // Buscar detalhes dos estabelecimentos
    const rankingPromises = votos.map(async (voto, index) => {
      const estabelecimento = await prisma.estabelecimento.findUnique({
        where: { id: voto.estabelecimentoId },
        select: { id: true, nome: true, logoUrl: true },
      });

      return {
        posicao: index + 1,
        estabelecimento,
        votos: voto._count?.id ?? 0,
        percentual: totalVotosSegmento > 0
          ? Number((((voto._count?.id ?? 0) / totalVotosSegmento) * 100).toFixed(2))
          : 0,
      };
    });

    return await Promise.all(rankingPromises);
  }

  /**
   * Busca todos os segmentos que possuem votos em uma enquete
   */
  static async getSegmentosComVotos(enqueteId: string) {
    const segmentos = await prisma.votoEstabelecimento.findMany({
      where: {
        resposta: {
          enqueteId,
          status: 'VALID',
        },
      },
      select: {
        segmentoId: true,
      },
      distinct: ['segmentoId'],
    });

    const segmentosDetails = await prisma.segmento.findMany({
      where: {
        id: {
          in: segmentos.map(s => s.segmentoId),
        },
      },
      select: {
        id: true,
        nome: true,
      },
    });

    return segmentosDetails;
  }
}
