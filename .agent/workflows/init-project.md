---
description: Initialize or refresh project from PRD and design assets
---

# /init-project Workflow

## Overview
This workflow reads the PRD and any design assets to generate the core project scaffolding.

## Input Locations

| Input | Path | Required |
|-------|------|----------|
| PRD | `.context/inputs/PRD.md` | ✅ Yes |
| Wireframes | `.context/inputs/wireframes/` | Optional |

## Steps

### 1. Validate Inputs

Check that required files exist:
- `.context/inputs/PRD.md` must exist
- If `.context/inputs/wireframes/` exists, validate it has `App.tsx`

If PRD is missing, stop and inform user:
```
❌ PRD not found at .context/inputs/PRD.md
Please add your PRD file and try again.
```

### 2. Extract Design System (if wireframes exist)

If `.context/inputs/wireframes/` exists:
**Run the `/extract-design` workflow first.**

This creates:
- `.context/design/design_tokens.json` - Colors, typography, spacing
- `.context/design/components.spec.md` - Component documentation
- `.context/design/screen_map.md` - Navigation flow

### 3. Hydrate Agent Playbooks

**Run the `/hydrate-agents` workflow.**

This fills `.context/agents/*.md` playbooks with:
- Correct file paths from this project
- Stack-specific instructions
- Project critical points

### 4. Generate Feature List

Create or update `feature_list.json` with ALL testable requirements from `.context/inputs/PRD.md`.

Cross-reference with `.context/design/screen_map.md` to ensure UI tests cover all screens.

Rules:
- Each test must have: `category`, `description`, `steps[]`, `passes: false`
- Categories: `functional`, `style`, `integration`, `performance`, `security`
- Steps should be granular enough for browser verification
- Group by RF-XXX code from PRD
- Minimum 10 tests per major RF

### 5. Create Init Script
// turbo
Create `init.sh` that:
- Checks for Node.js and Docker
- Installs dependencies
- Starts Docker services (if docker-compose.yml exists)
- Runs database migrations (if Prisma exists)

### 6. Update AGENTS.md

Fill the placeholders in `AGENTS.md` with:
- Project name from PRD
- Tech stack from PRD
- Repository structure
- Environment variables needed

### 7. Git Commit
// turbo
```bash
git add .
git commit -m "chore: Initialize project from PRD"
```

### 8. Report Status
Print summary:
```
✅ Project Initialized

📋 Feature List: X tests generated
🎨 Design Tokens: [extracted/not found]
🤖 Agents: X playbooks hydrated
📚 Docs: X templates ready for hydration

📁 Input Files:
   - .context/inputs/PRD.md ✅
   - .context/inputs/wireframes/ [✅/❌]

🚀 Next Step: /plan RF-001
```
