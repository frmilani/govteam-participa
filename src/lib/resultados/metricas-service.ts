import { prisma } from "@/lib/prisma";

export class MetricasService {
  /**
   * Retorna métricas consolidadas de uma enquete
   */
  static async getEnqueteMetrics(enqueteId: string) {
    const totalRespostas = await prisma.resposta.count({
      where: { enqueteId }
    });

    const totalVotos = await prisma.votoEstabelecimento.count({
      where: { resposta: { enqueteId } }
    });

    // Respostas por dia (últimos 15 dias)
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const respostasPorDia = await prisma.resposta.groupBy({
      by: ['respondidoEm'],
      where: {
        enqueteId,
        respondidoEm: { gte: fifteenDaysAgo }
      },
      _count: { id: true }
    });

    // Agrupar respostas por data (ignorando hora)
    const timelineMap: Record<string, number> = {};
    respostasPorDia.forEach(item => {
      const date = item.respondidoEm.toISOString().split('T')[0];
      timelineMap[date] = (timelineMap[date] || 0) + item._count.id;
    });

    const timeline = Object.entries(timelineMap).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRespostas,
      totalVotos,
      timeline
    };
  }

  /**
   * Retorna o funil de conversão de uma campanha
   */
  static async getCampanhaFunnel(campanhaId: string) {
    const campanha = await prisma.campanha.findUnique({
      where: { id: campanhaId },
      select: {
        totalLeads: true,
        totalEnviados: true,
        totalVisualizados: true,
        totalRespondidos: true,
      }
    });

    if (!campanha) return null;

    return [
      { step: 'Leads', count: campanha.totalLeads, percentage: 100 },
      { 
        step: 'Enviados', 
        count: campanha.totalEnviados, 
        percentage: campanha.totalLeads > 0 ? (campanha.totalEnviados / campanha.totalLeads) * 100 : 0 
      },
      { 
        step: 'Visualizados', 
        count: campanha.totalVisualizados, 
        percentage: campanha.totalEnviados > 0 ? (campanha.totalVisualizados / campanha.totalEnviados) * 100 : 0 
      },
      { 
        step: 'Respondidos', 
        count: campanha.totalRespondidos, 
        percentage: campanha.totalVisualizados > 0 ? (campanha.totalRespondidos / campanha.totalVisualizados) * 100 : 0 
      },
    ];
  }
}
