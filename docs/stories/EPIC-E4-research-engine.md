# Epic E4: 🎯 DynamicResearchEngine + Recall Assistido + Top of Mind

> **PRD Fonte:** `docs/prd/top-of-mind-analytics-prd.md` — Seções 4, 10, 12.2
> **Fase:** 2 (Sprint 2)
> **Critérios de Aceite:** CA-A3, CA-A4, CA-C1, CA-C2, CA-C3
> **Dependências:** E1 (schema), E2 (aba Pesquisa), E3 (templates qualidade)
> **Risco:** ALTO — Componente público complexo, integração Hub ↔ Spoke, Metaphone

---

## Epic Goal

Implementar o **DynamicResearchEngine**, o componente central que renderiza a pesquisa para o eleitor no Formbuilder (Hub). Este componente consome a configuração da enquete e renderiza dinamicamente blocos de pesquisa (Top of Mind, Recall Assistido, Lista Sugerida, Qualidade, etc.). Inclui a implementação do **Recall Assistido com Metaphone PT-BR** (diferencial competitivo) e a **Sala de Consolidação** para Top of Mind.

## Contexto do Sistema Existente

- **Formbuilder (Hub):** Já possui `TopOfMindField` com `allowCustomValue`
- **Spoke Prêmio Destaque:** Já tem API de votação (`POST /api/submissions`)
- **Integração Hub ↔ Spoke:** API key authentication, server-to-server
- **TopOfMindField existente:** Input com autocomplete para entidades — base para Recall Assistido

## Enhancement Details

- **O que muda:** Novo componente `<DynamicResearchEngine />` no Formbuilder. Novo endpoint `GET /api/enquetes/[id]/research-config`. Evolução do TopOfMindField com Metaphone. Sala de Consolidação no admin.
- **Como integra:** DynamicResearchEngine é embeddado no formulário do Hub. Submissão envia dados para o Spoke via POST.
- **Diferencial competitivo:** Recall Assistido com Metaphone PT-BR é exclusivo — nenhum concorrente oferece.

---

## Stories

### Story E4.1: API research-config — Configuração Pública da Pesquisa

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, api_contract_validation, security_scan]
```

**Descrição:** Criar o endpoint `GET /api/enquetes/[id]/research-config` que retorna a configuração completa para o DynamicResearchEngine renderizar: blocos, categorias, templates de qualidade resolvidos, modo de coleta, opções de distribuição. Este endpoint é **público** (sem auth, pois o eleitor acessa).

**Critérios de Aceite:**
- [ ] `GET /api/enquetes/[id]/research-config` retorna:
  ```json
  {
    "tipoPesquisa": "premiacao",
    "modoColeta": "recall-assistido",
    "randomizarOpcoes": true,
    "categorias": [
      {
        "id": "...",
        "nome": "Padaria",
        "segmentoId": "...",
        "entidades": [...],
        "templateQualidade": { "perguntas": [...] }
      }
    ],
    "blocosAdicionais": { "nps": false, "priorizacao": false },
    "distribuicao": { "modo": "grupo", "maxCategorias": null }
  }
  ```
- [ ] Templates de qualidade resolvidos via herança (function resolverTemplate do E3)
- [ ] Entidades filtradas por `ativo=true` e categoria
- [ ] Lista de entidades randomizada se `randomizarOpcoes=true`
- [ ] Endpoint público (sem autenticação) — mas sem dados sensíveis
- [ ] Nenhum dado de PII no response
- [ ] Rate limiting aplicado (100 req/min per IP)
- [ ] Cache de 60s para mesma enquete (evitar queries a cada page load)

**Quality Gates:**
- Pre-Commit: Security scan (nenhum PII exposto), input validation
- Pre-PR: Performance test com 60+ categorias, API contract review

**Estimativa:** 3-4h

---

### Story E4.2: Componente DynamicResearchEngine

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, pattern_validation, performance_review]
```

**Descrição:** Criar o componente `<DynamicResearchEngine />` que recebe `enqueteId` e `organizationId`, faz fetch da research-config e renderiza dinamicamente os blocos de pesquisa. Este componente vive no **Formbuilder (Hub)** e é embeddado no formulário.

