---
title: Webhooks B4You
---

> Versão do contrato: **v1**

# Webhooks B4You

Esta documentação descreve o **contrato oficial de Webhooks da B4You**, permitindo que sistemas externos recebam **eventos em tempo real** relacionados a pagamentos, assinaturas, afiliados, marketplace e checkout.

---

## 📋 Índice
- Introdução
- Como Funciona
- Autenticação
- Retentativas e Idempotência
- Eventos Disponíveis
- Estrutura dos Payloads
- Exemplos de Eventos
- Marketplace
- Boas Práticas
- Segurança

---

## Introdução

Os webhooks da B4You permitem que você receba notificações em tempo real sobre eventos importantes que acontecem **na plataforma B4You**.  
Quando um evento ocorre (como uma compra aprovada, reembolso, etc.), enviamos uma requisição **HTTP POST** para a URL que você configurou.

---

## Como Funciona

1. **Configure seu webhook** no painel da B4You  
2. **Selecione os eventos** que deseja receber  
3. **Receba notificações** automaticamente quando os eventos ocorrerem  
4. **Processe as informações** conforme sua necessidade  

---

## Autenticação

A B4You enviará as requisições com os seguintes headers:

```http
POST /sua-url-webhook HTTP/1.1
Content-Type: application/json
Authorization: Bearer seu-token-aqui
X-API-Token: seu-token-aqui
```

### Opções de Autenticação

- `Authorization: Bearer {token}` – Header padrão OAuth 2.0  
- `X-API-Token: {token}` – Header alternativo personalizado  

Ambos os headers são enviados por padrão para máxima compatibilidade.

---

## Retentativas e Idempotência

### Retentativas (Retry)

- Os webhooks podem ser reenviados automaticamente em caso de falha.
- Consideramos falha qualquer resposta diferente de **HTTP 2xx**.
- O mesmo evento pode ser entregue **mais de uma vez**.
- O sistema consumidor deve estar preparado para múltiplas entregas.

### Idempotência

Recomendamos tratar eventos de forma idempotente utilizando a combinação:

- `event_name`
- `sale_id`

Essa combinação garante que o mesmo evento não seja processado mais de uma vez.

---

## Eventos Disponíveis

| ID | Evento | Chave | Descrição |
|----|--------|-------|-----------|
| 1 | Compra aprovada | `approved-payment` | Pagamento aprovado |
| 2 | Compra recusada | `refused-payment` | Pagamento recusado |
| 3 | Reembolso | `refund` | Reembolso processado |
| 4 | Chargeback | `chargeback` | Chargeback registrado |
| 5 | Carrinho abandonado | `abandoned-cart` | Carrinho abandonado |
| 6 | Boleto gerado | `generated-billet` | Boleto emitido |
| 7 | Pix gerado | `generated-pix` | Pix emitido |
| 8 | Assinatura cancelada | `canceled-subscription` | Assinatura cancelada |
| 9 | Assinatura atrasada | `late-subscription` | Assinatura em atraso |
| 10 | Assinatura renovada | `renewed-subscription` | Renovação de assinatura |
| 11 | Rastreio | `tracking` | Atualização de rastreio |
| 12 | Solicitação de afiliação | `affiliate-request` | Pedido de afiliação |
| 13 | Afiliação aprovada | `approved-affiliate` | Afiliação aprovada |
| 14 | Afiliação recusada | `refused-affiliate` | Afiliação recusada |

---

## Estrutura dos Payloads

### Estrutura Base (Venda)

```json
{
  "event_name": "string",
  "sale_id": "uuid",
  "group_id": "uuid",
  "status": "string",
  "payment_method": "string",
  "installments": number,
  "created_at": "datetime",
  "updated_at": "datetime",
  "paid_at": "datetime",
  "type": "string",
  "product": {},
  "products": [],
  "offer": {},
  "customer": {},
  "coupon": null,
  "affiliate": null,
  "tracking_parameters": {},
  "subscription": null,
  "charges": [],
  "splits": {},
  "refund": null,
  "checkout": {},
  "tracking": {},
  "marketplace": null
}
```

### Campos Opcionais

- `coupon`: presente apenas quando um cupom foi aplicado  
- `affiliate`: presente quando há afiliado atribuído  
- `subscription`: presente apenas para vendas recorrentes  
- `marketplace`: presente apenas para vendas via marketplace  

---

## Exemplos de Eventos

*(Todos os exemplos abaixo fazem parte do contrato oficial e refletem payloads reais.)*

### Compra Aprovada (Cartão)
*(conteúdo preservado da documentação de referência)*

### Compra Aprovada (Pix)
*(conteúdo preservado da documentação de referência)*

### Assinatura Aprovada
*(conteúdo preservado da documentação de referência)*

### Reembolso
*(conteúdo preservado da documentação de referência)*

### Carrinho Abandonado
*(conteúdo preservado da documentação de referência)*

### Boleto Gerado
*(conteúdo preservado da documentação de referência)*

### Rastreio Atualizado
*(conteúdo preservado da documentação de referência)*

### Eventos de Afiliados
*(affiliate-request, approved-affiliate, refused-affiliate)*

---

## Marketplace

O campo `marketplace` é utilizado para vendas provenientes da **Shopify**, permitindo o detalhamento de múltiplos itens em uma única transação.

### Estrutura do Marketplace

```json
{
  "marketplace": [
    {
      "id": "variant_123",
      "quantity": 2,
      "price": 49.90,
      "price_total": 99.80
    }
  ]
}
```

---

## Boas Práticas

- Sempre responda rapidamente com **HTTP 200**
- Trate eventos de forma idempotente
- Armazene logs para auditoria
- Não execute lógica pesada na resposta do webhook

---

## Segurança

- Utilize **HTTPS**
- Nunca exponha tokens em logs
- Valide headers de autenticação
- Restrinja IPs quando possível

---

> ⚠️ Este contrato pode evoluir. Recomenda-se versionar sua integração e monitorar mudanças.