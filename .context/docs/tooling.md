<!-- template:tooling -->
<!-- hydration:required -->

# Tooling

> Ferramentas e scripts do projeto.

---

## Development Tools

<!-- placeholder:needs-hydration -->

| Tool | Purpose | Config File |
|------|---------|-------------|
| [TOOL 1] | [PURPOSE] | [FILE] |
| [TOOL 2] | [PURPOSE] | [FILE] |

<!-- /placeholder -->

---

## Scripts (package.json)

<!-- placeholder:needs-hydration -->

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `npm run dev` | [PURPOSE] |
| `build` | `npm run build` | [PURPOSE] |
| `lint` | `npm run lint` | [PURPOSE] |
| `test` | `npm run test` | [PURPOSE] |

<!-- /placeholder -->

---

## IDE Setup

### VS Code Extensions

Recommended extensions:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Linting & Formatting

### ESLint

**Config:** `.eslintrc.js` or `eslint.config.js`

**Run:** `npm run lint`

### Prettier

**Config:** `.prettierrc`

**Run:** `npm run format`

---

## Database Tools

### Prisma

```bash
npx prisma generate    # Generate client
npx prisma migrate dev # Run migrations
npx prisma studio      # Open GUI
npx prisma db push     # Push schema (dev only)
```

---

## Debugging

### Browser DevTools

- React DevTools
- Network tab for API calls
- Console for errors

### VS Code Debugging

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"]
    }
  ]
}
```

---

## Related Documents

- [🔄 Dev Workflow](./development-workflow.md) — Fluxo de trabalho
- [🧪 Testing Strategy](./testing-strategy.md) — Estratégia de testes
- [🔙 Docs Index](./README.md) — Índice de documentação
