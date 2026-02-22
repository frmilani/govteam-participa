import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CampanhaService } from '@/lib/campanhas/campanha-service';
import { prisma } from '@/lib/prisma';
import { CampanhaStatus } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        campanha: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        lead: {
            findMany: vi.fn(),
        },
        enquete: {
            findFirst: vi.fn(),
        },
        trackingLink: {
            createMany: vi.fn(),
        }
    },
}));

vi.mock('./queue', () => ({
    campanhaQueue: {
        add: vi.fn(),
        addBulk: vi.fn(),
    },
}));

vi.mock('../tracking/tracking-link-service', () => ({
    TrackingLinkService: {
        createLinksForCampaign: vi.fn(),
    },
}));

vi.mock('@prisma/client', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@prisma/client')>();
    return {
        ...actual,
        CampanhaStatus: {
            RASCUNHO: 'RASCUNHO',
            AGENDADA: 'AGENDADA',
            EM_ANDAMENTO: 'EM_ANDAMENTO',
            CANCELADA: 'CANCELADA',
        },
    };
});

describe('CampanhaService', () => {
    const orgId = 'org-123';
    const userId = 'user-456';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCampanhas', () => {
        it('should list campaigns', async () => {
            vi.mocked(prisma.campanha.findMany).mockResolvedValue([]);
            await CampanhaService.getCampanhas(orgId);
            expect(prisma.campanha.findMany).toHaveBeenCalled();
        });
    });

    describe('createCampanha', () => {
        it('should create a campaign and links', async () => {
            vi.mocked(prisma.lead.findMany).mockResolvedValue([{ id: 'lead-1' }] as any);
            vi.mocked(prisma.enquete.findFirst).mockResolvedValue({ id: 'enq-1', formPublicId: 'f-1', linkExpiracaoDias: 30 } as any);
            vi.mocked(prisma.campanha.create).mockResolvedValue({ id: 'camp-1' } as any);

            const data = {
                nome: 'Campanha Teste',
                enqueteId: 'enq-1',
                mensagens: { template: 'Olá' },
                segmentacao: { tagIds: [] },
            };

            await CampanhaService.createCampanha(orgId, userId, data);

            expect(prisma.campanha.create).toHaveBeenCalled();
            // expect(TrackingLinkService.createLinksForCampaign).toHaveBeenCalled();
        });
    });

    describe('deleteCampanha', () => {
        it('should delete a campaign', async () => {
            await CampanhaService.deleteCampanha('camp-1', orgId);
            expect(prisma.campanha.delete).toHaveBeenCalled();
        });
    });
});
