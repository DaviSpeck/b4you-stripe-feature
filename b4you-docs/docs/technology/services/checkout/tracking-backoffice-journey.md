---
title: Tracking - Backoffice (Jornada)
---

# Tracking - Backoffice (Jornada)

**Público:** frontend backoffice e produto.

Este documento descreve como a **Jornada** organiza sessões, funil e visualizações a partir de eventos persistidos.

---

## 1) Organização por sessão

- A unidade principal é `sessionId`.
- A linha do tempo exibe eventos em ordem cronológica.
- Não existe inferência de eventos ausentes.

---

## 2) Funil canônico

O funil é calculado em sequência com eventos chave:

1. `checkout_page_view`
2. `checkout_session_started`
3. `checkout_identification_completed`
4. `checkout_address_completed`
5. `checkout_submit_clicked`
6. `checkout_conversion_success`

A conversão exibida é a proporção entre etapas consecutivas.

---

## 3) Matriz de etapas

A matriz consolida eventos por etapa:

- **Identificação**: start/complete/error de identificação.
- **Endereço**: start/complete/error de endereço.
- **Pagamento**: seleção de método, sucesso e erros.

Cada linha apresenta:

- Sessões iniciadas.
- Sessões concluídas.
- Taxa de erro.

---

## 4) Linha do tempo por sessão

- Ordenação cronológica real por `timestamp`.
- Eventos são exibidos com `event_description` e horário.
- Eventos repetidos permanecem visíveis (sem colapsar estados).

---

## 5) Paginação e escalabilidade

- Tabelas e timelines usam paginação para volume alto.
- A paginação é local ao módulo da Jornada para evitar re-renderizações desnecessárias.

---

## 6) Relação entre eventos e visualizações

- **Cards de resumo**: contagem de sessões e eventos.
- **Funil**: usa sequência canônica.
- **Matriz**: agrega por etapa e tipo de evento.
- **Sessões**: visualiza a cronologia real, sem inferência.

---

## 7) Referências

- **Documento canônico:** Tracking de Checkout (Fonte de Verdade).
- **Read API:** endpoints de jornada baseados em `checkout_events`.
