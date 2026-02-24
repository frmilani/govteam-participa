# Épicos — Motor Universal de Pesquisa

> **PRD Fonte:** `docs/prd/top-of-mind-analytics-prd.md` (v3.1)
> **Status:** Em planejamento
> **Data:** 2026-02-21

## Visão Geral

A evolução do Spoke Prêmio Destaque para Motor Universal de Pesquisa está organizada em 6 épicos com dependências claras e execução em 4 fases (~3.5 semanas).

## Mapa de Épicos

| # | Épico | Arquivo | Fase | Stories | Status |
|---|-------|---------|------|---------|--------|
| E1 | 🏗️ Fundação do Motor (Schema + Entidade Tipada) | `EPIC-E1-fundacao-motor.md` | Fase 1 | 4 | ✅ Concluído (Stories) |
| E2 | 🔬 Aba Pesquisa + Presets + Tipo de Pesquisa | `EPIC-E2-aba-pesquisa.md` | Fase 1 | 4 | ✅ Concluído (Stories) |
| E3 | 🧩 Templates de Qualidade com Herança | `EPIC-E3-templates-qualidade.md` | Fase 1-2 | 3 | ✅ Concluído (Stories) |
| E4 | 🎯 DynamicResearchEngine + Recall Assistido | `EPIC-E4-research-engine.md` | Fase 2 | 5 | ✅ Concluído (Stories) |
| E5 | 👤 Lead Enriquecido + Analytics Demográfico | `EPIC-E5-lead-analytics.md` | Fase 3 | 3 | ✅ Concluído (Stories) |
| E6 | 📊 Distribuição Avançada + Campanhas | `EPIC-E6-distribuicao.md` | Fase 3-4 | 3 | ✅ Concluído (Stories) |

**Total: 22 stories estimadas**

## Grafo de Dependências

```
E1 (Fundação) ──────→ E2 (Aba Pesquisa)
       │                    │
       │                    ▼
       └────────────→ E3 (Templates Qualidade)
                            │
                            ▼
                      E4 (DynamicResearchEngine)
                            │
                      ┌─────┴─────┐
                      ▼           ▼
               E5 (Lead+Analytics) E6 (Distribuição)
```

## Faseamento

### Fase 1 — Fundação (Sprint 1, ~1 semana)
- **E1:** Schema Prisma, enum TipoEntidade, UI Entidades adaptativa
- **E2:** Campo tipoPesquisa, aba 🔬 Pesquisa, presets automáticos
- **E3 início:** CRUD de Templates de Qualidade

### Fase 2 — Motor de Pesquisa (Sprint 2, ~1 semana)
- **E3 conclusão:** Herança hierárquica, vinculação ao segmento
- **E4:** DynamicResearchEngine, Recall Assistido com Metaphone, Top of Mind, Sala de Consolidação

### Fase 3 — Analytics + Distribuição (Sprint 3, ~1 semana)
- **E5:** Lead enriquecido, APIs de analytics demográfico
- **E6:** Modos de distribuição, integração com campanhas

### Fase 4 — Qualidade + Documentação (Sprint 4, ~0.5 semana)
- Testes end-to-end cross-cenário
- Documentação final
- Segurança (CA-G1, CA-G2)

## Critérios de Aceite Transversais

| Critério | Épico(s) |
|----------|----------|
| CA-G1: Nenhum dado de voto/PII trafega para o Hub | E4, E5 |
| CA-G2: Telemetria anônima funcionando | E4, E5 |
