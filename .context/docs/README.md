<!-- manifest:type:docs -->
<!-- manifest:status:PENDING -->
<!-- manifest:updated:2024-12-09 -->

# Technical Documentation

> Documentação técnica do projeto: arquitetura, fluxos, padrões e referências.

## Quick Reference

| Key | Value |
|-----|-------|
| Type | docs |
| Status | ⏳ PENDING HYDRATION |
| Items | 10 documents |
| Depends On | PRD.md (para hidratação) |

## Contents

<!-- instruction:for-ai -->
Leia os documentos na ordem recomendada para entender o projeto progressivamente.
Documentos marcados com ⏳ precisam ser hidratados com dados do PRD.
<!-- /instruction -->

| Document | File | Status | Purpose |
|----------|------|--------|---------|
| 📋 Project Overview | `project-overview.md` | ⏳ | Stack, objetivos, escopo |
| 🏗️ Architecture | `architecture.md` | ⏳ | Decisões técnicas, estrutura |
| 📊 Data Flow | `data-flow.md` | ⏳ | Pipelines, integrações |
| 🔌 API Reference | `api-reference.md` | ⏳ | Endpoints, exemplos |
| 🧪 Testing Strategy | `testing-strategy.md` | ⏳ | Testes, coverage |
| 📖 Glossary | `glossary.md` | ⏳ | Terminologia do domínio |
| 🔒 Security | `security.md` | ⏳ | Auth, LGPD, secrets |
| 🔄 Dev Workflow | `development-workflow.md` | ⏳ | Git flow, PRs, CI |
| 🛠️ Tooling | `tooling.md` | ⏳ | Ferramentas, scripts |
| 🔧 Troubleshooting | `troubleshooting.md` | ⏳ | Problemas comuns |

## Reading Order

<!-- instruction:for-ai -->
Para contexto completo, leia nesta ordem:
1. project-overview.md (O QUE é o projeto)
2. architecture.md (COMO é construído)
3. glossary.md (terminologia)
4. Documentos específicos conforme necessidade
<!-- /instruction -->

### For New Agents
1. `project-overview.md` → Entenda o projeto
2. `architecture.md` → Entenda as decisões
3. `glossary.md` → Aprenda os termos
4. Outros → Conforme a tarefa

### For Specific Tasks
- **Criando API?** → `api-reference.md` + `security.md`
- **Escrevendo testes?** → `testing-strategy.md`
- **Debugando?** → `troubleshooting.md`
- **Setup local?** → `development-workflow.md` + `tooling.md`

## Structure

<!-- placeholder:needs-hydration -->
```
[ADICIONAR: Estrutura de pastas do projeto após hidratação]
```
<!-- /placeholder -->

## Usage

### For AI Agents

1. **Check Status:** Se PENDING, rode `/hydrate-agents` primeiro
2. **Start with Overview:** Sempre comece por `project-overview.md`
3. **Use Glossary:** Consulte `glossary.md` para termos desconhecidos
4. **Task-Specific:** Navegue para doc específico baseado na tarefa

### For Humans

1. Siga a ordem de leitura recomendada
2. Use o índice acima para encontrar docs específicos
3. Consulte glossário para terminologia

## Validation

- [ ] Todos os arquivos listados existem
- [ ] Placeholders foram preenchidos
- [ ] Estrutura de pastas está atualizada
- [ ] Links internos funcionam

## Related Indexes

- [🤖 Agent Playbooks](../agents/README.md) — Instruções para especialistas
- [📋 Plans](../../plans/README.md) — Guias de implementação
- [🎨 Design](../design/README.md) — Tokens e componentes
- [🎼 Maestro](../../AGENTS.md) — Ponto de entrada do projeto
