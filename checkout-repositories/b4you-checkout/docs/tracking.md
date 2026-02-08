# 📘 Event Tracking — Checkout (Standard & 3Steps)

## 1) Visão geral da infraestrutura

Foi criada uma camada dedicada de tracking no frontend, concentrada em `src/tracking/`, que:

- Normaliza eventos com campos obrigatórios.
- Enfileira eventos e os envia de forma assíncrona (fire-and-forget).
- Gera `eventId` via `crypto.randomUUID()` com fallback seguro.
- Gera `sessionId` no primeiro acesso e reutiliza durante a sessão.
- Determina `checkoutMode` exclusivamente pelo domínio (embedded/transparent/sandbox/development).
  - `checkoutType` é definido uma única vez no bootstrap do tracking.
- `eventDescription` é sempre derivado do catálogo oficial (sem override por evento).
- Enriquecimento centralizado para:
  - `executionEnvironment`
  - `fullHostname`
  - `rootDomain`

### Componentes principais

**`eventTypes.ts`**
- Define enums e tipos: `CheckoutType`, `CheckoutMode`, `CheckoutStep`, `PaymentMethod`.
- Define todos os nomes oficiais de eventos `CheckoutEventName`.
- Inclui `checkoutEventDescriptions` para mensagens padrão.
- Função `toPaymentMethod(...)` converte o método interno (CARD/PIX/BANK_SLIP/TWO_CARDS) para o payload (`credit_card`, `pix`, `boleto`).

**`eventManager.ts`**
- `getCheckoutMode()` usa somente `window.location.hostname` e regras:
  - `b4you.com.br` ⇒ `embedded`
  - `b4you-sandbox.com.br` ⇒ `sandbox`
  - `localhost` ou IP ⇒ `development`
  - demais domínios ⇒ `transparent`
- `setCheckoutTypeOnce()` registra o `checkoutType` apenas uma vez.
- `getSessionId()` persiste um `sessionId` curto em `sessionStorage` com fallback para `localStorage`.
- `trackCheckoutEvent(...)` cria o payload completo com `eventId` e `timestamp` e envia para a fila.

**`utils.ts`**
- `getExecutionEnvironment(hostname)` resolve `sandbox` | `development` | `production`.
- `getDomainInfo(hostname)` retorna `fullHostname` e `rootDomain` sem libs externas.

**`eventQueue.ts`**
- Fila em memória + flush assíncrono via `queueMicrotask` (fallback `setTimeout`).
- Nunca bloqueia a UI.

**`eventSender.ts`**
- Prioriza `navigator.sendBeacon`.
- Fallback para `fetch` com `keepalive: true` sem `await`.
- Falhas são silenciosas (não interferem no checkout).

**`useCheckoutTracking.ts`**
- Hook central de uso em componentes.
- Auto-dispara `checkout_page_view` e `checkout_session_started` (com guardas).
- Expõe `trackEvent(eventName, details)` para eventos específicos.

---

## 2) Campos base de todos os eventos

Todo evento enviado segue o padrão abaixo (definido nos tipos e aplicado no `eventManager.ts`):

```ts
{
  eventId: string;
  eventName: string;
  eventDescription: string;
  sessionId: string;
  offerId: string;
  checkoutType: 'standard' | '3steps';
  checkoutMode: 'embedded' | 'transparent' | 'sandbox' | 'development';
  executionEnvironment: 'sandbox' | 'development' | 'production';
  fullHostname: string;
  rootDomain: string;
  step?: 'identification' | 'address' | 'payment';
  email?: string;
  phone?: string;
  paymentMethod?: 'credit_card' | 'pix' | 'boleto';
  timestamp: number;
}
```

---

## 3) Regra de domínio (CheckoutMode)

A regra é aplicada exclusivamente por hostname:

- **Embedded**: domínio contém `b4you.com.br`
- **Sandbox**: domínio contém `b4you-sandbox.com.br`
- **Development**: `localhost` ou IP (ex: `127.0.0.1`, `192.x.x.x`)
- **Transparente**: qualquer outro domínio

Implementação:

```ts
if (hostname.includes("b4you-sandbox.com.br")) return "sandbox";
if (hostname.includes("b4you.com.br")) return "embedded";
if (hostname === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
  return "development";
}
return "transparent";
```

---

## 4) Disparos configurados — Checkout Standard

### 4.1 Page & Session

- `checkout_page_view`
- `checkout_session_started`

Disparados automaticamente via `useCheckoutTracking` no carregamento da página.

---

### 4.2 Identificação (User Info)

**Eventos disparados:**
- `checkout_identification_started`
  - Disparo no primeiro foco em algum campo da identificação (nome/email/documento/whatsapp).
- `checkout_identification_filled`
  - Disparo quando o formulário fica válido (dirty/submitted).
- `checkout_identification_error`
  - Disparo quando o submit ocorre com formulário inválido.
