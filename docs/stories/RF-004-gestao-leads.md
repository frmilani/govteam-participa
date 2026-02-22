# Story: Gestão de Leads (RF-004)

Base de dados de contatos (votores) com segmentação por tags e controle de opt-out.

## Visão Geral
Gerenciamento de leads capturados ou importados para disparo de campanhas. Inclui detecção de duplicidade por WhatsApp e sistema flexível de tags para segmentação.

## Critérios de Aceite
- [x] CRUD manual de leads com validação de WhatsApp.
- [x] Detecção de duplicidade ao criar ou importar (chave: WhatsApp).
- [x] Sistema de tags para segmentar leads (ex: "VIP", "Comércio Local").
- [x] Importação massiva via CSV.
- [x] Controle de opt-out para respeitar privacidade do usuário.

## Lista de Arquivos
- `src/app/admin/leads/page.tsx`: Lista de leads com filtros.
- `src/components/admin/lead-form.tsx`: Formulário de edição.
- `src/components/admin/tags-manager.tsx`: Gestor global de tags.
- `src/components/admin/import-leads-wizard.tsx`: Wizard de importação.
- `src/app/api/leads/`: Endpoints de CRUD.
- `src/app/api/tags/`: API de gestão de tags.

## Status: Concluído ✅
Funcionalidade estável.
