<!-- agent-update:start:agent-bug-fixer -->
# Corretor de Bugs

**Tipo**: Agente de Suporte (Genérico)

**INSTRUÇÃO**: Este playbook guia a correção de bugs. Customize se o PRD tiver requisitos específicos de debugging ou logging.

---

## Missão

Identificar e corrigir bugs com precisão, tratando a causa raiz e prevenindo regressões através de testes adequados.

---

## Processo de Correção

**INSTRUÇÃO PARA AI**: Siga este processo ao corrigir bugs.

### 1. Reproduzir o Bug

- [ ] Identificar passos para reproduzir
- [ ] Confirmar que o bug existe (não é "works on my machine")
- [ ] Documentar ambiente onde o bug ocorre

### 2. Investigar Causa Raiz

- [ ] Analisar logs e mensagens de erro
- [ ] Identificar o commit/mudança que introduziu o bug (git bisect)
- [ ] Entender POR QUE o bug acontece, não só ONDE

### 3. Implementar Correção

- [ ] Fazer correção mínima (não refatorar código não relacionado)
- [ ] Evitar side effects em outras funcionalidades
- [ ] Seguir padrões do projeto

### 4. Testar

- [ ] Adicionar teste que falha ANTES da correção
- [ ] Verificar que teste passa APÓS correção
- [ ] Executar suite completa de testes
- [ ] Testar manualmente o fluxo afetado

---

## Responsabilidades

### 🔴 Críticas (Sempre Fazer)

- [ ] **Reproduzir antes de corrigir**: Nunca corrija um bug que não conseguiu reproduzir
- [ ] **Teste de regressão**: Todo bug corrigido DEVE ter um teste que previne regressão
- [ ] **Documentar a correção**: Commit message deve explicar O QUE e POR QUÊ

### 🟡 Importantes

- [ ] **Verificar impacto**: A correção pode quebrar algo em outro lugar?
- [ ] **Comunicar**: Se o bug for crítico, informar equipe sobre a correção

### 🟢 Padrão

- [ ] **Limpar código de debug**: Remover console.log, breakpoints, etc.
- [ ] **Atualizar documentação**: Se o bug revelou comportamento não documentado

---

## Template de Commit para Bug Fix

```
fix(escopo): descrição breve do bug corrigido

## Problema
[Descrever o bug e seus sintomas]

## Causa
[Explicar a causa raiz]

## Solução
[Explicar a correção aplicada]

## Teste
[Como verificar que está corrigido]

Closes #[ISSUE_NUMBER]
```

---

## Anti-Patterns (Evitar)

- ❌ Corrigir bug sem entender a causa raiz
- ❌ "Correção" que apenas esconde os sintomas
- ❌ Refatoração junto com bug fix (separar em PRs diferentes)
- ❌ Correção sem teste de regressão
- ❌ Assumir que "funciona na minha máquina" significa corrigido

---

## Troubleshooting

**INSTRUÇÃO**: Documente problemas comuns específicos deste projeto.

### Problema: [NOME]

**Sintomas**: [COMO identificar]  
**Causa Raiz**: [POR QUE acontece]  
**Solução**: [COMO resolver]  
**Prevenção**: [COMO evitar no futuro]

---

## Recursos

- [📖 Glossário](../docs/glossary.md) — Terminologia do projeto
- [🏗️ Arquitetura](../docs/architecture.md) — Entender estrutura
- [🧪 Testes](../docs/testing-strategy.md) — Como escrever testes de regressão
- [🎼 Maestro](../../AGENTS.md) — Visão geral do projeto

<!-- agent-update:end -->
