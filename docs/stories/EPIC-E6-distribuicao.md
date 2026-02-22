# Epic E6: 📊 Distribuição Avançada + Campanhas Segmentadas

> **PRD Fonte:** `docs/prd/top-of-mind-analytics-prd.md` — Seções 8, 12.2
> **Fase:** 3-4 (Sprint 3 e 4)
> **Critérios de Aceite:** CA-F1, CA-F2
> **Dependências:** E1 (campos modoDistribuicao, maxCategoriasPorEleitor), E2 (aba Pesquisa com seção Distribuição), E4 (DynamicResearchEngine)
> **Risco:** MÉDIO — Lógica de distribuição afeta experiência do eleitor

---

## Epic Goal

Implementar o sistema de **Distribuição Avançada de Categorias** que controla como as categorias da enquete são apresentadas ao eleitor (todas, por grupo, individual, aleatório, rotativo). Integrar com o sistema de **Campanhas WhatsApp** existente (RF-007) para permitir segmentação avançada por grupo de categorias e pesos de distribuição.

## Contexto do Sistema Existente

- **Modos atuais:** Campanhas existentes (RF-007) já disparam para leads com tracking links
- **TransferList:** Componente existente para mover segmentos entre listas na enquete
- **DynamicResearchEngine (E4):** Consome a config e renderiza categorias — precisa saber quais mostrar
- **Campanhas WhatsApp:** Sistema completo com Wizard, BullMQ, tracking (RF-007)

## Enhancement Details

- **O que muda:** DynamicResearchEngine filtra categorias baseado no modo de distribuição e na campanha/link de acesso. Campanhas ganham campo de segmentação por grupo/categoria e pesos.
- **Como integra:** Configuração base na Enquete (modo + universo), segmentação específica na Campanha. research-config API considera a distribuição.

---

## Stories

### Story E6.1: Motor de Distribuição de Categorias

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, logic_validation, algorithm_review]
```

**Descrição:** Implementar a lógica server-side que determina quais categorias um eleitor específico deve ver, baseado no `modoDistribuicao` da enquete e no contexto de acesso (campanha, link público, tracking link).

**Critérios de Aceite:**
- [ ] **Modo "Todas":** Eleitor vê todas as categorias ativas da enquete
- [ ] **Modo "Por Grupo":** Categorias filtradas pelo grupo definido na campanha (`segmentacao.grupoIds[]`)
- [ ] **Modo "Individual":** Apenas 1 categoria por campanha
- [ ] **Modo "Aleatório":** Sistema sorteia N categorias (max = `maxCategoriasPorEleitor`) para cada eleitor
  - Sorteio determinístico por lead (mesmo lead = mesmas categorias)
  - Seed baseado em `leadId + enqueteId` para reprodutibilidade
- [ ] **Modo "Rotativo":** Round-robin — categorias distribuídas equitativamente entre eleitores
  - Contagem de acessos por categoria para balancear
  - Garantir que todas as categorias recebem ~mesmo número de eleitores
- [ ] `GET /api/enquetes/[id]/research-config` aceita query param `?campanhaId=xxx` ou `?trackingHash=yyy`
- [ ] Se acesso via link público sem campanha → usa modo default da enquete
- [ ] Se acesso via campanha → aplica filtro da campanha
- [ ] Logging: qual modo de distribuição foi usado, quantas categorias apresentadas
- [ ] Testes unitários para cada modo de distribuição

**Quality Gates:**
- Pre-Commit: Algorithm review (aleatório determinístico, rotativo balanceado)
- Pre-PR: Teste de carga (1.000 acessos simultâneos com distribuição aleatória)

**Estimativa:** 5-6h

---

### Story E6.2: Segmentação Avançada nas Campanhas WhatsApp

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, api_contract_validation, backward_compatibility_check]
```

**Descrição:** Estender o modelo e o Wizard de Campanha (RF-007) para suportar segmentação por grupo de categorias e pesos de distribuição. Ex: Campanha 1 → "Grupo Alimentação" (60% dos disparos), Campanha 2 → "Grupo Saúde" (40%).

**Critérios de Aceite:**
- [ ] Modelo Campanha estendido com:
  ```
  segmentacao: {
    tipo: "tags" | "grupoCategoria" | "todos",
    tagIds?: string[],
    grupoIds?: string[],           // IDs dos segmentos/grupos de categorias
    pesoDistribuicao?: { [grupoId]: number }  // Percentual de disparos por grupo
  }
  ```
