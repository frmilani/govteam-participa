---
description: Create detailed implementation plan for a specific RF requirement
---

# /plan [RF-XXX] Workflow

## Overview
Creates a detailed implementation plan for ONE functional requirement using the TEMPLATE.md structure.
This plan becomes the single source of truth for the `/implement` phase.

## Input Locations

| Input | Path | Purpose |
|-------|------|---------|
| PRD | `.context/inputs/PRD.md` | RF requirements |
| Template | `.context/templates/TEMPLATE.md` | Plan structure |
| Design Tokens | `.context/design/design_tokens.json` | UI decisions |

## Output Location

| Output | Path |
|--------|------|
| RF Plan | `.context/plans/RF-XXX.md` |

## Prerequisites
- `.context/inputs/PRD.md` must exist with the target RF documented
- `feature_list.json` should have tests for this RF (created by /init-project)

## Steps

### 1. Validate Input

Check files exist:
- `.context/inputs/PRD.md`
- `.context/templates/TEMPLATE.md`

### 2. Load Template

Read the base template from `.context/templates/TEMPLATE.md`

### 3. Extract RF Section from PRD

Read `.context/inputs/PRD.md` and extract ONLY the section related to the target RF.

Include:
- Functional requirements
- UI/UX specifications
- Data models mentioned
- Integration points

### 4. Load Design Tokens

If `.context/design/design_tokens.json` exists, load it to inform UI decisions in the plan.

### 5. Generate Plan

Create `.context/plans/RF-XXX.md` following the TEMPLATE structure:

Required sections:
- **Overview:** What this RF accomplishes (1-2 paragraphs)
- **Architecture:** Mermaid diagram showing components
- **Database Schema:** Prisma models needed (descriptions only, no code)
- **API Routes:** Endpoints with methods, auth, validation rules
- **UI Components:** Pages and components needed
- **Checklist:** Granular implementation checklist

Rules from TEMPLATE.md:
- NEVER include actual code, only descriptions
- Reference appropriate agents for each section
- All paths must be specific and concrete
- All checklist items must be verifiable

### 6. Reference Agents

Each step in the plan must reference the appropriate agent:

```markdown
## Passo 1: Database Schema
**Agent:** [database-specialist.md](../.context/agents/database-specialist.md)

## Passo 2: API Routes
**Agent:** [backend-specialist.md](../.context/agents/backend-specialist.md)

## Passo 3: UI Components
**Agent:** [frontend-specialist.md](../.context/agents/frontend-specialist.md)
```

### 7. Link to Feature List

Cross-reference the checklist items with tests in `feature_list.json`.
If tests are missing for any checklist item, note them.

### 8. Update Plans Manifest

Update `.context/plans/README.md`:
- Add new plan to the contents table
- Mark status as READY

### 9. Commit Plan
// turbo
```bash
git add .context/plans/
git commit -m "docs: Add implementation plan for RF-XXX"
```

### 10. Report

```
✅ Plan Created

📄 Plan: .context/plans/RF-XXX.md
📋 Checklist: X items
🔗 Tests linked: Y items in feature_list.json

📊 Estimated Complexity: [Low/Medium/High]
🤖 Agents involved:
   - database-specialist (if DB changes)
   - backend-specialist (if API changes)
   - frontend-specialist (if UI changes)

🚀 Next Step: /implement RF-XXX
```

## Plan Structure

The generated plan should follow this structure:

```markdown
# Plano de Implementação: RF-XXX - [Nome Descritivo]

## Visão Geral
[2 parágrafos sobre o que será implementado]

## Arquitetura
[Diagrama Mermaid]

## Referências
- PRD: `.context/inputs/PRD.md` seção X
- Design: `.context/design/design_tokens.json`

## Passo 1: [Database/Schema]
**Agent:** database-specialist.md
[Descrições de modelos, campos, relações - SEM CÓDIGO]

## Passo 2: [API/Backend]
**Agent:** backend-specialist.md
[Descrições de endpoints - SEM CÓDIGO]

## Passo 3: [UI/Frontend]
**Agent:** frontend-specialist.md
[Descrições de componentes - SEM CÓDIGO]

## Checklist de Implementação
### Database
- [ ] Item 1
- [ ] Item 2

### Backend
- [ ] Item 1
- [ ] Item 2

### Frontend
- [ ] Item 1
- [ ] Item 2

## Notas Importantes
[Considerações específicas]
```
