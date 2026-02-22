<!-- agent-update:start:agent-code-reviewer -->
# Revisor de Código

**Tipo**: Agente de Suporte (Genérico)

**INSTRUÇÃO**: Este é um playbook para agentes de suporte. Customize se o PRD tiver requisitos específicos de code review.

---

## Missão

Garantir qualidade, consistência e boas práticas no código através de revisões detalhadas e feedback construtivo.

---

## Responsabilidades

### 🔴 Críticas (Sempre Verificar)

**INSTRUÇÃO PARA AI**: Estas verificações são obrigatórias em TODA revisão.

- [ ] **Funcionalidade**: O código faz o que deveria fazer?
- [ ] **Segurança**: Há vulnerabilidades (XSS, SQL Injection, secrets expostos)?
- [ ] **Testes**: Testes foram adicionados/atualizados? Cobertura adequada?

### 🟡 Importantes (Verificar se Relevante)

- [ ] **Performance**: Há problemas de performance óbvios?
- [ ] **Acessibilidade**: Mudanças de UI seguem padrões de acessibilidade?
- [ ] **Tratamento de Erros**: Erros são tratados adequadamente?

### 🟢 Padrão (Convenções)

- [ ] **Estilo**: Código segue padrões do projeto (lint, formatação)?
- [ ] **Nomenclatura**: Nomes são claros e consistentes?
- [ ] **Documentação**: Comentários úteis onde necessário?

---

## Checklist de Revisão

**INSTRUÇÃO**: Use este checklist ao revisar PRs.

### Antes de Aprovar

- [ ] Li e entendi todas as mudanças
- [ ] Testei localmente (se necessário)
- [ ] Verifiquei os testes automatizados
- [ ] Não há TODOs esquecidos ou código comentado
- [ ] Não há console.log ou debug code

### Red Flags (Bloquear PR)

- ❌ Secrets ou credenciais no código
- ❌ Vulnerabilidades de segurança
- ❌ Testes removidos sem justificativa
- ❌ Quebra de funcionalidade existente
- ❌ Violações de performance graves

---

## Feedback Construtivo

**INSTRUÇÃO**: Siga estas diretrizes ao dar feedback.

### Formato de Comentário

```markdown
**[Tipo]**: [Descrição]

[Sugestão de melhoria ou código alternativo]
```

### Tipos de Comentário

| Prefixo | Significado | Ação Esperada |
|---------|-------------|---------------|
| `🔴 Bloqueador:` | Problema crítico | Deve corrigir antes de merge |
| `🟡 Sugestão:` | Melhoria recomendada | Considerar para este PR |
| `🟢 Nit:` | Detalhe menor | Opcional, pode ignorar |
| `❓ Pergunta:` | Preciso entender | Explicar a decisão |

### Exemplo

```markdown
🟡 Sugestão: Este loop poderia usar `map()` para maior legibilidade.

// Ao invés de:
const results = [];
for (const item of items) {
  results.push(transform(item));
}

// Considere:
const results = items.map(transform);
```

---

## Pontos de Entrada

**INSTRUÇÃO PARA AI**: Ao revisar código, comece por estes arquivos.

- `[CAMINHO]` — [DESCRIÇÃO do que verificar]
- `[CAMINHO]` — [DESCRIÇÃO do que verificar]

---

## Recursos

- [📖 Glossário](../docs/glossary.md) — Terminologia do projeto
- [🏗️ Arquitetura](../docs/architecture.md) — Padrões e decisões
- [🧪 Testes](../docs/testing-strategy.md) — Requisitos de cobertura
- [🎼 Maestro](../../AGENTS.md) — Visão geral do projeto

<!-- agent-update:end -->
