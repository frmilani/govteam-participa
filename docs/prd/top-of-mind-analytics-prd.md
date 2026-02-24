---
title: "PRD: Motor Universal de Pesquisa — A Perfect Tool"
subtitle: "Premiações, Pesquisas Políticas, Políticas Públicas, Corporativo e Mais"
status: "Em Revisão pelo PO"
author: "Equipe de Arquitetura & IA"
date: "2026-02-21"
epic: "Evolução Spoke Prêmio Destaque → Motor Universal de Pesquisa"
version: "3.1"
changelog:
  - "v1.0 — PRD inicial (Top of Mind + Analytics)"
  - "v2.0 — Blocos LEGO + 17 cenários + distribuição"
  - "v3.0 — Resolução das 7 observações do PO (herança de templates, entidades, expansão da tela, Lead enriquecido, Recall Assistido, distribuição na campanha, UX do coração)"
  - "v3.1 — 5 refinamentos: Políticas Públicas (nomenclatura), Metaphone no Recall Assistido, Lista Sugerida como dropdown com randomização, Premiação como toggle universal, Entidade tipada com metadados JSON"
stakeholders:
  - Product Owner do Prêmio Destaque
  - Equipe Técnica
  - Associações Comerciais (clientes finais)
---

# 1. Resumo Executivo

O Spoke **Prêmio Destaque** será elevado de um "sistema de votação de prêmios" para um **Motor Universal de Pesquisa** capaz de atender premiações empresariais, pesquisas políticas, políticas públicas (audiências, PPA) e pesquisas corporativas numa única plataforma.

A solução se baseia em **seis pilares**:
1. **Blocos de Pesquisa Modulares** — 8 tipos combináveis como peças LEGO
2. **Motor de Categorias Dinâmico** — Sem necessidade de recriar formulários por segmento
3. **Templates de Qualidade com Herança Hierárquica** — Configura no pai, herda nos filhos
4. **Entidade Avaliada Tipada** — O conceito de "Estabelecimento" expandido com `tipo` e `metadados Json` para candidatos, propostas, marcas, dimensões
5. **Analytics Demográfico Proprietário + Lead Enriquecido** — Dashboard local respeitando a Urna Trancada
6. **Premiação como Potencializador Universal** — Disponível como toggle para QUALQUER tipo de pesquisa, não apenas premiações empresariais

---

# 2. Cenários de Uso Mapeados (18 cenários)

## 2.1. Premiação Empresarial (Prêmio Destaque)

| # | Cenário | Modo de Coleta | Distribuição |
|---|---------|----------------|--------------|
| C1 | Lista sugerida, 1 categoria por campanha (modelo atual) | Lista Sugerida | Individual |
| C2 | Top of Mind puro, todas as categorias | Top of Mind Puro | Todas |
| C3 | Top of Mind + Qualidade, 1 categoria | Top of Mind Puro + Qualidade | Individual |
| C4 | Top of Mind + Qualidade, múltiplas categorias | Top of Mind Puro + Qualidade | Grupo |
| C5 | Lista sugerida + Qualidade diferenciada por categoria | Lista Sugerida + Qualidade | Grupo |

## 2.2. Pesquisa Política

| # | Cenário | Modo de Coleta | Distribuição |
|---|---------|----------------|--------------|
| C6 | Recall espontâneo puro | Top of Mind Puro | Todas |
| C7 | Recall estimulado (lista de candidatos) | Lista Sugerida | Todas |
| C8 | Combinado: espontâneo → estimulado | Top of Mind → Lista (2 etapas) | Todas |
| C9 | Rejeição (em quem NÃO votaria) | Lista Sugerida (modo rejeição) | Todas |

## 2.3. Políticas Públicas (Audiências, PPA)

| # | Cenário | Modo de Coleta | Distribuição |
|---|---------|----------------|--------------|
| C10 | Priorização de políticas públicas | Priorização | Todas |
| C11 | Avaliação de serviços públicos | Qualidade (matriz rating) | Todas |
| C12 | NPS Municipal | NPS | Todas |
| C13 | Consulta pública (propostas do PPA) | Aprovação + Texto Livre | Todas |
| C14 | Demanda espontânea por bairro | Texto Livre (agrupamento) | Todas |

## 2.4. Mercado / Corporativo

| # | Cenário | Modo de Coleta | Distribuição |
|---|---------|----------------|--------------|
| C15 | Brand Awareness (Top of Mind → lista) | Top of Mind → Lista (2 etapas) | Todas |
| C16 | Satisfação do colaborador | Qualidade + Texto Livre | Todas |
| C17 | Customer Experience (CSAT) | NPS + Texto Livre | Todas |

## 2.5. Recall Assistido (NOVO — Diferencial Competitivo)

| # | Cenário | Modo de Coleta | Distribuição |
|---|---------|----------------|--------------|
| C18 | Recall Assistido (digita livremente, mas recebe sugestões preditivas da base) | Recall Assistido | Qualquer |

---

# 3. O Conceito de "Entidade Avaliada" (Tipada com Metadados)

## 3.1. O Modelo "Estabelecimento" é Expandido com Tipo e Metadados

O modelo `Estabelecimento` no Prisma recebe **dois novos campos**: um `tipo` enum e um `metadados Json?` para dados específicos de cada tipo. Campos existentes (nome, logoUrl, descricao, ativo) continuam como campos comuns universais. Campos muito específicos de empresa (endereco, telefone, whatsapp, instagram, facebook) permanecem opcionais — são relevantes para empresas mas ignorados para outros tipos.

