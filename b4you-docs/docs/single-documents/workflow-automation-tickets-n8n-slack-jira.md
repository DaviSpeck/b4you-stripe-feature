---
title: "Workflow - Automação de Suporte via N8N, Slack e Jira"
---

# Workflow - Automação de Suporte via N8N, Slack e Jira

## 1. Objetivo

Este documento detalha o funcionamento do sistema de automação para o recebimento, triagem e criação de tickets de suporte. O objetivo principal é centralizar as solicitações, enriquecê-las com IA, obter aprovação de um gestor via Slack e, se aprovado, criar um ticket detalhado no Jira, atribuído à pessoa correta.

## 2. Arquitetura

A solução é dividida em dois workflows no n8n para separar as responsabilidades de envio e recebimento, conforme a estrutura definida.

* **Workflow 1: "O Mensageiro"** - Responsável por coletar, processar e enviar a solicitação para o Slack.
* **Workflow 2: "O Executor"** - Responsável por receber a interação do Slack, aplicar a lógica de negócios e criar o ticket no Jira.

---

## 3. Workflow 1: O Mensageiro (Google Sheets -> Slack)

**Gatilho:** `Google Sheets Trigger`

* **Ação:** É ativado sempre que uma nova linha é adicionada à planilha vinculada ao formulário de suporte.

### Passo a Passo da Execução:

1. **Tratamento de Dados (Nó `Set`)**

   * Converte o "Carimbo de data/hora" do Google Sheets de um número serial para um formato legível (ex: `dd/MM/yyyy` e `HH:mm`).
2. **Análise com IA (Nó `OpenAI`)**

   * Os dados do formulário são enviados para um modelo de linguagem (GPT).
   * **Prompt:** A IA é instruída a agir como um analista de suporte, criando um título padronizado, um resumo executivo e uma análise inicial do problema.
   * **Saída:** Retorna um objeto JSON estruturado com as informações enriquecidas.
3. **Preparação do Pacote de Dados (Nó `Set`)**

   * Um objeto JSON é criado para que os dados sejam utilizados pelo Slack posteriormente.
   * Este objeto contém **apenas os dados essenciais** que o Workflow 2 precisará para criar o ticket no Jira (título da IA, descrição, tipo de ticket, etc.). Isso otimiza a transferência de dados.
4. **Envio da Mensagem Interativa (Nó `Slack`)**

   * É montada uma mensagem visualmente rica (`blocksUi`) como um objeto JavaScript.
   * A mensagem exibe os detalhes do ticket para o gestor.
   * **Ponto Crítico:** O objeto JSON é transformado em uma string de texto (`JSON.stringify`) e embutido no campo `value` do botão de aprovação ("Enviar ao Jira") em base64. Este é o mecanismo de transferência de dados para o Workflow 2.
   * A mensagem também contém um seletor de prioridade (radio buttons) e um botão de rejeição.

---

## 4. Workflow 2: O Executor (Slack -> Jira)

**Gatilho:** `Webhook Trigger`

* **Ação:** É ativado quando um gestor clica em qualquer botão na mensagem enviada pelo Workflow 1. A URL deste webhook deve estar configurada na seção "Interactivity & Shortcuts" do Slack App correspondente.

### Passo a Passo da Execução:

1. **"Desempacotar" a Resposta do Slack (Nó `Set`)**

   * O gatilho recebe um `payload` em base64 do Slack. Este nó faz o decode do base64 e em seguida o `JSON.parse` desse payload, transformando-o em um objeto JSON utilizável (`slackData`).
2. **Decisão de Aprovação (Nó `IF`)**

   * Verifica se o `action_id` do botão clicado corresponde ao `approve_button`.
   * Se `true`, o fluxo continua para a criação do ticket.
   * Se `false` (botão "Rejeitar" foi clicado), o fluxo termina ou pode seguir um caminho alternativo (ex: enviar notificação de recusa).
3. **Lógica de Atribuição (Nó `Switch`)**

   * Este nó direciona o fluxo com base no `tipoTicket` (que foi extraído do `value` do botão de aprovação).
   * Possui uma saída para cada tipo de ticket conhecido ("Checkout", "Bling", etc.) e uma saída **Default** para todos os outros casos.
4. **Preparação Final dos Dados (Nós `Set`)**

   * Para cada responsável (Vinicius, Danilo, etc.), existe um único nó `Set`.
   * As saídas do `Switch` são agrupadas e conectadas ao `Set` do responsável correspondente.
   * Cada nó `Set` define duas variáveis essenciais:
     1. `jiraAssigneeId`: Contém o **Account ID** estático do responsável.
     2. `jiraPriorityId`: Usa uma expressão condicional (ternário) para traduzir o nome da prioridade vindo do Slack ("low", "medium", "high") para o **ID numérico** correspondente no Jira.
5. **Criação do Ticket (Nó `Jira`)**

   * Todas as ramificações dos nós `Set` convergem para este único nó.
   * Os campos do Jira são preenchidos dinamicamente:
     * **Summary (Título):** Usa o `titulo` do pacote vindo do primeiro workflow.
     * **Description:** Combina a `descricao` da IA com os dados originais do formulário.
     * **Assignee (Responsável):** Usa a variável `jiraAssigneeId`.
     * **Priority:** Usa a variável `jiraPriorityId`.
     * **Labels:** Usa o `tipoTicket` e o `departamento` para criar etiquetas dinâmicas.
   * Após a execução bem-sucedida, o ticket é criado no Jira, devidamente detalhado e atribuído.

- Anote decisões de design, riscos conhecidos ou dependências.