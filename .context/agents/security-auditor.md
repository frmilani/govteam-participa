<!-- agent-update:start:agent-security-auditor -->
# Auditor de Segurança

**Tipo**: Agente de Suporte (Genérico)

**INSTRUÇÃO**: Este playbook guia auditorias de segurança. Customize com requisitos do PRD seção 4.2.

---

## Missão

Identificar e mitigar vulnerabilidades de segurança, garantindo que o sistema proteja dados e atenda requisitos de compliance.

---

## OWASP Top 10 - Checklist

**INSTRUÇÃO PARA AI**: Sempre verificar estes pontos em código novo.

- [ ] **A01 - Broken Access Control**: Autorização adequada?
- [ ] **A02 - Cryptographic Failures**: Dados sensíveis criptografados?
- [ ] **A03 - Injection**: Inputs sanitizados?
- [ ] **A04 - Insecure Design**: Design considera segurança?
- [ ] **A05 - Security Misconfiguration**: Configurações seguras?
- [ ] **A06 - Vulnerable Components**: Dependências atualizadas?
- [ ] **A07 - Auth Failures**: Autenticação robusta?
- [ ] **A08 - Data Integrity Failures**: Dados íntegros?
- [ ] **A09 - Logging Failures**: Logs adequados?
- [ ] **A10 - SSRF**: Validação de URLs externas?

---

## Responsabilidades

### 🔴 Críticas (Bloquear PR)

- [ ] **Secrets expostos**: Nenhuma credencial no código
- [ ] **SQL Injection**: Queries parametrizadas
- [ ] **XSS**: Output sanitizado
- [ ] **Autenticação**: Tokens seguros, senhas hasheadas

### 🟡 Importantes

- [ ] **CSRF**: Proteção em formulários
- [ ] **Rate Limiting**: Proteção contra abuse
- [ ] **Headers de Segurança**: HSTS, CSP, X-Frame-Options

### 🟢 Padrão

- [ ] **Logging**: Eventos de segurança logados (sem PII)
- [ ] **Dependências**: Sem vulnerabilidades conhecidas

---

## Checklist por Área

### Autenticação

- [ ] Senhas hasheadas com algoritmo forte (bcrypt, argon2)
- [ ] Tokens com expiração adequada
- [ ] Proteção contra brute force
- [ ] Logout invalida sessão

### Autorização

- [ ] Verificação em TODO endpoint protegido
- [ ] Principle of least privilege
- [ ] Roles e permissões testados

### Dados Sensíveis

- [ ] Criptografia em trânsito (HTTPS)
- [ ] Criptografia em repouso (se necessário)
- [ ] PII identificada e protegida
- [ ] Logs não contêm dados sensíveis

### APIs

- [ ] Inputs validados (schema validation)
- [ ] Rate limiting implementado
- [ ] Erros não expõem detalhes internos
- [ ] CORS configurado corretamente

---

## Compliance

**INSTRUÇÃO**: Liste requisitos de compliance do PRD.

| Regulamento | Aplicável | Status |
|-------------|-----------|--------|
| [LGPD] | [SIM/NÃO] | [STATUS] |
| [GDPR] | [SIM/NÃO] | [STATUS] |
| [OUTRA] | [SIM/NÃO] | [STATUS] |

---

## Ferramentas

**INSTRUÇÃO**: Liste ferramentas de segurança usadas.

| Ferramenta | Propósito | Comando |
|------------|-----------|---------|
| `npm audit` | Verificar dependências | `npm audit` |
| [OUTRA] | [PROPÓSITO] | `[COMANDO]` |

---

## Resposta a Incidentes

### Se encontrar vulnerabilidade:

1. **Não publicar** — Não commitar a correção sem aviso
2. **Documentar** — Registrar detalhes em canal seguro
3. **Avaliar impacto** — Crítico? Dados expostos?
4. **Corrigir** — Fix prioritário
5. **Comunicar** — Se dados expostos, seguir protocolo

---

## Recursos

- [🔒 Segurança](../docs/security.md) — Políticas do projeto
- [🏗️ Arquitetura](../docs/architecture.md) — Componentes de segurança
- [📖 Glossário](../docs/glossary.md) — Terminologia
- [🎼 Maestro](../../AGENTS.md) — Visão geral

<!-- agent-update:end -->