### 3.1.1. Enum TipoEntidade e Campos por Tipo

| Tipo | Código | Campos Comuns (no modelo) | Campos Específicos (em `metadados Json`) |
|------|--------|---------------------------|------------------------------------------|
| **Empresa** | `EMPRESA` | nome, logoUrl, descricao, endereco, telefone, whatsapp, website, instagram, facebook | `{ ramoAtividade, cnpj, horarioFuncionamento }` |
| **Candidato** | `CANDIDATO` | nome, logoUrl, descricao | `{ partido, numeroCandidato, cargo, coligacao, fotoUrna }` |
| **Proposta** | `PROPOSTA` | nome, descricao | `{ areaOrcamentaria, impactoEstimado, prazoExecucao, secretariaResponsavel }` |
| **Marca** | `MARCA` | nome, logoUrl, descricao | `{ segmentoMercado, paisOrigem }` |
| **Dimensão** | `DIMENSAO` | nome, descricao | `{ areaCorporativa, peso }` |
| **Serviço Público** | `SERVICO_PUBLICO` | nome, descricao | `{ secretaria, localAtendimento, avaliacaoAtual }` |
| **Outro** | `OUTRO` | nome, descricao | Qualquer JSON livre |

### 3.1.2. Schema Prisma Atualizado

```prisma
enum TipoEntidade {
  EMPRESA
  CANDIDATO
  PROPOSTA
  MARCA
  DIMENSAO
  SERVICO_PUBLICO
  OUTRO
}

model Estabelecimento {
  // Campos COMUNS (universais para qualquer tipo)
  id             String      @id @default(cuid())
  organizationId String
  unitId         String?
  nome           String
  logoUrl        String?
  descricao      String?
  alias          String?
  ativo          Boolean     @default(true)

  // NOVO: Tipagem da entidade
  tipo           TipoEntidade @default(EMPRESA)

  // NOVO: Dados específicos do tipo (flexível)
  metadados      Json?       // Schema varia conforme o tipo

  // Campos legados de empresa (opcionais, ignorados para outros tipos)
  endereco       String?
  telefone       String?
  whatsapp       String?
  website        String?
  instagram      String?
  facebook       String?

  // Relações existentes
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  segmentos      EstabelecimentoSegmento[]
  votos          VotoEstabelecimento[]
  enquetes       Enquete[]

  @@index([organizationId])
  @@index([organizationId, ativo])
  @@index([organizationId, tipo])
  @@index([unitId])
}
```

### 3.1.3. UI Adaptativa no CRUD de Entidades

O formulário de cadastro de entidade se adapta ao **tipo selecionado**:
- Admin seleciona `EMPRESA` → exibe campos de contato (tel, whatsapp, instagram)
- Admin seleciona `CANDIDATO` → exibe campos de partido, número, cargo
- Admin seleciona `PROPOSTA` → exibe campos de área orçamentária, impacto
- Admin seleciona `OUTRO` → exibe apenas nome + JSON livre editável

**Breaking change: ZERO.** Os campos existentes permanecem, apenas ficam opcionais conforme o tipo. Dados existentes de empresas continuam funcionando perfeitamente.

## 3.2. Tabela de Tipos × Cenários

| Nicho | Tipo da Entidade | Pré-cadastro? | Fonte |
|-------|------------------|---------------|-------|
| Premiação (C1, C5) | `EMPRESA` | ✅ Sim | CRUD Entidades |
| Top of Mind (C2-C4) | `EMPRESA` | ❌ Nasce do voto | Consolidação posterior |
| Recall Assistido (C18) | `EMPRESA` | ⚡ Híbrido | Base + input livre |
| Política (C6-C9) | `CANDIDATO` | ✅ Sim | CRUD Entidades |
| Políticas Públicas (C10-C11) | `SERVICO_PUBLICO` | ✅ Sim | CRUD Entidades |
| Audiência (C13) | `PROPOSTA` | ✅ Sim | CRUD Entidades |
| Brand (C15) | `MARCA` | ❌ Nasce do voto | Consolidação posterior |
| Corporativo (C16-C17) | `DIMENSAO` | ✅ Sim | CRUD Entidades |

### Regra: O Ciclo de Vida da Entidade
```
Top of Mind:  Texto livre → "VotoLivre" → Consolidação → "Estabelecimento" (canônico, tipo inferido)
Lista:        Seleção direta → "VotoEstabelecimento" (já existe)
Recall Assistido: Sugestão aceita → "VotoEstabelecimento" | Texto novo → "VotoLivre"
```

No UI do Admin, a aba "Empresas" será renomeada para **"Entidades"** e exibirá label contextual:
- Tipo Premiação → "Empresas Participantes"
- Tipo Político → "Candidatos"
- Tipo Políticas Públicas → "Serviços e Propostas"
- Tipo Corporativo → "Dimensões Avaliadas"

---

# 4. Os 8 Tipos de Bloco de Pesquisa

