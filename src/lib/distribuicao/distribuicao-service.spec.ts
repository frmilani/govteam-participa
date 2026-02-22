import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DistribuicaoService } from './distribuicao-service';
import { prisma } from '@/lib/prisma';

// Mock do prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        enquete: {
            findUnique: vi.fn(),
        },
        campanha: {
            findUnique: vi.fn(),
        },
        distribuicaoRotativa: {
            findMany: vi.fn(),
            upsert: vi.fn(),
        },
    },
}));

describe('DistribuicaoService', () => {
    const categoriasBase = [
        { id: 'cat1', nome: 'Cat 1' },
        { id: 'cat2', nome: 'Cat 2' },
        { id: 'cat3', nome: 'Cat 3' },
        { id: 'cat4', nome: 'Cat 4' },
        { id: 'cat5', nome: 'Cat 5' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return all categories if mode is "todas"', async () => {
        vi.mocked(prisma.enquete.findUnique).mockResolvedValue({
            id: 'enq1',
            modoDistribuicao: 'todas',
        } as any);

        const result = await DistribuicaoService.resolverCategorias('enq1', categoriasBase);
        expect(result).toHaveLength(5);
    });

    it('should filter by groups if mode is "grupo" and there are groups in campanhas config', async () => {
        vi.mocked(prisma.enquete.findUnique).mockResolvedValue({
            id: 'enq1',
            modoDistribuicao: 'grupo',
        } as any);

        vi.mocked(prisma.campanha.findUnique).mockResolvedValue({
            id: 'camp1',
            segmentacao: { grupoIds: ['cat2'] },
        } as any);

        const result = await DistribuicaoService.resolverCategorias('enq1', categoriasBase, 'camp1');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('cat2');
    });

    it('should return exactly one category if mode is "individual"', async () => {
        vi.mocked(prisma.enquete.findUnique).mockResolvedValue({
            id: 'enq1',
            modoDistribuicao: 'individual',
        } as any);

        vi.mocked(prisma.campanha.findUnique).mockResolvedValue({
            id: 'camp1',
            segmentacao: { categoriaId: 'cat3' },
        } as any);

        const result = await DistribuicaoService.resolverCategorias('enq1', categoriasBase, 'camp1');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('cat3');
    });

    it('should fail if mode "individual" is requested but no `categoriaId` is configured', async () => {
        vi.mocked(prisma.enquete.findUnique).mockResolvedValue({
            id: 'enq1',
            modoDistribuicao: 'individual',
        } as any);

        vi.mocked(prisma.campanha.findUnique).mockResolvedValue({
            id: 'camp1',
            segmentacao: {},
        } as any);

        await expect(DistribuicaoService.resolverCategorias('enq1', categoriasBase, 'camp1'))
            .rejects.toThrow("Campanha com modo individual não definiu categoriaId em sua segmentacao");
    });

    it('should return deterministically random categories for the same inputs (Aleatorio)', async () => {
        vi.mocked(prisma.enquete.findUnique).mockResolvedValue({
            id: 'enq1',
            modoDistribuicao: 'aleatorio',
            maxCategoriasPorEleitor: 2,
        } as any);

        const result1 = await DistribuicaoService.resolverCategorias('enq1', categoriasBase, undefined, 'lead-same-1');
        const result2 = await DistribuicaoService.resolverCategorias('enq1', categoriasBase, undefined, 'lead-same-1');

        expect(result1).toHaveLength(2);
        // Os resultados devem ser os mesmos para o mesmo seed (leadId)
        expect(result1).toEqual(result2);

        const result3 = await DistribuicaoService.resolverCategorias('enq1', categoriasBase, undefined, 'lead-diff-2');
        // Tem boa chance de ser diferente
        // Note: as sementes determinísticas de lead-same-1 e lead-diff-2 geram pseudoaleatórios independentes
        expect(result3).toHaveLength(2);
    });

    it('should handle round-robin correctly in "rotativo" mode', async () => {
        vi.mocked(prisma.enquete.findUnique).mockResolvedValue({
            id: 'enq1',
            modoDistribuicao: 'rotativo',
            maxCategoriasPorEleitor: 2,
        } as any);

        // Simular que cat1 tem 5 acessos, cat2 tem 10 acessos, cat3 e restro tem 0
        vi.mocked((prisma as any).distribuicaoRotativa.findMany).mockResolvedValue([
            { categoriaId: 'cat1', totalAcessos: 5 },
            { categoriaId: 'cat2', totalAcessos: 10 },
            { categoriaId: 'cat3', totalAcessos: 1 },
        ]);

        const result = await DistribuicaoService.resolverCategorias('enq1', categoriasBase);
        expect(result).toHaveLength(2);

        // Deve preferir cat4 e cat5 porque eles tem 0 acessos na mock response default (e ordem do id)
        expect(result.map(c => c.id)).toEqual(['cat4', 'cat5']);

        // E ele deve tentar inserir eles
        expect((prisma as any).distribuicaoRotativa.upsert).toHaveBeenCalledTimes(2);
    });
});
