import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSegmento, getSegmentos, updateSegmento, deleteSegmento } from '@/lib/segmentos/segmento-service';
import { prisma } from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        segmento: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        $transaction: vi.fn((promises) => Promise.all(promises)),
    },
}));

describe('SegmentoService', () => {
    const orgId = 'org-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getSegmentos', () => {
        it('should fetch all segments by default (onlyPopulated = false)', async () => {
            vi.mocked(prisma.segmento.findMany).mockResolvedValue([]);

            await getSegmentos(orgId, false);

            expect(prisma.segmento.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    organizationId: orgId,
                    paiId: null
                }
            }));
        });

        it('should include establishment filter for onlyPopulated = true', async () => {
            vi.mocked(prisma.segmento.findMany).mockResolvedValue([]);

            await getSegmentos(orgId, true);

            expect(prisma.segmento.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.any(Array)
                })
            }));
        });
    });

    describe('createSegmento', () => {
        it('should create a segment with a unique slug', async () => {
            // First call to findFirst returns null (no collision)
            vi.mocked(prisma.segmento.findFirst)
                .mockResolvedValueOnce(null) // for slug collision check
                .mockResolvedValueOnce(null); // for nextOrdem check

            const data = { nome: 'Restaurantes', cor: '#FF0000' };

            await createSegmento(data, orgId);

            expect(prisma.segmento.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    nome: 'Restaurantes',
                    slug: 'restaurantes',
                    organizationId: orgId
                })
            }));
        });

        it('should handle slug collision by appending a counter', async () => {
            // First call returns an existing segment, second call returns null
            vi.mocked(prisma.segmento.findFirst)
                .mockResolvedValueOnce({ id: 'existing' } as any) // collision!
                .mockResolvedValueOnce(null) // unique now
                .mockResolvedValueOnce(null); // for nextOrdem

            const data = { nome: 'Restaurantes' };

            await createSegmento(data, orgId);

            expect(prisma.segmento.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    slug: 'restaurantes-1'
                })
            }));
        });
    });

    describe('updateSegmento', () => {
        it('should update a segment', async () => {
            vi.mocked(prisma.segmento.findUnique).mockResolvedValue({ id: 'seg-1', organizationId: orgId } as any);

            await updateSegmento('seg-1', { nome: 'Novo Nome' }, orgId);

            expect(prisma.segmento.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'seg-1' },
                data: expect.objectContaining({ nome: 'Novo Nome' })
            }));
        });
    });

    describe('deleteSegmento', () => {
        it('should delete a segment if it has no children', async () => {
            vi.mocked(prisma.segmento.findUnique).mockResolvedValue({
                id: 'seg-1',
                organizationId: orgId,
                _count: { filhos: 0 }
            } as any);

            await deleteSegmento('seg-1', orgId);

            expect(prisma.segmento.delete).toHaveBeenCalledWith({ where: { id: 'seg-1' } });
        });

        it('should throw error if segment has children', async () => {
            vi.mocked(prisma.segmento.findUnique).mockResolvedValue({
                id: 'seg-1',
                organizationId: orgId,
                _count: { filhos: 1 }
            } as any);

            await expect(deleteSegmento('seg-1', orgId)).rejects.toThrow('Não é possível excluir um segmento que possui subcategorias.');
        });
    });
});
