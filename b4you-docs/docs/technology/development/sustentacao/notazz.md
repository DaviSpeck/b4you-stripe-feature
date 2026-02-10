---
title: Notazz
---

# Notazz

## 1. Visão Geral

A integração com o Notazz na plataforma B4You utiliza uma Lambda (`b4you-production-notazz`) que executa via polling a cada hora. Nessa rotina, o sistema importa notas fiscais de produtos ou serviços conforme configuração específica de cada cliente.

## 2. Objetivo

Fornecer um guia de diagnóstico e resolução de chamados relacionados à importação e emissão de notas pelo Notazz, garantindo que qualquer desenvolvedor possa identificar e corrigir falhas na integração.

## 3. Plano de Ação

1. **Confirmar configuração de escopo**

   * Verifique se a integração está ativa de forma global ou por produto (não é possível ter ambos simultaneamente).
2. **Checar data de início**

   * Identifique o campo `start_date` definido no cadastro da integração: o polling roda sempre de hora em hora a partir dessa data.
3. **Validar tipo de emissão**

   * Acesse a opção “Quando emitir nota fiscal” para verificar se a emissão ocorre após garantia (ex.: 7, 15 dias etc.).
4. **Verificar configuração de chave**

   * Confirme se a integração está configurada para "Produto" ou "Serviço" - o Notazz só aceita um tipo por chave.
5. **Checar status de pagamento**

   * Na tabela `sales_items`, confirme que há a flag `id_order_notazz` e que o pagamento foi aprovado antes da emissão.
6. **Analisar logs da Lambda**

   * No CloudWatch, filtre pelos registros da função `b4you-production-notazz` na janela de polling mais recente.
   * Busque por mensagens de erro genéricas (ex.: timeouts, códigos HTTP ≥ 400).

## 4. Ferramentas de Diagnóstico

* **CloudWatch Logs:** consulte os logs da Lambda para identificar falhas de comunicação ou dados inválidos.
* **DB Query:** verifique diretamente a coluna `id_order_notazz` na `sales_items` para confirmar registros pendentes.

## 5. Critérios de Validação

* **Nota importada:** após reprocessar, o campo `id_order_notazz` deve estar preenchido.
* **Emissão correta:** o número da nota deve corresponder ao esperado (confira no painel do Notazz).
* **Ausência de duplicação:** não devem existir múltiplos registros de nota para o mesmo item.

## 6. Pontos de Atenção

* **Polling horário:** falhas podem ocorrer se o relógio da Lambda estiver desincronizado. Valide configurações de timezone.
* **Emissão pós-garantia:** prazos configuráveis (7, 15 dias) devem respeitar a data de venda + garantia.
* **Limitação de tipos:** cada chave só aceita um tipo (Produto ou Serviço); trocas exigem nova configuração.
* **Pagamentos pendentes:** sem aprovação, o Notazz não emite nota - sempre confirme `paid_at`.
* **Erros genéricos:** o Notazz não detalha falhas específicas; a análise de logs é essencial.

> **Observação:** Confirme todos os passos antes de mover o ticket para **Concluído**.