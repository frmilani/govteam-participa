
import { PrismaClient, ModoAcesso, EnqueteStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const orgId = 'cmke1hubr0001eci9bfl94mf6'; // ID da Secretaria Municipal de Saúde / Hub
    const userId = 'user_admin_demo';

    console.log('🌱 Iniciando seed de dados PREFEITURA para Premio Destaque...');

    // 1. Limpar dados
    console.log('Limpando dados antigos...');
    try {
        await prisma.votoEstabelecimento.deleteMany({ where: { resposta: { enquete: { organizationId: orgId } } } });
        await prisma.resposta.deleteMany({ where: { enquete: { organizationId: orgId } } });
        await prisma.campanha.deleteMany({ where: { organizationId: orgId } });
        await prisma.enquete.deleteMany({ where: { organizationId: orgId } });
        await prisma.estabelecimentoSegmento.deleteMany();
        await prisma.estabelecimento.deleteMany({ where: { organizationId: orgId } });
        await prisma.segmento.deleteMany({ where: { organizationId: orgId } });
    } catch (e) {
        console.warn("Aviso na limpeza:", e);
    }

    // 2. Criar Categorias (Segmentos)
    const categorias = [
        { nome: 'Eficiência Administrativa', slug: 'eficiencia-administrativa', cor: '#3B82F6', icone: 'Zap' },
        { nome: 'Excelência em Atendimento', slug: 'atendimento', cor: '#10B981', icone: 'UserCheck' },
        { nome: 'Inovação no Serviço Público', slug: 'inovacao', cor: '#8B5CF6', icone: 'Lightbulb' },
    ];

    const segmentosCriados: Record<string, any> = {};

    for (const cat of categorias) {
        segmentosCriados[cat.slug] = await prisma.segmento.create({
            data: {
                organizationId: orgId,
                nome: cat.nome,
                slug: cat.slug,
                cor: cat.cor,
                icone: cat.icone,
            },
        });
    }

    // 3. Criar Sub-categorias e Nominees (Ex: Secretarias)
    const secretarias = [
        { nome: 'Saúde', slug: 'sms', desc: 'Atendimento humanizado nas UBS' },
        { nome: 'Educação', slug: 'sme', desc: 'Inovação nas escolas municipais' },
        { nome: 'Finanças', slug: 'sefin', acronym: 'SEFIN', desc: 'Eficiência na arrecadação digital' },
        { nome: 'Mobilidade', slug: 'smm', desc: 'Segurança viária e fluidez' },
        { nome: 'Planejamento', slug: 'seplanh', desc: 'Modernização do cadastro urbano' },
        { nome: 'Assistência Social', slug: 'semas', desc: 'Proteção aos vulneráveis' },
        { nome: 'Meio Ambiente', slug: 'amma', desc: 'Preservação de parques' },
        { nome: 'Infraestrutura', slug: 'seinfra', desc: 'Obras de pavimentação' },
        { nome: 'Cultura', slug: 'secult', desc: 'Eventos culturais gratuitos' },
        { nome: 'Inovação', slug: 'seit', desc: 'Goiânia Inteligente' },
    ];

    const estabelecimentosCriados: any[] = [];

    // Melhor Secretaria (Sub-categoria)
    const subMelhorSecretaria = await prisma.segmento.create({
        data: {
            organizationId: orgId,
            nome: 'Melhor Secretaria do Ano',
            slug: 'voto-melhor-secretaria',
            paiId: segmentosCriados['eficiencia-administrativa'].id,
            cor: '#3B82F6',
            icone: 'Trophy',
        },
    });

    for (const sec of secretarias) {
        const est = await prisma.estabelecimento.create({
            data: {
                organizationId: orgId,
                nome: `Secretaria de ${sec.nome}`,
                descricao: sec.desc,
                ativo: true,
            }
        });
        estabelecimentosCriados.push(est);

        await prisma.estabelecimentoSegmento.create({
            data: {
                estabelecimentoId: est.id,
                segmentoId: subMelhorSecretaria.id
            }
        });
    }

    // 4. Criar Enquete
    await prisma.enquete.create({
        data: {
            organizationId: orgId,
            titulo: 'Prêmio Melhores da Prefeitura 2025',
            descricao: 'Escolha os órgãos e serviços que mais impactaram positivamente sua vida em 2025.',
            formPublicId: 'premio-prefeitura-2025',
            hubFormId: 'hub-form-premio',
            status: EnqueteStatus.PUBLICADA,
            modoAcesso: ModoAcesso.PUBLICO,
            criadoPor: userId,
            configVisual: {
                primaryColor: '#0066cc',
                template: 'premium',
                logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bras%C3%A3o_de_Goi%C3%A2nia.svg/1200px-Bras%C3%A3o_de_Goi%C3%A2nia.svg.png',
            },
            paginaAgradecimento: {
                titulo: 'Obrigado por votar!',
                mensagem: 'Sua participação ajuda a melhorar os serviços públicos.',
            },
            dataInicio: new Date(),
            segmentos: {
                connect: [{ id: subMelhorSecretaria.id }]
            },
            estabelecimentos: {
                connect: estabelecimentosCriados.map(e => ({ id: e.id }))
            },
            exigirIdentificacao: true,
        }
    });

    console.log('✅ Seed Premio Destaque (Prefeitura) finalizado!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
