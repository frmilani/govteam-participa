<!-- manifest:type:plans -->
<!-- manifest:status:READY -->
<!-- manifest:updated:2024-12-09 -->

# Implementation Plans

> Planos detalhados de implementação para cada Requisito Funcional (RF).

## Quick Reference

| Key | Value |
|-----|-------|
| Type | plans |
| Status | ✅ READY (template disponível) |
| Items | 1 template + N planos |
| Depends On | PRD.md, agents/, design/ |

## Contents

<!-- instruction:for-ai -->
Use TEMPLATE.md como base para criar novos planos.
Cada RF deve ter seu próprio plano antes da implementação.
Planos referenciam agents/ para cada tipo de tarefa.
<!-- /instruction -->

### Template

| File | Status | Purpose |
|------|--------|---------|
| `TEMPLATE.md` | ✅ | Base para criar novos planos |

### Feature Plans

| Plan | File | Status | RF Coverage |
|------|------|--------|-------------|
| Tenant Isolation Infrastructure | `INFRA-001-tenant-isolation.md` | 📝 DRAFT | Infra/Security |
| <!-- placeholder:plans-list -->RF-001 - Autenticação SSO | `RF-001-autenticacao-sso.md` | ✅ READY | RF-001 |
| RF-002 - Gestão de Segmentos | `RF-002-gestao-segmentos.md` | ✅ READY | RF-002 |
| RF-003 - Gestão de Estabelecimentos | `RF-003-gestao-estabelecimentos.md` | ✅ READY | RF-003 |
| RF-004 - Gestão de Leads | `RF-004-gestao-leads.md` | ✅ READY | RF-004 |
| RF-005 - Integração Hub | `RF-005-integracao-hub.md` | ✅ READY | RF-005 |
| RF-006 - Criação de Enquetes | `RF-006-criacao-enquetes.md` | ✅ READY | RF-006 |
| RF-007 - Campanhas WhatsApp | `RF-007-campanhas-whatsapp.md` | ✅ READY | RF-007 |
| RF-008 - Landing Page Votação | `RF-008-landing-page-votacao.md` | ✅ READY | RF-008 |
| RF-009 - Resultados Rankings | `RF-009-resultados-rankings.md` | ✅ READY | RF-009 |
| RF-010 - Controle de Limites | `RF-010-controle-limites.md` | ✅ READY | RF-010 |
| RF-011 - Engajamento e Segurança | `RF-011-engajamento-seguranca.md` | ✅ READY | RF-011 |
| RF-012 - Analytics e Resultados | `RF-012-analytics-resultados-avancados.md` | ✅ READY | RF-012 |<!-- /placeholder -->

## How to Create a Plan

### Via Workflow (Recommended)

```bash
/plan RF-002
```

Isso cria `.context/plans/RF-002.md` automaticamente usando o template.

### Manual Process

1. Copiar `TEMPLATE.md` para `RF-XXX.md`
2. Preencher todas as seções
3. Substituir todos os `[PLACEHOLDER]`
4. Referenciar agents corretos em cada passo
5. Criar checklist completo

## Plan Structure

Cada plano contém:

```markdown
# Plano: RF-XXX - [Nome]

## Visão Geral
[O que será implementado]

## Arquitetura
[Diagrama Mermaid]

## Passo 1: [Database]
**Agent:** database-specialist.md
[Descrições, SEM código]

## Passo 2: [Backend]
**Agent:** backend-specialist.md
[Descrições, SEM código]

## Passo 3: [Frontend]
**Agent:** frontend-specialist.md
[Descrições, SEM código]

## Checklist
- [ ] Item granular 1
- [ ] Item granular 2
```

## Usage

### For AI Agents

1. **Creating Plans:** Use `/plan RF-XXX` para gerar do template
2. **Executing Plans:** Use `/implement RF-XXX` para executar
3. **Switch Agents:** Carregue o agent especificado em cada passo
4. **Track Progress:** Marque checklist conforme avança

### For Humans

1. Leia o plano completo antes de começar
2. Siga os passos na ordem
3. Use o checklist para acompanhar progresso
4. Consulte agents/ para detalhes de implementação

## Plan Lifecycle

```
Template → Draft → Ready → In Progress → Completed
   │         │       │          │            │
   └─ Copy ──┴─ Fill ┴─ Review ─┴─ Execute ──┴─ Archive
```

## Validation

- [ ] TEMPLATE.md existe e está completo
- [ ] Planos criados não têm placeholders
- [ ] Cada passo referencia um agent
- [ ] Checklist é granular e verificável

## Related Indexes

- [🤖 Agent Playbooks](../.context/agents/README.md) — Instruções para especialistas
- [📚 Documentation](../.context/docs/README.md) — Arquitetura, fluxos
- [🎨 Design](../.context/design/README.md) — Tokens e componentes
- [🎼 Maestro](../AGENTS.md) — Ponto de entrada do projeto
