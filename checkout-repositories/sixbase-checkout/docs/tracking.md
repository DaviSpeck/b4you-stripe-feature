# Documentação — Event Tracking do Checkout (Standard & 3Steps)

## Visão geral

A camada de tracking foi adicionada no frontend para mapear a jornada completa do usuário sem bloquear UI ou submissões. O envio é assíncrono, com fila e fallback silencioso. Os eventos são normalizados com campos base como `eventId`, `sessionId`, `checkoutType`, `checkoutMode` e `timestamp`.

## Arquitetura

Estrutura em `src/tracking`:

- `eventManager.js`: normaliza e enriquece eventos, gera `eventId`/`sessionId`, calcula `checkoutMode` e enfileira o envio.
- `eventQueue.js`: fila com flush assíncrono via `queueMicrotask` com fallback `setTimeout(0)`.
- `eventSender.js`: envio via `navigator.sendBeacon` com fallback `fetch`.
- `eventTypes.js`: catálogo de nomes e descrições de eventos.
- `useCheckoutTracking.js`: hook para disparo centralizado (auto dispara `checkout_page_view` e `checkout_session_started`).

## Campos base do payload

Todos os eventos incluem:

- `eventId`
- `eventName`
- `eventDescription`
- `sessionId`
- `offerId`
- `checkoutType` (`standard` | `3steps`)
- `checkoutMode` (`embedded` | `transparent` | `sandbox` | `development`)
- `executionEnvironment` (`sandbox` | `development` | `production`)
- `fullHostname`
- `rootDomain`
- `step` (quando aplicável)
- `email` (quando disponível)
- `phone` (quando disponível)
- `paymentMethod` (quando aplicável)
- `timestamp`

## Regra de checkoutMode

`checkoutMode` é derivado do domínio atual:

- `embedded` quando o hostname contém `b4you.com.br`
- `sandbox` quando o hostname contém `b4you-sandbox.com.br`
- `development` quando o hostname é `localhost` ou um IP
- `transparent` para qualquer outro domínio

## Execution Environment

`executionEnvironment` é derivado do hostname:

- `sandbox` quando o hostname contém `sandbox`
- `development` quando o hostname é `localhost` ou um IP
- `production` como padrão

## Domínio

- `fullHostname`: `window.location.hostname`
- `rootDomain`: domínio raiz normalizado (últimos dois segmentos, exceto `localhost`/IP)

## Catálogo de eventos

Eventos suportados (como definidos em `eventTypes.js`):

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
- `checkout_step_viewed` *(somente 3Steps)*
- `checkout_step_advanced` *(somente 3Steps)*
- `checkout_step_back` *(somente 3Steps)*
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

---

# Disparos por fluxo e componente

## 1) Checkout Standard

### Sessão & Página

- `checkout_page_view`
- `checkout_session_started`

Disparados automaticamente no hook `useCheckoutTracking`.

### Endereço / Frete

- `checkout_shipping_method_selected`

Disparado ao selecionar um método de envio.

### Pagamento

- `checkout_payment_method_selected` (troca entre cartão/pix/boleto)
- `checkout_payment_data_started` (primeiro acesso ao bloco de pagamento)
- `checkout_payment_data_error` (submit com erro de validação)
- `checkout_submit_clicked` (submit do checkout)

Observações:

- Em fluxo de **dois cartões**, `checkout_payment_data_error` também é disparado quando a soma dos valores não bate com o total ou quando o segundo cartão está abaixo do mínimo.

### Identificação e Endereço (form único)

Emitidos em `CheckoutUserData` com base no preenchimento e validação:

- `checkout_identification_started`
- `checkout_identification_error`
- `checkout_identification_filled`
- `checkout_identification_completed`
- `checkout_address_started`
- `checkout_address_error`
- `checkout_address_filled`
- `checkout_address_completed`

### Cupom

- `checkout_coupon_applied`
- `checkout_coupon_error`

Observações:

- Quando disponíveis, os eventos de cupom incluem `email` e `phone` do formulário ativo.

### Order Bump

- `checkout_order_bump_viewed`
- `checkout_order_bump_accepted`
- `checkout_order_bump_declined`

### Resultado do pagamento (Modais)

- `checkout_payment_success`
- `checkout_conversion_success`
- `checkout_payment_error`

Disparados em `ModalCard`, `ModalPix` e `ModalBillet`.

Regras do `checkout_conversion_success`:

- **Cartão de crédito:** disparar junto do `checkout_payment_success`.
- **Pix:** disparar quando o usuário navega para a página de verificação/QR code.
- **Boleto:** disparar no momento da geração/abertura do modal do boleto.

---

## 2) Checkout 3Steps

### Sessão & Página

- `checkout_page_view`
- `checkout_session_started`

### Controle de Etapas (3Steps)

- `checkout_step_viewed`
- `checkout_step_advanced`
- `checkout_step_back`

### Identificação (Step01)

- `checkout_identification_started`
- `checkout_identification_error`
- `checkout_identification_filled`
- `checkout_identification_completed`

### Endereço (Step02)

- `checkout_address_started`
- `checkout_address_error`
- `checkout_address_filled`
- `checkout_address_completed`
- `checkout_shipping_method_selected`

### Pagamento (Step04)

- `checkout_payment_method_selected`
- `checkout_payment_data_started`
- `checkout_payment_data_error`

### Submit (3Steps)

- `checkout_submit_clicked`

### Cupom (3Steps)

- `checkout_coupon_applied`
- `checkout_coupon_error`

### Order Bump (3Steps)

- `checkout_order_bump_viewed`
- `checkout_order_bump_accepted`
- `checkout_order_bump_declined`

### Resultado do pagamento (Modais)

- `checkout_payment_success`
- `checkout_conversion_success`
- `checkout_payment_error`

Regras do `checkout_conversion_success`:

- **Cartão de crédito:** disparar junto do `checkout_payment_success`.
- **Pix:** disparar quando o usuário navega para a página de verificação/QR code.
- **Boleto:** disparar no momento da geração/abertura do modal do boleto.

---

# Envio assíncrono (performance)

- Eventos são enfileirados em memória e enviados em background.
- `navigator.sendBeacon` é usado quando disponível.
- Fallback com `fetch` sem `await`.
- Falhas são silenciosas para não interromper o checkout.

# Endpoint

Todos os eventos são enviados para:

```
POST /events/checkout
```
