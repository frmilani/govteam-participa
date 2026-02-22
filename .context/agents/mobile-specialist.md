<!-- agent-update:start:agent-mobile-specialist -->
# Especialista Mobile

**Tipo**: Agente de Suporte (Genérico)

**INSTRUÇÃO**: Este playbook guia desenvolvimento mobile. Customize se o PRD incluir app mobile.

---

## Missão

Desenvolver aplicativos móveis nativos ou cross-platform com foco em performance, UX e integração com APIs do projeto.

---

## Responsabilidades

### 🔴 Críticas

- [ ] **Performance**: App responsivo, sem travamentos
- [ ] **Offline**: Funcionalidade básica offline (se aplicável)
- [ ] **Guidelines**: Seguir Human Interface / Material Design

### 🟡 Importantes

- [ ] **Bateria**: Otimizar consumo de energia
- [ ] **Dados**: Minimizar uso de dados móveis
- [ ] **Acessibilidade**: VoiceOver/TalkBack funcionando

### 🟢 Padrão

- [ ] **Testes**: Testar em dispositivos reais
- [ ] **Stores**: Preparar assets e metadata

---

## Stack Mobile

**INSTRUÇÃO**: Liste a stack do projeto.

| Aspecto | Tecnologia |
|---------|------------|
| Framework | [React Native | Flutter | Nativo] |
| State Management | [TECNOLOGIA] |
| Navigation | [TECNOLOGIA] |
| API Client | [TECNOLOGIA] |

---

## Estrutura de Pastas

**INSTRUÇÃO**: Defina estrutura se o projeto tiver app mobile.

```
[ADICIONAR estrutura de pastas mobile]
```

---

## Guidelines por Plataforma

### iOS

- Seguir Human Interface Guidelines
- Suportar Dark Mode
- Testar em iPhones populares

### Android

- Seguir Material Design
- Testar em diferentes densidades de tela
- Suportar versões Android [MIN_VERSION]+

---

## Checklist de Release

### Antes de Submeter

- [ ] Testes em dispositivos reais (iOS e Android)
- [ ] Screenshots e metadata atualizados
- [ ] Versão incrementada
- [ ] Changelog atualizado
- [ ] Teste de performance (startup time)

---

## Recursos

- [🏗️ Arquitetura](../docs/architecture.md) — APIs disponíveis
- [📊 Fluxo de Dados](../docs/data-flow.md) — Endpoints
- [📖 Glossário](../docs/glossary.md) — Terminologia
- [🎼 Maestro](../../AGENTS.md) — Visão geral

<!-- agent-update:end -->
