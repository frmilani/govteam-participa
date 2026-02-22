# 🏆 Guia do Sistema: Prêmio Destaque

Bem-vindo ao Guia Oficial do Usuário do **Prêmio Destaque**. Este documento detalha como configurar, gerenciar e entender o comportamento das enquetes de premiação e votação popular.

---

## 📋 Sumário
1. [Visão Geral](#visão-geral)
2. [Gestão de Enquetes](#gestão-de-enquetes)
3. [Segurança e Identificação](#segurança-e-identificação)
4. [Gamificação e Cupons](#gamificação-e-cupons)
5. [Lógica de Votação (Validez)](#lógica-de-votação-validez)
6. [Cenários e Fluxos de Experiência](#cenários-e-fluxos-de-experiência)

---

## 1. Visão Geral
O Prêmio Destaque é um sistema de consultas populares integrado ao **FormEngine**. Ele permite transformar formulários estáticos em experiências dinâmicas de votação para escolher as melhores empresas, estabelecimentos e personalidades de uma região.

---

## 2. Gestão de Enquetes
No painel administrativo, você pode gerenciar o ciclo de vida de uma campanha:

- **Rascunho**: Configuração inicial. A enquete não é acessível ao público.
- **Publicada**: Enquete ativa no link público.
- **Pausada**: Interrompe a votação temporariamente sem encerrar a data oficial.
- **Encerrada**: Finaliza o recebimento de votos e libera apenas a visualização de resultados.

---

## 3. Segurança e Identificação
A segurança é baseada em três pilares configuráveis por enquete:

### A. Exigir Identificação
Define se o usuário precisa preencher dados básicos (**Nome** e **WhatsApp**) antes de votar.

### B. Exigir CPF
Se ativo, o campo CPF torna-se visível e obrigatório no modal de identificação. O sistema realiza a validação algorítmica para garantir que o número é um CPF real (Módulo 11).

### C. Níveis de Segurança
- **Padrão (Standard)**: Identificação simples sem verificação extra.
- **Alta Segurança (High - WhatsApp OTP)**: Após a identificação, o sistema envia automaticamente um código de 6 dígitos via WhatsApp. O usuário só libera o formulário após inserir o código correto.

---

## 4. Gamificação e Cupons
Para aumentar o engajamento e a qualidade dos dados (Progressive Profiling), o sistema utiliza um sistema de cupons:

- **+1 Cupom**: Identificação básica (Nome + WhatsApp).
- **+1 Cupom**: Informar Email válido.
- **+1 Cupom**: Informar Instagram para contato.
- **+2 Cupons**: Completar a verificação por WhatsApp (OTP).

Os cupons totais são associados ao **Lead** e podem ser utilizados para sorteios futuros vinculados à campanha.

---

## 5. Lógica de Votação (Validez)
Nem todo envio é considerado um "Voto Válido". O sistema aplica a seguinte regra de corte:

- **Percentual Mínimo de Conclusão**: Configurável por enquete (Padrão: 70%).
- **Cálculo**: O sistema divide a quantidade de perguntas respondidas pelo total de perguntas do formulário.
- **Persistência (Draft)**: O progresso é salvo no navegador do usuário automaticamente. Se ele fechar a aba e voltar depois, o formulário recupera as respostas anteriores.

---

## 6. Cenários e Fluxos de Experiência

### Cenário 1: Votação Totalmente Aberta (Open)
*   **Configuração:** Identificação Desligada.
*   **Fluxo:** Usuário acessa -> Vota imediatamente -> Rascunho salvo em real-time -> Envia voto anônimo (vinculado a IP).

### Cenário 2: Votação com Gate de Identificação
*   **Configuração:** Identificação Ligada | Segurança Padrão.
*   **Fluxo:** Usuário acessa -> Abre modal "Quem é você?" -> Preenche dados e ganha cupons -> Abre formulário -> Voto vinculado ao Lead.

### Cenário 3: Votação Blindada (WhatsApp OTP)
*   **Configuração:** Identificação Ligada | Segurança Alta | CPF Obrigatório.
*   **Fluxo:** Usuário acessa -> Preenche Nome+Whats+CPF -> Recebe código no celular -> Digita código na tela -> Libera formulário -> Ganha o máximo de cupons.

### Cenário 4: Retomada de Campanha (Link Único)
*   **Configuração:** Envio via WhatsApp (Campaign Mode).
*   **Fluxo:** Usuário clica no link único (com Token) -> Sistema identifica o Lead automaticamente -> **Gate é pulado** -> Usuário vê o progresso de onde parou e finaliza.

---

## 🛠️ Suporte Técnico
Caso precise de ajustes técnicos ou integração de novas APIs (WhatsApp, Email), consulte a documentação de implementação em `/docs/IMPLEMENTATION_PLAN_RF011.md`.
