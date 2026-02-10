# VALIDACAO_FASE_6.md

Checklist técnico de validação da **FASE 6 — Backoffice (Governança Internacional / Stripe)**.

## 1) Pré-condições

- [ ] Migrações aplicadas em Backoffice API e Dashboard API.
- [ ] Ambiente com usuário de backoffice autenticado (token admin).
- [ ] Ambiente com um produtor de teste (UUID conhecido).
- [ ] Sem mudanças de checkout no pacote desta validação.

## 2) Como rodar localmente (back + front)

### 2.1 Backoffice API

```bash
cd backoffice-repositories/sixbase-api-backoffice
npm install
npm run test
npm run test:integration
npm run test:front
```

### 2.2 Dashboard API

```bash
cd dashboard-repositories/sixbase-api
npm install
npm run test
npm run test:integration
npm run test:front
```

### 2.3 Backoffice Frontend

```bash
cd backoffice-repositories/sixbase-backoffice
npm install
npm run test
npm run test:integration
npm run test:front
```

### 2.4 Dashboard Frontend

```bash
cd dashboard-repositories/sixbase-dashboard
npm install
npm run test
npm run test:integration
npm run test:front
```

---

## 3) Checklist de estrutura de dados (DB)

### 3.1 Users (governança internacional)
- [ ] `users.international_status` existe (`enabled|blocked`) com default `blocked`.
- [ ] `users.international_stripe_enabled` existe com default `false`.
- [ ] `users.international_rules` existe com default `{}`.
- [ ] `users.international_status_updated_at` existe.
- [ ] `users.international_status_updated_by` existe (backoffice).

### 3.2 Products (separação nacional vs internacional)
- [ ] `products.operation_scope` existe (`national|international`) com default `national`.
- [ ] `products.currency_code` existe (len=3), default `BRL`.
- [ ] `products.acquirer_key` existe, default `pagarme`.
- [ ] `products.conversion_context` existe (JSON nullable).

### Queries SQL de verificação

```sql
SHOW COLUMNS FROM users LIKE 'international_status';
SHOW COLUMNS FROM users LIKE 'international_stripe_enabled';
SHOW COLUMNS FROM users LIKE 'international_rules';
SHOW COLUMNS FROM users LIKE 'international_status_updated_at';
SHOW COLUMNS FROM users LIKE 'international_status_updated_by';

SHOW COLUMNS FROM products LIKE 'operation_scope';
SHOW COLUMNS FROM products LIKE 'currency_code';
SHOW COLUMNS FROM products LIKE 'acquirer_key';
SHOW COLUMNS FROM products LIKE 'conversion_context';
```

---

## 4) Cenários obrigatórios de API

### 4.1 Produtor bloqueado (deve bloquear internacional)

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

**Aceite:** HTTP `403`.

### 4.2 Produtor habilitado (deve permitir internacional)

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

**Aceite:** HTTP `200`.

### 4.3 Produto nacional (não impactado)

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

**Aceite:** HTTP `200` independentemente do status internacional.

### 4.4 GET governança

```bash
curl -X GET "$BACKOFFICE_API/users/$PRODUCER_UUID/international-governance" \
  -H "Authorization: Bearer $BACKOFFICE_ADMIN_TOKEN"
```

**Aceite:** payload com `international_status`, `international_stripe_enabled`, `international_rules`, `international_status_updated_at`, `international_status_updated_by`.

---

## 5) Cenários obrigatórios de Frontend

### 5.1 Backoffice Front
- [ ] Card de governança internacional exibe status, stripe_enabled, rules, last updated e autor.
- [ ] Alteração com motivo obrigatório salva via PATCH e recarrega estado.
- [ ] Erro de backend exibe mensagem clara.

### 5.2 Dashboard Front
- [ ] Modal de criação de produto exibe campo `Operação` (`national|international`).
- [ ] Tentativa internacional bloqueada (403) mostra mensagem: `Seu produtor não está habilitado para criar produto internacional.`
- [ ] Criação nacional segue fluxo normal.

---

## 6) Auditoria e rastreabilidade

### Eventos esperados
- `international-governance-enabled`
- `international-governance-blocked`

### Query de inspeção

```sql
SELECT id, id_user_backoffice, id_user, id_event, params, ip_address, created_at
FROM logs_backoffice
WHERE created_at >= NOW() - INTERVAL 1 DAY
ORDER BY id DESC
LIMIT 50;
```

**Aceite:** log com `old_state`, `new_state`, `reason`, `rule_applied` e `id_event` correto.

---

## 7) Critérios objetivos de aceite/reprovação

### Aprovado se
- [ ] Governança internacional por produtor é persistida e recuperável.
- [ ] Internacional bloqueado retorna `403` no backend da dashboard.
- [ ] Internacional habilitado retorna `200`.
- [ ] Nacional continua com `200`.
- [ ] Frontends refletem backend sem inferência de regra.
- [ ] Auditoria contém trilha mínima exigida.
- [ ] Checkout permanece inalterado.

### Reprovado se
- [ ] Internacional for criado com produtor bloqueado.
- [ ] Bloqueio existir só na UI.
- [ ] Nacional depender da governança internacional.
- [ ] Logs sem `old_state/new_state/reason`.
