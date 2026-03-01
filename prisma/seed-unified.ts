import { PrismaClient, ModoAcesso, EnqueteStatus } from '@prisma/client';
import { fakerPT_BR as faker } from '@faker-js/faker';
import { metaphone } from "@oloko64/metaphone-ptbr-node";

const prisma = new PrismaClient();

const STOP_WORDS = new Set([
    "o", "a", "os", "as",
    "do", "da", "dos", "das", "de", "di",
    "no", "na", "nos", "nas", "em",
    "um", "uma", "uns", "umas",
    "e", "ou", "com", "para", "por", "sem", "ltda", "me", "cia"
]);

function removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Helper para metaphone similar ao do sistema
function getPhoneticKeys(text: string): string[] {
    if (!text) return [];
    try {
        const normalized = removeAccents(text.toLowerCase());
        const words = normalized.replace(/[^a-z0-9\s]/g, " ").trim().split(/\s+/);

        const metaphones = words
            .filter(word => !STOP_WORDS.has(word) && word.length > 0)
            .map(word => metaphone(word) || "")
            .filter(m => m.length > 0);

        metaphones.sort();
        return metaphones;
    } catch {
        return [];
    }
}

async function main() {
    // IDs Sincronizados com o HUB Real do Usuário
    const orgId = 'org-acieo-01'; // Associação Comercial e Industrial de Espigão do Oeste
    const userId = 'admin@acieo.com'; // User admin da ACIEO

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🏆 SEED PARTICIPA UNIFICADO - Demo Top of Mind & Metaphone');
    console.log('  🎯 Pesquisa: PREMIACAO | Coleta: TOP OF MIND PURO');
    console.log('═══════════════════════════════════════════════════════════');

    console.log('\n🧹 Limpando dados da org acieo...');
    try {
        await (prisma as any).votoLivre.deleteMany({ where: { resposta: { enquete: { organizationId: orgId } } } });
        await prisma.votoEstabelecimento.deleteMany({ where: { resposta: { enquete: { organizationId: orgId } } } });
        await prisma.resposta.deleteMany({ where: { enquete: { organizationId: orgId } } });
        await prisma.trackingLink.deleteMany({ where: { campanha: { organizationId: orgId } } });
        await prisma.campanha.deleteMany({ where: { organizationId: orgId } });
        await prisma.enquete.deleteMany({ where: { organizationId: orgId } });
        await (prisma as any).distribuicaoRotativa?.deleteMany({ where: { enqueteId: { not: "" } } });
        await prisma.leadTag.deleteMany({ where: { lead: { organizationId: orgId } } });
        await prisma.tag.deleteMany({ where: { organizationId: orgId } });
        await prisma.lead.deleteMany({ where: { organizationId: orgId } });
        await prisma.estabelecimentoSegmento.deleteMany({ where: { segmento: { organizationId: orgId } } });
        await prisma.estabelecimento.deleteMany({ where: { organizationId: orgId } });
        await prisma.segmento.deleteMany({ where: { organizationId: orgId, paiId: { not: null } } });
        await prisma.segmento.deleteMany({ where: { organizationId: orgId } });
        await prisma.spokeConfig.deleteMany({ where: { organizationId: orgId } });
    } catch (error) {
        console.warn('⚠️  Aviso na limpeza (alguns modelos podem estar vazios):', error);
    }

    // 1.5 SPOKE CONFIG
    await prisma.spokeConfig.upsert({
        where: { organizationId: orgId },
        update: {},
        create: { id: `config-${orgId}`, organizationId: orgId }
    });

    console.log('\n🏗️  Criando estrutura de Segmentos e Categorias (Taxonomia)...');

    // 2. Definir Taxonomia Completa (Importado do seed-robust.ts)
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
    let orderParent = 1;

    for (const group of taxonomy) {
        const parent = await prisma.segmento.create({
            data: {
                organizationId: orgId,
                nome: group.group,
                slug: group.slug,
                cor: group.color,
                icone: group.icon,
                ordem: orderParent++,
            }
        });

        let orderChild = 1;
        for (const child of group.children) {
            const segment = await prisma.segmento.create({
                data: {
                    organizationId: orgId,
                    nome: child.name,
                    slug: child.slug,
                    cor: group.color,
                    icone: group.icon,
                    paiId: parent.id,
                    ordem: orderChild++,
                }
            });
            allSegmentos.push(segment);
            // Não criamos estabelecimentos neste seed pois o modo de coleta é "Top of Mind"
        }
    }

    // Isolar as categorias das quais faremos mock de votos baseados no seed-v2:
    const subPizzaria = allSegmentos.find(s => s.slug === 'pizzarias');
    const subRestaurante = allSegmentos.find(s => s.slug === 'restaurantes');
    const subOficina = allSegmentos.find(s => s.slug === 'oficinas-mecanicas');

    if (!subPizzaria || !subRestaurante || !subOficina) {
        console.error("Erro: Sub-segmentos (pizzarias, restaurantes, oficinas-mecanicas) não encontrados na taxonomia!");
        process.exit(1);
    }

    // 3. ENQUETE DEMO (Top of Mind Puro)
    console.log('\n📝 Criando Enquete Participa (Top of Mind)...');
    const enquete = await prisma.enquete.create({
        data: {
            organizationId: orgId,
            titulo: 'Prêmio Destaque 2025 - Top of Mind',
            descricao: 'Demo do algoritmo de consolidação fonética e Top of Mind puro com taxonomia completa.',
            formPublicId: 'participa-demo-2025',
            hubFormId: 'hub_form_demo_2025',
            status: EnqueteStatus.PUBLICADA,
            modoAcesso: ModoAcesso.PUBLICO,
            tipoPesquisa: 'premiacao',
            modoColeta: 'top-of-mind', // Top of Mind Puro
            usarPremiacao: true,
            minCompleteness: 0, // Pra demo aceitar qualquer coisa
            criadoPor: userId,
            paginaAgradecimento: {
                titulo: '🎉 Voto Confirmado!',
                mensagem: 'Obrigado por testar o sistema Participa.',
                showShareButtons: true,
            },
            configVisual: {
                primaryColor: '#EF4444',
                template: 'modern',
            },
            // Vinculamos apenas as categorias-filhas na enquete
            segmentos: {
                connect: allSegmentos.map(s => ({ id: s.id }))
            }
        }
    });

    // 4. LEADS PARA VOTOS
    console.log('\n👥 Criando Leads para a Demo...');
    const leads: any[] = [];
    for (let i = 0; i < 20; i++) {
        const lead = await prisma.lead.create({
            data: {
                organizationId: orgId,
                nome: faker.person.fullName(),
                whatsapp: `119${faker.number.int({ min: 10000000, max: 99999999 })}`,
                statusVerificacao: 'VERIFICADO',
            }
        });
        leads.push(lead);
    }

    // 5. GERAR VOTOS LIVRES COM VARIAÇÕES
    console.log('\n🗳️  Gerando Votos Livres com variações metafonéticas...');

    const variacoesZe = [
        "Pizzaria do Zé", "Pizzaria do Zé", "Pisaria do Zé", "Pizaria do Se",
        "Pizzaria do Zé", "Pizaria do Ze", "Zé Pizzaria", "Pizzeria do Jose", "Pizzaria do Jose"
    ];

    const variacoesSabor = [
        "Restaurante Sabor da Terra", "Restaurante Sabor da Terra", "Sabor da Terra Restaurante",
        "Restorante Sabor da Terra", "Restaurente Sabor de Terra", "Sabur da Tera"
    ];

    const variacoesTonhao = [
        "Oficina do Tonhão", "Oficina do Tonhao", "Ofecina do Tonhão",
        "Tonhão Oficina", "Oficina do Tunhao"
    ];

    let voteCount = 0;

    for (let i = 0; i < variacoesZe.length; i++) {
        const lead = leads[i % leads.length];
        const texto = variacoesZe[i];

        const resp = await prisma.resposta.create({
            data: {
                enqueteId: enquete.id,
                formPublicId: enquete.formPublicId,
                leadId: lead.id,
                dadosJson: { [`voto_${subPizzaria.slug}`]: texto },
                votoValido: true,
                percentualConclusao: 100,
            }
        });

        await (prisma as any).votoLivre.create({
            data: {
                respostaId: resp.id,
                categoriaId: subPizzaria.id,
                textoOriginal: texto,
                chavesFoneticas: getPhoneticKeys(texto)
            }
        });
        voteCount++;
    }

    for (let i = 0; i < variacoesSabor.length; i++) {
        const lead = leads[(i + 5) % leads.length];
        const texto = variacoesSabor[i];

        const resp = await prisma.resposta.create({
            data: {
                enqueteId: enquete.id,
                formPublicId: enquete.formPublicId,
                leadId: lead.id,
                dadosJson: { [`voto_${subRestaurante.slug}`]: texto },
                votoValido: true,
                percentualConclusao: 100,
            }
        });

        await (prisma as any).votoLivre.create({
            data: {
                respostaId: resp.id,
                categoriaId: subRestaurante.id,
                textoOriginal: texto,
                chavesFoneticas: getPhoneticKeys(texto)
            }
        });
        voteCount++;
    }

    for (let i = 0; i < variacoesTonhao.length; i++) {
        const lead = leads[(i + 10) % leads.length];
        const texto = variacoesTonhao[i];

        const resp = await prisma.resposta.create({
            data: {
                enqueteId: enquete.id,
                formPublicId: enquete.formPublicId,
                leadId: lead.id,
                dadosJson: { [`voto_${subOficina.slug}`]: texto },
                votoValido: true,
                percentualConclusao: 100,
            }
        });

        await (prisma as any).votoLivre.create({
            data: {
                respostaId: resp.id,
                categoriaId: subOficina.id,
                textoOriginal: texto,
                chavesFoneticas: getPhoneticKeys(texto)
            }
        });
        voteCount++;
    }

    console.log(`   ✅ ${voteCount} Votos Livres (Top of Mind) gerados.`);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  ✨ SEED PARTICIPA UNIFICADO CONCLUÍDO!');
    console.log(`  🔗 Enquete ID: ${enquete.id}`);
    console.log(`  🏢 Org ID: ${orgId}`);
    console.log('  👉 Vá em Enquetes > Gerenciar > Sala de Consolidação');
    console.log('═══════════════════════════════════════════════════════════');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
