# Epic E5: 👤 Lead Enriquecido + Analytics Demográfico

> **PRD Fonte:** `docs/prd/top-of-mind-analytics-prd.md` — Seções 7, 12.4
> **Fase:** 3 (Sprint 3)
> **Critérios de Aceite:** CA-E1, CA-E2
> **Dependências:** E1 (campo dadosDemograficos no Lead), E4 (submissão ampliada)
> **Risco:** BAIXO — Extension de dados existentes, sem breaking changes

---

## Epic Goal

Implementar o mecanismo de **Lead Enriquecido** que captura automaticamente dados demográficos do formulário do Hub e persiste no campo `dadosDemograficos Json` do modelo Lead. Criar as **APIs de Analytics Demográfico** que permitem insights cruzados (ex: "60% dos eleitores da Padaria do Zé são do bairro Centro") respeitando a Urna Trancada (sem expor dados individuais).

## Contexto do Sistema Existente

- **Lead:** Modelo existente com campos nome, sexo, cpf, whatsapp. Novo campo `dadosDemograficos Json?` (do E1).
- **GamifiedGate:** Componente existente de identificação do eleitor no formulário
- **Formulário do Hub:** Campos demográficos (bairro, faixaEtaria, profissao) configuráveis por organização
- **Princípio "Urna Trancada":** Analytics NÃO revela quem votou em quem — apenas agregações

---

## Stories

### Story E5.1: Enriquecimento Automático do Lead com Dados Demográficos

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, security_scan, data_integrity_validation]
```

**Descrição:** No momento da submissão (`POST /api/submissions`), extrair campos demográficos do JSON de submissão do formulário do Hub e persistir no campo `dadosDemograficos` do Lead. Os campos demográficos são configuráveis por organização (bairro, faixaEtaria, profissao, escolaridade, etc.).

**Critérios de Aceite:**
- [ ] Ao processar submissão, identificar campos demográficos do formulário do Hub
- [ ] Extrair valores dos campos demográficos do JSON de submissão
- [ ] Persistir no Lead: `dadosDemograficos: { bairro: "Centro", faixaEtaria: "25-34", profissao: "Professor" }`
- [ ] Campos demográficos são identificados por metadata do formulário (tipo "demografico") ou por lista configurável
- [ ] NÃO sobrescrever dados existentes — merge com dados anteriores
- [ ] Funciona com qualquer campo do formulário (schema flexível via Json)
- [ ] Lead sem formulário do Hub → campo permanece null (sem erro)
- [ ] Validação: Dados demográficos não contêm PII sensível (cpf, passwords)
- [ ] Log de quais campos foram capturados (sem os valores) para auditoria

**Quality Gates:**
- Pre-Commit: Security scan — garantir que PII sensível não entra no campo
- Pre-PR: Teste com formulários reais de diferentes organizações

**Estimativa:** 2-3h

---

### Story E5.2: APIs de Analytics Demográfico

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, security_scan, performance_review, privacy_validation]
```

**Descrição:** Criar as APIs de analytics que cruzam dados de votação com dados demográficos dos Leads, sempre em formato agregado (nunca individual). As APIs fornecem insights como: distribuição de votos por bairro, faixa etária dos eleitores de cada entidade, etc.

**Critérios de Aceite:**
- [ ] `GET /api/admin/enquetes/[id]/analytics/overview` retorna:
  - Total de respostas, taxa de conclusão, período de votação
  - Distribuição por tipo de voto (lista, livre, recall assistido)
  - Top 10 entidades mais votadas
- [ ] `GET /api/admin/enquetes/[id]/analytics/demographics` retorna:
  - Distribuição de votos por campo demográfico (bairro, faixaEtaria, etc.)
  - Cruzamento: "Dos eleitores de {entidade}, X% são de {bairro}"
  - Filtros: por categoria, por entidade, por campo demográfico
- [ ] `GET /api/admin/enquetes/[id]/analytics/qualidade` retorna:
  - Radar de qualidade por entidade (média por pergunta)
  - Ranking de entidades por nota de qualidade
  - Comparativo entre categorias