| Tipo | Código | Descrição | Componente Base |
|------|--------|-----------|-----------------|
| **Top of Mind Puro** | `top-of-mind` | Input texto livre + Metaphone PT-BR | `<input type="text">` |
| **Recall Assistido** | `recall-assistido` | Digita livre, sugestões preditivas + Metaphone, aceita customValue | `<TopOfMindField allowCustomValue>` ← **JÁ EXISTE** (+ Metaphone) |
| **Lista Sugerida** | `lista-sugerida` | Dropdown fechado com opções pré-cadastradas, ordem randomizada | `<Select>` (dropdown nativo, **NÃO** TopOfMindField) |
| **Qualidade** | `qualidade` | Perguntas de avaliação (rating, escalas, Likert) | `<RatingMatrix>` |
| **NPS** | `nps` | Escala 0-10 + campo texto aberto | `<NPSWidget>` |
| **Priorização** | `priorizacao` | Ranking/ordenação de opções drag-and-drop | `<SortableList>` |
| **Texto Livre** | `texto-livre` | Resposta aberta (com agrupamento temático) | `<textarea>` |
| **Aprovação** | `aprovacao` | A Favor / Contra / Neutro sobre propostas | `<ApprovalCard>` |

### Diferença Clara: Recall Assistido vs Lista Sugerida

| Aspecto | Recall Assistido | Lista Sugerida |
|---------|-----------------|----------------|
| **Componente** | `<TopOfMindField>` (pesquisador preditivo) | `<Select>` (dropdown clássico) |
| **Comportamento** | Eleitor digita → sistema sugere matches | Eleitor abre dropdown → vê todas as opções |
| **Valor customizado** | ✅ Sim (`allowCustomValue=true`) → vira `VotoLivre` | ❌ Não — só opções pré-cadastradas |
| **Metaphone** | ✅ Busca fonética ao digitar | ❌ Não se aplica |
| **Ordem das opções** | Por relevância/similaridade | 🎲 **Randomizada** para evitar viés de apresentação |
| **Cenários** | C2-C4, C18 (Premiação + Brand) | C1, C5, C7, C9 (Lista fechada) |

### Metaphone no Recall Assistido (Evolução do TopOfMindField)
O componente `TopOfMindField` que **já existe** no Formbuilder será potencializado com Metaphone PT-BR:
- Carrega opções via `dataSource.endpoint` (entidades da categoria)
- Faz **fuzzy-match fonético** com `@oloko64/metaphone-ptbr-node` ao digitar (além do match textual com aliases)
- Se o eleitor digitar "Padaria do Ze", o Metaphone encontra "Padaria do Zé" mesmo com acentuação diferente
- Com `allowCustomValue=true`, permite valor novo se nenhum match é aceito (vira `VotoLivre`)

Nenhum concorrente oferece esse meio-termo. Enquanto outros forçam "ou aberto ou fechado", nós oferecemos o **modo que reduz erros de digitação drasticamente** via fonética em tempo real, sem impedir o recall espontâneo.

### Randomização na Lista Sugerida
Na Lista Sugerida (dropdown), a ordem das opções será **embaralhada aleatoriamente** a cada renderização. Isso é crítico para:
- **Evitar viés de apresentação:** O primeiro da lista tende a receber mais votos
- **Isonomia:** Todos os candidatos/empresas/propostas têm chance igual de posição
- **Configurável:** O admin pode desativar a randomização se houver motivo (ex: ordem alfabética para serviços públicos)

---

# 5. Templates de Qualidade com Herança Hierárquica

## 5.1. Regra de Herança (Cascata Pai → Filho)

O sistema de Segmentos já é hierárquico (`paiId` no Prisma). A regra de resolução é:

```
function resolverTemplate(categoriaId: string): TemplateQualidade | null {
  1. Busca template vinculado diretamente à categoria
  2. Se não encontrar → sobe para o pai (segmento.paiId)
  3. Se o pai tem template → retorna este (HERANÇA)
  4. Se nem o pai tem → sobe mais um nível (avô)
  5. Se ninguém tem → retorna null (sem perguntas de qualidade)
}
```

### Exemplo Prático
```
Alimentação (template: "Avaliação Gastronômica" → Sabor, Higiene, Preço)
├── Padaria (sem template próprio → HERDA "Avaliação Gastronômica")
├── Restaurante (sem template próprio → HERDA "Avaliação Gastronômica")
├── Pizzaria (template: "Pizza Específica" → Sabor, Massa, Entrega)  ← OVERRIDE

Saúde (template: "Avaliação Saúde" → Pontualidade, Diagnóstico, Infraestrutura)
├── Dentista (sem template → HERDA)
├── Médico (sem template → HERDA)
├── Hospital (template: "Hospital" → Emergência, UTI, Higiene)       ← OVERRIDE
```

**Impacto:** O admin configura 5-8 templates nos segmentos-pai e cobre 60+ categorias automaticamente. Só cria override quando absolutamente necessário.

## 5.2. Schema do Template

```typescript
interface TemplateQualidade {
  id: string;
  nome: string;                      // "Avaliação Gastronômica"
  organizationId: string;
  perguntas: PerguntaQualidade[];
}

interface PerguntaQualidade {
  id: string;
  texto: string;                     // "Como você avalia o atendimento?"
  tipo: 'rating-5' | 'rating-10' | 'likert' | 'sim-nao' | 'texto';
  obrigatorio: boolean;
  opcoes?: string[];                 // Para Likert: ["Péssimo","Ruim","Regular","Bom","Excelente"]
  ordem: number;
}
```

## 5.3. Vinculação ao Segmento

