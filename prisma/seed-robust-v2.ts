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
    const orgId = 'cmm0wu8720005j261a37str2i'; // Prefeitura Municipal de Exemplo
    const userId = 'cmm0wu86n0000j261icrbu660'; // Fábio Rogério Milani

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🏆 SEED PARTICIPA V3 - Demo Top of Mind & Metaphone');
    console.log('  🎯 Pesquisa: PREMIACAO | Coleta: TOP OF MIND PURO');
    console.log('═══════════════════════════════════════════════════════════');

    // 1. LIMPEZA (Apenas da Org Modelo para não quebrar outros testes)
    console.log('\n🧹 Limpando dados da org prefeitura-modelo...');
    try {
        await (prisma as any).votoLivre.deleteMany({ where: { resposta: { enquete: { organizationId: orgId } } } });
        await prisma.votoEstabelecimento.deleteMany({ where: { resposta: { enquete: { organizationId: orgId } } } });
        await prisma.resposta.deleteMany({ where: { enquete: { organizationId: orgId } } });
        await prisma.trackingLink.deleteMany({ where: { campanha: { organizationId: orgId } } });
        await prisma.campanha.deleteMany({ where: { organizationId: orgId } });
        await prisma.enquete.deleteMany({ where: { organizationId: orgId } });
        await (prisma as any).distribuicaoRotativa.deleteMany({ where: { enqueteId: { not: "" } } }); // Limpa rotatividade global pra garantir fresh demo
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
        create: { organizationId: orgId }
    });

    // 2. CATEGORIAS PARA DEMO
    console.log('\n🏗️  Criando estrutura de categorias...');

    // Categorias principais
    const catGastronomia = await prisma.segmento.create({
        data: {
            organizationId: orgId,
            nome: 'Gastronomia',
            slug: 'gastronomia',
            cor: '#EF4444',
            icone: 'Utensils',
            ordem: 1,
        }
    });

    const catServicos = await prisma.segmento.create({
        data: {
            organizationId: orgId,
            nome: 'Serviços e Varejo',
            slug: 'servicos-varejo',
            cor: '#3B82F6',
            icone: 'ShoppingBag',
            ordem: 2,
        }
    });

    // Sub-segmentos (Categorias de Voto)
    const subPizzaria = await prisma.segmento.create({
        data: {
            organizationId: orgId,
            nome: 'Melhor Pizzaria',
            slug: 'melhor-pizzaria',
            paiId: catGastronomia.id,
            ordem: 1,
        }
    });

    const subRestaurante = await prisma.segmento.create({
        data: {
            organizationId: orgId,
            nome: 'Melhor Restaurante',
            slug: 'melhor-restaurante',
            paiId: catGastronomia.id,
            ordem: 2,
        }
    });

    const subOficina = await prisma.segmento.create({
        data: {
            organizationId: orgId,
            nome: 'Melhor Oficina Mecânica',
            slug: 'melhor-oficina',
            paiId: catServicos.id,
            ordem: 1,
        }
    });

    // 3. ENQUETE DEMO (Top of Mind Puro)
    console.log('\n📝 Criando Enquete Participa (Top of Mind)...');
    const enquete = await prisma.enquete.create({
        data: {
            organizationId: orgId,
            titulo: 'Participa 2025 - Votação Popular',
            descricao: 'Demo do algoritmo de consolidação fonética e Top of Mind puro.',
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
            segmentos: {
                connect: [{ id: subPizzaria.id }, { id: subRestaurante.id }, { id: subOficina.id }]
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

    // 5. GERAR VOTOS LIVRES COM VARIAÇÕES (The Core of the Request)
    console.log('\n🗳️  Gerando Votos Livres com variações metafonéticas...');

    // Casos de Teste para "Pizzaria do Zé"
    const variacoesZe = [
        "Pizzaria do Zé",
        "Pizzaria do Zé", // repetido pra frequencia
        "Pisaria do Zé",
        "Pizaria do Se",
        "Pizzaria do Zé",
        "Pizaria do Ze",
        "Zé Pizzaria",
        "Pizzeria do Jose",
        "Pizzaria do Jose"
    ];

    // Casos de Teste para "Restaurante Sabor da Terra"
    const variacoesSabor = [
        "Restaurante Sabor da Terra",
        "Restaurante Sabor da Terra",
        "Sabor da Terra Restaurante",
        "Restorante Sabor da Terra",
        "Restaurente Sabor de Terra",
        "Sabur da Tera"
    ];

    // Casos de Teste para "Oficina do Tonhão"
    const variacoesTonhao = [
        "Oficina do Tonhão",
        "Oficina do Tonhao",
        "Ofecina do Tonhão",
        "Tonhão Oficina",
        "Oficina do Tunhao"
    ];

    let voteCount = 0;

    // Inserir votos de forma distribuída entre os leads
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
    console.log('  ✨ SEED PARTICIPA CONCLUÍDA!');
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
