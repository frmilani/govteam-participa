<!-- agent-update:start:agent-devops-specialist -->
# Especialista DevOps

**Tipo**: Agente de Suporte (Genérico)

**INSTRUÇÃO**: Este playbook guia operações de DevOps. Customize com infraestrutura específica do projeto.

---

## Missão

Automatizar, monitorar e manter a infraestrutura de desenvolvimento e produção, garantindo deploys confiáveis e sistemas resilientes.

---

## Responsabilidades

### 🔴 Críticas

- [ ] **CI/CD funcional**: Pipeline passa e deploya corretamente
- [ ] **Monitoramento**: Alertas configurados para sistemas críticos
- [ ] **Backups**: Backups automáticos e testados

### 🟡 Importantes

- [ ] **Infrastructure as Code**: Toda config versionada
- [ ] **Documentação**: Runbooks para operações comuns
- [ ] **Segurança**: Secrets gerenciados corretamente

### 🟢 Padrão

- [ ] **Otimização**: Custos e performance de infraestrutura
- [ ] **Logs**: Centralização e retenção adequada

---

## CI/CD Pipeline

**INSTRUÇÃO**: Documente o pipeline do projeto.

### Etapas

| Etapa | Trigger | Ação | Tempo |
|-------|---------|------|-------|
| Build | Push | [AÇÃO] | [TEMPO] |
| Test | Push | [AÇÃO] | [TEMPO] |
| Deploy Preview | PR | [AÇÃO] | [TEMPO] |
| Deploy Prod | Merge main | [AÇÃO] | [TEMPO] |

### Configuração

**Arquivo**: `[CAMINHO DO ARQUIVO CI]`

---

## Ambientes

**INSTRUÇÃO**: Liste os ambientes do projeto.

| Ambiente | URL | Branch | Propósito |
|----------|-----|--------|-----------|
| Development | localhost | - | Dev local |
| Preview | [URL] | PR | Review |
| Staging | [URL] | develop | Testes |
| Production | [URL] | main | Produção |

---

## Monitoramento

### Métricas Chave

| Métrica | Target | Alerta |
|---------|--------|--------|
| Uptime | [TARGET] | < [VALOR] |
| Response Time | [TARGET] | > [VALOR] |
| Error Rate | [TARGET] | > [VALOR] |

### Ferramentas

| Ferramenta | Propósito |
|------------|-----------|
| [FERRAMENTA] | [PROPÓSITO] |

---

## Troubleshooting

### Problema: Deploy Falhou

**Sintomas**: [COMO identificar]  
**Checklist**:
1. Verificar logs do CI
2. Verificar se tests passaram localmente
3. Verificar variáveis de ambiente
4. Rollback se necessário

### Problema: Sistema Lento

**Checklist**:
1. Verificar métricas de CPU/memória
2. Verificar conexões de banco
3. Verificar latência de rede
4. Escalar se necessário

---

## Recursos

- [🏗️ Arquitetura](../docs/architecture.md) — Infraestrutura
- [📊 Fluxo de Dados](../docs/data-flow.md) — Integrações
- [🔄 Workflow](../docs/development-workflow.md) — CI/CD
- [🎼 Maestro](../../AGENTS.md) — Visão geral

<!-- agent-update:end -->