```prisma
model Segmento {
  // ... campos existentes ...
  templateQualidadeId  String?
  templateQualidade    TemplateQualidade? @relation(fields: [templateQualidadeId], references: [id])
}
```

A vinculação é **no Segmento** (não no bloco), pois a herança segue a árvore hierárquica dos segmentos.

---

# 6. Expansão da Tela de Enquete (NÃO tela nova)

## 6.1. As 9 Abas Atuais + 1 Nova

A tela de `EnqueteForm` será **expandida** com uma nova aba estrategicamente posicionada:

```
[Dados Básicos] → [Categorias] → [🔬 Pesquisa] → [Entidades] → [Segurança]
→ [Premiação] → [Avisos Legais] → [Resultados] → [Identidade] → [Agradecimento]
                                      ▲ NOVA
```

A aba "Empresas" é renomeada para **"Entidades"** com label contextual.

## 6.2. Visibilidade Condicional por Tipo de Pesquisa

O campo **"Tipo de Pesquisa"** na aba `Dados Básicos` (ou no topo da aba `🔬 Pesquisa`) é o **controlador mestre** que mostra/esconde abas e seções:

| Aba | Premiação | Política | Políticas Públicas | Corporativo | Custom |
|-----|-----------|----------|--------------------|-------------|--------|
| Dados Básicos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Categorias | ✅ | ✅ (label: "Cargos Eletivos") | ✅ (label: "Áreas Temáticas") | ✅ (label: "Dimensões") | ✅ |
| 🔬 Pesquisa | ✅ | ✅ | ✅ | ✅ | ✅ |
| Entidades | ✅ (label: "Empresas") | ✅ (label: "Candidatos") | 🔒 Collapsed (label: "Serviços") | 🔒 Collapsed | ✅ |
| Segurança | ✅ | ✅ | ✅ | ✅ | ✅ |
| 🎁 Premiação | ✅ (ativo por padrão) | ✅ (OFF por padrão, ativável) | ✅ (OFF por padrão, ativável) | ✅ (OFF por padrão, ativável) | ✅ |
| Avisos Legais | ✅ | ✅ | ✅ | ✅ | ✅ |
| Resultados | ✅ | ✅ | ✅ | ✅ | ✅ |
| Identidade | ✅ | ✅ | ✅ | ✅ | ✅ |
| Agradecimento | ✅ | ✅ | ✅ | ✅ | ✅ |

**Regra de Premiação Universal:** A aba Premiação é **sempre visível** em todos os tipos de pesquisa, porque premiação é um **potencializador de engajamento** que pode ser usado em qualquer contexto:
- Pesquisa política com sorteio de brindes → incentiva participação
- Consulta pública com cupom de desconto → aumenta adesão
- Pesquisa corporativa com prêmio pro colaborador → melhora taxa de resposta

A diferença é que no tipo "Premiação" o toggle vem **ON por padrão**, nos outros vem **OFF por padrão** (mas o admin pode ativar).

**Nota:** Abas `🔒 Collapsed` ficam cinzas e recolhidas, NÃO desaparecem. O admin pode expandi-las manualmente. Isso garante que o Custom tenha acesso a tudo.

## 6.3. Cruzamento Detalhado: Cada Campo Existente × 18 Cenários

### Aba "Dados Básicos" — Campos e Relevância

| Campo | C1-C5 | C6-C9 | C10-C14 | C15-C17 | C18 |
|-------|-------|-------|---------|---------|-----|
| Título da Enquete | ✅ | ✅ | ✅ | ✅ | ✅ |
| Formulário do Hub | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modo de Acesso (Restrito/Público/Híbrido) | ✅ | ✅ (geralmente Público) | ✅ (geralmente Público) | ✅ (geralmente Restrito) | ✅ |
| Descrição | ✅ | ✅ | ✅ | ✅ | ✅ |
| Data Início / Fim | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tipo de Pesquisa (NOVO)** | ✅ | ✅ | ✅ | ✅ | ✅ |

### Aba "🔬 Pesquisa" (NOVA) — Seções Internas

| Seção | C1-C5 (Premiação) | C6-C9 (Política) | C10-C14 (Pol. Públicas) | C15-C17 (Corporativo) | C18 (Recall Assistido) |
|-------|-------------------|------------------|-------------------------|----------------------|------------------------|
| Modo de Coleta (Top of Mind / Recall Assistido / Lista / Misto) | ✅ | ✅ | ❌ (Priorização/Aprovação) | ✅ | ✅ |
| Recall Duplo (espontâneo → estimulado) | ❌ | ✅ (C8) | ❌ | ✅ (C15) | ❌ |
| Templates de Qualidade | ✅ | ❌ | ✅ (C11) | ✅ (C16) | ✅ |
| Blocos NPS | ❌ | ❌ | ✅ (C12) | ✅ (C17) | ❌ |
| Blocos Priorização | ❌ | ❌ | ✅ (C10) | ❌ | ❌ |
| Blocos Aprovação | ❌ | ❌ | ✅ (C13) | ❌ | ❌ |
| Bloco Texto Livre (qualitativo) | ❌ | ❌ | ✅ (C14) | ✅ (C16) | ❌ |
| Modo Distribuição | ✅ | ✅ | ✅ | ✅ | ✅ |

### Aba "Segurança" — Campos e Relevância

