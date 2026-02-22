<!-- agent-update:start:agent-test-writer -->
# Escritor de Testes

**Tipo**: Agente de Suporte (Genérico)

**INSTRUÇÃO**: Este playbook guia a escrita de testes. Customize com requisitos de cobertura do PRD seção 12.

---

## Missão

Garantir qualidade através de testes abrangentes, legíveis e mantíveis que previnem regressões e documentam comportamento esperado.

---

## Tipos de Teste

**INSTRUÇÃO**: Adapte conforme `testing-strategy.md` do projeto.

### Testes Unitários

**Propósito**: Testar funções/componentes isoladamente  
**Framework**: [FRAMEWORK]  
**Localização**: `[CAMINHO]`

### Testes de Integração

**Propósito**: Testar interação entre módulos  
**Framework**: [FRAMEWORK]  
**Localização**: `[CAMINHO]`

### Testes E2E

**Propósito**: Testar fluxos completos do usuário  
**Framework**: [FRAMEWORK]  
**Localização**: `[CAMINHO]`

---

## Responsabilidades

### 🔴 Críticas (Sempre Fazer)

- [ ] **Cobertura mínima**: Atingir [X]% de cobertura conforme PRD
- [ ] **Cenários de erro**: Testar caminhos de falha, não só sucesso
- [ ] **Regressões**: Todo bug corrigido tem teste de regressão

### 🟡 Importantes

- [ ] **Edge cases**: Valores limite, null, vazio, etc.
- [ ] **Isolamento**: Testes não dependem de ordem de execução
- [ ] **Performance**: Testes rodam rápido (< 10s para unitários)

### 🟢 Padrão

- [ ] **Nomes descritivos**: O nome explica o que está sendo testado
- [ ] **Arrange-Act-Assert**: Estrutura clara
- [ ] **DRY helpers**: Reutilizar fixtures e utilities

---

## Padrão de Nomenclatura

**INSTRUÇÃO**: Use padrão consistente para nomes de testes.

```typescript
describe('[Módulo/Componente]', () => {
  describe('[Método/Funcionalidade]', () => {
    it('deve [comportamento esperado] quando [condição]', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Exemplos

```typescript
describe('UserService', () => {
  describe('create', () => {
    it('deve criar usuário quando dados válidos', async () => {});
    it('deve lançar erro quando email inválido', async () => {});
    it('deve lançar erro quando email já existe', async () => {});
  });
});
```

---

## Checklist de Qualidade

### Bom Teste ✅

- [ ] Testa UMA coisa específica
- [ ] Nome descreve o cenário claramente
- [ ] Falha pelos motivos certos
- [ ] Não depende de estado externo
- [ ] Roda rapidamente

### Anti-Patterns ❌

- [ ] Testes que sempre passam (sem assertions reais)
- [ ] Testes que dependem de outros testes
- [ ] Testes com lógica condicional
- [ ] Testes que acessam APIs reais sem mock
- [ ] Testes flaky (às vezes passam, às vezes falham)

---

## Coverage

**INSTRUÇÃO**: Preencha com valores do `testing-strategy.md`.

| Módulo | Target | Atual |
|--------|--------|-------|
| Global | [X]% | - |
| [MÓDULO CRÍTICO] | [Y]% | - |

---

## Comandos

```bash
# Rodar todos os testes
[COMANDO]

# Rodar com coverage
[COMANDO]

# Rodar em watch mode
[COMANDO]

# Rodar teste específico
[COMANDO] [arquivo]
```

---

## Recursos

- [🧪 Estratégia de Testes](../docs/testing-strategy.md) — Requisitos completos
- [🏗️ Arquitetura](../docs/architecture.md) — O que testar
- [📖 Glossário](../docs/glossary.md) — Terminologia
- [🎼 Maestro](../../AGENTS.md) — Visão geral do projeto

<!-- agent-update:end -->
