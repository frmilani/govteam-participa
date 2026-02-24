# Epic E3: 🧩 Templates de Qualidade com Herança Hierárquica

> **PRD Fonte:** `docs/prd/top-of-mind-analytics-prd.md` — Seções 5, 11.1
> **Fase:** 1-2 (Sprint 1 e 2)
> **Critérios de Aceite:** CA-B1, CA-B2, CA-B3
> **Dependências:** E1 (modelos TemplateQualidade, PerguntaQualidade, campo templateQualidadeId no Segmento)
> **Risco:** MÉDIO — Lógica de herança hierárquica pode ter edge cases

---

## Epic Goal

Implementar o sistema de **Templates de Qualidade com Herança Hierárquica**, onde o admin configura templates nos segmentos-pai e estes são automaticamente herdados pelos segmentos-filhos, com possibilidade de override. O objetivo é que configurar 5-8 templates nos pais cubra 60+ categorias automaticamente.

## Contexto do Sistema Existente

- **Segmentos:** Modelo hierárquico existente com `paiId` (parent-child)
- **TransferList:** Componente existente para mover segmentos entre listas
- **Enquete ↔ Segmento:** Relação many-to-many via `EnqueteSegmento`
- **Stack:** Prisma + Next.js APIs + React components

## Enhancement Details

- **O que muda:** CRUD de Templates de Qualidade, function `resolverTemplate()` com busca hierárquica, visualização de herança na aba 🔬 Pesquisa.
- **Como integra:** Templates vinculados ao Segmento via `templateQualidadeId`. Herança resolve walkup na árvore `paiId`.
- **Impacto:** Admin configura poucos templates e cobre muitas categorias automaticamente.

---

## Stories

### Story E3.1: CRUD de Templates de Qualidade

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, api_contract_validation, pattern_validation]
```

**Descrição:** Criar o CRUD completo de Templates de Qualidade: API (admin) + UI de gestão. Um template contém nome + lista ordenada de perguntas com tipo (rating-5, rating-10, likert, sim-nao, texto).

**Critérios de Aceite:**
- [ ] `GET /api/admin/templates-qualidade` — lista templates da organização
- [ ] `POST /api/admin/templates-qualidade` — cria template com nome e perguntas
- [ ] `PUT /api/admin/templates-qualidade/[id]` — edita template (nome, perguntas)
- [ ] `DELETE /api/admin/templates-qualidade/[id]` — remove template (cascade nas perguntas)
- [ ] Cada pergunta tem: texto, tipo (rating-5 | rating-10 | likert | sim-nao | texto), obrigatorio, opcoes (array para likert), ordem
- [ ] UI de gestão acessível via menu admin com:
  - Listagem de templates com contagem de perguntas
  - Formulário de criação/edição com drag-and-drop para reordenar perguntas
  - Preview visual das perguntas
  - Botão de duplicar template
- [ ] Validação: Pelo menos 1 pergunta por template
- [ ] Validação: Opções obrigatórias para tipo `likert`
- [ ] Multi-tenant: Templates isolados por `organizationId`

**Quality Gates:**
- Pre-Commit: API contract validation, input sanitization
- Pre-PR: CRUD completo testado end-to-end

**Estimativa:** 4-5h

---

### Story E3.2: Herança Hierárquica — Function resolverTemplate()

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, logic_validation, performance_review]
```

**Descrição:** Implementar a função `resolverTemplate(categoriaId)` que resolve qual template de qualidade se aplica a uma categoria, subindo na hierarquia de segmentos (pai → avô → bisavô) até encontrar um template ou retornar null.

**Critérios de Aceite:**
- [ ] Function `resolverTemplate(categoriaId: string): Promise<TemplateQualidade | null>`
- [ ] Regra de resolução (PRD §5.1):
  1. Busca template vinculado diretamente à categoria
  2. Se não encontrar → sobe para o pai (`segmento.paiId`)
  3. Se o pai tem template → retorna este (HERANÇA)
  4. Se nem o pai tem → sobe mais um nível (avô)
  5. Se ninguém tem → retorna null
