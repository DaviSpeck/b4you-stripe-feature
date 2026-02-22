# FASE 6 — Execução técnica real no Backoffice (Governança Internacional Stripe)

## 1) Escopo executado nesta fase
Implementação realizada com foco em governança institucional no Backoffice, sem alteração de checkout e sem execução da FASE 7/8.

Status: **FASE 6 encerrada no escopo de governança internacional**.

Implementado:
1. elegibilidade internacional por produtor (habilitado/bloqueado) persistida em base;
2. governança condicional da Stripe em nível de produtor;
3. trilha auditável de transição de estado (anterior/novo, motivo, regra, ator, data);
4. bloqueio técnico no backend da Dashboard para impedir criação de produto internacional por produtor não habilitado;
5. separação explícita de dados do produto (escopo nacional/internacional, moeda, adquirente, contexto de conversão).

---

## 2) Implementações técnicas (código)

### 2.1 Backoffice API — governança por produtor
- Novos campos de governança internacional no `users`:
  - `international_status` (`enabled|blocked`);
  - `international_stripe_enabled` (boolean);
  - `international_rules` (JSON);
  - `international_status_updated_at`;
  - `international_status_updated_by`.
- Novas rotas no Backoffice:
  - `GET /users/:userUuid/international-governance`;
  - `PATCH /users/:userUuid/international-governance`.
- O PATCH exige payload validado com `status`, `international_stripe_enabled`, `rules`, `reason`.
- Cada transição gera log auditável com:
  - estado anterior;
  - novo estado;
  - regra aplicada;
  - motivo;
  - ator (`id_user_backoffice`), `user_agent` e `ip_address`.

### 2.2 Dashboard API — bloqueio backend de criação internacional sem habilitação
- Fluxo de criação de produto (`CreateProduct`) passou a validar governança do produtor quando `operation_scope = international`.
- Se produtor não estiver com `international_status = enabled` e `international_stripe_enabled = true`, a criação é bloqueada com erro `403`.
- A decisão não é feita na UI: o bloqueio está no backend da Dashboard.

### 2.3 Separação explícita de dados no produto (sem checkout)
- Novos campos persistidos em `products`:
  - `operation_scope` (`national|international`);
  - `currency_code`;
  - `acquirer_key`;
  - `conversion_context` (JSON).
- Esses campos permitem separar venda nacional vs internacional sem reprocessar histórico.
- Checkout não foi alterado; apenas passa a consumir dados já governados.

---

## 3) Evidência de responsabilidades por domínio
1. **Backoffice controla elegibilidade internacional do produtor e regra da Stripe**.
2. **Dashboard continua criando produto**, mas só cria produto internacional se habilitado pelo Backoffice.
3. **Checkout permanece consumidor** da decisão já tomada.

Regra de governança: ausência de decisão formal do Backoffice implica bloqueio internacional no backend da Dashboard.

---

## 4) Fora de escopo preservado
Não foi implementado nesta fase:
- criação de produto no Backoffice;
- qualquer alteração de checkout;
- alteração de estados internos;
- execução da FASE 7 (Dashboard operacional de governança);
- execução da FASE 8 (rollout/comunicação).

---

## 5) Dependências claras para FASE 7 (não executar agora)
A FASE 7 deverá:
1. expor os estados de governança internacional ao produtor na UI da Dashboard;
2. apresentar mensagens e bloqueios operacionais consistentes com o backend;
3. detalhar UX de regras condicionais da Stripe usando os campos `international_rules`.

Observação de negócio/governança: FASE 6 **não** representa liberação internacional para todos os produtores; representa decisão institucional por produtor com trilha auditável.

Regra mantida: se surgir decisão de negócio não documentada, bloquear implementação e registrar pendência formal.