| Campo | C1-C5 | C6-C9 | C10-C14 | C15-C17 | C18 |
|-------|-------|-------|---------|---------|-----|
| Exigir Identificação | ✅ Sim | ✅ Opcionalmente | ✅ Opcionalmente | ✅ Sim | ✅ |
| Exigir CPF | ✅ Comum | ❌ Geralmente não | ❌ Geralmente não | ✅ Possível | ✅ |
| Nível de Segurança (OTP) | ✅ | ❌ | ❌ | ✅ | ✅ |
| Percentual Mínimo Conclusão | ✅ | ✅ | ✅ | ✅ | ✅ |

### Aba "🎁 Premiação" — Disponível para TODOS os tipos (Toggle Universal)

| Campo | C1-C5 (Premiação) | C6-C9 (Política) | C10-C14 (Pol. Públicas) | C15-C17 (Corporativo) | C18 |
|-------|-------------------|------------------|-------------------------|----------------------|-----|
| Toggle "Ativar Premiação" | ✅ ON | ✅ OFF (ativável) | ✅ OFF (ativável) | ✅ OFF (ativável) | ✅ OFF (ativável) |
| Usar Números da Sorte | ✅ | ✅ se ativado | ✅ se ativado | ✅ se ativado | ✅ se ativado |
| Configuração de Premiação | ✅ | ✅ se ativado | ✅ se ativado | ✅ se ativado | ✅ se ativado |

**Exemplos de uso cross-tipo:**
- Consulta PPA com prêmio: "Vote nas prioridades da cidade e concorra a um tablet!" → engajamento 3x maior
- Pesquisa corporativa com premiação: "Participe da pesquisa de clima e concorra a um day off!" → adesão de 95%
- Pesquisa política com sorteio: "Opine sobre os candidatos e concorra a ingressos para o show municipal!"

---

# 7. Lead Enriquecido (Dados Demográficos em JSON)

## 7.1. Novo Campo no Modelo Lead

```prisma
model Lead {
  // ... campos existentes (nome, sexo, cpf, whatsapp, etc.) ...

  // NOVO: JSON flexível para dados demográficos do formulário do Hub
  dadosDemograficos Json?    // { bairro: "Centro", faixaEtaria: "25-34", profissao: "..." }
}
```

## 7.2. Como É Populado

Quando o Lead passa pelo "Gate de Identificação" (`GamifiedGate`), os dados demográficos presentes no formulário do Hub são automaticamente extraídos do JSON de submissão e persistidos nesse campo:

```typescript
// No momento da submissão (POST /api/submissions):
const dadosDemograficos = {};
for (const field of demographicFields) {
  if (dados[field.id]) {
    dadosDemograficos[field.label || field.id] = dados[field.id];
  }
}

await tx.lead.update({
  where: { id: leadId },
  data: { dadosDemograficos }
});
```

## 7.3. Poder do Lead Enriquecido

- **Analytics:** "Dos eleitores da Padaria do Zé, 60% são do bairro Centro"
- **CRM:** Segmentação baseada em qualquer campo demográfico sem alterar schema
- **Campanhas futuras:** Re-engajar leads com base em perfil demográfico
- **Compliance:** Dados centralizados facilitam atendimento a requisições LGPD

---

# 8. Regras de Distribuição: Enquete vs Campanha

## 8.1. Na Enquete (Configuração Base)

| Campo | Descrição |
|-------|-----------|
| `modoDistribuicao` | Define o **comportamento global**: Todas / Grupo / Individual / Aleatório / Rotativo |
| `segmentoIds[]` | Define o **universo de categorias** ativas na pesquisa (TransferList existente) |
| `maxCategoriasPorEleitor` | Para modo aleatório: quantas categorias sortear por pessoa |

## 8.2. Na Campanha (Segmentação Específica)

| Campo | Descrição |
|-------|-----------|
| `segmentacao.grupoIds[]` | Quais grupos/categorias ESTA campanha vai disparar |
| `segmentacao.pesoDistribuicao` | Ex: `{ "alimentacao": 60, "saude": 40 }` — % de disparos por grupo |

**Exemplo Real:**
- Enquete: "Melhores do Ano 2026" com 60 categorias ativas, modo="Grupo"
- Campanha 1: "Grupo Alimentação" → dispara para leads do bairro Centro → eleitor vota em Padaria, Restaurante, Pizzaria
- Campanha 2: "Grupo Saúde" → dispara para leads acima de 40 anos → eleitor vota em Médico, Dentista, Hospital
- Campanha 3: "Todas" → link público → eleitor vota em todas as 60

---

# 9. UX da Aba "🔬 Pesquisa" — O Coração do Sistema

## 9.1. Princípio de Design: Inteligência Adaptativa

A aba NÃO mostra todas as opções de uma vez. Ela se adapta ao **Tipo de Pesquisa** selecionado, revelando progressivamente apenas o que é relevante.

## 9.2. Estrutura Visual da Aba

