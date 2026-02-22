<!-- template:testing-strategy -->
<!-- hydration:required -->

# Testing Strategy

> Estratégia de testes do projeto.

---

## Test Pyramid

```
        ╱╲
       ╱  ╲        E2E Tests (Few)
      ╱────╲       - Critical user flows
     ╱      ╲
    ╱────────╲     Integration Tests (Some)
   ╱          ╲    - API endpoints
  ╱            ╲   - Database operations
 ╱──────────────╲
╱                ╲  Unit Tests (Many)
╲________________╱  - Functions
                    - Components
                    - Utilities
```

---

## Coverage Targets

<!-- placeholder:needs-hydration -->

| Area | Target | Current |
|------|--------|---------|
| Overall | [TARGET]% | ⏳ |
| Critical Paths | [TARGET]% | ⏳ |
| API Routes | [TARGET]% | ⏳ |
| Components | [TARGET]% | ⏳ |

<!-- /placeholder -->

---

## Test Types

### Unit Tests

**Framework:** [Jest / Vitest]

**Location:** `[PATH TO TESTS]`

**Run:** `npm run test`

**Focus:**
- Pure functions
- Utility helpers
- Business logic

---

### Integration Tests

**Framework:** [Jest / Vitest + Supertest]

**Location:** `[PATH TO TESTS]`

**Run:** `npm run test:integration`

**Focus:**
- API routes
- Database operations
- Service integrations

---

### E2E Tests

**Framework:** [Playwright / Cypress]

**Location:** `[PATH TO TESTS]`

**Run:** `npm run test:e2e`

**Focus:**
- Critical user flows
- Cross-browser testing

---

## Critical Tests

<!-- placeholder:needs-hydration -->

| Test | File | What it validates |
|------|------|-------------------|
| [TEST 1] | [PATH] | [WHAT] |
| [TEST 2] | [PATH] | [WHAT] |

<!-- /placeholder -->

---

## Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage

# E2E tests
npm run test:e2e
```

---

## Related Documents

- [🔄 Dev Workflow](./development-workflow.md) — Fluxo de desenvolvimento
- [🔙 Docs Index](./README.md) — Índice de documentação
