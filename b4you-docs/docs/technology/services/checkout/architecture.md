---
title: Arquitetura do Checkout
---

# Arquitetura do Checkout

Este documento descreve a **arquitetura técnica**, os **limites de responsabilidade** e os **princípios de design** do serviço de Checkout da B4You.

O Checkout é um serviço **crítico**, responsável pela execução do fluxo de compra a partir de configurações previamente definidas pela Dashboard.

---

## 1. Visão Geral da Arquitetura

O Checkout é composto por três camadas principais:

```

[ Dashboard ]
↓ (configuração)
[ API Checkout ]
↓ (execução)
[ Frontend Checkout ]

```

### Papéis claros

- **Dashboard**
  - Define regras
  - Persiste configurações
  - Não executa pagamento

- **API Checkout**
  - Executa regras
  - Processa vendas
  - Integra com adquirentes

- **Frontend Checkout**
  - Renderiza experiência
  - Coleta inputs do usuário
  - Nunca decide regra de negócio

---

## 2. Princípios Arquiteturais

### 2.1 Configuração > Execução

Toda regra de negócio deve ser:
1. Configurada previamente (Dashboard)
2. Persistida no backend
3. Consumida em tempo de execução pelo Checkout

O Checkout **não cria regra**, apenas executa.

---

### 2.2 Fonte Única da Verdade

- Banco de dados da API é a fonte oficial
- Frontend não mantém estado decisório
- Flags sempre vêm do backend

Exemplos:
- `is_one_click`
- `is_multi_offer`
- `payment_methods`
- `student_pays_interest`

---

### 2.3 Separação de Escopos

Regras podem existir em múltiplos níveis:

| Escopo   | Finalidade                         |
|--------|------------------------------------|
| Produto | Configuração base / fallback       |
| Oferta  | Sobrescrita pontual                |
| Venda  | Estado de execução                 |

O Checkout resolve **sempre nessa ordem**.

---

## 3. Componentes Técnicos

### 3.1 Frontend Checkout

- React (checkout legado)
- Next.js (novo checkout)
- Renderização baseada em configuração
- Zero lógica de decisão comercial

Responsabilidades:
- Exibir preços
- Coletar dados
- Acionar endpoints

---

### 3.2 API Checkout

- Node.js + Express
- Sequelize
- Serviços isolados por domínio:
  - Sales
  - Offers
  - Upsell
  - Payments

Responsabilidades:
- Validar estado da venda
- Orquestrar pagamento
- Garantir idempotência
- Emitir eventos

---

### 3.3 Integrações Externas

- Pagar.me
- Stripe (roadmap)
- Cloudflare Turnstile
- Frenet (frete)
- Serviços antifraude

Todas integradas **via backend**.

---

## 4. Fluxo Técnico de Compra

Fluxo simplificado:

```

Usuário → Frontend
Frontend → API Checkout
API Checkout → Gateway
Gateway → Webhook
Webhook → Atualização de Venda

```

O Frontend **não confia** em respostas diretas de gateway.

---

## 5. Segurança

Camadas aplicadas:

- CORS por domínio
- CSP restritiva
- Turnstile (Cloudflare)
- Assinatura de webhooks
- Validação de ownership

Nenhuma requisição crítica é executada sem:
- Venda válida
- Oferta válida
- Contexto de usuário

---

## 6. Observabilidade

- Logs estruturados por `req_id`
- Métricas Prometheus
- Sentry para frontend e backend
- Alertas por falha de pagamento

---

## 7. Anti-padrões (o que evitar)

- Regras hardcoded no front
- Decisão de pagamento no frontend
- Dependência direta de provider no UI
- Confundir configuração com execução

---

## 8. Evolução da Arquitetura

Roadmap arquitetural:

- Multiadquirência
- Materialização de métricas
- Isolamento de gateways
- Padronização total de domínios

---

> ⚠️ Qualquer mudança no Checkout deve respeitar:
> - Contratos existentes
> - Fluxos ativos
> - Impacto direto em conversão
```
