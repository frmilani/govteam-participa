<!-- manifest:type:inputs -->
<!-- manifest:status:TEMPLATE -->
<!-- manifest:updated:2024-12-09 -->

# Project Inputs

> Arquivos de entrada que definem O QUE será construído.

## Quick Reference

| Key | Value |
|-----|-------|
| Type | inputs |
| Status | ⏳ AWAITING PROJECT FILES |
| Required | PRD.md |
| Optional | wireframes/ |

## Required Files

### PRD.md

**Location:** `.context/inputs/PRD.md`

**Purpose:** Product Requirements Document - Single Source of Truth para requisitos de negócio.

**Must Contain:**
- Visão geral do projeto
- Requisitos funcionais (RF-XXX)
- Requisitos não funcionais
- Modelo de dados
- Stack tecnológica
- Critérios de aceite

**Format:** Markdown com seções numeradas

**Used By:**
- `/init-project` → Gera feature_list.json
- `/hydrate-agents` → Preenche playbooks
- `/plan RF-XXX` → Referência para planos

---

## Optional Files

### wireframes/

**Location:** `.context/inputs/wireframes/`

**Purpose:** Wireframes/Protótipos de UI aprovados (exportados do AI Studio ou similar).

**Expected Contents:**
```
wireframes/
├── App.tsx              ← Estrutura principal
├── components/          ← Componentes React
│   ├── Page1.tsx
│   ├── Page2.tsx
│   └── ...
├── index.html
├── package.json
└── README.md            ← Link para preview online
```

**Format:** Projeto React/Vite com Tailwind CSS

**Used By:**
- `/extract-design` → Extrai tokens e componentes

---

## File Placement Instructions

<!-- instruction:for-ai -->
Ao iniciar um novo projeto:
1. Copie o PRD.md do cliente para `.context/inputs/PRD.md`
2. Se houver wireframes, copie para `.context/inputs/wireframes/`
3. Execute `/init-project` para processar
<!-- /instruction -->

### For Humans

1. Coloque seu `PRD.md` em `.context/inputs/`
2. Se tiver wireframes do AI Studio, extraia para `.context/inputs/wireframes/`
3. Execute os workflows de inicialização

---

## Validation

- [ ] PRD.md existe em `.context/inputs/`
- [ ] PRD.md tem seções de requisitos (RF-XXX)
- [ ] PRD.md tem seção de stack tecnológica
- [ ] wireframes/ tem App.tsx (se wireframes existem)
- [ ] wireframes/ tem componentes React válidos

---

## Template PRD Structure

Se precisar criar um PRD do zero, use esta estrutura:

```markdown
# PRD - [Nome do Projeto]

## 1. Visão Geral
[Descrição do projeto]

## 2. Objetivos
[O que o projeto resolve]

## 3. Stakeholders
[Quem são os usuários]

## 4. Requisitos Funcionais
### RF-001: [Nome]
[Descrição]
### RF-002: [Nome]
...

## 5. Arquitetura Técnica
### 5.1 Stack
### 5.2 Estrutura de Pastas
### 5.3 Integrações

## 6. Design System
[Cores, tipografia, componentes]

## 7. Modelo de Dados
[Entidades, relacionamentos]

## 8. Requisitos Não Funcionais
[Performance, segurança, acessibilidade]

## 9. Critérios de Aceite
[Como validar cada RF]

## 10. Roadmap
[Fases de implementação]
```