```
┌─────────────────────────────────────────────────────────────┐
│  🔬 CONFIGURAÇÃO DA PESQUISA                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────── TIPO DE PESQUISA ──────────────┐             │
│  │  🏆 Premiação  │  🗳️ Política  │  🏛️ Pol. Públicas  │  💼 Corp  │  ⚙️ Custom │
│  └───────────────────────────────────────────┘             │
│                                                             │
│  ┌─────────── MODO DE COLETA ────────────────┐             │
│  │  Selector visual: como o eleitor vai      │             │
│  │  responder em cada categoria?             │             │
│  │                                           │             │
│  │  ○ Top of Mind Puro (texto 100% livre)    │             │
│  │  ◉ Recall Assistido (digita + sugestões)  │   ← default para Premiação
│  │  ○ Lista Sugerida (seleção fechada)       │             │
│  │  ○ Recall Duplo (espontâneo → estimulado) │   ← visível apenas em Política/Brand
│  │                                           │             │
│  │  ☑ Permitir resposta "Não sei / Não conheço" nesta     │
│  │    categoria (não obriga escolha)         │             │
│  └───────────────────────────────────────────┘             │
│                                                             │
│  ┌─────────── QUALIDADE (condicional) ───────┐             │
│  │  ☑ Incluir perguntas de qualidade         │             │
│  │                                           │             │
│  │  [Herança automática dos templates]       │             │
│  │  Alimentação → "Avaliação Gastronômica" ✅│             │
│  │  ├── Padaria → herdado ✅                 │             │
│  │  ├── Restaurante → herdado ✅             │             │
│  │  ├── Pizzaria → "Pizza Específica" ⚡     │  ← override │
│  │  Saúde → "Avaliação Saúde" ✅             │             │
│  │  ├── Dentista → herdado ✅                │             │
│  │                                           │             │
│  │  [+ Criar Novo Template]                  │             │
│  │  [+ Configurar Override por Categoria]    │             │
│  │                                           │             │
│  │  Perguntas CONDICIONAIS: aparecem após    │             │
│  │  o eleitor votar em cada categoria        │             │
│  └───────────────────────────────────────────┘             │
│                                                             │
│  ┌─────────── BLOCOS ADICIONAIS ─────────────┐             │
│  │  ▸ NPS (Net Promoter Score)     [OFF]  ← collapsed     │
│  │  ▸ Priorização (Ranking)        [OFF]  ← collapsed     │
│  │  ▸ Aprovação (A Favor/Contra)   [OFF]  ← collapsed     │
│  │  ▸ Texto Livre (Qualitativo)    [OFF]  ← collapsed     │
│  └───────────────────────────────────────────┘             │
│                                                             │
│  ┌─────────── DISTRIBUIÇÃO ──────────────────┐             │
│  │  Como as categorias serão distribuídas?    │             │
│  │                                           │             │
│  │  ◉ Todas — Eleitor vê todas as categorias │             │
│  │  ○ Por Grupo — Campanha filtra por grupo  │             │
│  │  ○ Individual — 1 categoria por campanha  │             │
│  │  ○ Aleatório — Sistema sorteia N categorias│             │
│  │      └── Máx. categorias por eleitor: [5] │             │
│  │  ○ Rotativo — Round-robin para equilíbrio │             │
│  └───────────────────────────────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 9.3. Presets Automáticos por Tipo

Ao selecionar o Tipo de Pesquisa, os campos se pré-configuram:

### Preset "Premiação Empresarial"
- Modo de Coleta: **Recall Assistido** (nosso diferencial — TopOfMindField + Metaphone)
- Qualidade: **Habilitada** (com herança)
- Distribuição: **Por Grupo**
- Premiação: **ON** por padrão
- Blocos extras: Todos desabilitados
- Entidades: tipo `EMPRESA`

### Preset "Pesquisa Política"
- Modo de Coleta: **Top of Mind Puro** (ou Recall Duplo para C8)
- Qualidade: **Desabilitada**
- Distribuição: **Todas**
- Premiação: **OFF** por padrão (ativável)
- Blocos extras: Todos desabilitados
- Entidades: tipo `CANDIDATO`

### Preset "Políticas Públicas"
- Modo de Coleta: **Priorização** (para C10) ou **Aprovação** (para C13)
- Qualidade: **Habilitada** (para C11 — avaliação de serviços)
- Distribuição: **Todas**
- Premiação: **OFF** por padrão (ativável para incentivar participação)
- Blocos extras: NPS (C12), Texto Livre (C14)
- Entidades: tipo `SERVICO_PUBLICO` ou `PROPOSTA`

### Preset "Corporativo"
- Modo de Coleta: **Qualidade** (rating por dimensão)
- Qualidade: **Habilitada**
- Distribuição: **Todas**
- Premiação: **OFF** por padrão (ativável)
- Blocos extras: NPS (C17), Texto Livre (C16)
- Entidades: tipo `DIMENSAO`

### Preset "Personalizado"
- Todos os controles desbloqueados e visíveis
- Premiação: **OFF** por padrão (ativável)
- Sem pré-configuração
- Entidades: tipo selecionável

## 9.4. Regras de Interação da UI

| Ação do Admin | Efeito na Tela |
|---------------|----------------|
| Seleciona "Premiação" | Modo de Coleta → Recall Assistido. Seção Qualidade expandida. Blocos extras colapsados. |
| Muda Modo para "Top of Mind Puro" | Aba "Entidades" fica collapsed (não se aplica em TOM puro) |
| Habilita "Recall Duplo" | Aparece config: "Etapa 1: texto livre" → "Etapa 2: lista sugerida" |
| Desabilita "Qualidade" | Toda a seção de herança/templates recolhe suavemente |
| Seleciona Distribuição "Aleatório" | Aparece campo "Máx. categorias por eleitor" |
| Toggle de "NPS" | Expande/recolhe a seção com config do NPS |
| Toggle de "Priorização" | Expande/recolhe com config de arrastar e soltar |

---

# 10. Integração Hub ↔ Spoke: O DynamicResearchEngine

## 10.1. Arquitetura

```
┌──────────────────────────────────────────────┐
│              FORMBUILDER (Hub)               │
│                                              │
│  [Nome]  [CPF]  [Bairro]  [Idade]  [Gênero] │   ← Demografia
│                                              │
│  ┌──────────────────────────────────────────┐│
│  │     <DynamicResearchEngine />            ││   ← UM ÚNICO COMPONENTE
│  │                                          ││
│  │  Props: { enqueteId, organizationId }    ││
│  │                                          ││
│  │  1. GET /api/enquetes/{id}/research-config│
│  │  2. Recebe: blocos, categorias, templates││
│  │  3. Renderiza N blocos dinamicamente     ││
│  └──────────────────────────────────────────┘│
│                                              │
│  [Botão: Enviar Voto]                        │
└──────────────────────────────────────────────┘
```

## 10.2. Fluxo de Submissão

```
Eleitor preenche formulário
        │
        ▼
