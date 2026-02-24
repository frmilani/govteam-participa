/**
 * E1.4 — Constantes e validadores Zod compartilhados para TipoEntidade
 *
 * Centraliza os valores do enum para evitar duplicação entre:
 * - API routes (route.ts, [id]/route.ts)
 * - Serviço (estabelecimento-service.ts)
 * - Frontend (tipo-entidade-config.ts)
 */
import { z } from 'zod';

/** Valores válidos do enum TipoEntidade (espelha o schema Prisma) */
export const TIPO_ENTIDADE_VALUES = [
    'EMPRESA',
    'CANDIDATO',
    'PROPOSTA',
    'MARCA',
    'DIMENSAO',
    'SERVICO_PUBLICO',
    'OUTRO',
] as const;

export type TipoEntidadeValue = typeof TIPO_ENTIDADE_VALUES[number];

/**
 * Zod schema para validação de TipoEntidade nos endpoints de API.
 * Aceita valores do enum ou undefined (default EMPRESA no service).
 * Rejeita strings arbitrárias com mensagem clara.
 */
export const tipoEntidadeSchema = z
    .enum(TIPO_ENTIDADE_VALUES, {
        message: `Tipo inválido. Valores aceitos: ${TIPO_ENTIDADE_VALUES.join(', ')}`,
    })
    .optional();

/**
 * Zod schema para validação de metadados como JSON object.
 * Aceita null (limpa metadados) ou Record<string, any>.
 */
export const metadadosSchema = z
    .record(z.string(), z.any())
    .nullable()
    .optional();
