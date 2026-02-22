import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEstabelecimento, getEstabelecimentos, updateEstabelecimento, toggleEstabelecimento } from '@/lib/estabelecimentos/estabelecimento-service';
import { prisma } from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        estabelecimento: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        estabelecimentoSegmento: {
            createMany: vi.fn(),
            deleteMany: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback(prisma)),
    },
}));

describe('EstabelecimentoService', () => {
    const orgId = 'org-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getEstabelecimentos', () => {
        it('should fetch establishments for an organization', async () => {
            vi.mocked(prisma.estabelecimento.findMany).mockResolvedValue([]);

            await getEstabelecimentos(orgId);

            expect(prisma.estabelecimento.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    organizationId: orgId
                })
            }));
        });

        it('should apply filters correctly', async () => {
            vi.mocked(prisma.estabelecimento.findMany).mockResolvedValue([]);

            await getEstabelecimentos(orgId, { search: 'Pizza', ativo: true });

            expect(prisma.estabelecimento.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    nome: { contains: 'Pizza', mode: 'insensitive' },
                    ativo: true
                } as any)
            }));
        });
    });

    describe('createEstabelecimento', () => {
        it('should create an establishment and link segments', async () => {
            const mockEstabelecimento = { id: 'est-1', nome: 'Pizzaria' };
            vi.mocked(prisma.estabelecimento.create).mockResolvedValue(mockEstabelecimento as any);
            vi.mocked(prisma.estabelecimento.findUnique).mockResolvedValue(mockEstabelecimento as any);

            const data = {
                nome: 'Pizzaria',
                segmentoIds: ['seg-1', 'seg-2']
            };

            await createEstabelecimento(data, orgId);

            expect(prisma.estabelecimento.create).toHaveBeenCalled();
            expect(prisma.estabelecimentoSegmento.createMany).toHaveBeenCalledWith({
                data: [
                    { estabelecimentoId: 'est-1', segmentoId: 'seg-1' },
                    { estabelecimentoId: 'est-1', segmentoId: 'seg-2' }
                ]
            });
        });
    });

    describe('updateEstabelecimento', () => {
        it('should update establishment details and segments', async () => {
            vi.mocked(prisma.estabelecimento.findUnique).mockResolvedValue({ id: 'est-1', organizationId: orgId } as any);

            await updateEstabelecimento('est-1', { nome: 'Pizzaria Atualizada', segmentoIds: ['seg-3'] }, orgId);

            expect(prisma.estabelecimento.update).toHaveBeenCalled();
            expect(prisma.estabelecimentoSegmento.deleteMany).toHaveBeenCalled();
            expect(prisma.estabelecimentoSegmento.createMany).toHaveBeenCalled();
        });
    });

    describe('toggleEstabelecimento', () => {
        it('should toggle the active status', async () => {
            vi.mocked(prisma.estabelecimento.findUnique).mockResolvedValue({ id: 'est-1', ativo: true } as any);

            await toggleEstabelecimento('est-1', orgId);

            expect(prisma.estabelecimento.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { ativo: false }
            }));
        });
    });
});
