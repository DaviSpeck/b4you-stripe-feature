# VALIDACAO_FASE_6.md

Checklist técnico de validação da **FASE 6 — Backoffice (Governança Internacional / Stripe)**.

## 1) Pré-condições

- [ ] Migrações aplicadas em Backoffice API e Dashboard API.
- [ ] Ambiente com usuário de backoffice autenticado (token admin).
- [ ] Ambiente com um produtor de teste (UUID conhecido).
- [ ] Sem mudanças de checkout no pacote desta validação.

### Comandos de apoio

```bash
# Backoffice migrations
cd backoffice-repositories/sixbase-api-backoffice
npm run sequelize db:migrate

# Dashboard migrations
cd ../../dashboard-repositories/sixbase-api
npm run sequelize db:migrate
```

---

## 2) Checklist de estrutura de dados (DB)

### 2.1 Users (governança internacional)
- [ ] `users.international_status` existe (`enabled|blocked`) com default `blocked`.
- [ ] `users.international_stripe_enabled` existe com default `false`.
- [ ] `users.international_rules` existe com default `{}`.
- [ ] `users.international_status_updated_at` existe.
- [ ] `users.international_status_updated_by` existe (backoffice).

### 2.2 Products (separação nacional vs internacional)
- [ ] `products.operation_scope` existe (`national|international`) com default `national`.
- [ ] `products.currency_code` existe (len=3), default `BRL`.
- [ ] `products.acquirer_key` existe, default `pagarme`.
- [ ] `products.conversion_context` existe (JSON nullable).

### Queries SQL de verificação

```sql
-- Users
SHOW COLUMNS FROM users LIKE 'international_status';
SHOW COLUMNS FROM users LIKE 'international_stripe_enabled';
SHOW COLUMNS FROM users LIKE 'international_rules';
SHOW COLUMNS FROM users LIKE 'international_status_updated_at';
SHOW COLUMNS FROM users LIKE 'international_status_updated_by';

-- Products
SHOW COLUMNS FROM products LIKE 'operation_scope';
SHOW COLUMNS FROM products LIKE 'currency_code';
SHOW COLUMNS FROM products LIKE 'acquirer_key';
SHOW COLUMNS FROM products LIKE 'conversion_context';
```

---

## 3) Cenários obrigatórios

## 3.1 Produtor bloqueado (deve bloquear internacional)

### Passo A — Setar governança para bloqueado

```bash
curl -X PATCH "$BACKOFFICE_API/users/$PRODUCER_UUID/international-governance" \
  -H "Authorization: Bearer $BACKOFFICE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "blocked",
    "international_stripe_enabled": false,
    "reason": "Validação de bloqueio FASE 6",
    "rules": {"origin": "manual_validation"}
  }'
```

**Aceite:** HTTP `200`.

### Passo B — Tentar criar produto internacional via Dashboard API

```bash
curl -X POST "$DASHBOARD_API/dashboard/products" \
  -H "Authorization: Bearer $PRODUCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Internacional Bloqueado",
    "category": 1,
    "payment_type": "single",
    "type": "video",
    "warranty": 7,
    "sales_page_url": "https://example.com",
    "operation_scope": "international",
    "currency_code": "USD",
    "acquirer_key": "stripe",
    "conversion_context": {"source": "manual-check"}
  }'
```

**Aceite:** HTTP `403` (bloqueio backend).

---

## 3.2 Produtor habilitado (deve permitir internacional)

### Passo A — Habilitar governança

```bash
curl -X PATCH "$BACKOFFICE_API/users/$PRODUCER_UUID/international-governance" \
  -H "Authorization: Bearer $BACKOFFICE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "enabled",
    "international_stripe_enabled": true,
    "reason": "Validação de habilitação FASE 6",
    "rules": {"country_allowlist": ["US"]}
  }'
```

**Aceite:** HTTP `200`.

### Passo B — Criar produto internacional

```bash
curl -X POST "$DASHBOARD_API/dashboard/products" \
  -H "Authorization: Bearer $PRODUCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Internacional Habilitado",
    "category": 1,
    "payment_type": "single",
    "type": "video",
    "warranty": 7,
    "sales_page_url": "https://example.com",
    "operation_scope": "international",
    "currency_code": "USD",
    "acquirer_key": "stripe",
    "conversion_context": {"source": "manual-check"}
  }'
```

**Aceite:** HTTP `200`, produto criado com `operation_scope=international`.

---

## 3.3 Produto nacional (não pode ser impactado)

```bash
curl -X POST "$DASHBOARD_API/dashboard/products" \
  -H "Authorization: Bearer $PRODUCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Nacional",
    "category": 1,
    "payment_type": "single",
    "type": "video",
    "warranty": 7,
    "sales_page_url": "https://example.com",
    "operation_scope": "national",
    "currency_code": "BRL",
    "acquirer_key": "pagarme"
  }'
```

**Aceite:** HTTP `200` independentemente do status internacional do produtor.

---

## 3.4 Leitura da governança

```bash
curl -X GET "$BACKOFFICE_API/users/$PRODUCER_UUID/international-governance" \
  -H "Authorization: Bearer $BACKOFFICE_ADMIN_TOKEN"
```

**Aceite:** payload contém `international_status`, `international_stripe_enabled`, `international_rules`, `international_status_updated_at`, `international_status_updated_by`.

---

## 4) Auditoria e rastreabilidade

### 4.1 Eventos esperados
- `international-governance-enabled`
- `international-governance-blocked`

### 4.2 Campos mínimos esperados no log
- ator (`id_user_backoffice`)
- usuário alvo (`id_user`)
- `old_state`
- `new_state`
- `reason`
- `rule_applied`
- `feature_flag`
- `ip_address`
- `user_agent`

### Query de inspeção

```sql
SELECT id, id_user_backoffice, id_user, id_event, params, ip_address, created_at
FROM logs_backoffice
WHERE created_at >= NOW() - INTERVAL 1 DAY
ORDER BY id DESC
LIMIT 50;
```

**Aceite:** ao menos 1 log por alteração de governança com estado anterior/novo.

---

## 5) Não-regressão mínima recomendada

```bash
# teste existente de criação de produto
cd dashboard-repositories/sixbase-api
npm test -- --runTestsByPath tests/integration/createProduct.spec.js
```

**Aceite:** suíte passando.

---

## 6) Critérios objetivos de aceite/reprovação

## Aprovado se:
- [ ] Governança internacional por produtor é persistida e recuperável via endpoint.
- [ ] Produtor bloqueado recebe `403` ao tentar criar produto internacional.
- [ ] Produtor habilitado consegue criar produto internacional.
- [ ] Produto nacional continua criando normalmente.
- [ ] Logs de auditoria registram estado anterior/novo, motivo e ator.
- [ ] Nenhuma alteração de checkout foi necessária.

## Reprovado se:
- [ ] Criação internacional passar para produtor bloqueado.
- [ ] Bloqueio ocorrer apenas em UI (sem `403` no backend).
- [ ] Produto nacional depender de status internacional para funcionar.
- [ ] Não houver trilha auditável mínima das mudanças de governança.
