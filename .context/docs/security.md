<!-- template:security -->
<!-- hydration:required -->

# Security

> Práticas de segurança e compliance do projeto.

---

## Authentication

<!-- placeholder:needs-hydration -->

**Provider:** [Clerk / Auth.js / Custom]

**Method:** [JWT / Session / OAuth]

**Implementation:**
- [DESCREVER COMO AUTH FUNCIONA]

<!-- /placeholder -->

---

## Authorization

<!-- placeholder:needs-hydration -->

| Role | Permissions | Access Level |
|------|-------------|--------------|
| [ROLE 1] | [PERMISSIONS] | [LEVEL] |
| [ROLE 2] | [PERMISSIONS] | [LEVEL] |

<!-- /placeholder -->

---

## Data Protection

### Sensitive Data Handling

<!-- placeholder:needs-hydration -->

| Data Type | Storage | Encryption | Access |
|-----------|---------|------------|--------|
| [TYPE 1] | [WHERE] | [HOW] | [WHO] |

<!-- /placeholder -->

### Environment Variables

**Never commit:**
- API keys
- Database credentials
- JWT secrets
- Third-party tokens

**Use:**
- `.env.local` for local development
- Environment secrets in hosting platform

---

## Compliance

<!-- placeholder:needs-hydration -->

| Standard | Requirement | Status |
|----------|-------------|--------|
| [LGPD] | [REQUIREMENT] | ⏳ |
| [WCAG] | [REQUIREMENT] | ⏳ |

<!-- /placeholder -->

---

## Security Checklist

- [ ] Inputs validated with Zod/schema
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (sanitized outputs)
- [ ] CSRF tokens implemented
- [ ] Rate limiting configured
- [ ] Secrets in environment variables
- [ ] HTTPS enforced
- [ ] Auth on all protected routes
- [ ] Logging does not expose secrets

---

## Incident Response

<!-- placeholder:needs-hydration -->

1. **Detect:** [HOW]
2. **Contain:** [STEPS]
3. **Notify:** [WHO]
4. **Recover:** [PROCESS]
5. **Review:** [POST-MORTEM]

<!-- /placeholder -->

---

## Related Documents

- [🏗️ Architecture](./architecture.md) — Estrutura técnica
- [🔌 API Reference](./api-reference.md) — Endpoints
- [🔙 Docs Index](./README.md) — Índice de documentação
