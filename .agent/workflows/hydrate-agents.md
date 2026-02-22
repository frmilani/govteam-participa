---
description: Hydrate agent playbooks with project-specific information from PRD
---

# /hydrate-agents Workflow

## Overview
Reads the PRD and fills in all `[PLACEHOLDER]` markers in agent playbooks and documentation with project-specific information.

## Input Location

| Input | Path |
|-------|------|
| PRD | `.context/inputs/PRD.md` |

## Output Locations

| Output | Path |
|--------|------|
| Agent Playbooks | `.context/agents/*.md` |
| Documentation | `.context/docs/*.md` |
| Maestro | `AGENTS.md` |

## Prerequisites
- `.context/inputs/PRD.md` must exist with complete project specification
- Agent playbooks must exist in `.context/agents/`

## Steps

### 1. Validate Input

Check `.context/inputs/PRD.md` exists.

If missing:
```
❌ PRD not found at .context/inputs/PRD.md
Please add your PRD file and try again.
```

### 2. Parse PRD Sections

Read `.context/inputs/PRD.md` and extract:

**Section 1-2 (Visão Geral):**
- Project name
- Description
- Target users

**Section 5 (Arquitetura):**
- Tech stack (Framework, Database, Auth, etc.)
- Directory structure
- Key file patterns

**Section 7 (Modelo de Dados):**
- Main entities
- Relationships
- Prisma schema location

**Section 10 (Integrações):**
- External APIs
- Authentication provider

### 3. Hydrate database-specialist.md

Replace placeholders with values from PRD:

```markdown
## Pontos de Entrada

- `prisma/schema.prisma` — Schema principal
- `prisma/migrations/` — Histórico de migrações
- `prisma/seed/` — Dados de desenvolvimento

## Instruções Específicas do Projeto

### Entidades Principais
[LIST FROM PRD SECTION 7]
```

### 4. Hydrate backend-specialist.md

Replace placeholders:

```markdown
## Pontos de Entrada

- `src/app/api/` — Endpoints da API
- `src/lib/services/` — Lógica de negócio
- `src/lib/validations/` — Schemas de validação (Zod)

## Instruções Específicas do Projeto

### Stack de Backend
[FROM PRD SECTION 5]
```

### 5. Hydrate frontend-specialist.md

Replace placeholders and reference design tokens:

```markdown
## Pontos de Entrada

- `src/app/` — Rotas da aplicação
- `src/components/` — Biblioteca de componentes
- `src/app/globals.css` — Configuração de estilos

## Instruções Específicas do Projeto

### Design Tokens
Reference: `.context/design/design_tokens.json`

### Componentes Base
Reference: `.context/design/components.spec.md`
```

### 6. Hydrate agents/README.md

Update the manifest:
- Change status from PENDING to HYDRATED
- Fill in "Contexto Crítico" section with project-specific points

```markdown
## Contexto Crítico para Todos os Agentes

- **[Point 1 from PRD]:** [Description]
- **[Point 2 from PRD]:** [Description]
- **[Point 3 from PRD]:** [Description]
```

### 7. Hydrate Documentation Templates

For each file in `.context/docs/`:

**project-overview.md:**
- Project name, description
- Tech stack table
- Key features list

**architecture.md:**
- Directory structure
- Key decisions from PRD

**glossary.md:**
- Domain terms from PRD
- Acronyms used

### 8. Hydrate AGENTS.md (Maestro)

Update the root `AGENTS.md` with:
- Project identity
- Dev environment commands
- Repository map
- Quality gates

### 9. Validate Hydration

Check that no `[PLACEHOLDER]` markers remain:

```bash
grep -r "\[.*\]" .context/agents/*.md | grep -v "http" | grep -v "Code block"
```

If any remain, list them for manual review.

### 10. Update Manifest Statuses

Update README.md files:
- `.context/agents/README.md` → status: HYDRATED
- `.context/docs/README.md` → status: HYDRATED (partial)
- `AGENTS.md` → status: HYDRATED

### 11. Commit
// turbo
```bash
git add .context/ AGENTS.md
git commit -m "chore: Hydrate agents and docs with project context"
```

### 12. Report

```
✅ Hydration Complete

📁 Source: .context/inputs/PRD.md
📄 Files hydrated:
   - .context/agents/database-specialist.md ✅
   - .context/agents/backend-specialist.md ✅
   - .context/agents/frontend-specialist.md ✅
   - .context/agents/README.md ✅
   - AGENTS.md ✅

📚 Docs hydrated:
   - project-overview.md ✅
   - architecture.md ✅
   - glossary.md ✅

⚠️ Manual review needed: [count] placeholders remain

🚀 Next Step: /init-project
```
