<!-- template:development-workflow -->
<!-- hydration:required -->

# Development Workflow

> Fluxo de trabalho para desenvolvimento.

---

## Git Workflow

### Branch Strategy

```
main (production)
  │
  └── develop (staging)
        │
        ├── feature/RF-001-library
        ├── feature/RF-002-execution
        ├── fix/bug-description
        └── chore/update-deps
```

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/RF-XXX-description` | `feature/RF-001-library` |
| Bug Fix | `fix/description` | `fix/modal-not-closing` |
| Chore | `chore/description` | `chore/update-deps` |

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Formatting
- `refactor` — Code restructure
- `test` — Adding tests
- `chore` — Maintenance

**Examples:**
```
feat(RF-001): Add flow card component
fix(modal): Resolve close button not working
docs(readme): Update installation instructions
```

---

## PR Process

### Before Creating PR

- [ ] Tests pass locally
- [ ] Lint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Feature list updated (if applicable)

### PR Template

```markdown
## Description
[What this PR does]

## RF Reference
RF-XXX

## Type
- [ ] Feature
- [ ] Bug Fix
- [ ] Refactor
- [ ] Documentation

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] feature_list.json updated
```

---

## Local Development

### Setup

```bash
# Clone
git clone [REPO_URL]
cd [PROJECT]

# Install
npm install

# Environment
cp .env.example .env.local
# Edit .env.local with your values

# Database
npx prisma generate
npx prisma migrate dev

# Run
npm run dev
```

### Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Check linting
npm run test         # Run tests
npm run db:studio    # Open Prisma Studio
```

---

## Code Review Guidelines

### Reviewer Checklist

- [ ] Code follows project patterns
- [ ] Tests are meaningful
- [ ] No security issues
- [ ] Performance considered
- [ ] Documentation updated

### Author Responsibilities

- [ ] Respond to feedback promptly
- [ ] Keep PR focused and small
- [ ] Update based on feedback
- [ ] Squash commits if needed

---

## Related Documents

- [🧪 Testing Strategy](./testing-strategy.md) — Como testar
- [🛠️ Tooling](./tooling.md) — Ferramentas utilizadas
- [🔙 Docs Index](./README.md) — Índice de documentação
