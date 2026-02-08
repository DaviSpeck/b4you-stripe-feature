# Event Tracking — Checkout (Standard & 3Steps)

## Visão geral

Este backend funciona exclusivamente como **Event Ingestion Service** para tracking do checkout. Ele recebe eventos enviados por dois frontends (estrutura antiga em React Scripts e moderna em NextJS) **sem distinção entre eles** e **sem aplicar lógica de negócio**. O objetivo é garantir confiabilidade, simplicidade e baixa latência, permitindo análise posterior (BI/analytics/observabilidade).

**Responsabilidades do backend:**

- Validar minimamente os campos obrigatórios.
- Normalizar dados permitidos (ex.: trim, lowercase para email).
- Enriquecer com metadados do backend (receivedAt, ipAddress, userAgent).
- Persistir eventos brutos para análise posterior.
- Responder rapidamente com `204 No Content` (ou `202 Accepted`).

**O que o backend NÃO faz:**

- Inferir frontend de origem ou fluxo visual.
- Recalcular `checkoutType`, `checkoutMode`, `step` ou `paymentMethod`.
- Corrigir/alterar valores semânticos enviados pelo frontend.
- Aplicar regras de negócio do checkout.

---

## Endpoint

```
POST /events/checkout
POST /api/checkout/events/checkout
```

Características:

- **Sem autenticação**.
- **Baixa latência** (fire-and-forget).
- **Nunca bloqueia o fluxo do frontend**.
- **Nunca depende de resposta síncrona externa**.

**Resposta esperada:**

- `204 No Content` (preferencial) para payload válido
- `202 Accepted` (alternativa) para payload válido
- `400 Bad Request` para payload inválido (quebra de contrato)

---

## Payload esperado (contrato imutável)

```json
{
  "eventId": "string",
  "eventName": "string",
  "eventDescription": "string",
  "sessionId": "string",
  "offerId": "string",
  "checkoutType": "standard" | "3steps",
  "checkoutMode": "embedded" | "transparent" | "sandbox" | "development",
  "executionEnvironment": "production" | "sandbox" | "development",
  "fullHostname": "string",
  "rootDomain": "string",
  "step": "identification" | "address" | "payment",
  "email": "string",
  "phone": "string",
  "paymentMethod": "credit_card" | "pix" | "boleto",
  "timestamp": 1700000000000
}
```

**Regras importantes:**

- Campos opcionais podem não existir.
- Campos **nunca** devem ser renomeados.
- O backend **não deve** inferir campos ausentes.
- `eventDescription` é enviado pelo frontend a partir do catálogo oficial e **não deve** ser recalculado pelo backend.
- `productId` e `producerId` **não são enviados** pelo frontend: são **resolvidos no backend** a partir do `offerId`.

---

## Validação mínima (não bloqueante)

Campos obrigatórios:

- `eventId`
- `eventName`
- `sessionId`
- `offerId`
- `timestamp`
- `executionEnvironment`
- `fullHostname`
- `rootDomain`

Se algum desses campos faltar:

- Logar `CHECKOUT_EVENT_INVALID`.
- Retornar `400 Bad Request`.
- **Nunca lançar exceção** ou retornar erro HTTP.

Regras adicionais:

- `executionEnvironment` deve ser um dos valores permitidos.
- `fullHostname` e `rootDomain` devem ser strings não vazias (apenas `trim()`).
- O payload **não deve** incluir `productId` ou `producerId`.
- Se `offerId` não puder ser resolvido em `productId`/`producerId`, o evento é inválido.

---

## ENUMs aceitos

O backend valida os valores quando presentes. Se um valor estiver fora do catálogo, o evento é tratado como inválido (log + 400).

### `eventName`

- `checkout_page_view`
- `checkout_session_started`
- `checkout_identification_started`
- `checkout_identification_filled`
- `checkout_identification_error`
- `checkout_identification_completed`
- `checkout_address_started`
- `checkout_address_filled`
- `checkout_address_error`
- `checkout_shipping_method_selected`
- `checkout_address_completed`
- `checkout_step_viewed`
- `checkout_step_advanced`
- `checkout_step_back`
- `checkout_payment_method_selected`
- `checkout_payment_data_started`
- `checkout_payment_data_error`
- `checkout_coupon_applied`
- `checkout_coupon_error`
- `checkout_order_bump_viewed`
- `checkout_order_bump_accepted`
- `checkout_order_bump_declined`
- `checkout_submit_clicked`
- `checkout_payment_success`
- `checkout_conversion_success`
- `checkout_payment_error`

**Novo evento recomendado:**