- [ ] Override funciona: Se filho tem template próprio, ignora o do pai
- [ ] Performance: Máximo 3-4 queries (profundidade máxima da árvore)
- [ ] Cache de resolução por enquete (evitar re-resolver para cada voto)
- [ ] API `GET /api/admin/segmentos/[id]/template-qualidade` retorna o template resolvido com flag `herdado: true/false`
- [ ] Testes unitários para cenários PRD §5.1 (Alimentação → Padaria herda, Pizzaria override)
- [ ] Edge case: Segmento sem pai e sem template → retorna null
- [ ] Edge case: Cadeia de 3+ níveis resolve corretamente

**Quality Gates:**
- Pre-Commit: Testes unitários com cobertura de edge cases
- Pre-PR: Performance review (evitar N+1 queries)

**Estimativa:** 3-4h

---

### Story E3.3: Visualização de Herança na Aba 🔬 Pesquisa

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, ui_consistency, ux_review]
```

**Descrição:** Na seção "Qualidade" da aba 🔬 Pesquisa do EnqueteForm, exibir a árvore de herança de templates vinculados aos segmentos da enquete. Mostrar visualmente quais categorias herdam de quem e quais têm override.

**Critérios de Aceite:**
- [ ] Seção "Qualidade" mostra árvore de herança conforme PRD §9.2:
  ```
  Alimentação → "Avaliação Gastronômica" ✅
  ├── Padaria → herdado ✅
  ├── Restaurante → herdado ✅
  ├── Pizzaria → "Pizza Específica" ⚡ ← override
  Saúde → "Avaliação Saúde" ✅
  ├── Dentista → herdado ✅
  ```
- [ ] Ícone ✅ para templates diretos e herdados
- [ ] Ícone ⚡ para overrides
- [ ] Ícone ⚠️ para categorias sem template (nenhuma herança encontrada)
- [ ] Botão "[+ Criar Novo Template]" abre modal de criação
- [ ] Botão "[+ Configurar Override por Categoria]" permite vincular template diferente a uma categoria específica
- [ ] Informação de herança carregada via API batch (não N+1)
- [ ] Tooltip no ícone de herança mostra "Herdado de: {nome do segmento pai}"
- [ ] Seção só aparece quando toggle "Incluir perguntas de qualidade" está ativo

**Quality Gates:**
- Pre-Commit: UI consistency check, performance de carregamento
- Pre-PR: UX review (clareza da visualização de herança)

**Estimativa:** 4-5h

---

## Compatibilidade

- [x] Segmentos existentes sem template → resolverTemplate retorna null (sem qualidade)
- [x] Enquetes existentes sem qualidade habilitada → seção não aparece
- [x] CRUD de templates é independente (pode ser usado antes dos demais épicos)

## Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Herança com ciclos na árvore de segmentos | Muito Baixa | Alto | Validar no CRUD de segmentos que paiId não cria ciclo |
| Performance com árvores profundas | Baixa | Médio | Limitar profundidade a 5 níveis, usar CTE recursiva se necessário |
| Admin confuso com herança | Média | Médio | Visualização clara com ícones e tooltips |

## Rollback Plan

- Remover seção de Qualidade da aba Pesquisa
- Manter CRUD de templates como feature standalone
- Dados de templates ficam intactos no banco

## Definition of Done

- [ ] Todas as 3 stories completadas com critérios de aceite atendidos
- [ ] CRUD de Templates de Qualidade funcional
- [ ] Herança hierárquica resolve corretamente (testes para cenário PRD §5.1)
- [ ] Visualização de herança na aba Pesquisa clara e performática
- [ ] Override por categoria funciona
- [ ] Sem regressão em funcionalidade existente
- [ ] Código revisado e aprovado
