# Estrutura de Manifests

Este documento define como os READMEs devem ser estruturados para serem úteis tanto para IAs quanto para humanos.

## Princípios

1. **Machine-Readable:** Seções estruturadas que IAs podem parsear
2. **Self-Aware:** Indica se o conteúdo está hidratado ou pendente
3. **Cross-Referenced:** Links funcionais para navegação
4. **Action-Oriented:** Instruções claras sobre o que fazer

## Formato de README/Manifest

```markdown
<!-- manifest:type:[folder-type] -->
<!-- manifest:status:[PENDING|HYDRATED] -->
<!-- manifest:updated:[YYYY-MM-DD] -->

# [Título]

> [Descrição breve de uma linha]

## Quick Reference

| Key | Value |
|-----|-------|
| Type | [agents/docs/plans/design] |
| Status | [PENDING/HYDRATED] |
| Items | [COUNT] |
| Depends On | [list of dependencies] |

## Contents

| Item | File | Status | Purpose |
|------|------|--------|---------|
| [Name] | [path.md] | [✅/⏳] | [one-line purpose] |

## Usage

### For AI Agents
1. Check `Status` - if PENDING, hydration required
2. Navigate to specific item based on task type
3. For implementation tasks, cross-reference with `.context/plans/`

### For Humans
1. Read contents table for overview
2. Click on specific guides as needed
3. Use glossary for terminology questions

## Dependencies

- **Requires:** [list what must exist before this works]
- **Provides:** [list what this enables]

## Validation

- [ ] All items in table exist as files
- [ ] All links resolve correctly
- [ ] Status matches actual hydration state
- [ ] Purpose descriptions are specific (not generic)

## Related Indexes

- [Link 1](path) — Description
- [Link 2](path) — Description
```

## Por Tipo de Pasta

### agents/README.md
- Lista todos os playbooks
- Indica quais são CORE (precisam hidratação) vs SUPPORT (genéricos)
- Mostra qual agente usar para qual tipo de tarefa

### docs/README.md
- Lista toda documentação técnica
- Indica ordem de leitura
- Mostra dependências entre docs

### plans/README.md
- Lista planos existentes
- Link para TEMPLATE.md
- Status de cada plano (DRAFT, READY, IMPLEMENTED)

### design/README.md (novo)
- Lista tokens extraídos
- Componentes documentados
- Mapa de telas

## Workflow de Hidratação

O workflow `/hydrate-agents` agora também deve:
1. Atualizar os manifests com status correto
2. Preencher contagens de items
3. Validar links

## Convenção de Marcadores

Para facilitar parsing por IAs:

```markdown
<!-- manifest:start -->
[conteúdo estruturado]
<!-- manifest:end -->

<!-- instruction:for-ai -->
[instruções específicas para IAs]
<!-- /instruction -->

<!-- placeholder:needs-hydration -->
[ADICIONAR: descrição do que precisa ser preenchido]
<!-- /placeholder -->
```
