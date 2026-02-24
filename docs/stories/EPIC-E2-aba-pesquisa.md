# Epic E2: 🔬 Aba Pesquisa + Presets + Tipo de Pesquisa

> **PRD Fonte:** `docs/prd/top-of-mind-analytics-prd.md` — Seções 6, 9
> **Fase:** 1 (Sprint 1)
> **Critérios de Aceite:** CA-A1, CA-A2
> **Dependências:** E1 (campos tipoPesquisa, modoColeta, etc. no schema)
> **Risco:** MÉDIO — Alteração de UI complexa em tela existente

---

## Epic Goal

Criar a nova aba "🔬 Pesquisa" no EnqueteForm e o sistema de **Presets Automáticos por Tipo de Pesquisa**, que configura inteligentemente os campos da enquete ao selecionar um tipo (Premiação, Política, Pol. Públicas, Corporativo, Custom). A UI se adapta progressivamente, revelando apenas o que é relevante.

## Contexto do Sistema Existente

- **EnqueteForm:** Tela de criação/edição de enquetes com 9 abas existentes
- **Abas atuais:** Dados Básicos, Categorias, Entidades (ex-Empresas), Segurança, Premiação, Avisos Legais, Resultados, Identidade, Agradecimento
- **Stack:** React + shadcn/ui + react-hook-form + Zod

## Enhancement Details

- **O que muda:** Nova aba "🔬 Pesquisa" inserida entre Categorias e Entidades. Campo `tipoPesquisa` no Dados Básicos controla visibilidade/estado de todas as abas.
- **Como integra:** Extends o EnqueteForm existente. Novos campos do schema E1 são consumidos.
- **Premiação como toggle universal:** Aba Premiação fica visível em TODOS os tipos (ON por padrão em Premiação, OFF nos demais).

---

## Stories

### Story E2.1: Campo "Tipo de Pesquisa" + Visibilidade Condicional de Abas

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, pattern_validation, ui_consistency]
```

**Descrição:** Adicionar o campo `Tipo de Pesquisa` na aba "Dados Básicos" do EnqueteForm com seletor visual (cards ou tabs). Ao selecionar um tipo, as abas se mostram/escondem/colapsam conforme a tabela de visibilidade da PRD §6.2.

**Critérios de Aceite:**
- [ ] Seletor visual de Tipo de Pesquisa na aba Dados Básicos com opções: 🏆 Premiação, 🗳️ Política, 🏛️ Pol. Públicas, 💼 Corporativo, ⚙️ Custom
- [ ] Campo persiste no banco como `tipoPesquisa` (string)
- [ ] Aba "Categorias" exibe label contextual: "Cargos Eletivos" (Política), "Áreas Temáticas" (Pol. Pub.), "Dimensões" (Corp.)
- [ ] Aba "Entidades" exibe label contextual conforme PRD §6.2
- [ ] Abas marcadas como `🔒 Collapsed` ficam cinzas e recolhidas, mas acessíveis
- [ ] Aba "🎁 Premiação" visível em TODOS os tipos:
  - Premiação → toggle ON por padrão
  - Demais → toggle OFF por padrão (ativável)
- [ ] Tipo "Custom" torna todas as abas visíveis e desbloqueadas
- [ ] Default para novas enquetes: "Premiação" (backward compatible)

**Quality Gates:**
- Pre-Commit: Verificar que tab system existente não quebra
- Pre-PR: Validação de UX, transições suaves

**Estimativa:** 4-5h

---

### Story E2.2: Nova Aba "🔬 Pesquisa" — Estrutura e Layout

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, pattern_validation, ui_consistency]
```

**Descrição:** Criar a nova aba "🔬 Pesquisa" no EnqueteForm com a estrutura visual definida na PRD §9.2. A aba é posicionada entre "Categorias" e "Entidades" e contém seções: Modo de Coleta, Qualidade (condicional), Blocos Adicionais (collapsed), Distribuição.

**Critérios de Aceite:**
- [ ] Nova aba "🔬 Pesquisa" inserida na posição correta: `[Dados Básicos] → [Categorias] → [🔬 Pesquisa] → [Entidades] → ...`
- [ ] Seção "Modo de Coleta" com radio buttons: Top of Mind Puro, Recall Assistido, Lista Sugerida, Recall Duplo
- [ ] Checkbox "Permitir resposta 'Não sei / Não conheço'" visível
- [ ] Seção "Qualidade" com toggle "Incluir perguntas de qualidade" (expandível)
- [ ] Seção "Blocos Adicionais" com toggles collapsed: NPS, Priorização, Aprovação, Texto Livre
- [ ] Seção "Distribuição" com radio buttons: Todas, Por Grupo, Individual, Aleatório, Rotativo
- [ ] Campo "Máx. categorias por eleitor" aparece somente quando Distribuição = Aleatório
- [ ] Opção "Recall Duplo" visível somente para Política e Corporativo/Brand
- [ ] Campos persistem nos campos correspondentes do schema (modoColeta, incluirQualidade, modoDistribuicao, etc.)
- [ ] Layout responsivo e consistente com design system existente

