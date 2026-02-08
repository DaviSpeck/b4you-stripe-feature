# Analytics Checkout — Jornada (Read API)

## Objetivo
Este documento descreve como a Jornada consome a **Read API** para `/checkout-analytics`, utilizando somente eventos persistidos em `checkout_events`. Não há inferência de dados.

## Filtros comuns
Todos os endpoints da Jornada aceitam `POST` com JSON no body:

```json
{
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "offer_id": "string?",
  "product_id": "string?",
  "producer_id": "string?",
  "checkout_type": "standard|3steps?",
  "checkout_mode": "embedded|transparent?",
  "payment_method": "credit_card|pix|boleto?",
  "execution_environment": "production|sandbox|development?",
  "has_success": true,
  "has_error": false
}
```

Regras:
- `start_date` e `end_date` são obrigatórios.
- O range é aplicado em `event_timestamp`.
- Strings são sanitizadas (trim) e vazios são ignorados.
- `offer_context` é **best-effort** (pode retornar `null`).
- `execution_environment`, `has_success` e `has_error` são opcionais e afetam todas as consultas.

## Endpoints

### Cards de resumo
`POST /checkout/analytics/journey/summary`

```json
{
  "total_sessions": 1234,
  "total_events": 48700,
  "success_sessions": 312,
  "error_sessions": 190
}
```

### Funil
`POST /checkout/analytics/journey/funnel`

```json
{
  "steps": [
    { "event_name": "checkout_page_view", "label": "Visualização", "sessions": 1200 },
    { "event_name": "checkout_session_started", "label": "Sessão iniciada", "sessions": 980 },
    { "event_name": "checkout_identification_completed", "label": "Identificação concluída", "sessions": 760 },
    { "event_name": "checkout_address_completed", "label": "Endereço concluído", "sessions": 540 },
    { "event_name": "checkout_submit_clicked", "label": "Pagamento enviado", "sessions": 410 },
    { "event_name": "checkout_conversion_success", "label": "Checkout concluído", "sessions": 310 }
  ]
}
```

Observação: `checkout_conversion_success` representa checkout concluído (PIX gerado, boleto gerado ou cartão aprovado). Já `checkout_payment_success` indica apenas cartão aprovado.

### Matriz de etapas
`POST /checkout/analytics/journey/steps`

```json
{
  "steps": [
    { "step": "identification", "started": 900, "completed": 760, "errors": 120 },
    { "step": "address", "started": 620, "completed": 540, "errors": 80 },
    { "step": "payment", "started": 430, "completed": 310, "errors": 95 }
  ]
}
```

### Conversão por método de pagamento
`POST /checkout/analytics/journey/payment-methods`

```json
{
  "items": [
    { "payment_method": "credit_card", "sessions": 210, "success_sessions": 120 },
    { "payment_method": "pix", "sessions": 140, "success_sessions": 110 },
    { "payment_method": "boleto", "sessions": 60, "success_sessions": 20 }
  ]
}
```

### Distribuição por tipo e modo
`POST /checkout/analytics/journey/distribution`

```json
{
  "checkout_type": [
    { "value": "standard", "sessions": 680 },
    { "value": "3steps", "sessions": 520 }
  ],
  "checkout_mode": [
    { "value": "embedded", "sessions": 740 },
    { "value": "transparent", "sessions": 460 }
  ]
}
```

### Tabelas agregadas
`POST /checkout/analytics/journey/breakdowns`

```json
{
  "by_checkout_type": [
    { "label": "standard", "sessions": 680, "success_sessions": 240 },
    { "label": "3steps", "sessions": 520, "success_sessions": 70 }
  ],
  "by_checkout_mode": [
    { "label": "embedded", "sessions": 740, "success_sessions": 250 },
    { "label": "transparent", "sessions": 460, "success_sessions": 60 }
  ],
  "by_payment_method": [
    { "label": "credit_card", "sessions": 210, "success_sessions": 120 },
    { "label": "pix", "sessions": 140, "success_sessions": 110 },
    { "label": "boleto", "sessions": 60, "success_sessions": 20 }
  ]
}
```

### Produtos (paginado)
`POST /checkout/analytics/journey/products`

```json
{
  "items": [
    {
      "product_id": "prod-10",
      "product_name": "Curso Crescimento Digital",
      "sessions": 120,
      "success_sessions": 40
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 48
}
```

Na interface, o nome do produto é exibido e, se ausente, o rótulo “Produto não identificado” é utilizado.

### Produtores (paginado)
`POST /checkout/analytics/journey/producers`

```json
{
  "items": [
    {
      "producer_id": "producer-01",
      "producer_name": "Escola Viver Bem",
      "sessions": 210,
      "success_sessions": 90
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 22
}
```

Na interface, o nome do produtor é exibido e, se ausente, o rótulo “Produtor não identificado” é utilizado.

### Sessões (paginado)
`POST /checkout/analytics/journey/sessions`

```json
{
  "items": [
    {
      "session_id": "chk_5cdef7c2",
      "offer_id": "KmtW6IVIhP",
      "checkout_type": "3steps",
      "checkout_mode": "transparent",
      "payment_method": "pix",
      "events": [
        {
          "event_name": "checkout_page_view",
          "event_description": "Checkout page viewed",
          "event_timestamp": 1768017455036
        }
      ],
      "offer_context": {
        "product_id": "...",
        "product_name": "...",
        "producer_id": "...",
        "producer_name": "..."
      }
    }
  ],
  "page": 1,
  "page_size": 5,
  "total": 1200
}
```
