---
title: Tracking - Analytics & BI
---

# Tracking - Analytics & BI

**Público:** analytics, BI e produto.

Este documento explica **como interpretar os eventos** e **o que é conversão**, sem inventar dados ausentes.

---

## 1) Como interpretar eventos

- Eventos são fatos históricos, não estados.
- Ausência de evento significa **não aconteceu**.
- Sessão (`sessionId`) é unidade de jornada; não representa usuário.

---

## 2) O que significa conversão

**Conversão canônica:** `checkout_conversion_success`.

- Esse é o evento que representa conclusão do checkout.
- `checkout_payment_success` é **resultado técnico** (principalmente cartão), não conversão universal.

### Hierarquia de verdade

1. **Primary:** `checkout_conversion_success`.
2. **Fallback histórico:** `checkout_payment_success` quando o canônico não existir.

---

## 3) Como lidar com dados legados

- Sessões antigas podem não ter `checkout_conversion_success`.
- Use `checkout_payment_success` apenas como fallback para histórico.
- Não “promover” conversão por aproximação ou ausência de erro.

---

## 4) O que NÃO inferir

- Não inferir identificação concluída sem `checkout_identification_completed`.
- Não inferir endereço concluído sem `checkout_address_completed`.
- Não inferir conversão pela ausência de erro.
- Não inferir `paymentMethod` ou `step` quando ausentes.

---

## 5) Leituras corretas de funil e jornada

### Funil canônico

1. `checkout_page_view`
2. `checkout_session_started`
3. `checkout_identification_completed`
4. `checkout_address_completed`
5. `checkout_submit_clicked`
6. `checkout_conversion_success`

### Jornada por sessão

- Ordenar por `timestamp`.
- Exibir apenas eventos existentes.
- Tratar múltiplos eventos repetidos como fatos independentes (sem colapsar).

---

## 6) Métricas e interpretações seguras

- **Sessões únicas:** contagem de `sessionId` distintos.
- **Eventos totais:** volume bruto de eventos.
- **Sessões com conversão:** sessões com `checkout_conversion_success` (ou fallback histórico).
- **Sessões com erro:** sessões com eventos de erro explícitos.

---

## 7) Referências

- **Documento canônico:** Tracking de Checkout (Fonte de Verdade).
- **Backoffice (Jornada):** leitura e visualização dos eventos.
