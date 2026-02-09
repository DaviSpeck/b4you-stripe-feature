# Documentação complementar obrigatória — FASE 4 (Checkout Internacional)

## Objetivo
Formalizar regras e comportamentos necessários para iniciar a FASE 4 sem risco de UX divergente, acoplamento ao Stripe ou fragilidade operacional. Este documento **não cria novos estados**, **não altera contratos existentes** e **não muda semântica financeira**.

## Premissas imutáveis
- FASES 1, 2 e 3 estão encerradas (técnico, negócio e governança).
- O estado interno é atualizado **exclusivamente** por webhooks.
- O frontend **não consome estados do provedor** (Stripe).
- O fluxo nacional permanece isolado e inalterado.

---

## 1) Mapeamento explícito de estados internos → UI

### Estados internos existentes (modelo consolidado)
- `pending`
- `approved`
- `failed`
- `refunded`
- `dispute`

### Estados exibidos no checkout / thank you page
- **Pendente** (`pending`)
  - Exibido imediatamente após criação do pagamento internacional.
  - Representa “aguardando confirmação via webhook”.
- **Aprovado** (`approved`)
  - Exibido apenas após webhook confirmado.
- **Falha** (`failed`)
  - Exibido apenas após webhook confirmado ou erro definitivo.

### Estados informativos (pós-compra)
- **Reembolsado** (`refunded`)
- **Disputa** (`dispute`)

Esses estados são **informativos** e **não iniciam fluxo de pagamento**.

### Estados que nunca podem ser tratados como “pagamento confirmado”
- `pending`
- `failed`
- `refunded`
- `dispute`

> **Regra central:** somente `approved` pode ser interpretado como pagamento confirmado.

---

## 2) Comportamento do checkout sem webhook

### Estado exibido
- **Pendente (`pending`)** enquanto o webhook não chegar.

### Comportamento de retry
- Retry **controlado pela UI** e **idempotente** (mesmo `transaction_id`/`order_id`).
- Retry **não pode** criar nova transação quando o pagamento original ainda está pendente.

### Mensagens de UX compatíveis
- “Pagamento em processamento. Aguarde a confirmação.”
- “Ainda não recebemos a confirmação. Você pode aguardar ou tentar novamente.”

### O que não pode acontecer
- **Nunca** exibir “aprovado” sem webhook.
- **Nunca** confirmar pagamento com base em status do provedor.
- **Nunca** iniciar polling no frontend.

---

## 3) Fallback do checkout legado

### Quando o checkout legado pode redirecionar
- Apenas quando:
  - Produto/oferta está marcado como internacional; **e**
  - Feature flag Stripe está `enabled`.

### Quando o fallback é proibido
- Produto/oferta internacional **não pode** cair automaticamente para fluxo nacional.
- Se a feature flag estiver `disabled` ou `suspended`, o checkout legado **não redireciona** para internacional.

### Como evitar conversão involuntária internacional → nacional
- Se produto/oferta estiver marcado como internacional, o checkout legado **não deve** executar fallback para nacional sob falha de handoff.
- Em falha de handoff internacional, o comportamento deve ser **erro controlado** com mensagem clara, sem alterar a rota de pagamento.

### Relação com feature flag e produto/oferta
- Produto/oferta internacional **só é considerado internacional** quando:
  - Flag Stripe `enabled`; **e**
  - Marcação explícita do produto/oferta.
- Caso contrário, o checkout legado permanece no fluxo nacional **sem tentar internacional**.

---

## 4) Governança da feature flag

### Fonte de verdade
- **Backoffice** é a fonte oficial da feature flag.
- Checkout e dashboard **apenas consomem**.

### Política de cache/TTL
- Cache permitido com TTL curto.
- Em caso de expiração ou inconsistência, deve prevalecer o **estado mais restritivo** (fail-safe):
  - Se houver dúvida, **bloquear internacional**.

### Comportamento em inconsistência entre camadas
- Divergência entre serviços deve resultar em **bloqueio do fluxo internacional** até convergência.
- Não iniciar pagamento internacional se a camada consumidora não estiver 100% confiante no estado da flag.

### Impacto esperado para CS e operação
- Em inconsistência, CS deve orientar como “fluxo internacional indisponível temporariamente”, sem redirecionar para nacional.
- A governança mantém auditabilidade do motivo (flag mudou / suspensa / cache expirado).

---

## 5) Observabilidade mínima para CS

### IDs que devem ser visíveis no checkout / thank you page
- `transaction_id`
- `order_id`
- `sale_id`
- `provider` (ex.: `stripe`)

### Como correlacionar checkout, estado e webhook
- CS deve usar `transaction_id`/`order_id` como **chave primária**.
- `provider_*` IDs podem ser exibidos em suporte interno, mas **não são necessários** ao usuário final.

### Informações que o suporte precisa sem acessar Stripe
- Status interno consolidado (`pending`, `approved`, `failed`, `refunded`, `dispute`).
- Data/hora da última atualização do status.
- Identificadores internos (`transaction_id`, `order_id`, `sale_id`).
- Indicação de `provider` (sem depender do status do provedor).

---

## Checklist de aderência (informativo)
- [ ] UI exibe apenas estados internos (nunca estados do provedor).
- [ ] `approved` é o único estado tratado como pagamento confirmado.
- [ ] Sem webhook → estado permanece `pending`.
- [ ] Retry é idempotente e não cria duplicidade.
- [ ] Fallback do checkout legado **não** converte internacional → nacional.
- [ ] Feature flag com fail-safe (em inconsistência, bloquear internacional).
- [ ] IDs internos visíveis para CS e correlação de suporte.

