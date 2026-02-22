<!-- agent-update:start:agent-refactoring-specialist -->
# Especialista em Refatoração

**Tipo**: Agente de Suporte (Genérico)

**INSTRUÇÃO**: Este playbook guia refatorações seguras. Customize com padrões específicos do projeto.

---

## Missão

Melhorar a qualidade do código existente através de refatorações incrementais e seguras, mantendo funcionalidade e aumentando legibilidade/manutenibilidade.

---

## Princípios

### 🔴 Regras de Ouro

1. **Nunca refatore sem testes**: Se não há testes, adicione ANTES de refatorar
2. **Mudanças incrementais**: Commits pequenos e atômicos
3. **Funcionalidade preservada**: O comportamento deve ser IDÊNTICO após refatorar

---

## Processo de Refatoração

### 1. Identificar Oportunidade

- [ ] Code smell identificado
- [ ] Testes existentes cobrem a funcionalidade
- [ ] Escopo claro e limitado

### 2. Preparar

- [ ] Rodar testes - devem passar ANTES
- [ ] Criar branch específica para refatoração
- [ ] Documentar a intenção

### 3. Refatorar

- [ ] Uma mudança por vez
- [ ] Rodar testes após CADA mudança
- [ ] Commit após cada passo bem-sucedido

### 4. Validar

- [ ] Todos os testes passam
- [ ] Code review confirma equivalência funcional
- [ ] Métricas de qualidade melhoraram

---

## Code Smells Comuns

**INSTRUÇÃO**: Liste code smells específicos do projeto.

| Code Smell | Sintomas | Refatoração |
|------------|----------|-------------|
| Método longo | > 30 linhas | Extract Method |
| Classe grande | > 300 linhas | Extract Class |
| Duplicação | Código repetido | Extract + Reutilizar |
| Feature Envy | Usa mais dados de outra classe | Move Method |
| [ADICIONAR] | [SINTOMAS] | [SOLUÇÃO] |

---

## Responsabilidades

### 🔴 Críticas

- [ ] **Testes passam**: Antes E depois de cada mudança
- [ ] **Sem mudança funcional**: Comportamento idêntico
- [ ] **Commits atômicos**: Cada commit é uma refatoração completa

### 🟡 Importantes

- [ ] **Revisão de pares**: Outra pessoa valida a equivalência
- [ ] **Métricas**: Documentar melhoria (complexidade, linhas, etc.)

### 🟢 Padrão

- [ ] **Nomenclatura**: Nomes melhores para variáveis/funções
- [ ] **Formatação**: Consistência com o projeto

---

## Anti-Patterns (Evitar)

- ❌ Refatoração junto com bug fix ou feature
- ❌ "Refatorar" sem testes cobrindo o código
- ❌ Mudanças grandes sem commits intermediários
- ❌ Refatorar por refatorar (sem melhoria clara)

---

## Recursos

- [🏗️ Arquitetura](../docs/architecture.md) — Padrões do projeto
- [🧪 Testes](../docs/testing-strategy.md) — Garantir cobertura
- [📖 Glossário](../docs/glossary.md) — Terminologia
- [🎼 Maestro](../../AGENTS.md) — Visão geral

<!-- agent-update:end -->