**Critérios de Aceite:**
- [ ] Componente `<DynamicResearchEngine enqueteId={id} organizationId={orgId} />`
- [ ] Faz `GET /api/enquetes/{id}/research-config` on mount
- [ ] Renderiza categorias dinamicamente com base na config
- [ ] Para cada categoria, renderiza o componente correto baseado no `modoColeta`:
  - `top-of-mind` → `<input type="text">` livre
  - `recall-assistido` → `<TopOfMindField>` com sugestões + Metaphone
  - `lista-sugerida` → `<Select>` (dropdown com opções randomizadas)
  - `recall-duplo` → Etapa 1 (texto livre) → Etapa 2 (lista)
- [ ] Se qualidade habilitada, após votar em uma categoria mostra perguntas do template resolvido
- [ ] Coleta todas as respostas e expõe via callback `onResearchComplete(data)`
- [ ] Loading state durante fetch da config
- [ ] Error handling com retry automático
- [ ] Responsivo (mobile-first)
- [ ] Não expõe dados entre categorias (isolamento)

**Quality Gates:**
- Pre-Commit: Component pattern validation, state management review
- Pre-PR: Performance com 60+ categorias, mobile responsiveness

**Estimativa:** 6-8h

---

### Story E4.3: Recall Assistido com Metaphone PT-BR

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, algorithm_validation, performance_review]
```

**Descrição:** Evoluir o componente `TopOfMindField` existente no Formbuilder com busca fonética via Metaphone PT-BR. O eleitor digita livremente, e o componente sugere entidades da base que são foneticamente similares. Se nenhum match é aceito, `allowCustomValue=true` permite criar valor novo (→ VotoLivre).

**Critérios de Aceite:**
- [ ] Instalar `@oloko64/metaphone-ptbr-node` ou equivalente
- [ ] TopOfMindField carrega entidades via `dataSource.endpoint` (da research-config)
- [ ] Ao digitar, faz fuzzy-match em 3 camadas:
  1. Match textual exato (substring)
  2. Match por alias (`estabelecimento.alias`)
  3. Match fonético via Metaphone PT-BR
- [ ] "Padaria do Ze" encontra "Padaria do Zé" (acentuação)
- [ ] "Farmacia São João" encontra "Farmácia São João" (acentuação)
- [ ] "Restorante" encontra "Restaurante" (erro ortográfico)
- [ ] Sugestões rankeadas por relevância: exato > alias > fonético
- [ ] `allowCustomValue=true` → valor não aceito vira VotoLivre com `chavesFoneticas[]`
- [ ] Chaves fonéticas geradas no backend ao salvar VotoLivre
- [ ] Performance: Busca deve responder em <100ms para base de 500 entidades
- [ ] Debounce de 200ms no input para evitar flood de buscas

**Quality Gates:**
- Pre-Commit: Testes unitários do matching fonético
- Pre-PR: Benchmark de performance, validação com nomes reais do mercado brasileiro

**Estimativa:** 5-6h

---

### Story E4.4: Fluxo de Submissão Ampliado (POST /api/submissions)

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, security_scan, data_integrity_validation]
```

**Descrição:** Ampliar o endpoint `POST /api/submissions` para processar os novos tipos de dados vindos do DynamicResearchEngine: VotoLivre (Top of Mind + Recall Assistido com valor novo), RespostaQualidade, e dados de blocos adicionais (NPS, Priorização, etc.).

**Critérios de Aceite:**
- [ ] Para cada voto de lista → `VotoEstabelecimento` (existente, sem mudança)
- [ ] Para cada voto livre (Top of Mind / Recall Assistido com customValue) → `VotoLivre`:
  - `textoOriginal` preserva texto exato do eleitor
  - `chavesFoneticas[]` geradas via Metaphone PT-BR
  - `categoriaId` vincula à categoria
- [ ] Para cada resposta de qualidade → `RespostaQualidade`:
  - `perguntaId` referencia a PerguntaQualidade
  - `categoriaId` referencia o segmento avaliado
  - `valor` contém a resposta (rating, likert text, texto livre)
- [ ] Submissão em transaction (tudo ou nada)
- [ ] Fire-and-forget telemetria para Hub (SEM dados sensíveis, CA-G1)
- [ ] Validação: Não aceitar submissão para enquete encerrada
- [ ] Validação: Categorias submetidas devem pertencer à enquete
- [ ] Resposta da API inclui `respostaId` e `numeroDaSorte` (se premiação ativa)

