<!-- manifest:type:agents -->
<!-- manifest:status:PENDING -->
<!-- manifest:updated:2024-12-09 -->

# Agent Playbooks

> Instruções especializadas para IAs atuarem em diferentes áreas do desenvolvimento.

## Quick Reference

| Key | Value |
|-----|-------|
| Type | agents |
| Status | ⏳ PENDING HYDRATION |
| Items | 16 playbooks |
| Depends On | PRD.md (para hidratação) |

## Contents

### Core Agents (Requerem Hidratação)

<!-- instruction:for-ai -->
Estes agentes precisam ser hidratados com dados específicos do projeto via `/hydrate-agents`.
Antes de usar, verifique se os placeholders [CAMINHO...] foram preenchidos.
<!-- /instruction -->

| Agent | File | Status | Purpose |
|-------|------|--------|---------|
| 🎨 Frontend | `frontend-specialist.md` | ⏳ | UI, React, Tailwind, acessibilidade |
| ⚙️ Backend | `backend-specialist.md` | ⏳ | APIs, validação, serviços |
| 🗄️ Database | `database-specialist.md` | ⏳ | Prisma, SQL, índices, migrações |

### Support Agents (Genéricos)

<!-- instruction:for-ai -->
Estes agentes são genéricos e funcionam em qualquer projeto sem hidratação.
<!-- /instruction -->

| Agent | File | Status | Purpose |
|-------|------|--------|---------|
| 👀 Code Review | `code-reviewer.md` | ✅ | Revisão de PRs |
| 🐛 Bug Fixer | `bug-fixer.md` | ✅ | Debug e correções |
| ✨ Feature Dev | `feature-developer.md` | ✅ | Novas funcionalidades |
| ♻️ Refactor | `refactoring-specialist.md` | ✅ | Melhoria de código |
| 🧪 Testing | `test-writer.md` | ✅ | Testes automatizados |
| 📝 Docs | `documentation-writer.md` | ✅ | Documentação técnica |
| ⚡ Performance | `performance-optimizer.md` | ✅ | Otimização |
| 🔒 Security | `security-auditor.md` | ✅ | Auditoria de segurança |
| ♿ A11y | `accessibility-specialist.md` | ✅ | WCAG, e-MAG |
| 🏗️ Architect | `architect-specialist.md` | ✅ | Decisões arquiteturais |
| 🚀 DevOps | `devops-specialist.md` | ✅ | CI/CD, infra |
| 📱 Mobile | `mobile-specialist.md` | ✅ | Apps móveis |

## Usage

### For AI Agents

1. **Check Status:** Se PENDING, rode `/hydrate-agents` primeiro
2. **Identify Task Type:** 
   - Database/Schema? → `database-specialist.md`
   - API/Services? → `backend-specialist.md`
   - UI/Components? → `frontend-specialist.md`
3. **Load Playbook:** Leia o arquivo do agente relevante
4. **Follow Priorities:** Execute tarefas na ordem 🔴 > 🟡 > 🟢
5. **Use Troubleshooting:** Se problemas, consulte seção de troubleshooting do agente

### For Humans

1. Revise a tabela acima para entender os agentes disponíveis
2. Escolha o agente baseado na tarefa
3. Siga as instruções do playbook
4. Use o checklist interno para validar trabalho

## Context Crítico

<!-- placeholder:needs-hydration -->
**[PONTO CRÍTICO 1]:** [A ser preenchido por /hydrate-agents com info do PRD]

**[PONTO CRÍTICO 2]:** [A ser preenchido por /hydrate-agents com info do PRD]

**[PONTO CRÍTICO 3]:** [A ser preenchido por /hydrate-agents com info do PRD]
<!-- /placeholder -->

## Validation

- [ ] Todos os arquivos listados existem
- [ ] Core agents estão hidratados (sem placeholders)
- [ ] Links para docs/ e plans/ funcionam
- [ ] Contexto crítico está preenchido

## Related Indexes

- [📚 Documentation](../docs/README.md) — Arquitetura, fluxos, testes
- [📋 Plans](../../plans/README.md) — Guias de implementação
- [🎨 Design](../design/README.md) — Tokens e componentes
- [🎼 Maestro](../../AGENTS.md) — Ponto de entrada do projeto
