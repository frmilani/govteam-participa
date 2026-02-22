import { PrismaClient, ModoAcesso, EnqueteStatus } from '@prisma/client';
import { fakerPT_BR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    const orgId = 'org-prefeitura-modelo-001';
    const userId = 'user-pref-admin-001';

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🏆 SEED ROBUSTO V2 - Prêmio Destaque 2025');
    console.log('  📊 10 Segmentos | 80+ Estabelecimentos | 20+ Leads');
    console.log('═══════════════════════════════════════════════════════════');

    // 1. LIMPEZA
    console.log('\n🧹 Limpando dados anteriores...');
    try {
        await prisma.votoEstabelecimento.deleteMany({ where: { resposta: { enquete: { organizationId: orgId } } } });
        await prisma.resposta.deleteMany({ where: { enquete: { organizationId: orgId } } });
        await prisma.trackingLink.deleteMany({ where: { campanha: { organizationId: orgId } } });
        await prisma.campanha.deleteMany({ where: { organizationId: orgId } });
        await prisma.enquete.deleteMany({ where: { organizationId: orgId } });
        await prisma.leadTag.deleteMany({ where: { lead: { organizationId: orgId } } });
        await prisma.tag.deleteMany({ where: { organizationId: orgId } });
        await prisma.lead.deleteMany({ where: { organizationId: orgId } });
        await prisma.estabelecimentoSegmento.deleteMany({ where: { segmento: { organizationId: orgId } } });
        await prisma.estabelecimento.deleteMany({ where: { organizationId: orgId } });
        await prisma.segmento.deleteMany({ where: { organizationId: orgId, paiId: { not: null } } });
        await prisma.segmento.deleteMany({ where: { organizationId: orgId } });
        await prisma.spokeConfig.deleteMany({ where: { organizationId: orgId } });
    } catch (error) {
        console.warn('⚠️  Aviso na limpeza:', error);
    }

    // 1.5 SPOKE CONFIG
    console.log('\n⚙️  Criando Spoke Config...');
    await prisma.spokeConfig.create({
        data: {
            organizationId: orgId,
        },
    });

    // 2. TAXONOMIA COMPLETA - 10 Segmentos com Sub-segmentos
    console.log('\n🏗️  Criando Segmentos e Estabelecimentos...');

    const taxonomy = [
        {
            group: 'Gastronomia', slug: 'gastronomia', color: '#EF4444', icon: 'Utensils',
            children: [
                { name: 'Melhor Restaurante', slug: 'melhor-restaurante' },
                { name: 'Melhor Pizzaria', slug: 'melhor-pizzaria' },
                { name: 'Melhor Churrascaria', slug: 'melhor-churrascaria' },
                { name: 'Melhor Hamburgueria', slug: 'melhor-hamburgueria' },
                { name: 'Melhor Doceria/Confeitaria', slug: 'melhor-doceria' },
                { name: 'Melhor Padaria', slug: 'melhor-padaria' },
                { name: 'Melhor Bar/Pub', slug: 'melhor-bar' },
                { name: 'Melhor Comida Japonesa', slug: 'melhor-japones' },
            ]
        },
        {
            group: 'Saúde e Bem-Estar', slug: 'saude-bem-estar', color: '#10B981', icon: 'HeartPulse',
            children: [
                { name: 'Melhor Clínica Médica', slug: 'melhor-clinica' },
                { name: 'Melhor Dentista', slug: 'melhor-dentista' },
                { name: 'Melhor Laboratório', slug: 'melhor-laboratorio' },
                { name: 'Melhor Fisioterapeuta', slug: 'melhor-fisio' },
                { name: 'Melhor Nutricionista', slug: 'melhor-nutricionista' },
                { name: 'Melhor Psicólogo(a)', slug: 'melhor-psicologo' },
                { name: 'Melhor Farmácia', slug: 'melhor-farmacia' },
                { name: 'Melhor Veterinário', slug: 'melhor-veterinario' },
            ]
        },
        {
            group: 'Beleza e Estética', slug: 'beleza-estetica', color: '#EC4899', icon: 'Sparkles',
            children: [
                { name: 'Melhor Salão de Beleza', slug: 'melhor-salao' },
                { name: 'Melhor Barbearia', slug: 'melhor-barbearia' },
                { name: 'Melhor Clínica de Estética', slug: 'melhor-estetica' },
                { name: 'Melhor Manicure/Pedicure', slug: 'melhor-manicure' },
                { name: 'Melhor Estúdio de Tatuagem', slug: 'melhor-tatuagem' },
                { name: 'Melhor Depilação', slug: 'melhor-depilacao' },
                { name: 'Melhor Maquiador(a)', slug: 'melhor-maquiador' },
                { name: 'Melhor Sobrancelha/Cílios', slug: 'melhor-sobrancelha' },
            ]
        },
        {
            group: 'Comércio Varejista', slug: 'comercio-varejista', color: '#F59E0B', icon: 'ShoppingBag',
            children: [
                { name: 'Melhor Loja de Roupas', slug: 'melhor-roupas' },
                { name: 'Melhor Loja de Calçados', slug: 'melhor-calcados' },
                { name: 'Melhor Supermercado', slug: 'melhor-supermercado' },
                { name: 'Melhor Pet Shop', slug: 'melhor-petshop' },
                { name: 'Melhor Ótica', slug: 'melhor-otica' },
                { name: 'Melhor Joalheria', slug: 'melhor-joalheria' },
                { name: 'Melhor Material de Construção', slug: 'melhor-material-construcao' },
                { name: 'Melhor Loja de Eletrônicos', slug: 'melhor-eletronicos' },
            ]
        },
        {
            group: 'Serviços Profissionais', slug: 'servicos-profissionais', color: '#3B82F6', icon: 'Briefcase',
            children: [
                { name: 'Melhor Escritório de Advocacia', slug: 'melhor-advocacia' },
                { name: 'Melhor Escritório de Contabilidade', slug: 'melhor-contabilidade' },
                { name: 'Melhor Imobiliária', slug: 'melhor-imobiliaria' },
                { name: 'Melhor Oficina Mecânica', slug: 'melhor-oficina' },
                { name: 'Melhor Agência de Marketing', slug: 'melhor-marketing' },
                { name: 'Melhor Fotógrafo(a)', slug: 'melhor-fotografo' },
                { name: 'Melhor Arquiteto(a)', slug: 'melhor-arquiteto' },
                { name: 'Melhor Empresa de TI', slug: 'melhor-ti' },
            ]
        },
        {
            group: 'Educação e Cultura', slug: 'educacao-cultura', color: '#8B5CF6', icon: 'GraduationCap',
            children: [
                { name: 'Melhor Escola de Idiomas', slug: 'melhor-idiomas' },
                { name: 'Melhor Escola Particular', slug: 'melhor-escola' },
                { name: 'Melhor Curso Preparatório', slug: 'melhor-cursinho' },
                { name: 'Melhor Escola de Música', slug: 'melhor-musica' },
                { name: 'Melhor Escola de Dança', slug: 'melhor-danca' },
                { name: 'Melhor Livraria', slug: 'melhor-livraria' },
            ]
        },
        {
            group: 'Fitness e Esporte', slug: 'fitness-esporte', color: '#F97316', icon: 'Dumbbell',
            children: [
                { name: 'Melhor Academia', slug: 'melhor-academia' },
                { name: 'Melhor Estúdio de Pilates', slug: 'melhor-pilates' },
                { name: 'Melhor CrossFit Box', slug: 'melhor-crossfit' },
                { name: 'Melhor Escola de Artes Marciais', slug: 'melhor-artes-marciais' },
                { name: 'Melhor Personal Trainer', slug: 'melhor-personal' },
                { name: 'Melhor Escola de Natação', slug: 'melhor-natacao' },
            ]
        },
        {
            group: 'Hotelaria e Turismo', slug: 'hotelaria-turismo', color: '#06B6D4', icon: 'Plane',
            children: [
                { name: 'Melhor Hotel', slug: 'melhor-hotel' },
                { name: 'Melhor Pousada', slug: 'melhor-pousada' },
                { name: 'Melhor Agência de Viagens', slug: 'melhor-agencia-viagens' },
                { name: 'Melhor Espaço para Eventos', slug: 'melhor-eventos' },
                { name: 'Melhor Buffet', slug: 'melhor-buffet' },
                { name: 'Melhor Decorador(a)', slug: 'melhor-decorador' },
            ]
        },
        {
            group: 'Automotivo', slug: 'automotivo', color: '#64748B', icon: 'Car',
            children: [
                { name: 'Melhor Concessionária', slug: 'melhor-concessionaria' },
                { name: 'Melhor Lava-Jato', slug: 'melhor-lavajato' },
                { name: 'Melhor Autopeças', slug: 'melhor-autopecas' },
                { name: 'Melhor Funilaria/Pintura', slug: 'melhor-funilaria' },
                { name: 'Melhor Borracharia', slug: 'melhor-borracharia' },
                { name: 'Melhor Auto Elétrica', slug: 'melhor-auto-eletrica' },
            ]
        },
        {
            group: 'Serviço Público', slug: 'servico-publico', color: '#0EA5E9', icon: 'Landmark',
            children: [
                { name: 'Melhor Secretaria Municipal', slug: 'melhor-secretaria' },
                { name: 'Melhor Unidade de Saúde', slug: 'melhor-ubs' },
                { name: 'Melhor Escola Pública', slug: 'melhor-escola-publica' },
                { name: 'Melhor CRAS', slug: 'melhor-cras' },
                { name: 'Melhor Atendimento ao Cidadão', slug: 'melhor-atendimento' },
                { name: 'Servidor Destaque do Ano', slug: 'servidor-destaque' },
            ]
        },
    ];

    // Realistic establishment names per category
    const establishmentNames: Record<string, string[]> = {
        'melhor-restaurante': ['Restaurante Sabor da Terra', 'Cantina Italiana Nonna Rosa', 'Bistrô do Chef André', 'Restaurante Fogão Mineiro', 'Casa do Peixe Goiano', 'Empório Gourmet Cerrado', 'Restaurante Raízes', 'Sabores do Araguaia'],
        'melhor-pizzaria': ['Pizzaria Forno a Lenha', 'Pizza Express Goiânia', 'Pizzaria Bella Napoli', 'Don Corleone Pizzas', 'Pizzaria Massa Madre', 'Slice Pizza Artesanal', 'Pizzaria Tradição', 'Forno & Massa'],
        'melhor-churrascaria': ['Churrascaria Boi na Brasa', 'Gaúcho Grill Premium', 'Churrascaria Fogo de Chão', 'Espeto & Cia', 'Churrascaria Sabor Goiano', 'Picanha do Cerrado', 'Churrascaria Tropeiro', 'Brasa Viva Steakhouse'],
        'melhor-hamburgueria': ['Burger Lab Goiânia', 'Smash Burger Co.', 'The Burger Joint', 'Artesanal Burgers', 'Hambúrguer do Cerrado', 'Grill House Burgers', 'Blend Burger Bar', 'Five Guys Goiânia'],
        'melhor-clinica': ['Clínica São Lucas', 'Instituto Médico Goiânia', 'Clínica Vida Nova', 'Centro Médico Cerrado', 'Clínica Saúde Total', 'Instituto de Cardiologia', 'Clínica Dermatológica Pele', 'Centro de Diagnóstico Avançado'],
        'melhor-dentista': ['Odonto Excellence', 'Sorriso Perfeito', 'Clínica Oral Premium', 'Dr. Marcos Odontologia', 'Dental Center Goiânia', 'Implante & Estética Oral', 'Clínica do Sorriso', 'OdontoVida'],
        'melhor-salao': ['Studio Hair Design', 'Beleza Pura Salon', 'Espaço Glamour', 'Hair & Beauty Goiânia', 'Studio Conceito', 'Salão Elegance', 'Beauty House', 'Espaço Transformação'],
        'melhor-barbearia': ['Barbearia Old School', 'The Barber Shop', 'Barbearia do Zé', 'Corte & Estilo', 'Barbearia Vintage', 'Barba Negra', 'Barbearia Premium', 'Navalha de Ouro'],
        'melhor-supermercado': ['Supermercado Bretas', 'Carrefour Goiânia', 'Atacadão Cerrado', 'Supermercado Tatico', 'Hiper Moreira', 'Supermercado Pão de Açúcar', 'Atacarejo Goiás', 'Supermercado Mais Barato'],
        'melhor-academia': ['Smart Fit Goiânia', 'Academia Corpo & Mente', 'Iron Gym', 'Bodytech Goiânia', 'Academia Fitness Center', 'Mega Gym', 'Academia Saúde Total', 'Power Gym Goiânia'],
        'melhor-hotel': ['Hotel Castro\'s Park', 'Comfort Suites Goiânia', 'Hotel Deville Prime', 'Ibis Styles Goiânia', 'Hotel Mercure Goiânia', 'Bourbon Convention', 'Hotel Araguaia', 'Quality Hotel Goiânia'],
        'melhor-secretaria': ['Secretaria de Saúde (SMS)', 'Secretaria de Educação (SME)', 'Secretaria de Finanças (SEFIN)', 'Secretaria de Mobilidade (SMM)', 'Secretaria de Assistência Social (SEMAS)', 'Secretaria de Inovação (SICT)', 'Secretaria de Cultura (SECULT)', 'Secretaria de Esportes (SMEL)'],
    };

    const allSegmentos: any[] = [];
    const allEstabelecimentos: any[] = [];
    const establishmentLookup: Record<string, string[]> = {};

    for (const group of taxonomy) {
        const parent = await prisma.segmento.create({
            data: {
                organizationId: orgId,
                nome: group.group,
                slug: group.slug,
                cor: group.color,
                icone: group.icon,
                ordem: taxonomy.indexOf(group) + 1,
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
                    ordem: group.children.indexOf(child) + 1,
                }
            });
            allSegmentos.push(segment);
            establishmentLookup[segment.id] = [];

            // Get realistic names or generate with faker
            const names = establishmentNames[child.slug] || [];
            const numEstabs = Math.max(8, names.length);

            for (let i = 0; i < numEstabs; i++) {
                const name = names[i] || faker.company.name();
                const alias = name.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]/g, '_')
                    .replace(/_+/g, '_')
                    .replace(/^_|_$/g, '');

                const bairros = ['Setor Bueno', 'Setor Marista', 'Jardim Goiás', 'Setor Oeste', 'Setor Sul', 'Setor Central', 'Setor Universitário', 'Alphaville Flamboyant', 'Park Lozandes', 'Setor Pedro Ludovico'];

                const estab = await prisma.estabelecimento.create({
                    data: {
                        organizationId: orgId,
                        nome: name,
                        alias: `${alias}_${i}`,
                        descricao: faker.company.catchPhrase(),
                        ativo: true,
                        endereco: `${faker.location.street()}, ${faker.number.int({ min: 1, max: 3000 })}, ${bairros[i % bairros.length]} - Goiânia/GO`,
                        telefone: `(62) ${faker.number.int({ min: 3000, max: 3999 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
                        whatsapp: `(62) 9${faker.number.int({ min: 8000, max: 9999 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
                        website: Math.random() > 0.3 ? `https://www.${alias.replace(/_/g, '')}.com.br` : null,
                        instagram: Math.random() > 0.2 ? `@${alias.replace(/_/g, '')}` : null,
                        facebook: Math.random() > 0.5 ? `https://facebook.com/${alias.replace(/_/g, '')}` : null,
                        logoUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}&backgroundColor=${group.color.replace('#', '')}`,
                    }
                });

                await prisma.estabelecimentoSegmento.create({
                    data: {
                        estabelecimentoId: estab.id,
                        segmentoId: segment.id,
                    }
                });

                allEstabelecimentos.push(estab);
                establishmentLookup[segment.id].push(estab.id);
            }
        }
        console.log(`   ✅ ${group.group}: ${group.children.length} sub-segmentos, ${group.children.length * 8}+ estabelecimentos`);
    }

    // 3. TAGS
    console.log('\n🏷️  Criando Tags...');
    const tagNames = [
        'votou-2025', 'newsletter', 'whatsapp-ativo', 'indicado-por-amigo',
        'participou-2024', 'vip', 'comerciante', 'servidor-publico',
        'influenciador', 'parceiro', 'primeiro-voto', 'engajado',
    ];
    const tags: any[] = [];
    for (const tagName of tagNames) {
        const tag = await prisma.tag.create({
            data: { organizationId: orgId, nome: tagName }
        });
        tags.push(tag);
    }

    // Mandatory Gender Tags
    const genderTags = [
        { nome: 'Homem', cor: '#3B82F6' },
        { nome: 'Mulher', cor: '#EC4899' },
        { nome: 'Outros / N.I.', cor: '#94A3B8' }
    ];
    const genderTagMap: Record<string, any> = {};
    for (const gt of genderTags) {
        genderTagMap[gt.nome] = await prisma.tag.create({
            data: { organizationId: orgId, nome: gt.nome, cor: gt.cor }
        });
    }

    // 4. LEADS (35+)
    console.log('\n👥 Criando Leads with Gender Tags...');
    const leads: any[] = [];
    const origens = ['MANUAL', 'FORMULARIO_WEB', 'IMPORTACAO'] as const;

    for (let i = 0; i < 35; i++) {
        const sexo = Math.random() > 0.5 ? 'M' : 'F';
        const lead = await prisma.lead.create({
            data: {
                organizationId: orgId,
                nome: faker.person.fullName({ sex: sexo === 'M' ? 'male' : 'female' }),
                email: faker.internet.email({ provider: 'gmail.com' }),
                whatsapp: `62${faker.number.int({ min: 980000000, max: 999999999 })}`,
                sexo: sexo,
                origem: origens[Math.floor(Math.random() * origens.length)],
            }
        });
        leads.push(lead);

        // Assign Gender Tag
        await prisma.leadTag.create({
            data: {
                leadId: lead.id,
                tagId: sexo === 'M' ? genderTagMap['Homem'].id : genderTagMap['Mulher'].id
            }
        });

        // Assign 1-3 random tags
        const numTags = faker.number.int({ min: 1, max: 3 });
        const shuffledTags = [...tags].sort(() => 0.5 - Math.random()).slice(0, numTags);
        for (const tag of shuffledTags) {
            await prisma.leadTag.create({
                data: { leadId: lead.id, tagId: tag.id }
            });
        }
    }
    console.log(`   ✅ ${leads.length} leads criados com tags`);

    // 5. ENQUETE PRINCIPAL (created before campanhas since they require enqueteId)
    console.log('\n📝 Criando Enquete Oficial...');
    const enquete = await prisma.enquete.create({
        data: {
            organizationId: orgId,
            titulo: 'Prêmio Destaque Goiânia 2025 - Edição Oficial',
            descricao: 'A maior premiação da cidade! Vote nos melhores estabelecimentos e profissionais de Goiânia. Seu voto reconhece a excelência e fortalece o comércio local. Participe e ajude a eleger os destaques de 2025!',
            formPublicId: 'premio-destaque-goiania-2025',
            hubFormId: 'hub_form_premio_destaque_2025',
            status: EnqueteStatus.PUBLICADA,
            modoAcesso: ModoAcesso.PUBLICO,
            minCompleteness: 15,
            criadoPor: userId,
            paginaAgradecimento: {
                titulo: '🎉 Voto Confirmado com Sucesso!',
                mensagem: 'Obrigado por participar do Prêmio Destaque Goiânia 2025! Seu voto é fundamental para reconhecer os melhores da nossa cidade. Compartilhe com seus amigos e ajude a fortalecer o comércio local!',
                showShareButtons: true,
                shareText: 'Acabei de votar no Prêmio Destaque Goiânia 2025! Vote você também:',
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
                primaryColor: '#B45309',
                secondaryColor: '#D97706',
                template: 'modern',
                logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=PremioDestaque2025&backgroundColor=B45309',
                bannerUrl: 'https://placehold.co/1200x400/B45309/FFFFFF?text=Premio+Destaque+Goiania+2025',
                fontFamily: 'Inter',
            },
        }
    });

    // 6. CAMPANHAS
    console.log('\n📢 Criando Campanhas...');
    const campanhaData = [
        { nome: 'Lançamento Prêmio Destaque 2025', template: 'Olá {nome}! O Prêmio Destaque Goiânia 2025 começou! Vote nos seus favoritos: {link}' },
        { nome: 'WhatsApp - Vote Agora!', template: '🏆 {nome}, vote agora no Prêmio Destaque 2025! Acesse: {link}' },
        { nome: 'Última Semana - Urgência', template: '⏰ {nome}, faltam poucos dias! Vote no Prêmio Destaque: {link}' },
    ];

    for (const camp of campanhaData) {
        const campanha = await prisma.campanha.create({
            data: {
                organizationId: orgId,
                nome: camp.nome,
                enqueteId: enquete.id,
                templateMensagem: camp.template,
                segmentacao: { tags: [], filtros: {} },
                status: 'CONCLUIDA',
                criadoPor: userId,
                totalLeads: faker.number.int({ min: 100, max: 500 }),
                totalEnviados: faker.number.int({ min: 80, max: 450 }),
                totalVisualizados: faker.number.int({ min: 50, max: 300 }),
                totalRespondidos: faker.number.int({ min: 20, max: 150 }),
                totalFalhados: faker.number.int({ min: 0, max: 20 }),
            }
        });

        // Create tracking links for each campaign (requires a lead)
        for (let i = 0; i < 5 && i < leads.length; i++) {
            await prisma.trackingLink.create({
                data: {
                    campanhaId: campanha.id,
                    leadId: leads[i].id,
                    hash: `${camp.nome.substring(0, 3).toLowerCase()}_${faker.string.alphanumeric(16)}`,
                    formPublicId: enquete.formPublicId,
                    expiraEm: new Date('2025-12-31'),
                    status: 'RESPONDIDO',
                    enviadoEm: faker.date.past(),
                    visualizadoEm: faker.date.recent(),
                    respondidoEm: faker.date.recent(),
                }
            });
        }
    }
    console.log(`   ✅ ${campanhaData.length} campanhas com tracking links`);

    // 7. VOTOS REALISTAS
    console.log('\n🗳️  Gerando votos realistas...');
    const totalVotes = 500;
    let validCount = 0;
    let suspiciousCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < totalVotes; i++) {
        const isSuspicious = suspiciousCount < 80 && Math.random() < 0.18;
        const isInvalid = !isSuspicious && invalidCount < 40 && Math.random() < 0.1;
        if (isSuspicious) suspiciousCount++;
        else if (isInvalid) invalidCount++;
        else validCount++;

        const fraudScore = isSuspicious
            ? faker.number.int({ min: 50, max: 90 })
            : isInvalid
                ? faker.number.int({ min: 91, max: 100 })
                : faker.number.int({ min: 0, max: 15 });

        const lead = Math.random() > 0.3 ? leads[Math.floor(Math.random() * leads.length)] : null;
        const date = faker.date.between({ from: '2025-01-15', to: '2025-07-15' });

        const userAgents = [
            'Mozilla/5.0 (Linux; Android 13; SM-A546B) AppleWebKit/537.36 Chrome/120.0',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 Safari/17.2',
            'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0',
        ];

        const resposta = await prisma.resposta.create({
            data: {
                enqueteId: enquete.id,
                formPublicId: enquete.formPublicId,
                leadId: lead?.id,
                ipAddress: isSuspicious ? '192.168.0.50' : faker.internet.ipv4(),
                userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
                respondidoEm: date,
                dadosJson: {},
            }
        });

        const status = isSuspicious ? 'SUSPICIOUS' : isInvalid ? 'INVALID' : 'VALID';
        const reason = isSuspicious ? 'IP Flood detectado - múltiplos votos do mesmo IP' : isInvalid ? 'Cadastro suspeito - dados inconsistentes' : null;

        await prisma.$executeRaw`
            UPDATE "Resposta"
            SET "status" = ${status}::"RespostaStatus",
                "fraudScore" = ${fraudScore},
                "fraudReason" = ${reason}
            WHERE "id" = ${resposta.id};
        `;

        // Vote in 40-100% of segments
        const numVotes = faker.number.int({ min: Math.ceil(allSegmentos.length * 0.4), max: allSegmentos.length });
        const shuffled = [...allSegmentos].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, numVotes);
        const json: any = {};

        for (const seg of selected) {
            const options = establishmentLookup[seg.id];
            if (!options || options.length === 0) continue;
            // First establishment has 35% chance (creates a "winner")
            const chosenId = Math.random() < 0.35 ? options[0] : options[Math.floor(Math.random() * options.length)];

            await prisma.votoEstabelecimento.create({
                data: {
                    respostaId: resposta.id,
                    estabelecimentoId: chosenId,
                    segmentoId: seg.id,
                    campoId: `seg_${seg.slug}`,
                }
            });
            json[`seg_${seg.slug}`] = chosenId;
        }

        await prisma.resposta.update({
            where: { id: resposta.id },
            data: { dadosJson: json },
        });

        if ((i + 1) % 100 === 0) {
            console.log(`   📊 ${i + 1}/${totalVotes} votos processados...`);
        }
    }

    // Update enquete totals
    await prisma.$executeRaw`
        UPDATE "Enquete"
        SET "totalSuspicious" = ${suspiciousCount},
            "totalInvalid" = ${invalidCount}
        WHERE "id" = ${enquete.id};
    `;

    // 8. RESUMO
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  ✅ SEED ROBUSTO V2 CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Resumo:`);
    console.log(`   🏷️  ${taxonomy.length} Segmentos principais`);
    console.log(`   📂 ${allSegmentos.length} Sub-segmentos`);
    console.log(`   🏪 ${allEstabelecimentos.length} Estabelecimentos`);
    console.log(`   👥 ${leads.length} Leads com tags`);
    console.log(`   📢 ${campanhaData.length} Campanhas com tracking`);
    console.log(`   🏷️  ${tags.length} Tags`);
    console.log(`   📝 1 Enquete: "${enquete.titulo}"`);
    console.log(`   🗳️  ${totalVotes} Votos (${validCount} válidos, ${suspiciousCount} suspeitos, ${invalidCount} inválidos)`);
    console.log(`\n🆔 Enquete ID: ${enquete.id}`);
    console.log(`🆔 Org ID: ${orgId}`);
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
