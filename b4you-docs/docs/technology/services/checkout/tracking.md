---
title: Tracking de Checkout (Fonte de Verdade)
---

# Tracking de Checkout (Fonte de Verdade)

Este documento é a **fonte canônica** de semântica do tracking de checkout. Ele descreve **o que os eventos significam**, **quais invariantes governam o sistema** e **como preservar compatibilidade histórica**. Não é um guia de implementação; decisões técnicas específicas estão nas abas por público.

---

## 1) Modelo mental do sistema

- **Eventos são fatos históricos imutáveis**: uma vez emitidos, não são reescritos nem reinterpretados.
- **Evento ≠ estado**: eventos registram acontecimentos pontuais; estado é derivação posterior.
- **Sessão ≠ usuário**: uma sessão representa uma tentativa de compra, não a identidade do usuário.
- **Conversão ≠ pagamento aprovado**: conversão é a conclusão do checkout; pagamento aprovado é um resultado técnico de um meio específico.
- **Backend é burro por design**: não infere, não corrige, não interpreta semântica.
- **Analytics não infere dados ausentes**: se um evento não existe, ele não aconteceu.
- **Tracking nunca pode quebrar o checkout**: observabilidade é sempre best-effort.

---

## 2) Princípios invioláveis

1. **Semântica é decidida no frontend**.
2. **Eventos não podem ser renomeados** nem ter seu significado alterado retroativamente.
3. **Qualquer mudança deve preservar compatibilidade histórica** (eventos legados continuam válidos).
4. **Dados ausentes não são preenchidos por inferência**.
5. **O backend não recalcula nem substitui campos semânticos** (`checkoutType`, `checkoutMode`, `paymentMethod`, `step`).

---

## 3) Glossário formal

- **Evento**: registro imutável de algo que aconteceu em um instante do tempo.
- **Sessão (`sessionId`)**: identificador de uma tentativa de checkout (não identifica usuário).
- **Conversão**: conclusão do checkout independente do método de pagamento.
- **Pagamento aprovado**: sucesso técnico de um método síncrono (ex.: cartão).
- **Checkout Type (`checkoutType`)**: formato do fluxo (`standard` ou `3steps`).
- **Checkout Mode (`checkoutMode`)**: contexto de execução definido por domínio.
- **Execution Environment (`executionEnvironment`)**: ambiente técnico (`production`, `sandbox`, `development`).

---

## 4) Arquitetura end-to-end

```
Frontend Checkout (legado e novo)
  ↓
Event Ingestion Service (backend checkout)
  ↓
Persistência de eventos brutos (checkout_events)
  ↓
Read API /checkout-analytics
  ↓
Backoffice (Dashboard + Jornada)
```

Cada camada possui responsabilidades **não sobrepostas**. Semântica nasce no frontend e segue imutável até o backoffice.

---

## 5) Dimensões fundamentais

### 5.1 checkoutType

Define o tipo de fluxo visual. **É definido uma única vez no frontend**:

- `standard`
- `3steps`

### 5.2 checkoutMode

Define o contexto do checkout a partir do domínio:

| Condição do hostname | checkoutMode |
| --- | --- |
| `b4you.com.br` | `embedded` |
| `b4you-sandbox.com.br` | `sandbox` |
| `localhost` ou IP | `development` |
| demais domínios | `transparent` |

### 5.3 executionEnvironment

Define o ambiente técnico:

- `production`
- `sandbox`
- `development`

> `checkoutMode` ≠ `executionEnvironment`. O primeiro é contexto do checkout; o segundo é ambiente técnico.

---

## 6) Modelo de eventos (evento ≠ estado)

Eventos representam fatos discretos. Não há **estado persistente** no tracking; qualquer estado é derivado **posteriormente** por analytics ou backoffice.

### 6.1 Catálogo global (nomes oficiais)

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

---

## 7) Evento canônico de conversão + hierarquia de verdade

### 7.1 Evento canônico

**Conversão canônica:** `checkout_conversion_success`

Esse evento representa **conclusão do checkout** e é a fonte principal de verdade para conversão, independente do método de pagamento.

### 7.2 Regras de disparo do evento canônico

