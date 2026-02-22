import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { slugify } from "@/lib/utils";

/**
 * Service to handle Segmentos (Categories) logic
 */
export async function getSegmentos(organizationId: string, onlyPopulated = false) {
  const where: any = {
    organizationId,
    paiId: null, // Only fetch top-level parents first
  };

  // If onlyPopulated is true, only show segments that have establishments (used in Enquetes)
  if (onlyPopulated) {
    where.OR = [
      { estabelecimentos: { some: {} } }, // Has direct establishments
      { filhos: { some: { estabelecimentos: { some: {} } } } } // Has children with establishments
    ];
  }

  return await prisma.segmento.findMany({
    where,
    orderBy: { ordem: 'asc' },
    include: {
      filhos: {
        where: onlyPopulated ? {
          estabelecimentos: { some: {} } // Only include children that have establishments
        } : undefined,
        orderBy: { ordem: 'asc' },
        include: {
          _count: {
            select: {
              estabelecimentos: true,
              filhos: true
            }
          }
        }
      },
      _count: {
        select: {
          estabelecimentos: true,
          filhos: true
        }
      }
    }
  });
}

export async function createSegmento(data: {
  nome: string;
  slug?: string;
  paiId?: string | null;
  cor?: string;
  icone?: string;
  templateQualidadeId?: string | null;
}, organizationId: string) {
  const baseSlug = data.slug || slugify(data.nome);
  let slug = baseSlug;
  let counter = 1;

  // Ensure unique slug per organization by checking and appending suffix if needed
  while (true) {
    const existing = await prisma.segmento.findFirst({
      where: { organizationId, slug }
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  // Validate hierarchy (max 2 levels)
  if (data.paiId) {
    const pai = await prisma.segmento.findUnique({
      where: { id: data.paiId },
      select: { paiId: true }
    });

    if (!pai) throw new Error("Segmento pai não encontrado.");
    if (pai.paiId) throw new Error("A hierarquia máxima é de 2 níveis (Pai > Filho).");
  }

  // Get next order
  const lastSegmento = await prisma.segmento.findFirst({
    where: { organizationId, paiId: data.paiId || null },
    orderBy: { ordem: 'desc' },
    select: { ordem: true }
  });

  const nextOrdem = (lastSegmento?.ordem ?? -1) + 1;

  return await prisma.segmento.create({
    data: {
      nome: data.nome,
      slug, // Clean slug without organizationId prefix (@@unique handle it)
      paiId: data.paiId || null,
      cor: data.cor || "#4F46E5",
      icone: data.icone || "Folder",
      ordem: nextOrdem,
      organizationId,
      templateQualidade: data.templateQualidadeId ? { connect: { id: data.templateQualidadeId } } : undefined
    }
  });
}

export async function updateSegmento(id: string, data: {
  nome?: string;
  slug?: string;
  paiId?: string | null;
  cor?: string;
  icone?: string;
  templateQualidadeId?: string | null;
}, organizationId: string) {
  const segmento = await prisma.segmento.findUnique({
    where: { id, organizationId }
  });

  if (!segmento) throw new Error("Segmento não encontrado.");

  // Validate hierarchy if changing paiId
  if (data.paiId !== undefined && data.paiId !== segmento.paiId && data.paiId !== null) {
    const pai = await prisma.segmento.findUnique({
      where: { id: data.paiId },
      select: { paiId: true }
    });

    if (!pai) throw new Error("Segmento pai não encontrado.");
    if (pai.paiId) throw new Error("A hierarquia máxima é de 2 níveis.");
  }

  const updateData: any = {
    nome: data.nome,
    cor: data.cor,
    icone: data.icone,
    pai: data.paiId !== undefined ? (data.paiId ? { connect: { id: data.paiId } } : { disconnect: true }) : undefined,
    templateQualidade: data.templateQualidadeId !== undefined ? (data.templateQualidadeId ? { connect: { id: data.templateQualidadeId } } : { disconnect: true }) : undefined
  };

  if (data.slug) {
    const baseSlug = slugify(data.slug);
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug per organization (excluding current record)
    while (true) {
      const existing = await prisma.segmento.findFirst({
        where: {
          organizationId,
          slug,
          NOT: { id }
        }
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter++}`;
    }
    updateData.slug = slug;
  }

  return await prisma.segmento.update({
    where: { id },
    data: updateData
  });
}

export async function deleteSegmento(id: string, organizationId: string) {
  const segmento = await prisma.segmento.findUnique({
    where: { id, organizationId },
    include: {
      _count: {
        select: { filhos: true }
      }
    }
  });

  if (!segmento) throw new Error("Segmento não encontrado.");

  // Note: Check for linked establishments should be added here when the model is created
  // For now, check if it has children
  if (segmento._count.filhos > 0) {
    throw new Error("Não é possível excluir um segmento que possui subcategorias.");
  }

  return await prisma.segmento.delete({
    where: { id }
  });
}

export async function reorderSegmentos(updates: { id: string, ordem: number }[], organizationId: string) {
  return await prisma.$transaction(
    updates.map((update) =>
      prisma.segmento.update({
        where: { id: update.id, organizationId },
        data: { ordem: update.ordem }
      })
    )
  );
}
