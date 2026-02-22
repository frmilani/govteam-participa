# 🏆 Prêmio Destaque - Sistema de Enquetes e Premiações

> Plataforma SaaS multi-tenant para distribuição e análise de enquetes online, com foco em premiações de destaque empresarial.

**Tech Stack:** Next.js 15 (App Router), PostgreSQL 15+, Redis + BullMQ, MinIO/S3, NextAuth + OAuth2

---

## 🚀 Pipeline de Desenvolvimento Multi-Repo

Este projeto faz parte de um **workspace multi-repositório** otimizado para trabalhar com múltiplos agentes de IA simultaneamente.

### 📁 Estrutura do Workspace

```
E:\Programacao\hub-spokes-workspace\
├── hub/                           # Repositório Hub (FormBuilder)
│   ├── .git/                      # Git independente
│   └── docs/
│       ├── SPOKE_UI_KIT.md       # Documentação compartilhada
│       └── components/            # Componentes de referência
│
└── spokes/
    └── premio-destaque/           # Este projeto
        ├── .git/                  # Git independente
        ├── Hub/                   # Symlink -> ../../hub/docs ✨
        └── src/
```

### 🎯 Conceito: Hub & Spoke

- **Hub:** FormBuilder (core) - Gerencia formulários, autenticação, organizações
- **Spoke:** Premio Destaque - Consome formulários do Hub via API, adiciona funcionalidades específicas
- **Symlink:** Atalho mágico que dá acesso direto aos docs do Hub sem duplicar arquivos

### ⚡ Quick Start (Workspace)

**1. Clonar Hub e Spoke:**
```powershell
# Criar workspace
mkdir E:\Programacao\hub-spokes-workspace
cd E:\Programacao\hub-spokes-workspace

# Clonar Hub
git clone https://github.com/frmilani/formbuilder.git hub

# Clonar Spoke
mkdir spokes
cd spokes
git clone https://github.com/frmilani/premio-destaque.git premio-destaque
```

**2. Criar Symlink (requer PowerShell como Admin):**
```powershell
cd E:\Programacao\hub-spokes-workspace\spokes\premio-destaque
New-Item -ItemType SymbolicLink -Path "Hub" -Target "..\..\hub\docs"
```

**3. Verificar:**
```powershell
dir Hub
# Deve mostrar conteúdo de hub/docs/
```

### 🤖 Trabalhando com Múltiplos Agentes

**Cenário: Implementar AppLauncher v2.0**

```
Agente 1 (Windsurf):
  Workspace: E:\Programacao\hub-spokes-workspace\hub
  Tarefa: Atualizar SPOKE_UI_KIT.md com AppLauncher v2.0

Agente 2 (Cursor):
  Workspace: E:\Programacao\hub-spokes-workspace\spokes\premio-destaque
  Tarefa: Implementar AppLauncher baseado em Hub/SPOKE_UI_KIT.md
```

**Vantagem:** Agente 2 acessa `Hub/SPOKE_UI_KIT.md` diretamente via symlink! 🎉

### 📚 Documentação Completa

- **Pipeline Multi-Repo:** `.context/docs/multi-repo-dev-pipeline.md`
- **Quick Start:** `.context/docs/multi-repo-quick-start.md`
- **Scripts de Setup:** `.context/docs/setup-workspace.ps1` (Windows) e `.context/docs/setup-workspace.sh` (Linux/Mac)
- **Guia de Compartilhamento:** `.context/docs/app-launcher-share-guide.md`
- **Guia de Migração:** `.context/docs/app-launcher-migration-guide.md`

---

## 🚀 Quick Start (Desenvolvimento Local)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env
# Editar .env com credenciais do Hub

# 3. Configurar banco de dados
npx prisma generate
npx prisma db push

# 4. Rodar desenvolvimento
npm run dev
```

### 🔑 Variáveis de Ambiente Importantes

```env
# Hub Integration
HUB_URL=https://formbuilder.plataforma.com
HUB_CLIENT_ID=spoke-premio-destaque
HUB_CLIENT_SECRET=seu-secret-aqui

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aqui

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/premio_destaque

# Storage (MinIO/S3)
S3_BUCKET=premio-destaque
S3_ENDPOINT=http://localhost:9000

# WhatsApp (Evolution API)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-key-aqui
```

---

## 🎨 Componentes Desenvolvidos

### AppLauncher v2.0
- **Localização:** `src/components/ui/AppLauncher.tsx`
- **Features:**
  - Ícone de 9 pontinhos (moderno)
  - Suporte a emojis + ícones Lucide React
  - Badge contador de aplicações
  - Indicador "Atual" para spoke ativo
  - Animações suaves com Framer Motion
  - Fallback automático quando Hub offline

**Documentação:** `.context/docs/app-launcher.md`

---

## 🔧 Comandos Úteis (AI Workflows)

Depois de configurar o workspace, use os comandos:
- `/extract-design` → Extrai tokens dos wireframes
- `/hydrate-agents` → Preenche agentes com dados do PRD
- `/init-project` → Inicializa o projeto
- `/plan RF-001` → Planeja uma feature
- `/implement RF-001` → Implementa a feature
- `/status` → Verifica progresso

---

## 📁 Estrutura do Projeto

```
premio-destaque/
├── AGENTS.md                      ← 🎼 Ponto de entrada para IAs
├── PRD.md                         ← 📋 Product Requirements Document
│
├── .agent/workflows/              ← ⚡ Comandos automatizados
│   ├── init-project.md
│   ├── plan.md
│   ├── implement.md
│   └── status.md
│
├── .context/
│   ├── agents/                    ← 🤖 Playbooks de especialistas
│   ├── docs/                      ← 📚 Documentação técnica
│   │   ├── multi-repo-dev-pipeline.md
│   │   ├── app-launcher.md
│   │   └── hub-integration-requirements.md
│   ├── design/                    ← 🎨 Design tokens
│   └── plans/                     ← 📋 Planos de implementação
│
├── src/
│   ├── app/                       ← Next.js App Router
│   ├── components/                ← Componentes React
│   │   ├── ui/                    ← Componentes UI (AppLauncher, etc)
│   │   └── admin/                 ← Componentes admin
│   ├── lib/                       ← Utilitários e configs
│   └── hooks/                     ← React hooks customizados
│
└── Hub/                           ← Symlink -> ../../hub/docs (gitignored)
```

---

## 🔗 O que é o Symlink Hub/?

**Symlink** é um atalho especial que aponta para a pasta de documentação do Hub.

### Como Funciona

```
premio-destaque/Hub/  →  ../../hub/docs/
                         (aponta para)
