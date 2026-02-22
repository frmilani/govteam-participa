import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getEstabelecimentos(organizationId: string, filters: {
  segmentoId?: string;
  ativo?: boolean;
  search?: string;
  // E1.2: Filtro por tipo de entidade (AC: 9)
  tipo?: string;
} = {}) {
  const { segmentoId, ativo, search, tipo } = filters;

  return await prisma.estabelecimento.findMany({
    where: {
      organizationId,
      ativo: ativo !== undefined ? ativo : undefined,
      nome: search ? { contains: search, mode: 'insensitive' } : undefined,
      tipo: tipo ? (tipo as any) : undefined,
      segmentos: segmentoId ? {
        some: {
          segmentoId
        }
      } : undefined,
    } as any,
    include: {
      segmentos: {
        include: {
          segmento: true
        }
      }
    },
    orderBy: { nome: 'asc' }
  });
}

export async function getEstabelecimento(id: string, organizationId: string) {
  const estabelecimento = await prisma.estabelecimento.findUnique({
    where: { id, organizationId },
    include: {
      segmentos: {
        include: {
          segmento: true
        }
      }
    }
  });

  if (!estabelecimento) {
    throw new Error("Estabelecimento não encontrado.");
  }

  return estabelecimento;
}

export async function createEstabelecimento(data: {
  nome: string;
  logoUrl?: string | null;
  descricao?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  alias?: string | null;
  segmentoIds: string[];
  // E1.2: Suporte ao Motor Universal (AC: 12)
  tipo?: string;
  metadados?: Record<string, unknown> | null;
}, organizationId: string) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const estabelecimento = await tx.estabelecimento.create({
      data: {
        nome: data.nome,
        logoUrl: data.logoUrl,
        descricao: data.descricao,
        endereco: data.endereco,
        telefone: data.telefone,
        whatsapp: data.whatsapp,
        website: data.website,
        instagram: data.instagram,
        facebook: data.facebook,
        alias: data.alias,
        tipo: (data.tipo ?? 'EMPRESA') as any,
        metadados: (data.metadados ?? undefined) as any,
        organizationId
      } as any
    });

    if (data.segmentoIds.length > 0) {
      await tx.estabelecimentoSegmento.createMany({
        data: data.segmentoIds.map(segmentoId => ({
          estabelecimentoId: estabelecimento.id,
          segmentoId
        }))
      });
    }

    return await tx.estabelecimento.findUnique({
      where: { id: estabelecimento.id },
      include: {
        segmentos: {
          include: {
            segmento: true
          }
        }
      }
    });
  });
}

export async function updateEstabelecimento(id: string, data: {
  nome?: string;
  logoUrl?: string | null;
  descricao?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  alias?: string | null;
  segmentoIds?: string[];
  ativo?: boolean;
  // E1.2: Suporte ao Motor Universal (AC: 12)
  tipo?: string;
  metadados?: Record<string, unknown> | null;
}, organizationId: string) {
  const existing = await prisma.estabelecimento.findUnique({
    where: { id, organizationId }
  });

  if (!existing) {
    throw new Error("Estabelecimento não encontrado.");
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const estabelecimento = await tx.estabelecimento.update({
      where: { id },
      data: {
        nome: data.nome,
        logoUrl: data.logoUrl,
        descricao: data.descricao,
        endereco: data.endereco,
        telefone: data.telefone,
        whatsapp: data.whatsapp,
        website: data.website,
        instagram: data.instagram,
        facebook: data.facebook,
        alias: data.alias,
        ativo: data.ativo,
        tipo: data.tipo ? (data.tipo as any) : undefined,
        metadados: data.metadados !== undefined ? (data.metadados as any) : undefined,
      } as any
    });

    if (data.segmentoIds !== undefined) {
      // Refresh segments
      await tx.estabelecimentoSegmento.deleteMany({
        where: { estabelecimentoId: id }
      });

      if (data.segmentoIds.length > 0) {
        await tx.estabelecimentoSegmento.createMany({
          data: data.segmentoIds.map(segmentoId => ({
            estabelecimentoId: id,
            segmentoId
          }))
        });
      }
    }

    return await tx.estabelecimento.findUnique({
      where: { id },
      include: {
        segmentos: {
          include: {
            segmento: true
          }
        }
      }
    });
  });
}

export async function toggleEstabelecimento(id: string, organizationId: string) {
  const existing = await prisma.estabelecimento.findUnique({
    where: { id, organizationId },
    select: { ativo: true }
  });

  if (!existing) {
    throw new Error("Estabelecimento não encontrado.");
  }

  return await prisma.estabelecimento.update({
    where: { id },
    data: { ativo: !existing.ativo }
  });
}

export async function importEstabelecimentos(data: any[], organizationId: string) {
  // Batch import logic
  const results = {
    total: data.length,
    created: 0,
    errors: [] as string[]
  };

  for (const item of data) {
    try {
      await createEstabelecimento(item, organizationId);
      results.created++;
    } catch (error: any) {
      results.errors.push(`${item.nome}: ${error.message}`);
    }
  }

  return results;
}