- `checkout_identification_completed`
  - Disparo no submit bem-sucedido.

---

### 4.3 Endereço (Address Info)

**Eventos disparados:**
- `checkout_address_started`
  - Disparo no foco do CEP.
- `checkout_address_filled`
  - Disparo quando o formulário fica válido.
- `checkout_address_error`
  - Disparo quando o submit é inválido.
- `checkout_address_completed`
  - Disparo no submit válido.
- `checkout_shipping_method_selected`
  - Disparo ao selecionar um frete (Frenet).

---

### 4.4 Cupom (Standard)

**Eventos disparados:**
- `checkout_coupon_applied`
- `checkout_coupon_error`

Disparados após feedback de cupom válido/ inválido (produto, plano, popup e modal de primeira compra).

---

### 4.5 Order Bump (Standard)

**Eventos disparados:**
- `checkout_order_bump_viewed`
  - Disparado quando o bloco é exibido.
- `checkout_order_bump_accepted`
- `checkout_order_bump_declined`
  - Disparados quando o usuário adiciona/remover (ou ajusta quantidade).

---

### 4.6 Pagamento (Standard)

**Eventos disparados:**
- `checkout_payment_method_selected`
  - Disparado quando o usuário troca o método (Card/PIX/Boleto/Two Cards).
- `checkout_submit_clicked`
- `checkout_payment_data_started`
  - Disparados no clique do CTA final “Comprar agora”.
- `checkout_payment_data_error`
  - Disparado quando há erros de validação em cartão/2-cartões.
- `checkout_payment_success`
  - Disparado no sucesso do pagamento com cartão de crédito.
- `checkout_conversion_success`
  - Disparado quando o checkout conclui sem impeditivos (independente do método).
  - **Pix:** no momento do navigate para a página de verificação/QR code.
  - **Boleto:** no momento da geração/abertura do modal do boleto.
  - **Cartão:** no mesmo instante do `checkout_payment_success`.
- `checkout_payment_error`
  - Disparado quando o pagamento falha.

---

## 5) Disparos configurados — Checkout 3Steps

### 5.1 Page & Session

- `checkout_page_view`
- `checkout_session_started`

Disparados automaticamente via `useCheckoutTracking`.

---

### 5.2 Controle de etapas (3Steps)

**Eventos disparados:**
- `checkout_step_viewed`
- `checkout_step_advanced`
- `checkout_step_back`

Disparados automaticamente ao mudar `currentStep`.

---

### 5.3 Identificação (Step 1)

**Eventos disparados:**
- `checkout_identification_started`
- `checkout_identification_filled`
- `checkout_identification_error`
- `checkout_identification_completed`

---

### 5.4 Endereço (Step 2)

**Eventos disparados:**
- `checkout_address_started`
- `checkout_address_filled`
- `checkout_address_error`
- `checkout_address_completed`
- `checkout_shipping_method_selected`

---

### 5.5 Pagamento (Step 3)

**Eventos disparados:**
- `checkout_payment_method_selected`
- `checkout_submit_clicked`
- `checkout_payment_data_started`
- `checkout_payment_data_error`

---

### 5.6 Cupom (3Steps)

**Eventos disparados:**
- `checkout_coupon_applied`
- `checkout_coupon_error`

---

### 5.7 Order Bump (3Steps)

**Eventos disparados:**
- `checkout_order_bump_viewed`
- `checkout_order_bump_accepted`
- `checkout_order_bump_declined`

---

### 5.8 Resultado do pagamento (3Steps)

**Eventos disparados:**
- `checkout_payment_success`
- `checkout_conversion_success`
- `checkout_payment_error`

---

## 6) Garantias de performance

- Envio é assíncrono usando fila + `sendBeacon` e fallback para `fetch` sem `await`.
- Falhas de tracking não quebram o checkout (erros são ignorados).
- Nenhum evento bloqueia validações ou submits.

---

# ✅ Resumo final dos eventos configurados

| Categoria | Eventos |
| --- | --- |
| Sessão/Página | `checkout_page_view`, `checkout_session_started` |
| Identificação | `checkout_identification_started`, `checkout_identification_filled`, `checkout_identification_error`, `checkout_identification_completed` |
| Endereço | `checkout_address_started`, `checkout_address_filled`, `checkout_address_error`, `checkout_shipping_method_selected`, `checkout_address_completed` |
| Etapas (3Steps) | `checkout_step_viewed`, `checkout_step_advanced`, `checkout_step_back` |
| Pagamento | `checkout_payment_method_selected`, `checkout_payment_data_started`, `checkout_payment_data_error`, `checkout_submit_clicked` |
| Cupom | `checkout_coupon_applied`, `checkout_coupon_error` |
| Order Bump | `checkout_order_bump_viewed`, `checkout_order_bump_accepted`, `checkout_order_bump_declined` |
| Finalização | `checkout_payment_success`, `checkout_conversion_success`, `checkout_payment_error` |