```

Quando você acessa `Hub/SPOKE_UI_KIT.md`, na verdade está lendo `../../hub/docs/SPOKE_UI_KIT.md`!

### Por Que Usar?

✅ **Acesso direto** à documentação do Hub  
✅ **Sempre atualizado** (quando faz git pull no Hub)  
✅ **Não duplica arquivos** (~100 bytes vs ~50MB)  
✅ **Agentes de IA** podem ler docs do Hub facilmente  

### Como Criar (Windows)

**Requer PowerShell como Administrador:**

```powershell
cd E:\Programacao\hub-spokes-workspace\spokes\premio-destaque
New-Item -ItemType SymbolicLink -Path "Hub" -Target "..\..\hub\docs"
```

**Alternativa sem Admin (Junction):**

```powershell
cmd /c mklink /J "Hub" "..\..\hub\docs"
```

### Importante

- ✅ `Hub/` está no `.gitignore` (não será commitado)
- ✅ Cada desenvolvedor cria seu próprio symlink
- ✅ Symlink é local (específico da sua máquina)

---

## � Melhores Práticas

### 1. Trabalhar com Múltiplos Agentes

```
Agente 1 (Hub):     E:\Programacao\hub-spokes-workspace\hub
Agente 2 (Spoke):   E:\Programacao\hub-spokes-workspace\spokes\premio-destaque
```

**Sempre especificar caminho absoluto** ao trabalhar com agentes de IA!

### 2. Sincronizar Repositórios

```bash
# Hub
cd E:\Programacao\hub-spokes-workspace\hub
git pull origin main

# Spoke
cd E:\Programacao\hub-spokes-workspace\spokes\premio-destaque
git pull origin master
```

### 3. Branches Coordenadas

Quando trabalhando na mesma feature em Hub e Spoke:

```bash
# Hub
cd hub
git checkout -b feature/app-launcher-v2

# Spoke
cd spokes/premio-destaque
git checkout -b feature/app-launcher-v2
```

### 4. PRs Linkados

```markdown
# PR no Hub
Closes #123
Related: frmilani/premio-destaque#45

# PR no Spoke
Implements: formbuilder/hub#123
```

---

## 🆘 Troubleshooting

### Symlink não funciona

**Solução 1:** Executar PowerShell como Admin e recriar:
```powershell
New-Item -ItemType SymbolicLink -Path "Hub" -Target "..\..\hub\docs"
```

**Solução 2:** Usar Junction (não precisa Admin):
```powershell
cmd /c mklink /J "Hub" "..\..\hub\docs"
```

### Git detectando Hub/ como repositório

**Causa:** Você clonou o Hub dentro do spoke (nested repo)

**Solução:** Remover pasta Hub/ e criar symlink correto:
```powershell
Remove-Item -Recurse -Force Hub
New-Item -ItemType SymbolicLink -Path "Hub" -Target "..\..\hub\docs"
```

### Badge "18 arquivos" no Source Control

**Causa:** Pasta Hub/ sendo detectada como repo separado

**Solução:** Verificar se `Hub/` está no `.gitignore` e remover pasta:
```bash
git status
# Se Hub/ aparecer, adicione ao .gitignore e remova
```

### Agente confundindo repos

**Solução:** Sempre verificar diretório atual:
```bash
pwd                # Ver diretório atual
git remote -v      # Ver remote do repo
```

---

## 🎯 Filosofia de Desenvolvimento

1. **Multi-Repo > Monorepo**: Autonomia total, Git isolado, múltiplos agentes simultâneos
2. **Symlink > Copiar**: Sempre atualizado, sem duplicação, acesso direto
3. **Contexto é Rei**: IAs trabalham melhor com contexto estruturado
4. **Planejamento antes de Código**: `/plan` antes de `/implement`
5. **Verificação Contínua**: Testes e screenshots como evidência

---

## 📖 Documentação Adicional

| Documento | Descrição |
|-----------|-----------|
| [AGENTS.md](AGENTS.md) | Ponto de entrada para IAs (Maestro) |
| [PRD.md](PRD.md) | Product Requirements Document completo |
| [.context/docs/multi-repo-dev-pipeline.md](.context/docs/multi-repo-dev-pipeline.md) | Pipeline multi-repo detalhado |
| [.context/docs/app-launcher-share-guide.md](.context/docs/app-launcher-share-guide.md) | Como compartilhar componentes |
| [.context/docs/setup-workspace.ps1](.context/docs/setup-workspace.ps1) | Script automático de setup (Windows) |

---

## 🔧 Requisitos

- Node.js 18+
- PostgreSQL 15+
- Redis (para BullMQ)
- Git
- PowerShell (Windows) ou Bash (Linux/Mac)
- IDE com suporte a IA (Windsurf, Cursor, VS Code)

---

## 📝 Licença

MIT
