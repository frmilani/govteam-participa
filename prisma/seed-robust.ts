import { PrismaClient, ModoAcesso, EnqueteStatus } from '@prisma/client';
import { fakerPT_BR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    const orgId = 'cmk2ngrnl00011y88benme53s';
    const userId = 'user_admin_demo';

    console.log('🌱 Iniciando seed ROBUSTO para Prêmio Destaque...');

    // 1. Limpeza Radical
    console.log('🧹 Limpando dados antigos...');
    try {
        await prisma.votoEstabelecimento.deleteMany({ where: { resposta: { enquete: { organizationId: orgId } } } });
        await prisma.resposta.deleteMany({ where: { enquete: { organizationId: orgId } } });
        await prisma.trackingLink.deleteMany({ where: { campanha: { organizationId: orgId } } });
        await prisma.campanha.deleteMany({ where: { organizationId: orgId } });
        await prisma.enquete.deleteMany({ where: { organizationId: orgId } });

        await prisma.estabelecimentoSegmento.deleteMany({ where: { segmento: { organizationId: orgId } } });
        await prisma.estabelecimento.deleteMany({ where: { organizationId: orgId } });
        await prisma.segmento.deleteMany({ where: { organizationId: orgId, paiId: { not: null } } });
        await prisma.segmento.deleteMany({ where: { organizationId: orgId } });
    } catch (error) {
        console.warn('⚠️  Erro na limpeza (pode ser ignorado se for primeira execução):', error);
    }

    // 2. Definir Taxonomia Completa
    const taxonomy = [
        {
            group: 'Comércio Varejista', slug: 'comercio-varejista', color: '#EC4899', icon: 'ShoppingBag',
            children: [
                { name: 'Vestuário', slug: 'vestuario' },
                { name: 'Calçados', slug: 'calcados' },
                { name: 'Supermercados', slug: 'supermercados' },
                { name: 'Materiais de construção', slug: 'materiais-construcao' },
                { name: 'Farmácias', slug: 'farmacias' },
                { name: 'Joalherias', slug: 'joalherias' }
            ]
        },
        {
            group: 'Saúde e Especialidades', slug: 'saude-especialidades', color: '#10B981', icon: 'HeartPulse',
            children: [
                { name: 'Clínicas médicas', slug: 'clinicas-medicas' },
                { name: 'Odontológicas', slug: 'odontologicas' },
                { name: 'Laboratórios', slug: 'laboratorios' },
                { name: 'Fisioterapia', slug: 'fisioterapia' },
                { name: 'Nutrição', slug: 'nutricao' },
                { name: 'Psicologia', slug: 'psicologia' }
            ]
        },
        {
            group: 'Gastronomia e Lazer', slug: 'gastronomia-lazer', color: '#EF4444', icon: 'Utensils',
            children: [
                { name: 'Restaurantes', slug: 'restaurantes' },
                { name: 'Churrascarias', slug: 'churrascarias' },
                { name: 'Pizzarias', slug: 'pizzarias' },
                { name: 'Bares', slug: 'bares' },
                { name: 'Docerias', slug: 'docerias' },
                { name: 'Clubes de recreação', slug: 'clubes-recreacao' }
            ]
        },
        {
            group: 'Serviços e Profissionais', slug: 'servicos-profissionais', color: '#3B82F6', icon: 'Briefcase',
            children: [
                { name: 'Advocacia', slug: 'advocacia' },
                { name: 'Contabilidade', slug: 'contabilidade' },
                { name: 'Agências de marketing', slug: 'agencias-marketing' },
                { name: 'Fotógrafos', slug: 'fotografos' },
                { name: 'Oficinas mecânicas', slug: 'oficinas-mecanicas' }
            ]
        },
        {
            group: 'Educação e Cultura', slug: 'educacao-cultura', color: '#F59E0B', icon: 'GraduationCap',
            children: [
                { name: 'Escolas de idiomas', slug: 'escolas-idiomas' },
                { name: 'Academias de dança', slug: 'academias-danca' },
                { name: 'Faculdades', slug: 'faculdades' },
                { name: 'Cursos técnicos', slug: 'cursos-tecnicos' }
            ]
        },
        {
            group: 'Bem-Estar e Estética', slug: 'bem-estar-estetica', color: '#8B5CF6', icon: 'Sparkles',
            children: [
                { name: 'Academias', slug: 'academias' },
                { name: 'Salões de beleza', slug: 'saloes-beleza' },
                { name: 'Clínicas de estética', slug: 'clinicas-estetica' },
                { name: 'Estúdios de tatuagem', slug: 'estudios-tatuagem' }
            ]
        },
        {
            group: 'Indústria e Tecnologia', slug: 'industria-tecnologia', color: '#6366F1', icon: 'Cpu',
            children: [
                { name: 'Fábricas de móveis', slug: 'fabricas-moveis' },
                { name: 'Provedores de internet', slug: 'provedores-internet' },
                { name: 'Automação comercial', slug: 'automacao-comercial' },
                { name: 'Metalurgia', slug: 'metalurgia' }
            ]
        }
    ];

    const allSegmentos: any[] = [];
    const allEstabelecimentos: any[] = [];
    const establishmentLookup: Record<string, string[]> = {};

    console.log('🏗️  Criando estrutura de Segmentos e Estabelecimentos...');

    for (const group of taxonomy) {
        const parent = await prisma.segmento.create({
            data: {
                organizationId: orgId,
                nome: group.group,
                slug: group.slug,
                cor: group.color,
                icone: group.icon,
            }
        });

        for (const child of group.children) {
            const segment = await prisma.segmento.create({
                data: {
                    organizationId: orgId,
                    nome: child.name,
                    slug: child.slug,
                    cor: group.color,
                    icone: group.icon,
                    paiId: parent.id,
                }
            });
            allSegmentos.push(segment);
            establishmentLookup[segment.id] = [];

            // Criar 5 estabelecimentos por segmento filho
            for (let i = 0; i < 5; i++) {
                const name = faker.company.name();
                const alias = name.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, "_")
                    .replace(/_+/g, "_");

                const estab = await prisma.estabelecimento.create({
                    data: {
                        organizationId: orgId,
                        nome: name,
                        alias: alias,
                        descricao: faker.company.catchPhrase(),
                        ativo: true,
                        endereco: `${faker.location.streetAddress()}, Cidade Modelo - SP`,
                        whatsapp: faker.phone.number(),
                    }
                });

                await prisma.estabelecimentoSegmento.create({
                    data: {
                        estabelecimentoId: estab.id,
                        segmentoId: segment.id
                    }
                });

                allEstabelecimentos.push(estab);
                establishmentLookup[segment.id].push(estab.id);
            }
        }
    }

    // 3. Criar Enquete
    console.log('📝 Criando Enquete Oficial...');
    const enquete = await prisma.enquete.create({
        data: {
            organizationId: orgId,
            titulo: 'Prêmio Destaque 2025 - Edição Oficial',
            descricao: 'A maior premiação da região. Seu voto reconhece o esforço e a excelência local!',
            formPublicId: 'premio-destaque-2025',
            hubFormId: 'hub_form_awards_2025',
            status: EnqueteStatus.PUBLICADA,
            modoAcesso: ModoAcesso.PUBLICO,
            minCompleteness: 10,
            criadoPor: userId,
            paginaAgradecimento: {
                titulo: 'Voto Confirmado!',
                mensagem: 'Obrigado por sua participação! Juntos fortalecemos nossa cidade.',
                showShareButtons: true
            },
            dataInicio: new Date('2025-01-01'),
            dataFim: new Date('2025-12-31'),
            segmentos: {
                connect: allSegmentos.map(s => ({ id: s.id }))
            },
            estabelecimentos: {
                connect: allEstabelecimentos.map(e => ({ id: e.id }))
            },
            configVisual: {
                primaryColor: '#B45309', // Um dourado elegante
                template: 'modern',
                logoUrl: 'https://placehold.co/400x400?text=Premio+Destaque'
            }
        }
    });

    // 4. Gerar Votos
    console.log('👥 Gerando centenas de votos...');

    // Gerar alguns leads
    const leads = [];
    for (let i = 0; i < 100; i++) {
        const lead = await prisma.lead.create({
            data: {
                organizationId: orgId,
                nome: faker.person.fullName(),
                email: faker.internet.email(),
                whatsapp: faker.number.int({ min: 11900000000, max: 11999999999 }).toString(),
                origem: 'MANUAL'
            }
        });
        leads.push(lead);
    }

    const totalVotes = 400;
    const suspiciousLimit = 70;
    const invalidLimit = 30;
    let sCount = 0;
    let iCount = 0;

    for (let i = 0; i < totalVotes; i++) {
        const isS = sCount < suspiciousLimit && Math.random() < 0.2;
        const isI = !isS && iCount < invalidLimit && Math.random() < 0.1;
        if (isS) sCount++;
        if (isI) iCount++;

        const fraudScore = isS ? faker.number.int({ min: 50, max: 90 }) : (isI ? 100 : faker.number.int({ min: 0, max: 15 }));
        const lead = Math.random() > 0.4 ? leads[Math.floor(Math.random() * leads.length)] : null;
        const date = faker.date.recent({ days: 15 });

        const resposta = await prisma.resposta.create({
            data: {
                enqueteId: enquete.id,
                formPublicId: enquete.formPublicId,
                leadId: lead?.id,
                ipAddress: isS ? '192.168.0.50' : faker.internet.ipv4(),
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/Seed',
                respondidoEm: date,
                dadosJson: {}
            }
        });

        const status = isS ? 'SUSPICIOUS' : (isI ? 'INVALID' : 'VALID');
        const reason = isS ? 'IP Flood detectado' : (isI ? 'Cadastro falso' : null);

        await prisma.$executeRaw`
            UPDATE "Resposta" 
            SET "status" = ${status}::"RespostaStatus", 
                "fraudScore" = ${fraudScore},
                "fraudReason" = ${reason}
            WHERE "id" = ${resposta.id};
        `;

        // Atribuir votos para 50% a 100% dos segmentos
        const numVotes = faker.number.int({ min: Math.ceil(allSegmentos.length / 2), max: allSegmentos.length });
        const shuffled = [...allSegmentos].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, numVotes);
        const json: any = {};

        for (const seg of selected) {
            const options = establishmentLookup[seg.id];
            // Criar um "vencedor" preferencial (o primeiro da lista tem 40% de chance)
            const chosenId = Math.random() < 0.4 ? options[0] : options[Math.floor(Math.random() * options.length)];

            await prisma.votoEstabelecimento.create({
                data: {
                    respostaId: resposta.id,
                    estabelecimentoId: chosenId,
                    segmentoId: seg.id,
                    campoId: `seg_${seg.slug}`
                }
            });
            json[`seg_${seg.slug}`] = chosenId;
        }

        await prisma.resposta.update({
            where: { id: resposta.id },
            data: { dadosJson: json }
        });
    }

    await prisma.$executeRaw`
        UPDATE "Enquete"
        SET "totalSuspicious" = ${sCount},
            "totalInvalid" = ${iCount}
        WHERE "id" = ${enquete.id};
    `;

    console.log(`✅ Seed Finalizado!
    - Enquete: ${enquete.titulo}
    - Segmentos: ${allSegmentos.length}
    - Estabelecimentos: ${allEstabelecimentos.length}
    - Votos Gerados: ${totalVotes}
    `);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
