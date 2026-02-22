import { prisma } from "@/lib/prisma";

export class TagService {
  static async getTags(organizationId: string) {
    return await prisma.tag.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { leads: true },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  static async createTag(organizationId: string, data: { nome: string; cor: string }) {
    // Check if tag already exists
    const existing = await prisma.tag.findUnique({
      where: {
        organizationId_nome: {
          organizationId,
          nome: data.nome,
        },
      },
    });

    if (existing) {
      throw new Error("Uma tag com este nome já existe");
    }

    return await prisma.tag.create({
      data: {
        organizationId,
        nome: data.nome,
        cor: data.cor,
      },
    });
  }

  static async updateTag(
    id: string,
    organizationId: string,
    data: { nome?: string; cor?: string }
  ) {
    if (data.nome) {
      const existing = await prisma.tag.findFirst({
        where: {
          organizationId,
          nome: data.nome,
          id: { not: id },
        },
      });

      if (existing) {
        throw new Error("Outra tag com este nome já existe");
      }
    }

    return await prisma.tag.update({
      where: { id, organizationId },
      data,
    });
  }

  static async deleteTag(id: string, organizationId: string) {
    // Check if tag has leads
    const tag = await prisma.tag.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    if (tag?._count.leads && tag._count.leads > 0) {
      throw new Error("Não é possível excluir uma tag que possui leads vinculados");
    }

    return await prisma.tag.delete({
      where: { id, organizationId },
    });
  }
}
