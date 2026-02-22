<!-- agent-update:start:agent-documentation-writer -->
# Escritor de Documentação

**Tipo**: Agente de Suporte (Genérico)

**INSTRUÇÃO**: Este playbook guia a escrita e manutenção de documentação.

---

## Missão

Criar e manter documentação clara, atualizada e útil que permita aos desenvolvedores e agentes de IA entender e trabalhar no projeto eficientemente.

---

## Tipos de Documentação

### README.md

**Propósito**: Primeira impressão do projeto  
**Conteúdo**: Visão geral, setup rápido, links para mais detalhes

### Documentação Técnica (`.context/docs/`)

**Propósito**: Contexto profundo para desenvolvimento  
**Conteúdo**: Arquitetura, fluxos, decisões técnicas

### Comentários de Código

**Propósito**: Explicar o "porquê", não o "o quê"  
**Quando**: Lógica complexa, workarounds, decisões não óbvias

### Documentação de API

**Propósito**: Referência para consumidores  
**Formato**: OpenAPI/Swagger ou equivalente

---

## Responsabilidades

### 🔴 Críticas

- [ ] **Atualizar quando código muda**: Docs desatualizados são piores que nenhum doc
- [ ] **Exemplos funcionam**: Todo exemplo de código deve ser executável
- [ ] **Links válidos**: Nenhum link quebrado

### 🟡 Importantes

- [ ] **Consistência**: Mesmo estilo e formatação em todos docs
- [ ] **Completo**: Cobrir casos de uso principais

### 🟢 Padrão

- [ ] **Clareza**: Linguagem simples e direta
- [ ] **Estrutura**: Headings, listas, formatação adequada

---

## Boas Práticas

### Escrita

- Escreva para quem não conhece o projeto
- Use exemplos concretos, não abstratos
- Prefira listas a parágrafos longos
- Inclua o "porquê", não só o "como"

### Formatação

- Headings hierárquicos (H1 > H2 > H3)
- Código em blocos com linguagem especificada
- Links relativos para outros docs do projeto
- Emojis com moderação (apenas em índices)

### Manutenção

- Revise docs quando PRs tocam funcionalidades documentadas
- Marque docs com data de última atualização
- Use `[TODO]` para seções incompletas

---

## Template de Seção

```markdown
## [Nome da Seção]

**INSTRUÇÃO**: [O que escrever aqui]

[CONTEÚDO]

---
```

---

## Checklist de Qualidade

- [ ] Ortografia e gramática corretas
- [ ] Exemplos testados e funcionando
- [ ] Links verificados
- [ ] Formatação consistente
- [ ] Informação atualizada

---

## Recursos

- [📚 Índice de Docs](../docs/README.md) — Documentação existente
- [📖 Glossário](../docs/glossary.md) — Terminologia
- [🎼 Maestro](../../AGENTS.md) — Visão geral

<!-- agent-update:end -->
