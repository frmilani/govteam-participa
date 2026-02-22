# Story: Autenticação e SSO via OAuth2 (RF-001)

Implementação da camada de autenticação unificada com o FormBuilder Hub utilizando o protocolo OAuth2 e NextAuth.js.

## Visão Geral
Esta story cobre a integração do Spoke (Premio Destaque) com o servidor de identidade do Hub, garantindo que usuários autenticados no Hub tenham acesso transparente ao painel administrativo do Spoke, preservando o contexto de multi-tenancy (`organizationId`).

## Critérios de Aceite
- [x] Login via Hub redireciona corretamente para a tela de autorização.
- [x] O token JWT contém o `organizationId` e `role` do usuário.
- [x] Middleware protege todas as rotas em `/admin/*`.
- [x] Rotas públicas como `/vote/*` e `/r/*` permanecem acessíveis sem login.

## Lista de Arquivos
- `src/lib/auth.config.ts`: Configuração do provider OAuth2 e callbacks de sessão.
- `src/middleware.ts`: Proteção de rotas e injeção de headers de tenant.
- `src/app/api/auth/[...nextauth]/route.ts`: Endpoint do NextAuth.
- `src/lib/hub-auth.ts`: Utilitários para comunicação com o Hub Auth.
- `src/app/auth/signin/page.tsx`: Página customizada de login.

## Status: Concluído ✅
Implementado durante a fase inicial do projeto.
