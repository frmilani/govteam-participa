import { prisma } from "@/lib/prisma";
import { Sexo, VerificacaoStatus, OrigemLead, TipoPessoa } from "@prisma/client";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export interface LeadFilters {
  search?: string;
  tagIds?: string[];
  status?: VerificacaoStatus;
  optOut?: boolean;
  unitScope?: string[] | null;
}

export class LeadService {
  static async getLeads(organizationId: string, filters: LeadFilters = {}) {
    const { search, tagIds, status, optOut, unitScope } = filters;

    // HPAC: build unit scope filter
    // We include null to ensure "Global/Unassigned" leads are visible even in narrowed scopes
    const unitWhere = unitScope ? {
      OR: [
        { unitId: { in: unitScope } },
        { unitId: null }
      ]
    } : {};

    return await prisma.lead.findMany({
      where: {
        organizationId,
        ...unitWhere,
        optOut: optOut !== undefined ? optOut : undefined,
        statusVerificacao: status,
        AND: [
          search
            ? {
              OR: [
                { nome: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { whatsapp: { contains: search } },
              ],
            }
            : {},
          tagIds && tagIds.length > 0
            ? {
              tags: {
                some: {
                  tagId: { in: tagIds },
                },
              },
            }
            : {},
        ],
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
    });
  }

  static async getLeadById(id: string, organizationId: string) {
    return await prisma.lead.findFirst({
      where: { id, organizationId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  static async checkDuplicate(organizationId: string, whatsapp?: string, email?: string) {
    if (!whatsapp && !email) return null;

    return await prisma.lead.findFirst({
      where: {
        organizationId,
        OR: [
          whatsapp ? { whatsapp } : {},
          email ? { email: { equals: email, mode: "insensitive" as const } } : {},
        ].filter((condition) => Object.keys(condition).length > 0),
      },
    });
  }

  static formatWhatsApp(whatsapp: string) {
    const phoneNumber = parsePhoneNumberFromString(whatsapp, "BR");
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.format("E.164").replace("+", "");
    }
    // Fallback: remove non-digits
    return whatsapp.replace(/\D/g, "");
  }

  static async createLead(
    organizationId: string,
    data: {
      nome: string;
      whatsapp: string;
      email?: string | null;
      sexo?: Sexo | null;
      telefone?: string | null;
      facebook?: string | null;
      instagram?: string | null;
      tagIds?: string[];
      origem?: OrigemLead;
      consentimentoEm?: Date;
      tipoPessoa?: TipoPessoa;
      cpf?: string | null;
      cnpj?: string | null;
      unitId?: string | null;
    }
  ) {
    const formattedWhatsApp = this.formatWhatsApp(data.whatsapp);

    // Check for duplicate
    const duplicate = await this.checkDuplicate(organizationId, formattedWhatsApp, data.email || undefined);
    if (duplicate) {
      throw new Error("Lead já cadastrado com este WhatsApp ou Email");
    }

    return await prisma.lead.create({
      data: {
        organizationId,
        nome: data.nome,
        whatsapp: formattedWhatsApp,
        email: data.email,
        sexo: data.sexo,
        telefone: data.telefone,
        facebook: data.facebook,
        instagram: data.instagram,
        tipoPessoa: data.tipoPessoa,
        cpf: data.cpf,
        cnpj: data.cnpj,
        unitId: data.unitId,
        origem: data.origem || OrigemLead.MANUAL,
        consentimentoEm: data.consentimentoEm || new Date(),
        tags: data.tagIds
          ? {
            create: data.tagIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  static async updateLead(
    id: string,
    organizationId: string,
    data: {
      nome?: string;
      whatsapp?: string;
      email?: string | null;
      sexo?: Sexo | null;
      telefone?: string | null;
      facebook?: string | null;
      instagram?: string | null;
      tagIds?: string[];
      optOut?: boolean;
      tipoPessoa?: TipoPessoa;
      cpf?: string | null;
      cnpj?: string | null;
      unitId?: string | null;
    }
  ) {
    const formattedWhatsApp = data.whatsapp ? this.formatWhatsApp(data.whatsapp) : undefined;

    // If updating whatsapp/email, check for duplicates (excluding self)
    if (formattedWhatsApp || data.email) {
      const duplicate = await prisma.lead.findFirst({
        where: {
          organizationId,
          id: { not: id },
          OR: [
            formattedWhatsApp ? { whatsapp: formattedWhatsApp } : {},
            data.email ? { email: { equals: data.email, mode: "insensitive" as const } } : {},
          ].filter((condition) => Object.keys(condition).length > 0),
        },
      });
      if (duplicate) {
        throw new Error("Outro lead já cadastrado com este WhatsApp ou Email");
      }
    }

    // Handle tag updates (replace all)
    if (data.tagIds) {
      await prisma.leadTag.deleteMany({
        where: { leadId: id },
      });
    }

    return await prisma.lead.update({
      where: { id, organizationId },
      data: {
        nome: data.nome,
        whatsapp: formattedWhatsApp,
        email: data.email,
        sexo: data.sexo,
        telefone: data.telefone,
        facebook: data.facebook,
        instagram: data.instagram,
        tipoPessoa: data.tipoPessoa,
        cpf: data.cpf,
        cnpj: data.cnpj,
        unitId: data.unitId,
        optOut: data.optOut,
        optOutEm: data.optOut === true ? new Date() : (data.optOut === false ? null : undefined),
        tags: data.tagIds
          ? {
            create: data.tagIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  static calculateCoupons(data: {
    whatsapp?: string;
    email?: string | null;
    instagram?: string | null;
    statusVerificacao?: VerificacaoStatus;
  }): number {
    let coupons = 0;

    // Mission 1: Basic Identification (Name + Whats is implied if called)
    if (data.whatsapp) coupons += 1;

    // Mission 2: Email provided
    if (data.email && data.email.includes("@")) coupons += 1;

    // Mission 3: Instagram provided
    if (data.instagram && data.instagram.length > 2) coupons += 1;

    // Mission 4: OTP Verified (Security Booster)
    if (data.statusVerificacao === VerificacaoStatus.VERIFICADO) coupons += 2;

    return coupons;
  }

  static async upsertLeadPartial(
    organizationId: string,
    data: {
      nome: string;
      whatsapp: string;
      cpf?: string | null;
      email?: string | null;
      instagram?: string | null;
      origem?: OrigemLead;
      unitId?: string | null;
    }
  ) {
    const formattedWhatsApp = this.formatWhatsApp(data.whatsapp);

    // Try to find existing lead by WhatsApp OR CPF in this organization
    // Important: check both because they are both unique constraints in the organization
    let existingLead = await prisma.lead.findFirst({
      where: {
        organizationId,
        whatsapp: formattedWhatsApp,
      },
    });

    if (!existingLead && data.cpf) {
      existingLead = await prisma.lead.findFirst({
        where: {
          organizationId,
          cpf: data.cpf,
        },
      });
    }

    const couponData = {
      whatsapp: formattedWhatsApp,
      email: data.email || existingLead?.email,
      instagram: data.instagram || existingLead?.instagram,
      statusVerificacao: existingLead?.statusVerificacao,
    };

    const totalCoupons = this.calculateCoupons(couponData);

    try {
      if (existingLead) {
        // SECURITY: If the WhatsApp number changed, we MUST reset the verification status
        const isPhoneChanging = formattedWhatsApp && existingLead.whatsapp !== formattedWhatsApp;
        const newStatus = isPhoneChanging ? VerificacaoStatus.NAO_VERIFICADO : existingLead.statusVerificacao;

        // Recalculate coupons if status changed
        const finalCoupons = isPhoneChanging
          ? this.calculateCoupons({ ...couponData, statusVerificacao: newStatus })
          : totalCoupons;

        return await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            nome: data.nome || existingLead.nome,
            whatsapp: formattedWhatsApp || existingLead.whatsapp,
            cpf: data.cpf || existingLead.cpf,
            email: data.email || existingLead.email,
            instagram: data.instagram || existingLead.instagram,
            unitId: data.unitId || existingLead.unitId,
            cupons: finalCoupons,
            statusVerificacao: newStatus,
            ultimaInteracao: new Date(),
          },
        });
      }

      return await prisma.lead.create({
        data: {
          organizationId,
          nome: data.nome,
          whatsapp: formattedWhatsApp,
          cpf: data.cpf,
          email: data.email,
          instagram: data.instagram,
          unitId: data.unitId,
          origem: data.origem || OrigemLead.FORMULARIO_WEB,
          cupons: totalCoupons,
          statusVerificacao: VerificacaoStatus.NAO_VERIFICADO,
          consentimentoEm: new Date(),
        },
      });
    } catch (err: any) {
      // If we still hit a unique constraint error (e.g. race condition), try one last time to find and update
      if (err.message?.includes('Unique constraint failed')) {
        const fallbackLead = await prisma.lead.findFirst({
          where: {
            organizationId,
            OR: [
              { whatsapp: formattedWhatsApp },
              ...(data.cpf ? [{ cpf: data.cpf }] : []),
            ],
          },
        });

        if (fallbackLead) {
          return await prisma.lead.update({
            where: { id: fallbackLead.id },
            data: {
              nome: data.nome || fallbackLead.nome,
              whatsapp: formattedWhatsApp || fallbackLead.whatsapp,
              cpf: data.cpf || fallbackLead.cpf,
              cupons: totalCoupons,
              ultimaInteracao: new Date(),
            },
          });
        }
      }
      throw err;
    }
  }

  static async deleteLead(id: string, organizationId: string) {

    return await prisma.lead.delete({
      where: { id, organizationId },
    });
  }
}
