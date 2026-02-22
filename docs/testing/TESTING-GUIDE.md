# Testing Guide - Prêmio Destaque Spoke

> Infraestrutura de testes com Vitest

## 🧪 Comandos

```bash
npm test              # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run test:ui      # Interactive UI
```

## 📂 Estrutura

```
premio-destaque/
├── vitest.config.ts
├── tests/
│   ├── setup.ts
│   └── unit/
│       └── hub-integration/
│           ├── hub-permissions.test.ts
│           └── resource-registry.test.ts
```

## 📊 Coverage Thresholds

- **Global**: 60%
- **Hub Integration** (hub-permissions, resource-registry): 80%
- **Voting Logic** (src/lib/voting/**): 70%

## 🎯 Testes Existentes

1. **hub-permissions.test.ts** - Integração HPAC (checkPermission, applyFieldMask)
2. **resource-registry.test.ts** - Validação de recursos

## 📚 Recursos

- [Hub Testing Guide](../../hub/docs/testing/TESTING-GUIDE.md)
- [FormBuilder Testing](../formbuilder/docs/testing/TESTING-GUIDE.md)

---

**Versão**: 1.0.0