- [ ] `GET /api/admin/enquetes/[id]/analytics/ranking` retorna:
  - Ranking consolidado (votos de lista + votos livres consolidados)
  - Posição, nome, total votos, % do total
  - Filtro por categoria
- [ ] **REGRA URNA TRANCADA**: Nenhuma API retorna dados individuais (quem votou em quem)
- [ ] Dados agregados com mínimo de 5 respostas por grupo (evitar desanonimização)
- [ ] Performance: APIs devem responder em <2s para enquetes com 10.000 respostas
- [ ] Cache de 5min nas respostas de analytics (dados não mudam em tempo real)
- [ ] Autenticação obrigatória (admin only)

**Quality Gates:**
- Pre-Commit: Security scan — nenhum dado individual exposto
- Pre-PR: Privacy validation, performance com dataset realista

**Estimativa:** 5-7h

---

### Story E5.3: Dashboard de Analytics no Admin

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [code_review, ui_consistency, ux_review, performance_review]
```

**Descrição:** Criar o dashboard de analytics na área admin da enquete, consumindo as APIs do E5.2. O dashboard apresenta: visão geral, insights demográficos, radar de qualidade, e ranking consolidado com gráficos e tabelas interativas.

**Critérios de Aceite:**
- [ ] Nova aba "📊 Analytics" na tela de detalhes da enquete (ou botão "Ver Analytics")
- [ ] Seção "Visão Geral": Cards com total respostas, taxa conclusão, período
- [ ] Seção "Ranking": Tabela rankeable com entidades, votos, % do total
  - Filtro por categoria
  - Indicador visual (barras, medalhas para top 3)
- [ ] Seção "Perfil Demográfico": Gráficos por campo demográfico
  - Gráfico de barras: Votos por bairro
  - Gráfico de pizza: Distribuição por faixa etária
  - Cruzamento: Selecionar entidade → ver perfil demográfico dos eleitores
- [ ] Seção "Qualidade": Radar chart por entidade com notas por pergunta
  - Comparativo entre entidades da mesma categoria
  - Ranking por nota média de qualidade
- [ ] Loading states enquanto APIs carregam
- [ ] Exportar dados como CSV (respeitando anonimização)
- [ ] Responsivo (desktop-first com mobile support)
- [ ] Não mostra seções com dados insuficientes (<5 respostas)

**Quality Gates:**
- Pre-Commit: UI consistency, chart library validation
- Pre-PR: Performance com gráficos e 10.000+ pontos de dados

**Estimativa:** 6-8h

---

## Compatibilidade

- [x] Leads existentes sem dadosDemograficos → analytics mostra "Dados demográficos não coletados"
- [x] Enquetes existentes sem VotoLivre/RespostaQualidade → analytics mostra dados disponíveis
- [x] Campo dadosDemograficos é aditivo (não quebra nada)

## Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Desanonimização via cruzamento | Baixa | Alto | Mínimo de 5 respostas por grupo, não expor dados individuais |
| Performance de queries agregadas | Média | Médio | Materialized views ou cache, queries otimizadas com GROUP BY |
| LGPD compliance | Média | Alto | Dados demográficos em Json flexível, fácil de apagar per-lead |

## Rollback Plan

- Remover dashboard de analytics
- Campo dadosDemograficos fica no schema sem ser populado
- APIs de analytics retornam dados básicos (só contagem)

## Definition of Done

- [ ] Todas as 3 stories completadas com critérios de aceite atendidos
- [ ] Lead enriquecido automaticamente com dados demográficos
- [ ] 4 APIs de analytics funcionais com dados agregados
- [ ] Dashboard visual com gráficos e filtros
- [ ] Urna Trancada respeitada (nenhum dado individual exposto)
- [ ] Performance aceitável com datasets realistas
- [ ] Sem regressão na funcionalidade existente
- [ ] Código revisado e aprovado
