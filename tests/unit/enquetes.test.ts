import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnqueteService } from '@/lib/enquetes/enquete-service';
import { prisma } from '@/lib/prisma';
import { HubApiService } from '@/lib/hub-api';
import { EnqueteStatus } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        enquete: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

vi.mock('@/lib/hub-api', () => ({
    HubApiService: {
        getFormSchema: vi.fn(),
    },
}));

// Provide enums if they are missing from @prisma/client in test env
vi.mock('@prisma/client', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@prisma/client')>();
    return {
        ...actual,
        EnqueteStatus: {
            RASCUNHO: 'RASCUNHO',
            PUBLICADA: 'PUBLICADA',
            ENCERRADA: 'ENCERRADA',
            PAUSADA: 'PAUSADA',
        },
    };
});

describe('EnqueteService', () => {
    const orgId = 'org-123';
    const userId = 'user-456';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createEnquete', () => {
        it('should create an enquete after validating hub form', async () => {
            vi.mocked(HubApiService.getFormSchema).mockResolvedValue({ id: 'hub-form-id' } as any);
            vi.mocked(prisma.enquete.create).mockResolvedValue({ id: 'enq-1' } as any);

            const data = {
                titulo: 'Melhores de 2025',
                formPublicId: 'pub-form-123',
                modoAcesso: 'HIBRIDO' as any,
                configVisual: {},
                paginaAgradecimento: {},
            };

            await EnqueteService.createEnquete(orgId, userId, data as any);

            expect(HubApiService.getFormSchema).toHaveBeenCalledWith('pub-form-123');
            expect(prisma.enquete.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    titulo: 'Melhores de 2025',
                    hubFormId: 'hub-form-id'
                })
            }));
        });
    });

    describe('updateEnquete', () => {
        it('should update an existing enquete', async () => {
            vi.mocked(prisma.enquete.findFirst).mockResolvedValue({ id: 'enq-1', formPublicId: 'old' } as any);

            await EnqueteService.updateEnquete('enq-1', orgId, { titulo: 'Novo Titulo' });

            expect(prisma.enquete.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'enq-1' },
                data: expect.objectContaining({ titulo: 'Novo Titulo' })
            }));
        });
    });

    describe('deleteEnquete', () => {
        it('should delete a draft enquete with no responses', async () => {
            vi.mocked(prisma.enquete.findFirst).mockResolvedValue({
                id: 'enq-1',
                status: 'RASCUNHO',
                _count: { respostas: 0 }
            } as any);

            await EnqueteService.deleteEnquete('enq-1', orgId);

            expect(prisma.enquete.delete).toHaveBeenCalledWith({
                where: { id: 'enq-1', organizationId: orgId }
            });
        });

        it('should throw if enquete has responses', async () => {
            vi.mocked(prisma.enquete.findFirst).mockResolvedValue({
                id: 'enq-1',
                status: 'RASCUNHO',
                _count: { respostas: 5 }
            } as any);

            await expect(EnqueteService.deleteEnquete('enq-1', orgId)).rejects.toThrow('Esta enquete possui respostas');
        });
    });
});
