# Epic E1: 🏗️ Fundação do Motor (Schema + Entidade Tipada)

> **PRD Fonte:** `docs/prd/top-of-mind-analytics-prd.md` — Seções 3, 11
> **Fase:** 1 (Sprint 1)
> **Critérios de Aceite:** CA-D1, CA-D2
> **Dependências:** Nenhuma (épico raiz)
> **Risco:** MÉDIO — Alteração de schema em produção

---

## Epic Goal

Evoluir o modelo de dados do Spoke Prêmio Destaque para suportar entidades além de "Empresa", introduzindo o conceito de **Entidade Avaliada Tipada** com `TipoEntidade` enum e campo `metadados Json`, além de preparar os novos modelos (VotoLivre, TemplateQualidade, RespostaQualidade) que serão usados pelos épicos subsequentes.

## Contexto do Sistema Existente

- **Stack:** Next.js 14 (App Router) + Prisma + PostgreSQL (Supabase)
- **Modelo atual:** `Estabelecimento` com campos fixos de empresa (endereco, telefone, whatsapp, etc.)
- **CRUD existente:** `/admin/estabelecimentos` com listagem, criação e edição
- **Integração:** Multi-tenant via `organizationId`, autenticação SSO via Hub

## Enhancement Details

- **O que muda:** Modelo `Estabelecimento` recebe campos `tipo` (enum) e `metadados` (Json). Novos modelos criados: `VotoLivre`, `TemplateQualidade`, `PerguntaQualidade`, `RespostaQualidade`. Extensões em `Lead`, `Enquete`, `Resposta`.
- **Como integra:** Migration Prisma backward-compatible. Dados existentes recebem `tipo: EMPRESA` por padrão. UI adapta campos conforme tipo selecionado.
- **Breaking changes:** ZERO. Campos existentes permanecem. Default garante compatibilidade.

---

## Stories

### Story E1.1: Migration Prisma — Entidade Tipada e Novos Modelos

```yaml
executor: "@data-engineer"
quality_gate: "@dev"
quality_gate_tools: [schema_validation, migration_review, backward_compatibility_check]
```

**Descrição:** Criar migration Prisma que adiciona `TipoEntidade` enum, campos `tipo` e `metadados` ao modelo `Estabelecimento`, e cria os novos modelos: `TemplateQualidade`, `PerguntaQualidade`, `RespostaQualidade`, `VotoLivre`. Estender modelos `Lead` (dadosDemograficos), `Enquete` (tipoPesquisa, modoColeta, etc.) e `Resposta` (relações com novos modelos).

**Critérios de Aceite:**
- [ ] Enum `TipoEntidade` criado com valores: EMPRESA, CANDIDATO, PROPOSTA, MARCA, DIMENSAO, SERVICO_PUBLICO, OUTRO
- [ ] Campo `tipo TipoEntidade @default(EMPRESA)` adicionado a `Estabelecimento`
- [ ] Campo `metadados Json?` adicionado a `Estabelecimento`
- [ ] Índice `@@index([organizationId, tipo])` adicionado
- [ ] Modelo `TemplateQualidade` criado com campos conforme PRD §5.2
- [ ] Modelo `PerguntaQualidade` criado com relação cascade para TemplateQualidade
- [ ] Modelo `RespostaQualidade` criado com relação para Resposta
- [ ] Modelo `VotoLivre` criado com campos `textoOriginal`, `chavesFoneticas`, `consolidadoEmId`
- [ ] Campo `dadosDemograficos Json?` adicionado a `Lead`
- [ ] Campos `tipoPesquisa`, `modoColeta`, `incluirQualidade`, `modoDistribuicao`, `maxCategoriasPorEleitor`, `randomizarOpcoes`, `configPesquisa` adicionados a `Enquete`
- [ ] Relações `respostasQualidade[]` e `votosLivres[]` adicionadas a `Resposta`
- [ ] Campo `templateQualidadeId` adicionado a `Segmento`
- [ ] Migration roda sem erros em banco com dados existentes
- [ ] Dados existentes preservados (estabelecimentos recebem `tipo: EMPRESA`)
- [ ] `npx prisma generate` executa com sucesso

**Quality Gates:**
- Pre-Commit: Schema validation, backward compatibility verificada
- Pre-PR: Migration safety check (dados existentes não afetados)

**Estimativa:** 2-3h

---

