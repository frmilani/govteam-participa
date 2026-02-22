---
description: Check current project implementation status
---

# /status Workflow

## Overview
Quick check on project progress and next steps.

## Steps

### 1. Check Input Files Exist
// turbo

Check for required inputs:
```
.context/inputs/PRD.md → [✅ Found / ❌ Missing]
.context/inputs/wireframes/ → [✅ Found / ❌ Not provided]
```

### 2. Count Tests
// turbo

Read `feature_list.json` and count:
- Total tests
- Tests with `passes: true`
- Tests with `passes: false`

Calculate completion percentage.

### 3. Group by RF

Group remaining (false) tests by their RF code.
Identify which RF has the most remaining work.

### 4. Check Plans

List plans in `.context/plans/`:
- Count total plans
- Identify which RFs have plans
- Identify which RFs need plans

### 5. Check Hydration Status

Check manifest statuses:
```
.context/agents/README.md → status
.context/docs/README.md → status
.context/design/README.md → status
AGENTS.md → status
```

### 6. Check Git Status
// turbo
```bash
git status --short
git log -1 --oneline
```

### 7. Check Running Services
// turbo
```bash
docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "Docker not running"
```

### 8. Report

Print formatted status:

```
╔══════════════════════════════════════════════════════════════╗
║                     PROJECT STATUS                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  📋 Feature List                                               ║
║     Total: XXX tests                                           ║
║     Passing: XX (XX%)                                          ║
║     Remaining: XX                                              ║
║                                                                ║
║  📊 Progress by RF:                                            ║
║     RF-001: ██████████ 100% ✅                                 ║
║     RF-002: ██████░░░░  60% 🔄                                 ║
║     RF-003: ░░░░░░░░░░   0% ⏳                                 ║
║                                                                ║
║  📁 Inputs:                                                    ║
║     PRD.md: ✅                                                  ║
║     Wireframes: ✅ / ❌                                         ║
║                                                                ║
║  🤖 Context Status:                                            ║
║     Agents: [HYDRATED/PENDING]                                 ║
║     Docs: [HYDRATED/PENDING]                                   ║
║     Design: [EXTRACTED/PENDING]                                ║
║                                                                ║
║  📋 Plans:                                                     ║
║     Created: X                                                 ║
║     Missing: [list RFs without plans]                          ║
║                                                                ║
║  🔧 Last Commit:                                               ║
║     abc1234 - feat: Complete RF-001                            ║
║                                                                ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 RECOMMENDED NEXT ACTION:                                   ║
║                                                                ║
║     /plan RF-002                                               ║
║     (Highest priority RF with remaining work)                  ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝
```

## Decision Tree for Next Action

```
Is .context/inputs/PRD.md present?
├── NO → "Add PRD to .context/inputs/PRD.md"
└── YES
    ├── Is .context/design/README.md status PENDING?
    │   └── YES + wireframes exist → "/extract-design"
    ├── Is .context/agents/README.md status PENDING?
    │   └── YES → "/hydrate-agents"
    ├── Does feature_list.json exist?
    │   └── NO → "/init-project"
    ├── Are there RFs without plans?
    │   └── YES → "/plan RF-XXX" (first without plan)
    └── Are there failing tests?
        └── YES → "/implement RF-XXX" (RF with most remaining)
        └── NO → "🎉 Project complete!"
```