**Quality Gates:**
- Pre-Commit: Security scan (nenhum PII no telemetry), transaction integrity
- Pre-PR: Teste end-to-end do fluxo completo de submissão

**Estimativa:** 4-5h

---

### Story E4.5: Sala de Consolidação (Top of Mind)

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, ux_review, data_integrity_validation]
```

**Descrição:** Criar a "Sala de Consolidação" no admin onde o administrador visualiza os VotosLivres agrupados por similaridade fonética (clusters) e pode mesclá-los em Estabelecimentos canônicos. Ex: "Padaria do Zé", "Padaria do Ze", "padaria do zé" → mergem para "Padaria do Zé" (Estabelecimento oficial).

**Critérios de Aceite:**
- [ ] `GET /api/admin/enquetes/[id]/top-of-mind/grupos` retorna clusters fonéticos:
  ```json
  [
    {
      "chavesFoneticas": ["PTRT", "Z"],
      "textos": ["Padaria do Zé", "Padaria do Ze", "padaria do zé"],
      "totalVotos": 15,
      "estabelecimentoSugerido": { "id": "...", "nome": "Padaria do Zé" }
    }
  ]
  ```
- [ ] Agrupamento fonético usa Metaphone PT-BR para clustering
- [ ] UI da Sala de Consolidação mostra:
  - Lista de clusters ordenados por totalVotos (desc)
  - Para cada cluster: textos variantes, contagem, sugestão de entidade canônica
  - Botão "Consolidar" → mescla todos os VotosLivres no Estabelecimento selecionado
  - Botão "Criar Novo" → cria Estabelecimento a partir do cluster
  - Botão "Ignorar" → marca cluster como revisado sem ação
- [ ] `POST /api/admin/enquetes/[id]/top-of-mind/consolidar`:
  - Recebe `clusterIds[]` + `estabelecimentoId`
  - Atualiza `consolidadoEmId` nos VotosLivres
  - Atualiza contagem de votos no Estabelecimento
- [ ] Filtro por categoria na Sala de Consolidação
- [ ] Indicador de progresso: "X de Y clusters consolidados"
- [ ] Não permite consolidar clusters já consolidados (sem duplicação)

**Quality Gates:**
- Pre-Commit: Data integrity validation (consolidação não perde votos)
- Pre-PR: UX review, teste com cenário realista (100+ votos livres)

**Estimativa:** 5-6h

---

## Compatibilidade

- [x] Submissão existente (VotoEstabelecimento) continua funcionando
- [x] TopOfMindField existente é estendido (não substituído)
- [x] Formulários existentes sem DynamicResearchEngine continuam normais
- [x] CA-G1: Nenhum dado de voto ou PII trafega para o Hub

## Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Performance do Metaphone com base grande | Média | Alto | Pré-calcular chaves fonéticas no CRUD de entidades, indexar |
| DynamicResearchEngine complexo demais | Média | Alto | Arquitetura de componentes isolados por tipo de bloco |
| Integração Hub ↔ Spoke falha | Baixa | Alto | API key auth existente, retry automático, error boundary |
| Clusters fonéticos incorretos | Média | Médio | Admin sempre valida manualmente na Sala de Consolidação |

## Rollback Plan

- Remover DynamicResearchEngine do Formbuilder
- Manter TopOfMindField original
- Votos continuam via fluxo existente (VotoEstabelecimento)
- Dados de VotoLivre ficam no banco sem ser processados

## Definition of Done

- [ ] Todas as 5 stories completadas com critérios de aceite atendidos
- [ ] DynamicResearchEngine renderiza pesquisa para todos os modos de coleta
- [ ] Recall Assistido com Metaphone sugere entidades foneticamente
- [ ] Submissão ampliada processa VotoLivre + RespostaQualidade
- [ ] Sala de Consolidação permite mesclar votos livres
- [ ] Nenhum PII/dado de voto trafega para o Hub (CA-G1)
- [ ] Performance aceitável com 60+ categorias
- [ ] Sem regressão na funcionalidade existente
- [ ] Código revisado e aprovado