FormRenderer.onSubmit({ nome, cpf, bairro, ..., researchData: {...} })
        │
        ▼
POST /api/submissions (Spoke Prêmio Destaque)
        │
        ├─→ Salva Resposta (dadosJson completo) na DB local
        ├─→ Para cada voto de lista → VotoEstabelecimento
        ├─→ Para cada voto livre → VotoLivre (com chavesFoneticas)
        ├─→ Para cada resposta de qualidade → RespostaQualidade
        ├─→ Enriquece Lead com dadosDemograficos (JSON)
        │
        └─→ Fire-and-forget: Telemetria → Hub (SEM dados sensíveis)
```

---

# 11. Modelo de Dados Completo (Schema Prisma)

> **Nota:** O modelo `Estabelecimento` com `tipo` e `metadados` já foi detalhado na Seção 3.1.2.

## 11.1. Novas Entidades

```prisma
// Novo campo no Segmento para herança de template
model Segmento {
  // ... campos existentes ...
  templateQualidadeId  String?
  templateQualidade    TemplateQualidade? @relation(fields: [templateQualidadeId], references: [id])
}

// Template reutilizável de perguntas de qualidade
model TemplateQualidade {
  id              String               @id @default(cuid())
  organizationId  String
  nome            String               // "Avaliação Gastronômica"
  perguntas       PerguntaQualidade[]
  segmentos       Segmento[]           // Segmentos que usam este template
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  @@index([organizationId])
}

model PerguntaQualidade {
  id                  String            @id @default(cuid())
  templateQualidadeId String
  templateQualidade   TemplateQualidade @relation(fields: [templateQualidadeId], references: [id], onDelete: Cascade)
  texto               String            // "Como você avalia o atendimento?"
  tipo                String            // rating-5 | rating-10 | likert | sim-nao | texto
  obrigatorio         Boolean           @default(false)
  opcoes              Json?             // ["Péssimo","Ruim","Regular","Bom","Excelente"]
  ordem               Int               @default(0)
}

// Resposta de qualidade individual (por categoria votada)
model RespostaQualidade {
  id            String   @id @default(cuid())
  respostaId    String
  resposta      Resposta @relation(fields: [respostaId], references: [id], onDelete: Cascade)
  perguntaId    String   // ID da PerguntaQualidade
  categoriaId   String   // Segmento sobre o qual a avaliação se refere
  valor         String   // "4" para rating, "Bom" para likert, texto livre
  criadoEm      DateTime @default(now())

  @@index([respostaId])
  @@index([categoriaId])
}

// Voto de texto livre (Top of Mind / Recall Assistido com valor novo)
model VotoLivre {
  id              String   @id @default(cuid())
  respostaId      String
  resposta        Resposta @relation(fields: [respostaId], references: [id], onDelete: Cascade)
  categoriaId     String   // Segmento-categoria onde foi digitado
  textoOriginal   String   // "Padaria do Zé" (exatamente como digitado)
  chavesFoneticas String[] // ["PTRTSIS", "PTRT"] — Metaphone PT-BR
  consolidadoEmId String?  // ID do Estabelecimento canônico (após consolidação)
  criadoEm        DateTime @default(now())

  @@index([respostaId])
  @@index([categoriaId])
  @@index([chavesFoneticas])
}
```

## 11.2. Extensões em Modelos Existentes

```prisma
model Lead {
  // ... campos existentes ...
  dadosDemograficos Json?    // Dados capturados do formulário do Hub
}

model Enquete {
  // ... campos existentes ...
  tipoPesquisa             String   @default("premiacao") // premiacao | politica | politicas-publicas | corporativo | custom
  modoColeta               String   @default("recall-assistido") // top-of-mind | recall-assistido | lista-sugerida | recall-duplo
  incluirQualidade         Boolean  @default(false)
  modoDistribuicao         String   @default("grupo") // todas | grupo | individual | aleatorio | rotativo
  maxCategoriasPorEleitor  Int?     // Para modo aleatório
  randomizarOpcoes         Boolean  @default(true)  // Embaralhar ordem das opções na Lista Sugerida
  configPesquisa           Json?    // Configurações extras (blocos NPS, Priorização, etc.)
}

