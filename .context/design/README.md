<!-- manifest:type:design -->
<!-- manifest:status:PENDING -->
<!-- manifest:updated:2024-12-09 -->

# Design System

> Tokens, componentes e especificações visuais extraídas dos wireframes.

## Quick Reference

| Key | Value |
|-----|-------|
| Type | design |
| Status | ⏳ PENDING EXTRACTION |
| Items | 0 (aguardando /extract-design) |
| Depends On | Wireframes (multi-agent-flow-architecture/) |

## Contents

<!-- instruction:for-ai -->
Esta pasta é populada pelo workflow `/extract-design`.
Se estiver vazia, rode o workflow primeiro.
Os arquivos gerados são a "lei visual" do projeto.
<!-- /instruction -->

| File | Status | Purpose |
|------|--------|---------|
| `design_tokens.json` | ⏳ | Cores, tipografia, espaçamentos |
| `components.spec.md` | ⏳ | Documentação de componentes |
| `screen_map.md` | ⏳ | Mapa de navegação entre telas |

## Expected Structure After Extraction

### design_tokens.json
```json
{
  "meta": {
    "source": "[wireframe-folder]",
    "extractedAt": "[date]"
  },
  "colors": {
    "primary": { "500": "#...", "600": "#..." },
    "neutral": { ... }
  },
  "typography": {
    "heading1": "text-3xl font-bold",
    "body": "text-base text-slate-600"
  },
  "spacing": { ... },
  "borders": { ... },
  "shadows": { ... }
}
```

### components.spec.md
```markdown
# Component Specification

## ComponentName
**Source:** [file:line]
**Usage:** [where used]
**Classes:** [Tailwind classes]
**States:** [hover, active, disabled variations]
```

### screen_map.md
```markdown
# Screen Map

## Screens
1. screen-name — Description
2. ...

## Navigation
- How screens connect
- User flow
```

## Usage

### For AI Agents

1. **Check Status:** Se PENDING, rode `/extract-design` primeiro
2. **Load Tokens:** Sempre carregue `design_tokens.json` antes de criar UI
3. **Reference Components:** Consulte `components.spec.md` para padrões
4. **Understand Flow:** Use `screen_map.md` para entender navegação

### For Frontend Development

1. **Colors:** Use exatamente as cores de `design_tokens.json`
2. **Typography:** Copie classes de tipografia do tokens
3. **Components:** Siga estrutura documentada em `components.spec.md`
4. **Consistency:** Nunca invente estilos - use os documentados

## Extraction Source

<!-- placeholder:needs-hydration -->
**Wireframe Folder:** [A ser definido - ex: multi-agent-flow-architecture/]
**Contains:** [React components com Tailwind]
<!-- /placeholder -->

## Validation

- [ ] design_tokens.json existe e é JSON válido
- [ ] Cores estão em formato válido (hex ou Tailwind)
- [ ] Componentes documentados existem no wireframe
- [ ] Mapa de telas cobre todas as telas do wireframe

## Related Indexes

- [🤖 Agent Playbooks](../agents/README.md) — Instruções para especialistas
- [📚 Documentation](../docs/README.md) — Arquitetura, fluxos
- [📋 Plans](../../plans/README.md) — Guias de implementação
- [🎼 Maestro](../../AGENTS.md) — Ponto de entrada do projeto
