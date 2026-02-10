---
title: Webhooks
---

# Webhooks

## 1. Visão Geral

A funcionalidade de webhooks na plataforma B4You dispara chamadas HTTP para URLs externas configuradas pelos produtores, permitindo reações automáticas a eventos como compras aprovadas, recusadas, reembolsos, entre outros. A lógica de disparo é executada pela Lambda `webhookEvent`.

## 2. Objetivo

Este guia visa orientar o desenvolvedor na identificação e resolução de falhas em webhooks, cobrindo análise de histórico, logs, simulação de chamadas e verificação de configurações.

## 3. Plano de Ação

1. **Consultar histórico de disparos**
   * Diretamente na base de dados, verifique o histórico de disparos para validar o retorno dos disparos.
   * Use os filtros por evento, status ou data para localizar chamadas com código de retorno diferente de 200 e identificar o número de tentativas.
2. **Analisar logs da Lambda**
   * No AWS CloudWatch, acesse a função `webhookEvent`.
   * Pesquise pelos identificadores disponíveis: ID do produto, ID da venda, e‑mail do cliente, ID da oferta ou nome do evento.
3. **Reproduzir manualmente**
   * Utilize o script `test.mjs`, fornecendo a URL do webhook e o nome do evento problemático.
   * Inspecione a resposta HTTP e o payload enviado para diagnosticar discrepâncias.
4. **Verificar configuração no painel**
   * Em **Editar Webhook** ou **Novo Webhook**, confirme:
     * **URL do Webhook** está correta e acessível.
     * **B4You Token** corresponde ao token recebido pela Lambda.
     * **Produto** selecionado engloba o recurso esperado.
     * **Eventos** desejados estão marcados (ou “Selecionar todos”).

## 4. Ferramentas de Diagnóstico

* **UI de Webhooks ou base de dados**: histórico de disparos e configurações.
* **AWS CloudWatch**: logs detalhados da Lambda `webhookEvent`.
* **Script de teste (`test.mjs`)**: simulação de chamadas e inspeção de respostas.

## 5. Critérios de Validação

* **HTTP 200 ou de sucesso** em todas as tentativas após correção.
* **Nenhum erro de payload** ou timeout nos logs.
* **Eventos corretos**: apenas eventos configurados disparam chamadas.

## 6. Pontos de Atenção

* **Retentativas**: histórico mostra número de reenvios; garanta que não haja excesso de tentativas automáticas sem sucesso.
* **Token expirado**: se gerar novo token, atualize imediatamente no endpoint do produtor.
* **Seleção de eventos**: desmarcar eventos não utilizados evita chamadas desnecessárias.
* **Permissões de endpoint**: assegure-se de que o destino aceite requisições `POST`, incluindo CORS e headers necessários.

> **Observação:** Confirme todos os passos antes de mover o ticket para **Concluído**.