- **Cartão de crédito**: disparado junto com `checkout_payment_success`.
- **Pix**: disparado ao navegar para a página de QR Code/validação.
- **Boleto**: disparado ao gerar/abrir o boleto.

### 7.3 Hierarquia de verdade

1. **Primary**: `checkout_conversion_success`.
2. **Fallback histórico**: `checkout_payment_success` (apenas para sessões legadas sem o evento canônico).

---

## 8) Fluxos reais (Standard × 3Steps × métodos)

Os fluxos abaixo descrevem **eventos reais emitidos**. Eles não são prescrições, mas fotografia do que já existe.

### 8.1 Standard - sequência típica (pagamento cartão)

1. `checkout_page_view`
2. `checkout_session_started`
3. `checkout_identification_*` (started/filled/error/completed)
4. `checkout_address_*` (started/filled/error/completed)
5. `checkout_payment_method_selected`
6. `checkout_payment_data_started`
7. `checkout_submit_clicked`
8. `checkout_payment_success`
9. `checkout_conversion_success`

### 8.2 Standard - Pix

1. `checkout_page_view`
2. `checkout_session_started`
3. `checkout_identification_*`
4. `checkout_address_*`
5. `checkout_payment_method_selected`
6. `checkout_payment_data_started`
7. `checkout_submit_clicked`
8. `checkout_conversion_success` (navegação para QR Code)

### 8.3 Standard - Boleto

1. `checkout_page_view`
2. `checkout_session_started`
3. `checkout_identification_*`
4. `checkout_address_*`
5. `checkout_payment_method_selected`
6. `checkout_payment_data_started`
7. `checkout_submit_clicked`
8. `checkout_conversion_success` (geração/abertura do boleto)

### 8.4 3Steps - eventos de navegação entre etapas

- `checkout_step_viewed`
- `checkout_step_advanced`
- `checkout_step_back`

### 8.5 3Steps - sequência típica (pagamento cartão)

1. `checkout_page_view`
2. `checkout_session_started`
3. `checkout_step_viewed` (identification)
4. `checkout_identification_*`
5. `checkout_step_advanced`
6. `checkout_step_viewed` (address)
7. `checkout_address_*`
8. `checkout_step_advanced`
9. `checkout_step_viewed` (payment)
10. `checkout_payment_method_selected`
11. `checkout_payment_data_started`
12. `checkout_submit_clicked`
13. `checkout_payment_success`
14. `checkout_conversion_success`

### 8.6 Eventos transversais

Podem ocorrer em ambos os fluxos quando aplicáveis:

- `checkout_coupon_applied`
- `checkout_coupon_error`
- `checkout_order_bump_viewed`
- `checkout_order_bump_accepted`
- `checkout_order_bump_declined`
- `checkout_payment_error`

---

## 9) Contrato de evolução e compatibilidade histórica

- **Nunca** renomear eventos existentes.
- **Nunca** mudar significado de eventos já emitidos.
- **Adições futuras** só podem ser incrementais e documentadas com fallback.
- **Eventos legados** continuam válidos e devem ser compreendidos por analytics.
- **Backoffice** deve tratar ausência de `checkout_conversion_success` como cenário legado.

---

## 10) Anti-padrões (o que NÃO fazer)

- Inferir conversão a partir de ausência de erro.
- Recalcular `checkoutMode` ou `executionEnvironment` no backend.
- Alterar `eventDescription` no backend.
- Corrigir evento “errado” após persistido.
- Criar eventos ad-hoc fora do catálogo oficial.

---

## 11) Mapa de relacionamento entre documentos

- **Documento canônico (este)**: semântica, invariantes e contrato histórico.
- **Tracking - Frontend (Implementação)**: arquitetura e responsabilidades do frontend.
- **Tracking - Backend (Ingestão)**: contrato de payload, validação mínima e política de erros.
- **Tracking - Analytics & BI**: interpretação correta, conversão e leitura de funil.
- **Tracking - Backoffice (Jornada)**: como a Jornada organiza sessões e visualiza eventos.

**Regra de ouro:** semântica e invariantes **não devem ser duplicadas** fora deste documento; documentos derivados referenciam a fonte canônica.
