---
title: Sustentação - Overview
---

# Sustentação

> **Objetivo:** disponibilizar, em um único lugar, o **passo‑a‑passo técnico** para resolver tickets/chamados recorrentes sem exigir conhecimento aprofundado do negócio B4You.

## Por que existe?

Mesmo os tickets mais simples podem se tornar gargalos quando dependem de know‑how específico.  
A seção **Sustentação** concentra _contextos críticos_ (Bling, Notazz, Webhook, etc.) em guias objetivos, permitindo que qualquer dev:

1. **Identifique** rapidamente onde investigar (BD, APIs, Lambdas, logs).  
2. **Execute** o plano de ação padronizado.  
3. **Valide** a correção seguindo critérios de aceite claros.

## Estrutura dos Documentos

Cada contexto segue o template:

| Seção                | Conteúdo                                         |
| -------------------- | ------------------------------------------------ |
| Overview             | Visão geral do contexto e motivo dos chamados    |
| Base de Dados        | Tabelas/collections e campos relevantes          |
| APIs / Endpoints     | Rotas, controllers/services envolvidos           |
| Lambdas / Jobs       | Funções serverless ou workers relacionados       |
| Logs & Monitoramento | Log groups, dashboards e filtros úteis           |
| Diagnóstico          | Passos ordenados para isolar a causa             |
| Plano de Ação        | Scripts, comandos de redisparo, migrations, etc. |
| Validação            | Critérios de aceite e testes manuais             |
| Acesso               | Credenciais, ambientes, permissões               |
| Observações & Links  | PRs, Issues, contatos internos                   |

## Como Contribuir

1. **Crie ou atualize** o arquivo Markdown em  
   `docs/technology/development/sustentacao/[contexto].md`.
2. Siga o template acima.  
3. Abra um **Pull Request** atribuindo o revisor da squad responsável.
4. Após merge, verifique no ambiente de _preview_ se a sidebar exibe o novo contexto.  
5. Marque o ticket correspondente como **Concluído**.

## Contextos Iniciais

| Contexto             | Sintoma comum                          | Ticket label   |
| -------------------- | -------------------------------------- | -------------- |
| Bling                | Pedidos sem nota, falha de redisparo   | `BLING`        |
| Notazz               | Falha na geração ou cancelamento de NF | `NOTAZZ`       |
| Webhook              | Callback não recebido / fila morta     | `WEBHOOK`      |
| Reembolso            | Divergência de status após prazo       | `REFUND`       |
| Repasse de Comissões | Comissão não atribuída / retroativa    | `COMMISSION`   |
| Verificação          | Usuário verificado sem poder sacar     | `VERIFICATION` |

> Esses contextos foram priorizados por volume de chamados e impacto financeiro.

## Próximos Passos

- Concluir documentação dos contextos iniciais.  
- Automatizar geração de novos documentos via script que lê tickets Jira.  
- Definir indicadores de sucesso (tempo médio de resolução, chamados reabertos).