### Story E1.2: UI Adaptativa — CRUD de Entidades

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, pattern_validation, ui_consistency]
```

**Descrição:** Refatorar o CRUD de Estabelecimentos (`/admin/estabelecimentos`) para suportar a entidade tipada. O formulário de criação/edição deve adaptar os campos exibidos com base no `tipo` selecionado. A listagem deve exibir filtro por tipo e label contextual.

**Critérios de Aceite:**
- [ ] Seletor de `TipoEntidade` no formulário de criação/edição
- [ ] Ao selecionar `EMPRESA` → exibe campos de contato (telefone, whatsapp, instagram, facebook, website, endereco)
- [ ] Ao selecionar `CANDIDATO` → exibe campos de partido, numeroCandidato, cargo, coligacao em `metadados`
- [ ] Ao selecionar `PROPOSTA` → exibe campos de areaOrcamentaria, impactoEstimado, prazoExecucao em `metadados`
- [ ] Ao selecionar `SERVICO_PUBLICO` → exibe campos de secretaria, localAtendimento em `metadados`
- [ ] Ao selecionar `DIMENSAO` → exibe campos de areaCorporativa, peso em `metadados`
- [ ] Ao selecionar `MARCA` → exibe campos de segmentoMercado, paisOrigem em `metadados`
- [ ] Ao selecionar `OUTRO` → exibe editor JSON livre para metadados
- [ ] Filtro por tipo na listagem de entidades
- [ ] Campos de empresa (endereco, tel, etc.) ficam ocultos para tipos que não os usam
- [ ] Dados existentes (tipo EMPRESA) continuam funcionando perfeitamente

**Quality Gates:**
- Pre-Commit: Verificar que padrões UI existentes são seguidos (Modal, DataTable)
- Pre-PR: Validação de acessibilidade e responsividade

**Estimativa:** 4-5h

---

### Story E1.3: Renomear Aba "Empresas" → "Entidades" com Label Contextual

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, ui_consistency]
```

**Descrição:** Na tela de Enquete (EnqueteForm), renomear a aba "Empresas" para "Entidades" e fazer o label se adaptar ao tipo de pesquisa selecionado: "Empresas Participantes" (Premiação), "Candidatos" (Política), "Serviços e Propostas" (Pol. Públicas), "Dimensões Avaliadas" (Corporativo).

**Critérios de Aceite:**
- [ ] Aba renomeada de "Empresas" para "Entidades" no EnqueteForm
- [ ] Label contextual baseado no campo `tipoPesquisa` da enquete:
  - `premiacao` → "Empresas Participantes"
  - `politica` → "Candidatos"
  - `politicas-publicas` → "Serviços e Propostas"
  - `corporativo` → "Dimensões Avaliadas"
  - `custom` → "Entidades"
- [ ] Aba fica `collapsed` (cinza, recolhida) quando o tipo de pesquisa não exige pré-cadastro (ex: Top of Mind puro)
- [ ] Admin pode expandir manualmente abas collapsed

**Quality Gates:**
- Pre-Commit: UI consistency check

**Estimativa:** 2h

---

### Story E1.4: API de Entidades — Filtro por Tipo + Metadados

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, api_contract_validation, security_scan]
```

**Descrição:** Estender as APIs existentes de Estabelecimentos para suportar filtragem por `tipo` e persistência de `metadados`. Garantir que o endpoint de listagem aceita query param `?tipo=CANDIDATO` e que criação/edição aceita o campo `metadados`.

**Critérios de Aceite:**
- [ ] `GET /api/estabelecimentos?tipo=CANDIDATO` filtra por tipo
- [ ] `GET /api/estabelecimentos` sem filtro retorna todos (backward compatible)
- [ ] `POST /api/estabelecimentos` aceita campos `tipo` e `metadados`
- [ ] `PATCH /api/estabelecimentos/[id]` aceita atualização de `tipo` e `metadados`
- [ ] Validação: `metadados` deve ser JSON válido
- [ ] Validação: `tipo` deve ser valor válido do enum `TipoEntidade`
- [ ] Resposta da API inclui `tipo` e `metadados` nos objetos retornados
- [ ] Testes de integração para cada cenário

**Quality Gates:**
- Pre-Commit: Security scan, input validation
- Pre-PR: API contract backward compatibility check

**Estimativa:** 2-3h

---

## Compatibilidade

- [x] APIs existentes de Estabelecimentos continuam funcionando sem alteração de contrato
- [x] Schema backward compatible — campo `tipo` tem default `EMPRESA`
- [x] UI existente funciona normalmente para tipo EMPRESA
- [x] Dados em produção preservados

## Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Migration falha em dados existentes | Baixa | Alto | Default `EMPRESA` garante compatibilidade. Testar em staging primeiro. |
| Performance com campo Json | Baixa | Médio | Índice em `tipo` (não em metadados). Queries filtram por `tipo`. |
| UI confusa com muitos tipos | Média | Médio | Presets automáticos reduzem escolhas para o admin. |

## Rollback Plan

- Reverter migration Prisma (migration down)
- Remover novos campos/modelos
- UI volta ao CRUD original de Estabelecimentos

## Definition of Done

- [ ] Todas as 4 stories completadas com critérios de aceite atendidos
- [ ] Migration testada em banco com dados existentes
- [ ] CRUD de Entidades funcional com UI adaptativa
- [ ] APIs backward compatible
- [ ] Funcionalidade existente verificada sem regressão
- [ ] Código revisado e aprovado
