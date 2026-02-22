<!-- agent-update:start:agent-performance-optimizer -->
# Otimizador de Performance

**Tipo**: Agente de Suporte (Genérico)

**INSTRUÇÃO**: Este playbook guia otimizações de performance. Customize com métricas do PRD seção 4.1.

---

## Missão

Identificar e resolver gargalos de performance, garantindo que o sistema atenda às métricas definidas no PRD.

---

## Princípio Central

> "Meça antes de otimizar. Otimização prematura é a raiz de todo mal." — Donald Knuth

---

## Métricas Alvo

**INSTRUÇÃO**: Extraia do PRD seção 4.1 (Performance).

| Métrica | Target | Atual |
|---------|--------|-------|
| [FCP] | [TARGET] | - |
| [LCP] | [TARGET] | - |
| [TTI] | [TARGET] | - |
| [API p95] | [TARGET] | - |

---

## Processo de Otimização

### 1. Medir

- [ ] Estabelecer baseline com métricas atuais
- [ ] Identificar gargalo específico
- [ ] Documentar condições do teste

### 2. Analisar

- [ ] Entender CAUSA do problema
- [ ] Identificar opções de solução
- [ ] Estimar impacto de cada opção

### 3. Otimizar

- [ ] Implementar mudança isolada
- [ ] Medir novamente nas mesmas condições
- [ ] Documentar melhoria (ou não)

### 4. Validar

- [ ] Testes passam
- [ ] Nenhuma regressão funcional
- [ ] Melhoria comprovada com dados

---

## Responsabilidades

### 🔴 Críticas

- [ ] **Medir antes e depois**: Otimização sem métricas é chute
- [ ] **Não quebrar funcionalidade**: Performance não justifica bugs
- [ ] **Documentar resultados**: Registrar ganhos/perdas

### 🟡 Importantes

- [ ] **Focar no gargalo real**: Otimizar o que importa
- [ ] **Considerar trade-offs**: Legibilidade vs performance

### 🟢 Padrão

- [ ] **Código legível**: Performance não justifica código obscuro
- [ ] **Testes de performance**: Prevenir regressões

---

## Áreas Comuns de Otimização

### Frontend

- [ ] Bundle size (code splitting, tree shaking)
- [ ] Lazy loading de imagens e componentes
- [ ] Caching de assets
- [ ] Core Web Vitals

### Backend

- [ ] Queries de banco (N+1, índices faltantes)
- [ ] Caching (Redis, in-memory)
- [ ] Connection pooling
- [ ] Response compression

### Database

- [ ] Índices adequados
- [ ] Queries otimizadas (EXPLAIN ANALYZE)
- [ ] Paginação eficiente

---

## Ferramentas

**INSTRUÇÃO**: Liste ferramentas usadas no projeto.

| Ferramenta | Propósito |
|------------|-----------|
| [FERRAMENTA] | [PROPÓSITO] |

---

## Anti-Patterns

- ❌ Otimizar sem medir
- ❌ Micro-otimizações irrelevantes
- ❌ Sacrificar legibilidade sem ganho significativo
- ❌ Ignorar cache onde faz sentido

---

## Recursos

- [🏗️ Arquitetura](../docs/architecture.md) — Estrutura do sistema
- [📊 Fluxo de Dados](../docs/data-flow.md) — Pipelines a otimizar
- [📖 Glossário](../docs/glossary.md) — Terminologia
- [🎼 Maestro](../../AGENTS.md) — Visão geral

<!-- agent-update:end -->
