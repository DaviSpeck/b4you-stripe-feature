---
title: Tracking - Backend (Ingestão)
---

# Tracking - Backend (Ingestão)

**Público:** engenharia backend e infraestrutura.

Este documento descreve o backend como **Event Ingestion Service**, explicitando contrato, validação mínima, políticas de erro e limites de enriquecimento.

---

## 1) Papel do backend

O backend é **burro por design**: recebe eventos do frontend, valida o mínimo necessário e persiste eventos brutos. Ele **não interpreta** nem altera semântica.

Responsabilidades:

- Validar contrato mínimo.
- Normalizar tecnicamente (ex.: trim/lowercase onde permitido).
- Enriquecer com metadados do servidor.
- Persistir eventos brutos.
- Responder rápido sem bloquear o checkout.

---

## 2) Endpoint de ingestão

```
POST /events/checkout
POST /api/checkout/events/checkout
```

Respostas esperadas:

- `204 No Content` (preferencial) para payload válido.
- `202 Accepted` (alternativa) para payload válido.
- `400 Bad Request` para quebra de contrato.

---

## 3) Contrato imutável do payload

Campos obrigatórios:

- `eventId`
- `eventName`
- `sessionId`
- `offerId`
- `timestamp`
- `executionEnvironment`
- `fullHostname`
- `rootDomain`

Campos opcionais:

- `eventDescription`
- `checkoutType`
- `checkoutMode`
- `step`
- `email`
- `phone`
- `paymentMethod`

Regras:

- Campos **não podem ser renomeados**.
- Campos ausentes **não** são inferidos.
- `eventDescription` **não** é recalculado no backend.

---

## 4) Validação mínima

- Se faltar campo obrigatório, logar `CHECKOUT_EVENT_INVALID` e retornar `400`.
- Validar `executionEnvironment` contra catálogo permitido.
- `fullHostname` e `rootDomain` devem ser strings não vazias (apenas `trim`).
- `eventName`, `checkoutType`, `checkoutMode`, `paymentMethod` e `step` são validados **quando presentes**.

---

## 5) Enriquecimento permitido vs proibido

### Permitido

- `trim()` em strings.
- `lowercase()` para email.
- Metadados técnicos:
  - `received_at`
  - `ip_address`
  - `user_agent`

### Proibido

- Recalcular `checkoutMode`.
- Recalcular `checkoutType`.
- Inferir `step`.
- Inferir `paymentMethod`.
- Alterar `eventDescription`.
- Inferir `executionEnvironment`, `fullHostname` ou `rootDomain`.

---

## 6) Regras de resolução de `productId` e `producerId`

- **Frontend envia apenas `offerId`.**
- **Backend resolve `productId` e `producerId`** a partir do `offerId`.
- Se `offerId` não puder ser resolvido, o evento é inválido e deve retornar `400`.

---

## 7) Logs estruturados

- Evento válido: `CHECKOUT_EVENT_RECEIVED`.
- Evento inválido: `CHECKOUT_EVENT_INVALID`.
- Erro de persistência: `CHECKOUT_EVENT_PERSIST_ERROR`.

---

## 8) Política de erro

- `204`/`202` para payload válido, mesmo que a persistência falhe.
- `400` somente para quebra de contrato.
- Nunca lançar exceções que possam propagar para o cliente.

---

## 9) Referências

- **Documento canônico:** Tracking de Checkout (Fonte de Verdade).
