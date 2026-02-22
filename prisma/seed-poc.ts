
import { PrismaClient, ModoAcesso, EnqueteStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const orgId = 'org-acieo-01'; // Matches Hub seed
    const userId = 'admin@acieo.com'; // Matches Hub seed user

    console.log('🌱 Starting POC Seed for Prêmio Destaque (ACIEO)...');

    // 1. Clear ALL Data (Aggressive Truncate for Spoke)
    console.log('🧹 Cleaning ALL spoke data to avoid orphans...');
    try {
        await prisma.votoEstabelecimento.deleteMany({});
        await prisma.resposta.deleteMany({});
        await prisma.campanha.deleteMany({});
        await prisma.trackingLink.deleteMany({});
        await prisma.leadTag.deleteMany({});
        await prisma.tag.deleteMany({});
        await prisma.lead.deleteMany({});
        await prisma.enquete.deleteMany({});
        await prisma.estabelecimentoSegmento.deleteMany({});
        await prisma.estabelecimento.deleteMany({});
        await prisma.segmento.deleteMany({});
        console.log('✅ Clean slate.');
    } catch (e) {
        console.warn("⚠️ Warning during cleanup:", e);
    }

    // 2. Data from acieo.md
    const segmentosData = [
        { "id": "seg-saude", "nome": "Saúde e Bem-Estar", "slug": "saude-bem-estar", "paiId": null, "icone": "Heart", "cor": "#EF4444" },
        { "id": "seg-farmacia", "nome": "Farmácias e Drogarias", "slug": "farmacias", "paiId": "seg-saude", "icone": "Pill" },
        { "id": "seg-odonto", "nome": "Odontologia", "slug": "odontologia", "paiId": "seg-saude", "icone": "Smile" },
        { "id": "seg-hospital", "nome": "Hospitais e Clínicas", "slug": "hospitais-clinicas", "paiId": "seg-saude", "icone": "Activity" },
        { "id": "seg-laboratorio", "nome": "Laboratórios de Análises", "slug": "laboratorios", "paiId": "seg-saude", "icone": "FlaskConical" },
        { "id": "seg-estetica", "nome": "Estética, Pilates e Bem-Estar", "slug": "estetica-bem-estar", "paiId": "seg-saude", "icone": "Sparkles" },
        { "id": "seg-alimentacao", "nome": "Alimentação", "slug": "alimentacao", "paiId": null, "icone": "Utensils", "cor": "#F59E0B" },
        { "id": "seg-restaurante", "nome": "Restaurantes e Lanchonetes", "slug": "restaurantes", "paiId": "seg-alimentacao", "icone": "Soup" },
        { "id": "seg-mercado", "nome": "Supermercados e Padarias", "slug": "mercados", "paiId": "seg-alimentacao", "icone": "ShoppingBasket" },
        { "id": "seg-comercio", "nome": "Comércio Local", "slug": "comercio", "paiId": null, "icone": "Store", "cor": "#3B82F6" },
        { "id": "seg-posto", "nome": "Postos de Combustível", "slug": "postos", "paiId": "seg-comercio", "icone": "Fuel" },
        { "id": "seg-lojas", "nome": "Lojas e Variedades", "slug": "lojas", "paiId": "seg-comercio", "icone": "ShoppingBag" },
        { "id": "seg-servicos", "nome": "Serviços e Instituições", "slug": "servicos", "paiId": null, "icone": "Briefcase", "cor": "#6366F1" },
        { "id": "seg-agro", "nome": "Agronegócio e Veterinária", "slug": "agronegocio", "paiId": "seg-servicos", "icone": "Tractor" },
        { "id": "seg-institucional", "nome": "Institucional e Utilidade Pública", "slug": "institucional", "paiId": "seg-servicos", "icone": "Building2" }
    ];

    const estabelecimentosData = [
        { "id": "est-farm-saojose", "nome": "Farmácia São José", "descricao": "Higiene e Beleza. Email: fsjeoe@outlook.com", "endereco": "Av. Sete de Setembro, 2587 - Centro", "telefone": "(69) 3481-2356", "whatsapp": "(69) 99972-7966" },
        { "id": "est-farm-ultra", "nome": "Drogarias Ultra Popular", "descricao": "Rede de farmácias com preços populares.", "endereco": "Av. Sete de Setembro, 2760 - Centro", "website": "tiendeo.com.br" },
        { "id": "est-farm-zezinho", "nome": "Farmácia do Zezinho", "descricao": "Cadastro CNES.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-farm-entrefolhas", "nome": "Drogaria Entre Folhas", "descricao": "Drogaria local. Registro ACIEO.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-farm-farmacertta", "nome": "Farmacertta Drugstore", "descricao": "Farmácia e Drugstore. Registro ACIEO.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-odonto-arco", "nome": "Arco Odontologia", "descricao": "Clínica Geral Odontológica.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-odonto-centrodonto", "nome": "Centrodonto", "descricao": "Serviços odontológicos.", "endereco": "Espigão do Oeste" },
        { "id": "est-odonto-bem", "nome": "Odonto Bem", "endereco": "Espigão do Oeste" },
        { "id": "est-odonto-clin", "nome": "Odontoclin", "endereco": "Espigão do Oeste" },
        { "id": "est-odonto-oralmed", "nome": "Oralmed Odontologia", "descricao": "Odontologia Especializada.", "endereco": "Espigão do Oeste" },
        { "id": "est-odonto-sorriso", "nome": "Sorriso Popular", "endereco": "Espigão do Oeste" },
        { "id": "est-odonto-bruno", "nome": "Clin. Odont. Dr. Bruno Willian", "endereco": "Espigão do Oeste" },
        { "id": "est-hosp-santacecilia", "nome": "Hospital Santa Cecília", "descricao": "Hospital e Clínica Particular. Atendimento 24h.", "endereco": "Rua Acre, 2926 - Vista Alegre", "telefone": "(69) 98481-7632" },
        { "id": "est-hosp-angelina", "nome": "Hospital Municipal Angelina Georgetti", "descricao": "Saúde Pública e Emergência.", "endereco": "Rua Paraná, 3357 - Liberdade", "telefone": "(69) 3912-8054", "whatsapp": "(69) 99295-8772" },
        { "id": "est-clin-clileal", "nome": "Clileal", "descricao": "Clínica médica. Registro ACIEO.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-clin-face", "nome": "Clínica da Face", "endereco": "Espigão do Oeste" },
        { "id": "est-clin-familia", "nome": "Clínica da Família", "endereco": "Espigão do Oeste" },
        { "id": "est-lab-labcenter", "nome": "Labcenter", "endereco": "Espigão do Oeste" },
        { "id": "est-lab-biolab", "nome": "Laboratório Biolab", "endereco": "Espigão do Oeste" },
        { "id": "est-lab-brasil", "nome": "Laboratório Brasil", "endereco": "Espigão do Oeste" },
        { "id": "est-lab-central", "nome": "Laboratório Central", "endereco": "Espigão do Oeste" },
        { "id": "est-lab-quality", "nome": "Laboratório Quality", "endereco": "Espigão do Oeste" },
        { "id": "est-lab-lutz", "nome": "Lutz Laboratório", "endereco": "Espigão do Oeste" },
        { "id": "est-est-estetica", "nome": "Estética", "descricao": "Salão de Beleza e Estética.", "endereco": "Espigão do Oeste" },
        { "id": "est-est-fisiopilates", "nome": "Fisiopilates", "descricao": "Bem-estar e Pilates.", "endereco": "Espigão do Oeste" },
        { "id": "est-est-morena", "nome": "Morena Studio de Pilates", "descricao": "Estética e Pilates.", "endereco": "Espigão do Oeste" },
        { "id": "est-est-vidaplena", "nome": "Vida Plena", "descricao": "Centro de Bem-estar.", "endereco": "Espigão do Oeste" },
        { "id": "est-est-anecarine", "nome": "Ane Carine Loch Seconelli", "descricao": "Psicologia e Saúde.", "endereco": "Rua Mato Grosso, 1890" },
        { "id": "est-rest-modelo", "nome": "Restaurante Modelo", "descricao": "Marmitaria e Comida Saudável.", "endereco": "Espigão do Oeste - Centro", "telefone": "(69) 3481-1283" },
        { "id": "est-rest-saboriarte", "nome": "Saboriarte", "descricao": "Gastronomia. Registro ACIEO.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-rest-acai", "nome": "Açaí da Terra", "descricao": "Lanchonete.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-rest-oneway", "nome": "One Way Sanduicheria", "descricao": "Sanduicheria e Lanchonete.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-rest-menudino", "nome": "MenuDino Espigão", "descricao": "Plataforma Digital de Delivery.", "website": "menudino.com" },
        { "id": "est-pad-modelo", "nome": "Panificadora Modelo", "descricao": "Panificação e Confeitaria.", "endereco": "Av. Sete de Setembro, 1500 - Vista Alegre", "telefone": "(69) 3481-3266" },
        { "id": "est-merc-supercarnes", "nome": "Super Carnes", "descricao": "Supermercado e Açougue.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-merc-max", "nome": "Max Wilhelm Laranjinha", "descricao": "Sorvetes e Bebidas.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-posto-laranjense", "nome": "Postos Laranjense Gás e Água", "descricao": "Postos de Combustíveis e Gás.", "endereco": "Av. Sete de Setembro, 1969 - Centro", "telefone": "(69) 3481-1378", "whatsapp": "(69) 3481-1378" },
        { "id": "est-posto-espigao", "nome": "Auto Posto Combustível Espigão", "descricao": "Conveniência e Troca de Óleo.", "endereco": "Av. Sete de Setembro, 2223 - Centro", "telefone": "(69) 3481-2913" },
        { "id": "est-loja-milenio", "nome": "Milenio Calçados", "descricao": "Calçados, Vestuário e Acessórios.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-loja-boticario", "nome": "O Boticário", "descricao": "Cosméticos e Perfumaria.", "endereco": "Av. 7 de Setembro, 2757 - Centro" },
        { "id": "est-loja-softcom", "nome": "Softcom Tecnologia", "descricao": "Loja de Informática e TI.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-loja-gtinox", "nome": "GT Inox", "descricao": "Ferragens, Ferramentas e Metalúrgica.", "endereco": "Espigão do Oeste - Centro" },
        { "id": "est-loja-claro", "nome": "Claro (Revenda)", "descricao": "Telefonia, Celulares e Provedor.", "endereco": "R. Paraná, 2550 - Centro" },
        { "id": "est-loja-suvinil", "nome": "Suvinil (Revenda)", "descricao": "Casa de Tintas.", "endereco": "Av. Sete de Setembro, 2413" },
        { "id": "est-inst-oab", "nome": "OAB Subseção Espigão", "descricao": "Escritório de Advocacia (Base).", "endereco": "R. Rio Grande do Sul, 2700", "whatsapp": "(69) 99256-1235" },
        { "id": "est-inst-acieoro", "nome": "ACIEORO", "descricao": "Associação Comercial e Industrial.", "endereco": "R. Alagoas, 2644 - Centro", "telefone": "(69) 3481-2443", "whatsapp": "(16) 99153-7759" },
        { "id": "est-inst-scpc", "nome": "SCPC Espigão do Oeste", "descricao": "Serviço de Proteção ao Crédito e Contabilidade.", "endereco": "R. Bahia, 2624 - Centro", "telefone": "(69) 3481-2443" },
        { "id": "est-inst-crea", "nome": "CREA-RO Regional", "descricao": "Conselho de Engenharia e Agronomia.", "website": "crearo.org.br" },
        { "id": "est-inst-prefeitura", "nome": "Prefeitura Municipal", "descricao": "Gestão Pública.", "endereco": "Rua Rio Grande do Sul, 2800", "telefone": "(69) 3481-1400" },
        { "id": "est-inst-procon", "nome": "PROCON Espigão", "descricao": "Defesa do Consumidor.", "telefone": "(69) 3481-2226" },
        { "id": "est-agro-tecnoleite", "nome": "Tecno Leite", "descricao": "Produtos Agrícolas.", "endereco": "Rua Paraná, 2825 - Centro", "telefone": "(69) 3481-2216" },
        { "id": "est-agro-nelore", "nome": "Nelore JV", "descricao": "Genética e Veterinária.", "endereco": "Rua Independência, 2141 - Centro", "whatsapp": "(69) 98115-3337" },
        { "id": "est-agro-pecarara", "nome": "Peça Rara Agropecuária", "descricao": "Agronegócio.", "endereco": "Espigão do Oeste", "website": "agrorondonia.com.br" }
    ];

    const relacionamentosData = [
        { "estabelecimentoId": "est-farm-saojose", "segmentoId": "seg-farmacia" },
        { "estabelecimentoId": "est-farm-ultra", "segmentoId": "seg-farmacia" },
        { "estabelecimentoId": "est-farm-zezinho", "segmentoId": "seg-farmacia" },
        { "estabelecimentoId": "est-farm-entrefolhas", "segmentoId": "seg-farmacia" },
        { "estabelecimentoId": "est-farm-farmacertta", "segmentoId": "seg-farmacia" },
        { "estabelecimentoId": "est-odonto-arco", "segmentoId": "seg-odonto" },
        { "estabelecimentoId": "est-odonto-centrodonto", "segmentoId": "seg-odonto" },
        { "estabelecimentoId": "est-odonto-bem", "segmentoId": "seg-odonto" },
        { "estabelecimentoId": "est-odonto-clin", "segmentoId": "seg-odonto" },
        { "estabelecimentoId": "est-odonto-oralmed", "segmentoId": "seg-odonto" },
        { "estabelecimentoId": "est-odonto-sorriso", "segmentoId": "seg-odonto" },
        { "estabelecimentoId": "est-odonto-bruno", "segmentoId": "seg-odonto" },
        { "estabelecimentoId": "est-hosp-santacecilia", "segmentoId": "seg-hospital" },
        { "estabelecimentoId": "est-hosp-angelina", "segmentoId": "seg-hospital" },
        { "estabelecimentoId": "est-clin-clileal", "segmentoId": "seg-hospital" },
        { "estabelecimentoId": "est-clin-face", "segmentoId": "seg-hospital" },
        { "estabelecimentoId": "est-clin-familia", "segmentoId": "seg-hospital" },
        { "estabelecimentoId": "est-lab-labcenter", "segmentoId": "seg-laboratorio" },
        { "estabelecimentoId": "est-lab-biolab", "segmentoId": "seg-laboratorio" },
        { "estabelecimentoId": "est-lab-brasil", "segmentoId": "seg-laboratorio" },
        { "estabelecimentoId": "est-lab-central", "segmentoId": "seg-laboratorio" },
        { "estabelecimentoId": "est-lab-quality", "segmentoId": "seg-laboratorio" },
        { "estabelecimentoId": "est-lab-lutz", "segmentoId": "seg-laboratorio" },
        { "estabelecimentoId": "est-est-estetica", "segmentoId": "seg-estetica" },
        { "estabelecimentoId": "est-est-fisiopilates", "segmentoId": "seg-estetica" },
        { "estabelecimentoId": "est-est-morena", "segmentoId": "seg-estetica" },
        { "estabelecimentoId": "est-est-vidaplena", "segmentoId": "seg-estetica" },
        { "estabelecimentoId": "est-est-anecarine", "segmentoId": "seg-estetica" },
        { "estabelecimentoId": "est-rest-modelo", "segmentoId": "seg-restaurante" },
        { "estabelecimentoId": "est-rest-saboriarte", "segmentoId": "seg-restaurante" },
        { "estabelecimentoId": "est-rest-acai", "segmentoId": "seg-restaurante" },
        { "estabelecimentoId": "est-rest-oneway", "segmentoId": "seg-restaurante" },
        { "estabelecimentoId": "est-rest-menudino", "segmentoId": "seg-restaurante" },
        { "estabelecimentoId": "est-pad-modelo", "segmentoId": "seg-mercado" },
        { "estabelecimentoId": "est-merc-supercarnes", "segmentoId": "seg-mercado" },
        { "estabelecimentoId": "est-merc-max", "segmentoId": "seg-mercado" },
        { "estabelecimentoId": "est-posto-laranjense", "segmentoId": "seg-posto" },
        { "estabelecimentoId": "est-posto-espigao", "segmentoId": "seg-posto" },
        { "estabelecimentoId": "est-loja-milenio", "segmentoId": "seg-lojas" },
        { "estabelecimentoId": "est-loja-boticario", "segmentoId": "seg-lojas" },
        { "estabelecimentoId": "est-loja-softcom", "segmentoId": "seg-lojas" },
        { "estabelecimentoId": "est-loja-gtinox", "segmentoId": "seg-lojas" },
        { "estabelecimentoId": "est-loja-claro", "segmentoId": "seg-lojas" },
        { "estabelecimentoId": "est-loja-suvinil", "segmentoId": "seg-lojas" },
        { "estabelecimentoId": "est-inst-oab", "segmentoId": "seg-institucional" },
        { "estabelecimentoId": "est-inst-acieoro", "segmentoId": "seg-institucional" },
        { "estabelecimentoId": "est-inst-scpc", "segmentoId": "seg-institucional" },
        { "estabelecimentoId": "est-inst-crea", "segmentoId": "seg-institucional" },
        { "estabelecimentoId": "est-inst-prefeitura", "segmentoId": "seg-institucional" },
        { "estabelecimentoId": "est-inst-procon", "segmentoId": "seg-institucional" },
        { "estabelecimentoId": "est-agro-tecnoleite", "segmentoId": "seg-agro" },
        { "estabelecimentoId": "est-agro-nelore", "segmentoId": "seg-agro" },
        { "estabelecimentoId": "est-agro-pecarara", "segmentoId": "seg-agro" }
    ];

    console.log('Seeding Segments...');
    for (const seg of segmentosData) {
        await prisma.segmento.upsert({
            where: { id: seg.id },
            update: {
                nome: seg.nome,
                slug: seg.slug,
                paiId: seg.paiId,
                icone: seg.icone,
                cor: seg.cor,
                organizationId: orgId
            },
            create: {
                id: seg.id,
                organizationId: orgId,
                nome: seg.nome,
                slug: seg.slug,
                paiId: seg.paiId,
                icone: seg.icone,
                cor: seg.cor
            }
        });
    }

    console.log('Seeding Establishments...');
    const createdEstMap = new Map();
    for (const est of estabelecimentosData) {
        const created = await prisma.estabelecimento.upsert({
            where: { id: est.id },
            update: {
                nome: est.nome,
                descricao: est.descricao || '',
                endereco: est.endereco || '',
                telefone: est.telefone,
                whatsapp: est.whatsapp,
                website: est.website,
                ativo: true,
                organizationId: orgId
            },
            create: {
                id: est.id,
                organizationId: orgId,
                nome: est.nome,
                descricao: est.descricao || '',
                endereco: est.endereco || '',
                telefone: est.telefone,
                whatsapp: est.whatsapp,
                website: est.website,
                ativo: true
            }
        });
        createdEstMap.set(est.id, created.id);
    }

    console.log('Seeding Relationships...');
    for (const rel of relacionamentosData) {
        const estId = createdEstMap.get(rel.estabelecimentoId);
        // Ensure segment exists
        if (estId) {
            // Check if relation exists to avoid duplicates if upsert didn't clear them (we cleared them but just in case)
            await prisma.estabelecimentoSegmento.create({
                data: {
                    estabelecimentoId: estId,
                    segmentoId: rel.segmentoId
                }
            }).catch(e => { }); // Ignore duplicates or errors
        }
    }

    // 4. Create Poll
    console.log('Creating Poll...');
    const allEstIds = estabelecimentosData.map(e => ({ id: e.id }));

    await prisma.enquete.upsert({
        where: { organizationId_formPublicId: { organizationId: orgId, formPublicId: 'frm_ZrUJW0FJbs' } },
        update: {
            status: EnqueteStatus.PUBLICADA,
            dataInicio: new Date('2024-01-01'),
            dataFim: new Date('2025-12-31'),
            usarNumerosSorte: true,
            digitosNumerosSorte: 5,
            estabelecimentos: {
                set: allEstIds // re-link all establishments
            }
        },
        create: {
            organizationId: orgId,
            titulo: 'Destaques Empresariais e Profissionais 2024',
            descricao: 'Vote nas empresas e profissionais que se destacaram no ano de 2024 em Espigão do Oeste.',
            formPublicId: 'frm_ZrUJW0FJbs',
            hubFormId: 'hub-form-acieo',
            status: EnqueteStatus.PUBLICADA,
            modoAcesso: ModoAcesso.PUBLICO,
            criadoPor: userId,
            configVisual: {
                primaryColor: '#EF4444',
                template: 'premium',
                logoUrl: 'https://acieoro.com.br/wp-content/uploads/2021/08/logo-acieo.png',
            },
            paginaAgradecimento: {
                titulo: 'Voto Registrado!',
                mensagem: 'A ACIEO agradece sua participação.',
            },
            dataInicio: new Date('2024-01-01'),
            dataFim: new Date('2025-12-31'),
            segmentos: {
                connect: segmentosData.map(s => ({ id: s.id }))
            },
            estabelecimentos: {
                connect: allEstIds // Link ALL establishments so candidates API works
            },
            exigirIdentificacao: true,
            usarNumerosSorte: true,
            digitosNumerosSorte: 5,
        }
    });

    // 4.5. Create Tags (Mandatory for segmentation)
    console.log('Seeding Tags...');
    const tagsData = [
        { id: 'tag-sexo-m', nome: 'Homem', cor: '#3B82F6' },
        { id: 'tag-sexo-f', nome: 'Mulher', cor: '#EC4899' },
        { id: 'tag-sexo-o', nome: 'Outros / N.I.', cor: '#94A3B8' }
    ];

    for (const tag of tagsData) {
        await prisma.tag.upsert({
            where: { id: tag.id },
            update: { nome: tag.nome, cor: tag.cor, organizationId: orgId },
            create: { id: tag.id, organizationId: orgId, nome: tag.nome, cor: tag.cor }
        });
    }

    // 5. Create Leads (200 com CPFs únicos)
    console.log('Generating 200 Leads with unique CPFs and Gender Tags...');

    const firstNames = ['Ana', 'Carlos', 'Fernanda', 'João', 'Mariana', 'Pedro', 'Beatriz', 'Lucas',
        'Camila', 'Rafael', 'Juliana', 'Gabriel', 'Larissa', 'Thiago', 'Amanda', 'Rodrigo',
        'Patrícia', 'Bruno', 'Carla', 'Felipe', 'Débora', 'Leandro', 'Renata', 'Diego',
        'Vanessa', 'Marcos', 'Sabrina', 'André', 'Natalia', 'Eduardo'];
    const lastNames = ['Silva', 'Oliveira', 'Santos', 'Pereira', 'Costa', 'Alves', 'Lima', 'Souza',
        'Rocha', 'Mendes', 'Dias', 'Martins', 'Fernandes', 'Barbosa', 'Gomes', 'Carvalho',
        'Ribeiro', 'Castro', 'Nunes', 'Cardoso', 'Moraes', 'Freitas', 'Correia', 'Melo',
        'Nascimento', 'Araújo', 'Teixeira', 'Monteiro', 'Borges', 'Vieira'];

    /** Generates a valid CPF string (digits only, 11 chars) */
    function generateCPF(seed: number): string {
        // Deterministic but realistic-looking CPF from seed
        const base = (123456789 + seed * 7) % 999999999;
        const d1str = base.toString().padStart(9, '0');
        const digits = d1str.split('').map(Number);
        const d1 = (11 - (digits.reduce((acc, d, i) => acc + d * (10 - i), 0) % 11)) % 11;
        const d2 = (11 - ([...digits, d1 < 2 ? 0 : d1].reduce((acc, d, i) => acc + d * (11 - i), 0) % 11)) % 11;
        return d1str + (d1 < 2 ? 0 : d1).toString() + (d2 < 2 ? 0 : d2).toString();
    }

    const leadsData: Array<{
        id: string; organizationId: string; nome: string; whatsapp: string;
        email: string | null; instagram: string | null; cpf: string; sexo: 'F' | 'M';
        statusVerificacao: string; origem: string;
    }> = [];

    for (let i = 0; i < 200; i++) {
        const fn = firstNames[i % firstNames.length];
        const ln = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        const suffix = i >= (firstNames.length * lastNames.length) ? ` ${i}` : '';
        const nome = `${fn} ${ln}${suffix}`;
        const hasEmail = i % 3 !== 0; // ~67% têm email
        const hasInst = i % 5 === 0;  // 20% têm instagram
        leadsData.push({
            id: `lead-poc-${i + 1}`,
            organizationId: orgId,
            nome,
            whatsapp: `5569${(900000000 + i * 13).toString().padStart(9, '0')}`,
            email: hasEmail ? `${fn.toLowerCase()}.${ln.toLowerCase()}${i + 1}@email.com` : null,
            instagram: hasInst ? `@${fn.toLowerCase()}${ln.toLowerCase()}${i}` : null,
            cpf: generateCPF(i + 1),
            sexo: i % 2 === 0 ? 'F' : 'M',
            statusVerificacao: 'VERIFICADO',
            origem: 'IMPORTACAO',
        });
    }

    for (const lead of leadsData) {
        const createdLead = await prisma.lead.upsert({
            where: { id: lead.id },
            update: { cpf: lead.cpf, email: lead.email, instagram: lead.instagram },
            create: {
                id: lead.id,
                organizationId: lead.organizationId,
                nome: lead.nome,
                whatsapp: lead.whatsapp,
                email: lead.email,
                instagram: lead.instagram,
                cpf: lead.cpf,
                sexo: lead.sexo,
                statusVerificacao: 'VERIFICADO',
                origem: 'IMPORTACAO',
            },
        });

        // 🏷️ Associate Gender Tag
        const tagId = lead.sexo === 'M' ? 'tag-sexo-m' : (lead.sexo === 'F' ? 'tag-sexo-f' : 'tag-sexo-o');
        await prisma.leadTag.create({
            data: {
                leadId: createdLead.id,
                tagId: tagId
            }
        }).catch(() => { }); // Ignore if relation already exists
    }
    console.log(`✅ ${leadsData.length} leads created.`);

    // 6. Generate Votes — 3 cenários para demonstração do Sentinela
    console.log('Simulating votes with Sentinel fraud scenarios...');
    const enquete = await prisma.enquete.findFirst({ where: { organizationId: orgId, formPublicId: 'frm_ZrUJW0FJbs' } });

    if (!enquete) {
        console.error('❌ Enquete not found! Aborting votes.');
        return;
    }

    /** Helper: pega estabelecimentos válidos de um segmento */
    function getEstsForSegment(segId: string): string[] {
        return relacionamentosData.filter(r => r.segmentoId === segId).map(r => r.estabelecimentoId);
    }
    function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

    const leafSegments = segmentosData.filter(s => s.paiId !== null); // Only leaf segments have establishments
    let totalVotes = 0;

    // ─────────────────────────────────────────────
    // CENÁRIO A — VOTOS ORGÂNICOS LEGÍTIMOS (~160)
    // IPs únicos por faixa residencial, tempo 25–200s, >70% respondido
    // ─────────────────────────────────────────────
    console.log('  📗 Cenário A: Votos Orgânicos (+80% conclusão)...');
    const baseTimestamp = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago

    for (let i = 0; i < 160; i++) {
        const lead = leadsData[i];

        // Pick 8-10 segments out of 11 (~72% to 90% completion)
        const numSegments = 8 + Math.floor(Math.random() * 3);
        const selectedSegments = [...leafSegments].sort(() => 0.5 - Math.random()).slice(0, numSegments);

        const ip = `177.${10 + (i % 80)}.${(i * 7) % 256}.${(i * 13) % 256}`;
        const minsAgo = i * 70 + Math.floor(Math.random() * 60);
        const respondidoEm = new Date(baseTimestamp + minsAgo * 60 * 1000);
        const tempoResposta = 45 + Math.floor(Math.random() * 150); // More time for more choices

        const percentualConclusao = Math.round((numSegments / leafSegments.length) * 100);

        const resposta = await prisma.resposta.create({
            data: {
                enqueteId: enquete.id,
                formPublicId: enquete.formPublicId,
                leadId: lead.id,
                dadosJson: { origem: 'whatsapp', device: 'mobile' },
                respondidoEm,
                tempoRespostaSegundos: tempoResposta,
                ipAddress: ip,
                userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36',
                status: 'VALID',
                fraudScore: Math.floor(Math.random() * 12),
                votoValido: true,
                percentualConclusao,
            },
        });

        for (const seg of selectedSegments) {
            const ests = getEstsForSegment(seg.id);
            if (ests.length > 0) {
                await prisma.votoEstabelecimento.create({
                    data: { respostaId: resposta.id, estabelecimentoId: pickRandom(ests), segmentoId: seg.id, campoId: 'voto_principal' },
                });
            }
        }
        totalVotes++;
    }

    // ─────────────────────────────────────────────
    // CENÁRIO B — VELOCITY CHECK / BOT (~25 votos)
    // Bots também votam em massa para tentar burlar filtros de conclusão
    // ─────────────────────────────────────────────
    console.log('  🤖 Cenário B: Velocity Check (bots <5s)...');
    const botLeads = leadsData.slice(160, 163);
    const botIps = ['189.45.22.7', '189.45.22.8', '189.45.22.9'];
    const botBase = new Date(Date.now() - 2 * 60 * 60 * 1000);

    for (let round = 0; round < 3; round++) {
        for (let b = 0; b < botLeads.length; b++) {
            const lead = botLeads[b];

            // Bots vote in ALL segments very fast
            const selectedSegments = leafSegments;

            const respondidoEm = new Date(botBase.getTime() + round * 30000 + b * 800);
            const resposta = await prisma.resposta.create({
                data: {
                    enqueteId: enquete.id,
                    formPublicId: enquete.formPublicId,
                    leadId: lead.id,
                    dadosJson: { source: 'api_direct' },
                    respondidoEm,
                    tempoRespostaSegundos: 2 + b,
                    ipAddress: botIps[b],
                    userAgent: 'python-requests/2.28.0',
                    status: 'SUSPICIOUS',
                    fraudScore: 80,
                    fraudReason: 'Alta velocidade detectada (Bot-like behavior)',
                    votoValido: true,
                    percentualConclusao: 100,
                },
            });
            for (const seg of selectedSegments) {
                const ests = getEstsForSegment(seg.id);
                if (ests.length > 0) {
                    await prisma.votoEstabelecimento.create({
                        data: { respostaId: resposta.id, estabelecimentoId: pickRandom(ests), segmentoId: seg.id, campoId: 'voto_principal' },
                    });
                }
            }
            totalVotes++;
        }
    }

    // ─────────────────────────────────────────────
    // CENÁRIO C — IP FLOOD / VOTE FARM (~23 votos)
    // ─────────────────────────────────────────────
    console.log('  🌊 Cenário C: IP Flood (mais escolhas)...');
    const floodIp1 = '201.88.55.100';
    const floodIp2 = '201.88.55.101';
    const floodLeads = leadsData.slice(163, 186);
    const floodBase = new Date(Date.now() - 4 * 60 * 60 * 1000);

    for (let f = 0; f < floodLeads.length; f++) {
        const lead = floodLeads[f];
        const numSegments = 9; // High completion
        const selectedSegments = [...leafSegments].sort(() => 0.5 - Math.random()).slice(0, numSegments);

        const ip = f % 2 === 0 ? floodIp1 : floodIp2;
        const respondidoEm = new Date(floodBase.getTime() + f * 3 * 60 * 1000);
        const tempoResposta = 25 + Math.floor(Math.random() * 30);

        const resposta = await prisma.resposta.create({
            data: {
                enqueteId: enquete.id,
                formPublicId: enquete.formPublicId,
                leadId: lead.id,
                dadosJson: { source: 'whatsapp_link' },
                respondidoEm,
                tempoRespostaSegundos: tempoResposta,
                ipAddress: ip,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                status: 'SUSPICIOUS',
                fraudScore: 60,
                fraudReason: `IP Flood: Mais de 10 votos em 60min (${ip})`,
                votoValido: true,
                percentualConclusao: Math.round((numSegments / leafSegments.length) * 100),
            },
        });
        for (const seg of selectedSegments) {
            const ests = getEstsForSegment(seg.id);
            if (ests.length > 0) {
                await prisma.votoEstabelecimento.create({
                    data: { respostaId: resposta.id, estabelecimentoId: pickRandom(ests), segmentoId: seg.id, campoId: 'voto_principal' },
                });
            }
        }
        totalVotes++;
    }

    // ─────────────────────────────────────────────
    // CENÁRIO D — VOTOS JÁ INVALIDADOS (~8)
    // Situação pós-auditoria: admin já marcou como INVALID
    // ─────────────────────────────────────────────
    console.log('  ❌ Cenário D: Votos já invalidados (pós-auditoria)...');
    const invalidLeads = leadsData.slice(186, 194);
    for (let d = 0; d < invalidLeads.length; d++) {
        const lead = invalidLeads[d];
        const seg = pickRandom(leafSegments);
        const ests = getEstsForSegment(seg.id);
        if (ests.length === 0) continue;

        const resposta = await prisma.resposta.create({
            data: {
                enqueteId: enquete.id,
                formPublicId: enquete.formPublicId,
                leadId: lead.id,
                dadosJson: {},
                respondidoEm: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                tempoRespostaSegundos: 3,
                ipAddress: '198.51.100.5',
                status: 'INVALID',
                fraudScore: 95,
                fraudReason: 'Confirmed fraud: CPF duplicate across organizations',
                reviewedBy: userId,
                reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                votoValido: false,
            },
        });
        await prisma.votoEstabelecimento.create({
            data: { respostaId: resposta.id, estabelecimentoId: pickRandom(ests), segmentoId: seg.id, campoId: 'voto_principal' },
        });
        totalVotes++;
    }

    console.log(`✅ ${totalVotes} votes generated across 4 scenarios.`);

    // 6b. Generate Cupons & Números da Sorte per lead
    console.log('Generating Cupons & Números da Sorte...');
    const usedNumbers = new Set<number>();
    const getUniqueNumber = (): number => {
        let n: number;
        do { n = Math.floor(10000 + Math.random() * 90000); } while (usedNumbers.has(n));
        usedNumbers.add(n);
        return n;
    };

    // Only give cupons to leads that actually voted (orgânicos)
    const votingLeads = leadsData.slice(0, 160);
    for (const lead of votingLeads) {
        const cupons = 1 + (lead.email ? 1 : 0) + (lead.instagram ? 1 : 0);
        await prisma.lead.update({ where: { id: lead.id }, data: { cupons } });
        const nums = Array.from({ length: cupons }, () => ({ numero: getUniqueNumber(), enqueteId: enquete.id, leadId: lead.id }));
        for (const data of nums) {
            await prisma.numeroSorte.upsert({
                where: { enqueteId_numero: { enqueteId: data.enqueteId, numero: data.numero } },
                update: {},
                create: data,
            });
        }
    }
    console.log(`✅ Cupons e Números da Sorte gerados para ${votingLeads.length} leads.`);

    // 7. Create Campaigns
    console.log('Creating Campaigns...');
    if (enquete) {
        // Campanha 1: Disparo Inicial (Convite)
        await prisma.campanha.create({
            data: {
                organizationId: orgId,
                nome: "Campanha de Lançamento - Votação Aberta",
                enqueteId: enquete.id,
                criadoPor: userId,
                status: "AGENDADA", // Enum
                segmentacao: { type: "all_leads" },
                mensagens: [
                    {
                        type: "text",
                        content: "Olá *{{nome}}*! 🏆\n\nA votação para o *Prêmio Destaque ACIEO 2024* já começou! Sua opinião é muito importante para nosso comércio."
                    },
                    {
                        type: "image",
                        mediaUrl: "https://acieoro.com.br/wp-content/uploads/2021/08/logo-acieo.png",
                        content: "Participe e ajude a escolher os melhores do ano em Espigão do Oeste! 🚀"
                    },
                    {
                        type: "action_button",
                        content: "Clique abaixo para votar agora mesmo:",
                        options: [
                            { label: "Votar Agora", url: `https://app.premio.com/votar/${enquete.formPublicId}` }
                        ]
                    }
                ]
            }
        });

        // Campanha 2: Lembrete Final (Urgência)
        await prisma.campanha.create({
            data: {
                organizationId: orgId,
                nome: "Últimos Dias - Lembrete Final via WhatsApp",
                enqueteId: enquete.id,
                criadoPor: userId,
                status: "RASCUNHO", // Enum
                segmentacao: { type: "non_voters" },
                mensagens: [
                    {
                        type: "audio",
                        mediaUrl: "https://example.com/audio-convite-final.mp3",
                        delayAfter: 2000
                    },
                    {
                        type: "text",
                        content: "Oi {{nome}}, tudo bem? Passando para avisar que faltam apenas *2 dias* para o encerramento da votação. ⏳"
                    },
                    {
                        type: "text",
                        content: "Já computamos mais de 5.000 votos! Não deixe sua empresa favorita de fora. Acesse: https://app.premio.com/votar"
                    }
                ]
            }
        });
    }

    console.log('✅ Premio Destaque Seed Completed Successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
