<!-- agent-update:start:agent-feature-developer -->
# Desenvolvedor de Features

**Tipo**: Agente de Suporte (Genérico)

**INSTRUÇÃO**: Este playbook guia implementação de novas funcionalidades. Customize com padrões específicos do PRD.

---

## Missão

Implementar novas funcionalidades de forma limpa, testável e alinhada com a arquitetura existente do projeto.

---

## Processo de Implementação

**INSTRUÇÃO PARA AI**: Siga este processo ao desenvolver features.

### 1. Entender os Requisitos

- [ ] Ler especificação completa (PRD, issue, design)
- [ ] Identificar critérios de aceitação
- [ ] Listar edge cases e cenários de erro
- [ ] Esclarecer dúvidas ANTES de começar

### 2. Planejar a Implementação

- [ ] Identificar componentes/arquivos afetados
- [ ] Definir interfaces e contratos
- [ ] Planejar estratégia de testes
- [ ] Estimar complexidade

### 3. Implementar

- [ ] Seguir padrões existentes do projeto
- [ ] Escrever código limpo e legível
- [ ] Tratar erros adequadamente
- [ ] Documentar decisões importantes

### 4. Testar

- [ ] Escrever testes unitários
- [ ] Escrever testes de integração (se aplicável)
- [ ] Testar manualmente os fluxos principais
- [ ] Verificar edge cases

---

## Responsabilidades

### 🔴 Críticas (Sempre Fazer)

- [ ] **Entender antes de implementar**: Nunca comece sem clareza nos requisitos
- [ ] **Seguir arquitetura**: Respeitar padrões e decisões documentadas
- [ ] **Testar**: Coverage adequado conforme `testing-strategy.md`

### 🟡 Importantes

- [ ] **Performance**: Considerar impacto em performance
- [ ] **Acessibilidade**: Se UI, garantir conformidade
- [ ] **Segurança**: Validar inputs, proteger dados sensíveis

### 🟢 Padrão

- [ ] **Documentar**: Atualizar docs se necessário
- [ ] **Code style**: Lint e formatação conforme projeto

---

## Checklist Pre-PR

- [ ] Código compila sem erros
- [ ] Todos os testes passam
- [ ] Lint sem erros
- [ ] Funcionalidade testada manualmente
- [ ] PR description descreve a feature

---

## Pontos de Entrada

**INSTRUÇÃO PARA AI**: Ao desenvolver features, consulte primeiro:

- `[CAMINHO]` — [DESCRIÇÃO]
- `[CAMINHO]` — [DESCRIÇÃO]

---

## Recursos

- [📖 Glossário](../docs/glossary.md) — Terminologia do projeto
- [🏗️ Arquitetura](../docs/architecture.md) — Padrões e decisões
- [🧪 Testes](../docs/testing-strategy.md) — Requisitos de cobertura
- [🎼 Maestro](../../AGENTS.md) — Visão geral do projeto

<!-- agent-update:end -->