**Quality Gates:**
- Pre-Commit: Consistência com componentes shadcn/ui existentes
- Pre-PR: Responsividade e acessibilidade

**Estimativa:** 5-6h

---

### Story E2.3: Presets Automáticos por Tipo de Pesquisa

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, logic_validation, pattern_validation]
```

**Descrição:** Implementar o sistema de presets que pré-configura a aba "🔬 Pesquisa" ao selecionar o Tipo de Pesquisa, conforme PRD §9.3. Ao mudar o tipo, os campos se ajustam automaticamente com animação suave.

**Critérios de Aceite:**
- [ ] Preset "Premiação Empresarial": Modo=Recall Assistido, Qualidade=ON, Distribuição=Por Grupo, Premiação=ON, Blocos extras=OFF
- [ ] Preset "Pesquisa Política": Modo=Top of Mind Puro, Qualidade=OFF, Distribuição=Todas, Premiação=OFF, Blocos extras=OFF
- [ ] Preset "Políticas Públicas": Modo=Priorização, Qualidade=ON (para C11), Distribuição=Todas, Premiação=OFF, NPS visível, Texto Livre visível
- [ ] Preset "Corporativo": Modo=Qualidade, Qualidade=ON, Distribuição=Todas, Premiação=OFF, NPS visível, Texto Livre visível
- [ ] Preset "Personalizado": Todos os controles desbloqueados, sem pré-configuração
- [ ] Ao mudar tipo, confirmação se admin quer aplicar preset (não sobrescrever config manual)
- [ ] Transição suave (animação de expand/collapse) ao aplicar preset
- [ ] Admin pode alterar qualquer campo pré-configurado pelo preset manualmente
- [ ] Presets são idempotentes (aplicar 2x não duplica dados)

**Quality Gates:**
- Pre-Commit: Testes unitários para cada preset
- Pre-PR: Validação cross-cenário (18 cenários da PRD)

**Estimativa:** 3-4h

---

### Story E2.4: Regras de Interação UI da Aba Pesquisa

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, ui_consistency, interaction_validation]
```

**Descrição:** Implementar as regras de interação dinâmica da aba Pesquisa conforme PRD §9.4. Cada ação do admin desencadeia efeitos visuais na tela (expand, collapse, show, hide).

**Critérios de Aceite:**
- [ ] Selecionar "Premiação" → Modo=Recall Assistido, Qualidade expandida, Blocos extras colapsados
- [ ] Mudar Modo para "Top of Mind Puro" → Aba "Entidades" fica collapsed
- [ ] Habilitar "Recall Duplo" → Aparece config de 2 etapas: "Etapa 1: texto livre" → "Etapa 2: lista sugerida"
- [ ] Desabilitar "Qualidade" → Seção de herança/templates recolhe suavemente
- [ ] Selecionar Distribuição "Aleatório" → Aparece campo "Máx. categorias por eleitor"
- [ ] Toggle de NPS → Expande/recolhe seção com config do NPS
- [ ] Toggle de Priorização → Expande/recolhe config de drag-and-drop
- [ ] Toggle de Aprovação → Expande/recolhe config A Favor/Contra
- [ ] Toggle de Texto Livre → Expande/recolhe config qualitativa
- [ ] Todas as animações são suaves (CSS transitions, 300ms)
- [ ] Estado da UI é consistente com o form state (react-hook-form)

**Quality Gates:**
- Pre-Commit: Testes de interação, verificar estado do form
- Pre-PR: Testes E2E das interações de toggle

**Estimativa:** 3-4h

---

## Compatibilidade

- [x] Enquetes existentes recebem `tipoPesquisa: "premiacao"` por padrão (do E1)
- [x] Abas existentes continuam funcionando
- [x] Ordem das abas preserva navegação existente
- [x] Nova aba é inserida sem quebrar fluxo

## Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade de UI com muitas condições | Alta | Médio | Separar lógica de presets em hook dedicado (`useResearchPresets`) |
| Performance com muitos re-renders | Média | Médio | Memoização e lazy loading das seções collapsed |
| Conflito com EnqueteForm existente | Baixa | Alto | Adicionar aba como componente isolado, integrar via props |

## Rollback Plan

- Remover nova aba do EnqueteForm
- Remover seletor de tipo do Dados Básicos
- Campos novos no schema ficam com defaults (não causam problema)

## Definition of Done

- [ ] Todas as 4 stories completadas com critérios de aceite atendidos
- [ ] Aba "🔬 Pesquisa" funcional com todas as seções
- [ ] 5 presets automáticos funcionando corretamente
- [ ] Regras de interação UI implementadas com animações suaves
- [ ] Enquetes existentes continuam funcionando sem regressão
- [ ] Código revisado e aprovado