- [ ] Wizard de Campanha (Step 2) ganha opção "Segmentar por Grupo de Categorias"
  - Exibe categorias da enquete agrupadas
  - Permite selecionar grupo(s)
  - Se múltiplos grupos: campo de peso (% de distribuição)
- [ ] Tracking link gerado inclui `campanhaId` para o research-config filtrar categorias
- [ ] Validação: Soma dos pesos deve ser 100%
- [ ] Validação: Grupo selecionado deve conter categorias ativas na enquete
- [ ] Backward compatible: Campanhas existentes sem grupoIds continuam funcionando
- [ ] Preview no Step 5 (Revisão) mostra quais categorias cada grupo terá

**Quality Gates:**
- Pre-Commit: Backward compatibility check com campanhas existentes
- Pre-PR: Teste end-to-end: campanha com grupo → lead acessa → vê só categorias do grupo

**Estimativa:** 4-5h

---

### Story E6.3: UI de Configuração de Distribuição na Aba Pesquisa

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, ui_consistency, ux_review]
```

**Descrição:** Implementar a seção "Distribuição" na aba 🔬 Pesquisa do EnqueteForm com os controles visuais para selecionar modo e configurar parâmetros. Integrar com a TransferList existente de categorias.

**Critérios de Aceite:**
- [ ] Radio buttons para modo de distribuição: Todas, Por Grupo, Individual, Aleatório, Rotativo
- [ ] Modo "Todas" → sem configuração adicional
- [ ] Modo "Por Grupo" → info text: "Configure os grupos nas campanhas"
- [ ] Modo "Individual" → info text: "Cada campanha terá 1 categoria"
- [ ] Modo "Aleatório" → aparece campo slider/number: "Máx. categorias por eleitor" (1-20)
- [ ] Modo "Rotativo" → info text sobre round-robin automático
- [ ] Preview: "Com {N} categorias ativas e modo {modo}, cada eleitor verá ~{X} categorias"
- [ ] Tooltip explicativo em cada modo
- [ ] Valor default baseado no preset do tipo de pesquisa (E2.3):
  - Premiação → "Por Grupo"
  - Política → "Todas"
  - Pol. Públicas → "Todas"
  - Corporativo → "Todas"
- [ ] Valor salvo no campo `modoDistribuicao` e `maxCategoriasPorEleitor` da enquete
- [ ] Animação suave ao mostrar/esconder campos condicionais

**Quality Gates:**
- Pre-Commit: UI consistency, form state validation
- Pre-PR: UX review, teste de interações

**Estimativa:** 3-4h

---

## Compatibilidade

- [x] Campanhas existentes sem segmentação de grupo continuam funcionando
- [x] Enquetes existentes recebem `modoDistribuicao: "grupo"` por padrão
- [x] Link público sem campanha → todas as categorias (backward compatible)
- [x] TransferList existente não é alterada

## Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Modo aleatório não equitativo | Média | Médio | Seed determinístico garante reprodutibilidade, estatísticas monitoram equilíbrio |
| Modo rotativo perde contagem | Baixa | Médio | Contagem persistida em Redis ou tabela (não depender de memória) |
| Campanhas existentes quebram | Baixa | Alto | Backward compatible — campos novos são opcionais |
| Eleitor confuso com poucas categorias | Média | Baixo | UI clara indicando "Você está votando no Grupo X" |

## Rollback Plan

- Revertir filtro de categorias no research-config (retornar todas)
- Campos de segmentação da campanha ficam ignorados
- Modo fixo "Todas" para toda enquete

## Definition of Done

- [ ] Todas as 3 stories completadas com critérios de aceite atendidos
- [ ] 5 modos de distribuição funcionando (Todas, Grupo, Individual, Aleatório, Rotativo)
- [ ] Campanhas com segmentação por grupo e pesos
- [ ] UI de distribuição na aba Pesquisa funcional
- [ ] Backward compatible com campanhas e enquetes existentes
- [ ] Performance aceitável com distribuição aleatória/rotativa
- [ ] Sem regressão na funcionalidade existente
- [ ] Código revisado e aprovado
