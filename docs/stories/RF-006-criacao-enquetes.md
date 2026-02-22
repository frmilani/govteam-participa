# Story: Criação de Enquetes (RF-006)

Configuração de enquetes de premiação vinculadas a formulários do Hub, com personalização visual.

## Visão Geral
Permite ao administrador criar uma Enquete no Spoke, selecionando um formulário do Hub, definindo banners, logotipos customizados e cores para a landing page da premiação.

## Critérios de Aceite
- [x] Seleção de formulário do Hub ao criar nova enquete.
- [x] Personalização de logo, banner e cores via interface administrativa.
- [x] Publicação e pausa de enquetes (alteração de status).
- [x] Configuração de página de agradecimento customizada.

## Lista de Arquivos
- `src/app/admin/enquetes/page.tsx`: Lista de enquetes por organização.
- `src/components/admin/enquete-form.tsx`: Formulário complexo de configuração e design.
- `src/lib/enquetes/`: Lógica de banco de dados para enquetes.
- `src/app/api/enquetes/`: API de gestão.

## Status: Concluído ✅
Funcionalidade core concluída.
