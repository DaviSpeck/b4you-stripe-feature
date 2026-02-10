# Checklist operacional — FASE 5 · Etapa 2 (Convergência do pós‑venda / thank‑you)

## 1) Premissas obrigatórias (fixas)
- [x] Checkout internacional é **variação** do checkout existente (padrão/3 etapas).【F:docs/ADR-001-checkout-internacional-como-variacao.md†L9-L21】
- [x] Pós‑venda (delivery/thank‑you) **compartilhado** entre nacional e internacional.【F:docs/ADR-001-checkout-internacional-como-variacao.md†L13-L19】
- [x] Estados internos são a **única fonte de verdade** (`pending`, `approved`, `failed`, `refunded`, `dispute`).【F:docs/ADR-001-checkout-internacional-como-variacao.md†L13-L19】
- [x] **Sem polling** e **sem confirmação sem webhook**.【F:docs/27-gate-fase-5.md†L17-L24】
- [x] **Sem lógica Stripe no frontend** e **sem terceira família de checkout**.【F:docs/ADR-001-checkout-internacional-como-variacao.md†L49-L63】【F:docs/27-gate-fase-5.md†L17-L24】
- [x] Testabilidade **determinística local** (sem API real) é requisito inegociável.【F:docs/27-gate-fase-5.md†L15-L23】

---

## 2) Critérios de aceite (objetivos e verificáveis)
- [x] Thank‑you internacional confirma pagamento **somente** com `approved`.【F:docs/02-tasks-e-checklists.md†L120-L123】
- [x] Estados `pending`, `failed`, `refunded`, `dispute` são exibidos como **não‑confirmados** (informativos).【F:docs/02-tasks-e-checklists.md†L120-L123】
- [x] Pós‑venda internacional consome **apenas estados internos** (sem Stripe).【F:docs/ADR-001-checkout-internacional-como-variacao.md†L13-L19】
- [x] Fluxo nacional permanece **inalterado** e sem regressões.【F:docs/28-encerramento-fase-4.md†L20-L24】【F:docs/27-gate-fase-5.md†L29-L33】
- [x] E2E determinístico cobre **convergência de thank‑you/delivery** no internacional.【F:docs/27-gate-fase-5.md†L15-L33】

---

## 3) Checkpoints (marcadores claros de progresso)
- [x] **CP1:** contrato de delivery/thank‑you internacional alinhado ao modelo nacional.【F:docs/ADR-001-checkout-internacional-como-variacao.md†L13-L19】
- [x] **CP2:** comportamento de `pending`/`approved`/`failed`/`refunded`/`dispute` confirmado na thank‑you internacional.【F:docs/02-tasks-e-checklists.md†L120-L123】
- [x] **CP3:** E2E determinístico validando thank‑you/delivery sem API real.【F:docs/27-gate-fase-5.md†L15-L33】
- [x] **CP4:** documentação atualizada conforme kickoff (checklists + critérios de aceite).【F:docs/29-kickoff-fase-5.md†L80-L92】

---

## 4) E2E determinístico (o que mockar/interceptar e como)
- [x] Mockar/interceptar o **endpoint de delivery/thank‑you** usado pelo novo checkout (sem API real).【F:docs/27-gate-fase-5.md†L15-L23】
- [x] Mockar respostas de delivery com **estado interno** (`pending`, `approved`, `failed`, `refunded`, `dispute`) para validar renderização da thank‑you.【F:docs/ADR-001-checkout-internacional-como-variacao.md†L13-L19】
- [x] Assegurar que nenhum teste E2E dependa de Stripe real ou webhooks reais.【F:docs/28-encerramento-fase-4.md†L6-L15】【F:docs/27-gate-fase-5.md†L15-L23】
- [x] Validar que não existe polling na thank‑you internacional (apenas uma leitura determinística).【F:docs/27-gate-fase-5.md†L17-L24】

---

## 5) Não‑regressão (fluxo nacional)
- [x] Nenhuma alteração no fluxo nacional (padrão e 3 etapas).【F:docs/28-encerramento-fase-4.md†L20-L24】
- [x] Thank‑you nacional permanece inalterado e funcionando com estados internos.【F:docs/ADR-001-checkout-internacional-como-variacao.md†L13-L19】
- [x] Nenhuma dependência Stripe no frontend legado ou nacional.【F:docs/ADR-001-checkout-internacional-como-variacao.md†L55-L63】

---

## 6) Escopo de entrega (Etapa 2)
**Inclui**
- [x] Convergência do pós‑venda internacional com o modelo nacional (delivery/thank‑you compartilhado).【F:docs/ADR-001-checkout-internacional-como-variacao.md†L13-L19】
- [x] Estados internos como única fonte de verdade no pós‑venda internacional.【F:docs/ADR-001-checkout-internacional-como-variacao.md†L13-L19】
- [x] E2E determinístico validando thank‑you/delivery no internacional.【F:docs/27-gate-fase-5.md†L15-L33】

**Fora de escopo**
- [x] Qualquer lógica de saldo, saque ou reconciliação financeira permanece fora de escopo nesta etapa.【F:docs/27-gate-fase-5.md†L17-L20】
- [x] Qualquer confirmação sem webhook ou polling permanece fora de escopo nesta etapa.【F:docs/27-gate-fase-5.md†L17-L24】
- [x] Qualquer nova família de checkout internacional permanece fora de escopo nesta etapa.【F:docs/ADR-001-checkout-internacional-como-variacao.md†L49-L63】

---

## 7) Gates de conclusão (Etapa 2 encerrada)
- [x] E2E determinístico cobre **thank‑you/delivery internacional** e estados internos (sem API real).【F:docs/27-gate-fase-5.md†L15-L33】
- [x] Thank‑you internacional confirma pagamento **somente com `approved`**.【F:docs/02-tasks-e-checklists.md†L120-L123】
- [x] Fluxo nacional validado como **sem regressão**.【F:docs/27-gate-fase-5.md†L29-L33】
- [x] Documentação atualizada (checklists + critérios de aceite + checkpoint da etapa).【F:docs/29-kickoff-fase-5.md†L80-L92】
