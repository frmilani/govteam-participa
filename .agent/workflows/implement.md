---
description: Implement a specific RF requirement from feature_list.json
---

# /implement [RF-XXX] Workflow

## Overview
Implements ONE functional requirement following its detailed plan.
**The plan specifies which specialist agent to use for each step.**

## Input Locations

| Input | Path | Purpose |
|-------|------|---------|
| Plan | `.context/plans/RF-XXX.md` | Implementation guide |
| Design Tokens | `.context/design/design_tokens.json` | UI styling |
| Feature List | `feature_list.json` | Test tracking |
| Agents | `.context/agents/*.md` | Specialist instructions |

## Agent Selection Logic

When executing each step in the plan, the AI must:

1. **Read the step header** for the agent reference:
   ```markdown
   ## Passo 2: Schema do Banco de Dados
   **Agent:** database-specialist.md
   ```

2. **Load the agent playbook** from `.context/agents/[agent-name].md`

3. **Follow the agent's responsibilities** in priority order:
   - 🔴 Critical: MUST do
   - 🟡 Important: SHOULD do
   - 🟢 Standard: NICE to do

4. **Use agent's troubleshooting** if issues arise

## Agent Reference Quick Map

| Step Type | Agent File | Key Focus |
|-----------|------------|-----------|
| Database/Schema/Prisma | `database-specialist.md` | Indexes, constraints, migrations |
| API Routes/Services | `backend-specialist.md` | Validation, auth, error handling |
| UI/Components/Pages | `frontend-specialist.md` | Accessibility, performance, design tokens |
| Tests | `test-writer.md` | Coverage, edge cases |
| Security Review | `security-auditor.md` | Auth, input validation, secrets |

## Prerequisites
- `.context/plans/RF-XXX.md` must exist (created by `/plan RF-XXX`)
- Agent playbooks must exist in `.context/agents/`
- Dev server should be running (`npm run dev`)

## Steps

### 1. Load Implementation Plan

Read `.context/plans/RF-XXX.md` as the PRIMARY source of truth.

### 2. For Each Step in the Plan

**2.1 Identify the Agent**
```markdown
## Passo N: [Título]
**Agent:** [agent-file].md
```

**2.2 Load Agent Playbook**
Read `.context/agents/[agent-file].md` and note:
- 🔴 Critical responsibilities
- Specific project instructions
- Troubleshooting section

**2.3 Execute Step Following Agent Rules**

Example for database step:
- Load `database-specialist.md`
- Check 🔴 Critical: "Schema correto, Índices otimizados, Migrações seguras"
- Apply project-specific instructions
- Create Prisma schema following documented patterns

**2.4 Verify Against Agent Checklist**
Each agent has internal checklists. Mark items as complete.

### 3. Load Design Tokens (for Frontend Steps)

When executing frontend-specialist steps:
- Load `.context/design/design_tokens.json`
- Apply colors, typography, spacing from tokens
- Reference `.context/design/components.spec.md` for component patterns

### 4. Browser Verification
// turbo-all

For UI-related tests in `feature_list.json`:
1. Open browser to localhost
2. Execute the test steps
3. Capture screenshot as evidence
4. Document any issues

### 5. Update Feature List

For each verified test:
- Change `"passes": false` to `"passes": true`
- NEVER modify test descriptions

### 6. Update Plan Status

Mark completed items in `.context/plans/RF-XXX.md`:
- `- [ ]` → `- [x]`
- Add "Status: COMPLETED" header if all items done

### 7. Commit Progress
// turbo
```bash
git add .
git commit -m "feat(RF-XXX): [Brief description]"
```

### 8. Report Status

```
✅ Implementation Progress

📋 Plan: .context/plans/RF-XXX.md
   Checklist: X/Y items completed

📝 Feature List: RF-XXX
   Tests: X/Y passing

🤖 Agents used:
   - database-specialist ✅
   - backend-specialist ✅
   - frontend-specialist 🔄

📸 Screenshots: [list paths]

🚀 Next Step: [Continue RF-XXX / /plan RF-YYY]
```

## Example Execution Flow

```
/implement RF-002

1. Load: .context/plans/RF-002.md

2. Passo 1: Database Schema
   → Load: .context/agents/database-specialist.md
   → Create: prisma/schema.prisma additions
   → Run: npx prisma migrate dev
   → Verify: Migration applied ✅

3. Passo 2: API Routes
   → Load: .context/agents/backend-specialist.md
   → Create: src/app/api/flows/route.ts
   → Apply: Zod validation, auth middleware
   → Verify: Endpoint returns data ✅

4. Passo 3: UI Components
   → Load: .context/agents/frontend-specialist.md
   → Load: .context/design/design_tokens.json
   → Create: src/components/FlowForm.tsx
   → Verify: Browser shows form ✅

5. Update feature_list.json
6. Commit
7. Report
```
