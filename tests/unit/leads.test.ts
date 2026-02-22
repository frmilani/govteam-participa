import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeadService } from '@/lib/leads/lead-service';
import { prisma } from '@/lib/prisma';
import { Sexo, VerificacaoStatus, OrigemLead, TipoPessoa } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        lead: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        leadTag: {
            deleteMany: vi.fn(),
        }
    },
}));

vi.mock('@prisma/client', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@prisma/client')>();
    return {
        ...actual,
        Sexo: { MASCULINO: 'MASCULINO', FEMININO: 'FEMININO', OUTRO: 'OUTRO' },
        VerificacaoStatus: { VERIFICADO: 'VERIFICADO', NAO_VERIFICADO: 'NAO_VERIFICADO' },
        OrigemLead: { MANUAL: 'MANUAL', FORMULARIO_WEB: 'FORMULARIO_WEB', IMPORTACAO: 'IMPORTACAO' },
        TipoPessoa: { FISICA: 'FISICA', JURIDICA: 'JURIDICA' },
    };
});

describe('LeadService', () => {
    const orgId = 'org-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createLead', () => {
        it('should create a lead and format whatsapp', async () => {
            vi.mocked(prisma.lead.findFirst).mockResolvedValue(null);
            vi.mocked(prisma.lead.create).mockResolvedValue({ id: 'lead-1' } as any);

            const data = {
                nome: 'João Silva',
                whatsapp: '(11) 98888-8888',
                email: 'joao@example.com'
            };

            await LeadService.createLead(orgId, data);

            expect(prisma.lead.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    whatsapp: '5511988888888', // formatted
                    nome: 'João Silva'
                })
            }));
        });

        it('should throw if duplicate found', async () => {
            vi.mocked(prisma.lead.findFirst).mockResolvedValue({ id: 'existing' } as any);

            const data = {
                nome: 'João Silva',
                whatsapp: '11988888888'
            };

            await expect(LeadService.createLead(orgId, data)).rejects.toThrow('Lead já cadastrado');
        });
    });

    describe('upsertLeadPartial', () => {
        it('should calculate coupons correctly', () => {
            const coupons = LeadService.calculateCoupons({
                whatsapp: '123',
                email: 'test@example.com',
                instagram: 'test'
            });
            // 1 (whats) + 1 (email) + 1 (insta) = 3
            expect(coupons).toBe(3);
        });

        it('should update existing lead if found by whatsapp', async () => {
            vi.mocked(prisma.lead.findFirst).mockResolvedValue({ id: 'lead-1', whatsapp: '123' } as any);
            vi.mocked(prisma.lead.update).mockResolvedValue({ id: 'lead-1' } as any);

            await LeadService.upsertLeadPartial(orgId, {
                nome: 'João',
                whatsapp: '123'
            });

            expect(prisma.lead.update).toHaveBeenCalled();
            expect(prisma.lead.create).not.toHaveBeenCalled();
        });
    });

    describe('deleteLead', () => {
        it('should delete a lead', async () => {
            await LeadService.deleteLead('lead-1', orgId);
            expect(prisma.lead.delete).toHaveBeenCalledWith({
                where: { id: 'lead-1', organizationId: orgId }
            });
        });
    });
});