model Resposta {
  // ... campos existentes ...
  respostasQualidade  RespostaQualidade[]
  votosLivres         VotoLivre[]
}
```

---

# 12. APIs a Desenvolver

## 12.1. Configuração (Admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/admin/templates-qualidade` | Lista templates da organização |
| `POST` | `/api/admin/templates-qualidade` | Cria template |
| `PUT` | `/api/admin/templates-qualidade/[id]` | Edita template |
| `DELETE` | `/api/admin/templates-qualidade/[id]` | Remove template |

## 12.2. Pesquisa Pública (Votação)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/enquetes/[id]/research-config` | Config pública para DynamicResearchEngine |
| `POST` | `/api/submissions` | Recebe voto completo (ampliada) |

## 12.3. Consolidação Top of Mind

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/admin/enquetes/[id]/top-of-mind/grupos` | Clusters fonéticos |
| `POST` | `/api/admin/enquetes/[id]/top-of-mind/consolidar` | Mescla textos em entidade canônica |

## 12.4. Analytics

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/admin/enquetes/[id]/analytics/overview` | Visão geral |
| `GET` | `/api/admin/enquetes/[id]/analytics/demographics` | Insights demográficos por ganhador |
| `GET` | `/api/admin/enquetes/[id]/analytics/qualidade` | Radar de qualidade |
| `GET` | `/api/admin/enquetes/[id]/analytics/ranking` | Ranking consolidado |

---

# 13. Critérios de Aceite

## Grupo A: Motor de Pesquisa
- [ ] **CA-A1:** Admin seleciona Tipo de Pesquisa e a UI se adapta automaticamente
- [ ] **CA-A2:** Presets funcionam corretamente para cada tipo
- [ ] **CA-A3:** Modo de Coleta configurável: Top of Mind, Recall Assistido, Lista, Duplo
- [ ] **CA-A4:** `<DynamicResearchEngine />` renderiza categorias dinamicamente

## Grupo B: Herança de Templates
- [ ] **CA-B1:** Template no segmento-pai é herdado automaticamente pelos filhos
- [ ] **CA-B2:** Override no segmento-filho substitui o template herdado
- [ ] **CA-B3:** Visualização da herança exibida na aba 🔬 Pesquisa

## Grupo C: Top of Mind + Recall Assistido
- [ ] **CA-C1:** Campo texto livre funciona e salva VotoLivre com chaves fonéticas
- [ ] **CA-C2:** Recall Assistido sugere entidades ao digitar e aceita valor customizado
- [ ] **CA-C3:** Sala de Consolidação exibe clusters e permite mesclagem

## Grupo D: Entidades Generalizadas
- [ ] **CA-D1:** Aba "Entidades" exibe label contextual baseado no tipo de pesquisa
- [ ] **CA-D2:** VotoLivre pode ser consolidado em Estabelecimento canônico

## Grupo E: Lead Enriquecido
- [ ] **CA-E1:** Campo dadosDemograficos populado automaticamente a partir do formulário
- [ ] **CA-E2:** Analytics consegue filtrar por qualquer campo demográfico

## Grupo F: Distribuição
- [ ] **CA-F1:** Configuração base na Enquete (modo + universo de categorias)
- [ ] **CA-F2:** Filtro por grupo/categoria na Campanha

## Grupo G: Segurança
- [ ] **CA-G1:** Nenhum dado de voto ou PII trafega para o Hub
- [ ] **CA-G2:** Telemetria anônima funcionando

---

# 14. Estimativa

| Fase | Sprint | Esforço |
|------|--------|---------|
| **Fase 1:** Fundação (schema, aba Pesquisa, presets, templates qualidade) | Sprint 1 | 1 semana |
| **Fase 2:** DynamicResearchEngine + Recall Assistido + Top of Mind | Sprint 2 | 1 semana |
| **Fase 3:** Consolidação + Lead Enriquecido + Analytics | Sprint 3 | 1 semana |
| **Fase 4:** Distribuição Avançada + Testes + Documentação | Sprint 4 | 0.5 semana |

**Total: ~3.5 semanas de desenvolvimento**

---

# 15. Diferencial Competitivo

Este motor posiciona o govTeam como o **único** sistema brasileiro que:
1. Unifica pesquisa espontânea, assistida e estimulada numa única plataforma
2. Oferece o **Recall Assistido com Metaphone em tempo real** como diferencial exclusivo
3. Resolve variações de nomes automaticamente via fonética PT-BR (tanto no backend quanto no frontend)
4. Gera insights demográficos cruzados sem expor dados individuais (Urna Trancada)
5. Escala de 5 a 500 categorias sem retrabalho do administrador
6. Herda templates de qualidade na hierarquia de segmentos (configura 5, cobre 60+)
7. Atende premiações, pesquisas políticas, políticas públicas E corporativo com a mesma engine
8. Enriquece leads automaticamente com dados demográficos do formulário
9. **Premiação como potencializador universal** de engajamento para qualquer tipo de pesquisa
10. **Randomização de opções** na Lista Sugerida para isonomia e neutralidade científica
11. **Entidade Avaliada Tipada** — candidato, empresa, proposta, marca ou serviço com metadados específicos flexíveis

---

*Documento gerado pela Equipe de Arquitetura & IA — govTeam AIOS v3.1*
*Pronto para revisão final do Product Owner*
