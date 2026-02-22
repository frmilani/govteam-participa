import { prisma } from "@/lib/prisma"
import { RespostaStatus } from "@prisma/client"

export type FraudDetectionResult = {
    processed: number
    flagged: number
    details: string[]
}

const VELOCITY_THRESHOLD_SECONDS = 5
const IP_FLOOD_THRESHOLD_COUNT = 10
const IP_FLOOD_WINDOW_MINUTES = 60

export async function detectFraudPatterns(enqueteId: string): Promise<FraudDetectionResult> {
    const details: string[] = []
    let flaggedCount = 0

    // 1. Velocity Check (Votos muito rápidos)
    const fastVotes = await prisma.resposta.findMany({
        where: {
            enqueteId,
            status: 'VALID',
            tempoRespostaSegundos: { lt: VELOCITY_THRESHOLD_SECONDS, gt: 0 } // gt 0 para ignorar nulos/erros
        },
        select: { id: true, tempoRespostaSegundos: true }
    })

    if (fastVotes.length > 0) {
        await prisma.resposta.updateMany({
            where: { id: { in: fastVotes.map(v => v.id) } },
            data: {
                status: 'SUSPICIOUS',
                fraudScore: 80,
                fraudReason: 'High Velocity (Bot-like behavior)'
            }
        })
        flaggedCount += fastVotes.length
        details.push(`Velocity Check: ${fastVotes.length} votos marcados (< ${VELOCITY_THRESHOLD_SECONDS}s)`)
    }

    // 2. IP Flood Check (Muitos votos do mesmo IP)
    // Agrupar por IP
    const votosPorIP = await prisma.resposta.groupBy({
        by: ['ipAddress'],
        where: {
            enqueteId,
            status: 'VALID',
            ipAddress: { not: null }
        },
        _count: { ipAddress: true },
        having: {
            ipAddress: { _count: { gt: IP_FLOOD_THRESHOLD_COUNT } }
        }
    })

    const floodIps = votosPorIP.map(g => g.ipAddress).filter((ip): ip is string => ip !== null);

    if (floodIps.length > 0) {
        // Marcar votos desses IPs
        const result = await prisma.resposta.updateMany({
            where: {
                enqueteId,
                status: 'VALID',
                ipAddress: { in: floodIps }
            },
            data: {
                status: 'SUSPICIOUS',
                fraudScore: 60,
                fraudReason: `IP Flood (> ${IP_FLOOD_THRESHOLD_COUNT} votes/hour)`
            }
        })
        flaggedCount += result.count
        details.push(`IP Flood: ${result.count} votos marcados de ${floodIps.length} IPs suspeitos`)
    }

    // Atualizar contador na Enquete
    const totalSuspicious = await prisma.resposta.count({
        where: { enqueteId, status: 'SUSPICIOUS' }
    })

    await prisma.enquete.update({
        where: { id: enqueteId },
        data: { totalSuspicious }
    })

    return {
        processed: await prisma.resposta.count({ where: { enqueteId } }),
        flagged: flaggedCount,
        details
    }
}

export async function invalidateVotes(respostaIds: string[], reason: string, userId: string): Promise<void> {
    await prisma.resposta.updateMany({
        where: { id: { in: respostaIds } },
        data: {
            status: 'INVALID',
            fraudReason: reason,
            reviewedBy: userId,
            reviewedAt: new Date()
        }
    })
}

export async function validateVotes(respostaIds: string[], userId: string): Promise<void> {
    await prisma.resposta.updateMany({
        where: { id: { in: respostaIds } },
        data: {
            status: 'VALID',
            fraudScore: 0,
            fraudReason: null,
            reviewedBy: userId,
            reviewedAt: new Date()
        }
    })
}