- `checkout_conversion_success`: indica sucesso na conversão do checkout **independente do método de pagamento**.
  - **Cartão de crédito:** disparar no sucesso de pagamento (equivalente ao `checkout_payment_success`).
  - **Pix:** disparar ao navegar para a página de verificação/QR code.
  - **Boleto:** disparar no momento da geração/abertura do modal do boleto.

### `checkoutType`

- `standard`
- `3steps`

### `checkoutMode`

- `embedded`
- `transparent`
- `sandbox`
- `development`

### `executionEnvironment`

- `production`
- `sandbox`
- `development`

### `step`

- `identification`
- `address`
- `payment`

### `paymentMethod`

- `credit_card`
- `pix`
- `boleto`

---

## Normalização & Enriquecimento

**Permitido:**

- `trim()` em strings.
- `lowercase()` para email.
- Adicionar metadados:
  - `received_at` (timestamp do backend)
  - `ip_address` (via `req.ip`)
  - `user_agent` (via headers)
  - `execution_environment`, `full_hostname`, `root_domain` (persistidos conforme enviados)

**Proibido:**

- Recalcular `checkoutMode`.
- Recalcular `checkoutType`.
- Inferir `step`.
- Inferir `paymentMethod`.
- Alterar valores semânticos enviados pelo frontend.
- Inferir `executionEnvironment`, `fullHostname` ou `rootDomain`.

**Observações dos frontends (referência):**

- O `checkoutMode` é definido unicamente pelo domínio:
  - `b4you.com.br` ⇒ `embedded`.
  - `b4you-sandbox.com.br` ⇒ `sandbox`.
  - `localhost` e IPs ⇒ `development`.
  - demais ⇒ `transparent`.
- `executionEnvironment` é definido no frontend:
  - `sandbox` quando o domínio contém `"sandbox"`.
  - `development` quando o hostname é `localhost` ou IP (ex.: `127.x.x.x`, `192.x.x.x`).
  - `production` para qualquer outro domínio.
- Em fluxos com dois cartões, `checkout_payment_data_error` pode ser disparado quando a soma não fecha o total ou quando há cartão abaixo do mínimo.
- Eventos de cupom podem incluir `email` e `phone` quando disponíveis.

---

## Logs estruturados

**Evento válido**

```json
{
  "type": "CHECKOUT_EVENT_RECEIVED",
  "eventName": "checkout_page_view",
  "sessionId": "...",
  "offerId": "..."
}
```

**Evento inválido**

```json
{
  "type": "CHECKOUT_EVENT_INVALID",
  "payload": { "...": "..." }
}
```

**Erro de persistência**

```json
{
  "type": "CHECKOUT_EVENT_PERSIST_ERROR",
  "error": "...",
  "eventId": "..."
}
```

---

## Persistência (Model + Migration)

A tabela armazena **eventos brutos** (sem agregação), com os campos:

- `event_id`
- `event_name`
- `event_description`
- `session_id`
- `offer_id`
- `product_id`
- `producer_id`
- `checkout_type`
- `checkout_mode`
- `step`
- `email`
- `phone`
- `payment_method`
- `event_timestamp`
- `execution_environment`
- `full_hostname`
- `root_domain`
- `received_at`
- `ip_address`
- `user_agent`
- `created_at`
- `updated_at`

---

## Segurança básica

- Aceita apenas `Content-Type: application/json`.
- Limite de payload recomendado: **50kb**.
- Sanitiza strings (`trim`, `lowercase` para email).
- Nunca executa código dinâmico vindo do payload.

---

## Arquitetura do código

```
/events
  ├── checkoutEvents.controller.js
  ├── checkoutEvents.service.js
  ├── checkoutEvents.repository.js
  └── checkoutEvent.model.js
```

**Responsabilidades**

- **Controller**: validação mínima e resposta imediata.
- **Service**: normalização/enriquecimento e delegação de persistência.
- **Repository**: gravação no banco via Model.
- **Model**: espelho da tabela.

---

## Garantias de performance

- Endpoint rápido.
- Não bloqueia checkout.
- Não depende de serviços externos síncronos.
- Retorna 204/202 para payload válido, mesmo com erro interno.
- Retorna 400 para quebra de contrato.

---

## Checklist de impacto para os frontends

- [ ] Enviar `executionEnvironment` com os valores permitidos (`production`, `sandbox`, `development`).
- [ ] Enviar `fullHostname` com o hostname completo (sem normalização adicional).
- [ ] Enviar `rootDomain` já normalizado pelo frontend.
- [ ] Enviar apenas `offerId` (o backend resolve `productId` e `producerId`).
- [ ] Garantir que `eventDescription` continue vindo do catálogo oficial (sem override).

---

## Observação final

Este backend é um **serviço de ingestão de eventos**, não um serviço de negócio.
A prioridade absoluta é: **confiabilidade, simplicidade e não interferência no checkout**.
