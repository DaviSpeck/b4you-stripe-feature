# Documentação de Webhooks - B4You

## 📋 Índice
- [Introdução](#introdução)
- [Como Funciona](#como-funciona)
- [Eventos Disponíveis](#eventos-disponíveis)
- [Estrutura dos Payloads](#estrutura-dos-payloads)
- [Exemplos de Eventos](#exemplos-de-eventos)
- [Marketplace](#marketplace)
- [Boas Práticas](#boas-práticas)
- [Segurança](#segurança)

---

## Introdução

Os webhooks da B4You permitem que você receba notificações em tempo real sobre eventos importantes que acontecem em sua plataforma. Quando um evento ocorre (como uma compra aprovada, reembolso, etc.), enviamos uma requisição HTTP POST para a URL que você configurou.

## Como Funciona

1. **Configure seu webhook** no painel da B4You
2. **Selecione os eventos** que deseja receber
3. **Receba notificações** automaticamente quando os eventos ocorrerem
4. **Processe as informações** conforme sua necessidade

### Headers da Requisição

A B4You enviará as requisições com os seguintes headers:

```http
POST /sua-url-webhook HTTP/1.1
Content-Type: application/json
Authorization: Bearer seu-token-aqui
X-API-Token: seu-token-aqui
```

**Opções de Autenticação:**
- `Authorization: Bearer {token}` - Header padrão OAuth 2.0
- `X-API-Token: {token}` - Header alternativo personalizado

Ambos os headers são enviados por padrão para máxima compatibilidade.

---

## Eventos Disponíveis

| ID | Evento | Chave | Descrição |
|----|--------|-------|-----------|
| 1 | Compra aprovada | `approved-payment` | Disparado quando um pagamento é aprovado |
| 2 | Compra recusada | `refused-payment` | Disparado quando um pagamento é recusado |
| 3 | Reembolso | `refund` | Disparado quando um reembolso é processado |
| 4 | Chargeback | `chargeback` | Disparado quando ocorre um chargeback |
| 5 | Carrinho abandonado | `abandoned-cart` | Disparado quando um carrinho é abandonado |
| 6 | Boleto gerado | `generated-billet` | Disparado quando um boleto é gerado |
| 7 | Pix gerado | `generated-pix` | Disparado quando um Pix é gerado |
| 8 | Assinatura cancelada | `canceled-subscription` | Disparado quando uma assinatura é cancelada |
| 9 | Assinatura atrasada | `late-subscription` | Disparado quando uma assinatura está atrasada |
| 10 | Assinatura renovada | `renewed-subscription` | Disparado quando uma assinatura é renovada |
| 11 | Rastreio | `tracking` | Disparado quando informações de rastreio são atualizadas |
| 12 | Solicitação de afiliação | `affiliate-request` | Disparado quando um afiliado solicita participar |
| 13 | Afiliação aprovada | `approved-affiliate` | Disparado quando uma afiliação é aprovada |
| 14 | Afiliação recusada | `refused-affiliate` | Disparado quando uma afiliação é recusada |

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
  "installments": "number",
  "created_at": "datetime",
  "updated_at": "datetime",
  "paid_at": "datetime",
  "type": "string",
  "product": { },
  "products": [ ],
  "offer": { },
  "customer": { },
  "coupon": { },
  "affiliate": { },
  "tracking_parameters": { },
  "subscription": { },
  "charges": [ ],
  "splits": { },
  "refund": { },
  "checkout": { },
  "tracking": { },
  "marketplace": [ ]
}
```

---

## Exemplos de Eventos

### 1. Compra Aprovada (Cartão de Crédito)

```json
{
  "event_name": "approved-payment",
  "sale_id": "550e8400-e29b-41d4-a716-446655440001",
  "group_id": "550e8400-e29b-41d4-a716-446655440002",
  "status": "paid",
  "payment_method": "card",
  "installments": 3,
  "card": [
    {
      "brand": "visa",
      "last_four_digits": "4242"
    }
  ],
  "pix": null,
  "billet": null,
  "created_at": "2025-10-22T10:30:00",
  "updated_at": "2025-10-22T10:35:00",
  "paid_at": "2025-10-22T10:35:00",
  "type": "main",
  "product": {
    "id": "650e8400-e29b-41d4-a716-446655440003",
    "name": "Curso De Marketing Digital Avançado",
    "logo": "https://exemplo.com/logo.png",
    "cover": "https://exemplo.com/capa.jpg",
    "dimensions": null,
    "offer_image": "https://exemplo.com/oferta.jpg"
  },
  "products": [
    {
      "type": "order-bump",
      "id": "750e8400-e29b-41d4-a716-446655440004",
      "name": "E-book Bônus: Estratégias De Tráfego",
      "logo": "https://exemplo.com/ebook-logo.png",
      "cover": "https://exemplo.com/ebook-capa.jpg",
      "dimensions": null
    }
  ],
  "offer": {
    "id": "850e8400-e29b-41d4-a716-446655440005",
    "name": "Oferta Especial Black Friday",
    "quantity": 1,
    "original_price": 997.00
  },
  "customer": {
    "id": "950e8400-e29b-41d4-a716-446655440006",
    "full_name": "João Silva Santos",
    "email": "joao.silva@exemplo.com",
    "whatsapp": "11999887766",
    "document_number": "12345678900",
    "address": {
      "street": "Rua Das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipcode": "01234567",
      "country": "BR"
    }
  },
  "coupon": {
    "name": "BLACKFRIDAY2025",
    "amount": 100.00,
    "type": "amount"
  },
  "affiliate": {
    "full_name": "Maria Oliveira Costa",
    "email": "maria.oliveira@exemplo.com",
    "b4f": "a50e8400-e29b-41d4-a716-446655440007"
  },
  "tracking_parameters": {
    "src": "facebook",
    "sck": "campaign_123",
    "utm_source": "facebook",
    "utm_medium": "cpc",
    "utm_campaign": "black_friday_2025",
    "utm_content": "ad_video_001",
    "utm_term": "marketing_digital"
  },
  "subscription": null,
  "charges": [
    {
      "id": "b50e8400-e29b-41d4-a716-446655440008",
      "amount": 332.33,
      "status": "paid",
      "created_at": "2025-10-22T10:30:00"
    }
  ],
  "splits": {
    "base_price": 997.00,
    "fee": 49.85,
    "commissions": [
      {
        "type": "producer",
        "email": "produtor@exemplo.com",
        "amount": 697.90,
        "release_date": "2025-11-21",
        "released": false
      },
      {
        "type": "affiliate",
        "email": "maria.oliveira@exemplo.com",
        "amount": 249.25,
        "release_date": "2025-11-21",
        "released": false
      }
    ],
    "my_commission": 697.90,
    "release_date": "2025-11-21",
    "released": false
  },
  "refund": null,
  "checkout": {
    "url": "https://checkout.b4you.com.br/850e8400-e29b-41d4-a716-446655440005?b4f=a50e8400-e29b-41d4-a716-446655440007",
    "url_3_steps": "https://checkout.b4you.com.br/850e8400-e29b-41d4-a716-446655440005/3steps?b4f=a50e8400-e29b-41d4-a716-446655440007"
  },
  "tracking": {
    "code": null,
    "url": null,
    "company": null,
    "price": null
  },
  "marketplace": null
}
```

### 2. Compra Aprovada (Pix)

```json
{
  "event_name": "approved-payment",
  "sale_id": "c50e8400-e29b-41d4-a716-446655440009",
  "group_id": "d50e8400-e29b-41d4-a716-446655440010",
  "status": "paid",
  "payment_method": "pix",
  "installments": 1,
  "card": null,
  "pix": {
    "code": "00020126580014br.gov.bcb.pix...",
    "url": "https://exemplo.com/qrcode/pix123.png"
  },
  "billet": null,
  "created_at": "2025-10-22T14:20:00",
  "updated_at": "2025-10-22T14:25:00",
  "paid_at": "2025-10-22T14:25:00",
  "type": "main",
  "product": {
    "id": "e50e8400-e29b-41d4-a716-446655440011",
    "name": "Mentoria Individual",
    "logo": "https://exemplo.com/mentoria-logo.png",
    "cover": "https://exemplo.com/mentoria-capa.jpg",
    "dimensions": null,
    "offer_image": null
  },
  "products": [],
  "offer": {
    "id": "f50e8400-e29b-41d4-a716-446655440012",
    "name": "Mentoria 6 Meses",
    "quantity": 1,
    "original_price": 2997.00
  },
  "customer": {
    "id": "050e8400-e29b-41d4-a716-446655440013",
    "full_name": "Ana Paula Ferreira",
    "email": "ana.ferreira@exemplo.com",
    "whatsapp": "11988776655",
    "document_number": "98765432100",
    "address": null
  },
  "coupon": null,
  "affiliate": null,
  "tracking_parameters": {
    "src": null,
    "sck": null,
    "utm_source": "instagram",
    "utm_medium": "stories",
    "utm_campaign": "lancamento_mentoria",
    "utm_content": null,
    "utm_term": null
  },
  "subscription": null,
  "charges": [
    {
      "id": "150e8400-e29b-41d4-a716-446655440014",
      "amount": 2997.00,
      "status": "paid",
      "created_at": "2025-10-22T14:20:00"
    }
  ],
  "splits": {
    "base_price": 2997.00,
    "fee": 149.85,
    "commissions": [
      {
        "type": "producer",
        "email": "produtor@exemplo.com",
        "amount": 2847.15,
        "release_date": "2025-11-21",
        "released": false
      }
    ],
    "my_commission": 2847.15,
    "release_date": "2025-11-21",
    "released": false
  },
  "refund": null,
  "checkout": {
    "url": "https://checkout.b4you.com.br/f50e8400-e29b-41d4-a716-446655440012",
    "url_3_steps": "https://checkout.b4you.com.br/f50e8400-e29b-41d4-a716-446655440012/3steps"
  },
  "tracking": {
    "code": null,
    "url": null,
    "company": null,
    "price": null
  },
  "marketplace": null
}
```

### 3. Assinatura Aprovada (Recorrência)

```json
{
  "event_name": "approved-payment",
  "sale_id": "250e8400-e29b-41d4-a716-446655440015",
  "group_id": "350e8400-e29b-41d4-a716-446655440016",
  "status": "paid",
  "payment_method": "card",
  "installments": 1,
  "card": [
    {
      "brand": "mastercard",
      "last_four_digits": "5678"
    }
  ],
  "pix": null,
  "billet": null,
  "created_at": "2025-10-22T09:00:00",
  "updated_at": "2025-10-22T09:05:00",
  "paid_at": "2025-10-22T09:05:00",
  "type": "subscription",
  "product": {
    "id": "450e8400-e29b-41d4-a716-446655440017",
    "name": "Plataforma De Cursos Premium",
    "logo": "https://exemplo.com/plataforma-logo.png",
    "cover": "https://exemplo.com/plataforma-capa.jpg",
    "dimensions": null,
    "offer_image": null
  },
  "products": [],
  "offer": {
    "id": "550e8400-e29b-41d4-a716-446655440018",
    "name": "Assinatura Mensal Premium",
    "quantity": 1,
    "original_price": 97.00
  },
  "customer": {
    "id": "650e8400-e29b-41d4-a716-446655440019",
    "full_name": "Carlos Eduardo Souza",
    "email": "carlos.souza@exemplo.com",
    "whatsapp": "11977665544",
    "document_number": "11122233344",
    "address": null
  },
  "coupon": {
    "name": "PRIMEIRAASSINATURA",
    "amount": 10,
    "type": "percentage"
  },
  "affiliate": null,
  "tracking_parameters": {
    "src": "google",
    "sck": "ads_conversion_001",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "assinatura_premium",
    "utm_content": "anuncio_search",
    "utm_term": "curso_online"
  },
  "subscription": {
    "id": "750e8400-e29b-41d4-a716-446655440020",
    "start_date": "2025-10-22T09:05:00",
    "next_charge": "2025-11-22T09:05:00",
    "status": "active",
    "plan": {
      "id": "850e8400-e29b-41d4-a716-446655440021",
      "name": "Plano Mensal",
      "frequency": "Mensal"
    }
  },
  "charges": [
    {
      "id": "950e8400-e29b-41d4-a716-446655440022",
      "amount": 87.30,
      "status": "paid",
      "created_at": "2025-10-22T09:00:00"
    }
  ],
  "splits": {
    "base_price": 87.30,
    "fee": 4.37,
    "commissions": [
      {
        "type": "producer",
        "email": "produtor@exemplo.com",
        "amount": 82.93,
        "release_date": "2025-11-21",
        "released": false
      }
    ],
    "my_commission": 82.93,
    "release_date": "2025-11-21",
    "released": false
  },
  "refund": null,
  "checkout": {
    "url": "https://checkout.b4you.com.br/550e8400-e29b-41d4-a716-446655440018",
    "url_3_steps": "https://checkout.b4you.com.br/550e8400-e29b-41d4-a716-446655440018/3steps"
  },
  "tracking": {
    "code": null,
    "url": null,
    "company": null,
    "price": null
  },
  "marketplace": null
}
```

### 4. Reembolso

```json
{
  "event_name": "refund",
  "sale_id": "a50e8400-e29b-41d4-a716-446655440023",
  "group_id": "b50e8400-e29b-41d4-a716-446655440024",
  "status": "refunded",
  "payment_method": "card",
  "installments": 1,
  "card": [
    {
      "brand": "elo",
      "last_four_digits": "9012"
    }
  ],
  "pix": null,
  "billet": null,
  "created_at": "2025-10-15T11:20:00",
  "updated_at": "2025-10-22T15:30:00",
  "paid_at": "2025-10-15T11:25:00",
  "type": "main",
  "product": {
    "id": "c50e8400-e29b-41d4-a716-446655440025",
    "name": "Workshop Ao Vivo",
    "logo": "https://exemplo.com/workshop-logo.png",
    "cover": "https://exemplo.com/workshop-capa.jpg",
    "dimensions": null,
    "offer_image": null
  },
  "products": [],
  "offer": {
    "id": "d50e8400-e29b-41d4-a716-446655440026",
    "name": "Ingresso Workshop",
    "quantity": 1,
    "original_price": 497.00
  },
  "customer": {
    "id": "e50e8400-e29b-41d4-a716-446655440027",
    "full_name": "Fernanda Costa Lima",
    "email": "fernanda.lima@exemplo.com",
    "whatsapp": "11966554433",
    "document_number": "55566677788",
    "address": null
  },
  "coupon": null,
  "affiliate": null,
  "tracking_parameters": {
    "src": null,
    "sck": null,
    "utm_source": null,
    "utm_medium": null,
    "utm_campaign": null,
    "utm_content": null,
    "utm_term": null
  },
  "subscription": null,
  "charges": [
    {
      "id": "f50e8400-e29b-41d4-a716-446655440028",
      "amount": 497.00,
      "status": "refunded",
      "created_at": "2025-10-15T11:20:00"
    }
  ],
  "splits": {
    "base_price": 497.00,
    "fee": 24.85,
    "commissions": [
      {
        "type": "producer",
        "email": "produtor@exemplo.com",
        "amount": 472.15,
        "release_date": "2025-11-14",
        "released": false
      }
    ],
    "my_commission": 472.15,
    "release_date": "2025-11-14",
    "released": false
  },
  "refund": {
    "reason": "Cliente solicitou reembolso dentro do prazo de garantia",
    "created_at": "2025-10-22T15:30:00",
    "status": "completed"
  },
  "checkout": {
    "url": "https://checkout.b4you.com.br/d50e8400-e29b-41d4-a716-446655440026",
    "url_3_steps": "https://checkout.b4you.com.br/d50e8400-e29b-41d4-a716-446655440026/3steps"
  },
  "tracking": {
    "code": null,
    "url": null,
    "company": null,
    "price": null
  },
  "marketplace": null
}
```

### 5. Carrinho Abandonado

```json
{
  "event_name": "abandoned-cart",
  "sale_id": null,
  "group_id": null,
  "status": null,
  "payment_method": null,
  "installments": null,
  "card": null,
  "pix": null,
  "billet": null,
  "created_at": "2025-10-22T16:45:00",
  "updated_at": "2025-10-22T16:45:00",
  "paid_at": null,
  "type": null,
  "product": {
    "id": "050e8400-e29b-41d4-a716-446655440029",
    "name": "E-book Definitivo De Vendas",
    "logo": "https://exemplo.com/ebook-vendas-logo.png",
    "cover": "https://exemplo.com/ebook-vendas-capa.jpg",
    "offer_image": null
  },
  "customer": {
    "full_name": "Roberto Almeida Silva",
    "email": "roberto.almeida@exemplo.com",
    "whatsapp": "11955443322",
    "document_number": "99988877766",
    "address": null
  },
  "affiliate": {
    "b4f": "150e8400-e29b-41d4-a716-446655440030"
  },
  "checkout": {
    "url": "https://checkout.b4you.com.br/250e8400-e29b-41d4-a716-446655440031?b4f=150e8400-e29b-41d4-a716-446655440030",
    "url_3_steps": "https://checkout.b4you.com.br/250e8400-e29b-41d4-a716-446655440031?b4f=150e8400-e29b-41d4-a716-446655440030",
    "price": 97.00
  },
  "offer": {
    "id": "250e8400-e29b-41d4-a716-446655440031",
    "name": "E-book + Planilhas",
    "quantity": 1,
    "original_price": 97.00
  },
  "tracking_parameters": {
    "src": null,
    "sck": null,
    "utm_source": null,
    "utm_medium": null,
    "utm_campaign": null,
    "utm_content": null,
    "utm_term": null
  },
  "subscription": null,
  "charges": null,
  "splits": null,
  "refund": null
}
```

### 6. Boleto Gerado

```json
{
  "event_name": "generated-billet",
  "sale_id": "350e8400-e29b-41d4-a716-446655440032",
  "group_id": "450e8400-e29b-41d4-a716-446655440033",
  "status": "pending",
  "payment_method": "billet",
  "installments": 1,
  "card": null,
  "pix": null,
  "billet": {
    "url": "https://exemplo.com/boleto/123456.pdf",
    "line_code": "23793381286000000019770001001234567890"
  },
  "created_at": "2025-10-22T17:10:00",
  "updated_at": "2025-10-22T17:10:00",
  "paid_at": null,
  "type": "main",
  "product": {
    "id": "550e8400-e29b-41d4-a716-446655440034",
    "name": "Treinamento Completo Excel",
    "logo": "https://exemplo.com/excel-logo.png",
    "cover": "https://exemplo.com/excel-capa.jpg",
    "dimensions": null,
    "offer_image": null
  },
  "products": [],
  "offer": {
    "id": "650e8400-e29b-41d4-a716-446655440035",
    "name": "Treinamento Excel Básico Ao Avançado",
    "quantity": 1,
    "original_price": 197.00
  },
  "customer": {
    "id": "750e8400-e29b-41d4-a716-446655440036",
    "full_name": "Patricia Gomes Rodrigues",
    "email": "patricia.gomes@exemplo.com",
    "whatsapp": "11944332211",
    "document_number": "12312312300",
    "address": null
  },
  "coupon": null,
  "affiliate": null,
  "tracking_parameters": {
    "src": null,
    "sck": null,
    "utm_source": "email",
    "utm_medium": "newsletter",
    "utm_campaign": "excel_outubro",
    "utm_content": null,
    "utm_term": null
  },
  "subscription": null,
  "charges": [
    {
      "id": "850e8400-e29b-41d4-a716-446655440037",
      "amount": 197.00,
      "status": "pending",
      "created_at": "2025-10-22T17:10:00"
    }
  ],
  "splits": {
    "base_price": 197.00,
    "fee": 9.85,
    "commissions": [
      {
        "type": "producer",
        "email": "produtor@exemplo.com",
        "amount": 187.15,
        "release_date": "2025-11-21",
        "released": false
      }
    ],
    "my_commission": 187.15,
    "release_date": "2025-11-21",
    "released": false
  },
  "refund": null,
  "checkout": {
    "url": "https://checkout.b4you.com.br/650e8400-e29b-41d4-a716-446655440035",
    "url_3_steps": "https://checkout.b4you.com.br/650e8400-e29b-41d4-a716-446655440035/3steps"
  },
  "tracking": {
    "code": null,
    "url": null,
    "company": null,
    "price": null
  },
  "marketplace": null
}
```

### 7. Rastreio Atualizado

```json
{
  "event_name": "tracking",
  "sale_id": "950e8400-e29b-41d4-a716-446655440038",
  "group_id": "a60e8400-e29b-41d4-a716-446655440039",
  "status": "paid",
  "payment_method": "card",
  "installments": 2,
  "card": [
    {
      "brand": "visa",
      "last_four_digits": "3456"
    }
  ],
  "pix": null,
  "billet": null,
  "created_at": "2025-10-18T08:30:00",
  "updated_at": "2025-10-22T18:00:00",
  "paid_at": "2025-10-18T08:35:00",
  "type": "main",
  "product": {
    "id": "b60e8400-e29b-41d4-a716-446655440040",
    "name": "Kit De Livros Físicos",
    "logo": "https://exemplo.com/livros-logo.png",
    "cover": "https://exemplo.com/livros-capa.jpg",
    "dimensions": {
      "weight": 2.5,
      "height": 25,
      "width": 20,
      "length": 5
    },
    "offer_image": null
  },
  "products": [],
  "offer": {
    "id": "c60e8400-e29b-41d4-a716-446655440041",
    "name": "Kit 3 Livros + Marcadores",
    "quantity": 1,
    "original_price": 247.00
  },
  "customer": {
    "id": "d60e8400-e29b-41d4-a716-446655440042",
    "full_name": "Lucas Henrique Martins",
    "email": "lucas.martins@exemplo.com",
    "whatsapp": "11933221100",
    "document_number": "45645645600",
    "address": {
      "street": "Avenida Paulista",
      "number": "1000",
      "complement": "Bloco B",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "zipcode": "01310100",
      "country": "BR"
    }
  },
  "coupon": null,
  "affiliate": null,
  "tracking_parameters": {
    "src": null,
    "sck": null,
    "utm_source": null,
    "utm_medium": null,
    "utm_campaign": null,
    "utm_content": null,
    "utm_term": null
  },
  "subscription": null,
  "charges": [
    {
      "id": "e60e8400-e29b-41d4-a716-446655440043",
      "amount": 123.50,
      "status": "paid",
      "created_at": "2025-10-18T08:30:00"
    }
  ],
  "splits": {
    "base_price": 247.00,
    "fee": 12.35,
    "commissions": [
      {
        "type": "producer",
        "email": "produtor@exemplo.com",
        "amount": 234.65,
        "release_date": "2025-11-17",
        "released": false
      }
    ],
    "my_commission": 234.65,
    "release_date": "2025-11-17",
    "released": false
  },
  "refund": null,
  "checkout": {
    "url": "https://checkout.b4you.com.br/c60e8400-e29b-41d4-a716-446655440041",
    "url_3_steps": "https://checkout.b4you.com.br/c60e8400-e29b-41d4-a716-446655440041/3steps"
  },
  "tracking": {
    "code": "BR123456789BR",
    "url": "https://rastreamento.correios.com.br/BR123456789BR",
    "company": "Correios",
    "price": 25.50
  },
  "marketplace": null
}
```

### 8. Solicitação de Afiliação

```json
{
  "event_name": "affiliate-request",
  "affiliate": {
    "name": "Pedro Augusto Mendes",
    "email": "pedro.mendes@exemplo.com",
    "phone": "11922110099"
  },
  "product": {
    "id": 12345,
    "name": "Curso De Copywriting"
  }
}
```

### 9. Afiliação Aprovada

```json
{
  "event_name": "approved-affiliate",
  "affiliate": {
    "name": "Juliana Santos Costa",
    "email": "juliana.santos@exemplo.com",
    "phone": "11911009988"
  },
  "product": {
    "id": 12346,
    "name": "Treinamento De Lançamentos"
  }
}
```

### 10. Afiliação Recusada

```json
{
  "event_name": "refused-affiliate",
  "affiliate": {
    "name": "Ricardo Ferreira Lima",
    "email": "ricardo.ferreira@exemplo.com",
    "phone": "11900998877"
  },
  "product": {
    "id": 12347,
    "name": "Mentoria Executiva"
  }
}
```

---

## 🛒 Marketplace

O campo `marketplace` é utilizado para vendas provenientes da **Shopify**, permitindo o detalhamento de múltiplos itens em uma única transação.

### Estrutura do Marketplace

Quando uma venda contém produtos configurados como marketplace, o webhook incluirá um array `marketplace` com os detalhes de cada item:

```json
{
  "marketplace": [
    {
      "id": "variant_123",
      "quantity": 2,
      "price": 49.90,
      "price_total": 99.80
    },
    {
      "id": "variant_456",
      "quantity": 1,
      "price": 149.90,
      "price_total": 149.90
    },
    {
      "id": "variant_789",
      "quantity": 3,
      "price": 29.90,
      "price_total": 89.70
    }
  ]
}
```

### Campos do Marketplace

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | Identificador do produto/variação da Shopify |
| `quantity` | number | Quantidade de itens comprados |
| `price` | number | Preço unitário do item |
| `price_total` | number | Valor total (price × quantity) |

### Exemplo Completo com Marketplace

```json
{
  "event_name": "approved-payment",
  "sale_id": "f60e8400-e29b-41d4-a716-446655440044",
  "group_id": "g60e8400-e29b-41d4-a716-446655440045",
  "status": "paid",
  "payment_method": "card",
  "installments": 3,
  "card": [
    {
      "brand": "mastercard",
      "last_four_digits": "7890"
    }
  ],
  "pix": null,
  "billet": null,
  "created_at": "2025-10-22T19:15:00",
  "updated_at": "2025-10-22T19:20:00",
  "paid_at": "2025-10-22T19:20:00",
  "type": "main",
  "product": {
    "id": "h60e8400-e29b-41d4-a716-446655440046",
    "name": "Kit Empreendedor Completo",
    "logo": "https://exemplo.com/kit-logo.png",
    "cover": "https://exemplo.com/kit-capa.jpg",
    "dimensions": {
      "weight": 3.8,
      "height": 30,
      "width": 25,
      "length": 10
    },
    "offer_image": "https://exemplo.com/kit-oferta.jpg"
  },
  "products": [],
  "offer": {
    "id": "i60e8400-e29b-41d4-a716-446655440047",
    "name": "Kit Completo: Livros + Cursos + Planilhas",
    "quantity": 1,
    "original_price": 897.00
  },
  "customer": {
    "id": "j60e8400-e29b-41d4-a716-446655440048",
    "full_name": "Mariana Oliveira Rocha",
    "email": "mariana.rocha@exemplo.com",
    "whatsapp": "11988887777",
    "document_number": "32132132100",
    "address": {
      "street": "Rua Augusta",
      "number": "2000",
      "complement": "Casa",
      "neighborhood": "Consolação",
      "city": "São Paulo",
      "state": "SP",
      "zipcode": "01412000",
      "country": "BR"
    }
  },
  "coupon": {
    "name": "KIT10OFF",
    "amount": 10,
    "type": "percentage"
  },
  "affiliate": null,
  "tracking_parameters": {
    "src": "tiktok",
    "sck": "viral_video_001",
    "utm_source": "tiktok",
    "utm_medium": "organic",
    "utm_campaign": "viral_kit_empreendedor",
    "utm_content": "video_001",
    "utm_term": null
  },
  "subscription": null,
  "charges": [
    {
      "id": "k60e8400-e29b-41d4-a716-446655440049",
      "amount": 269.00,
      "status": "paid",
      "created_at": "2025-10-22T19:15:00"
    }
  ],
  "splits": {
    "base_price": 807.30,
    "fee": 40.37,
    "commissions": [
      {
        "type": "producer",
        "email": "produtor@exemplo.com",
        "amount": 565.11,
        "release_date": "2025-11-21",
        "released": false
      },
      {
        "type": "co-producer",
        "email": "coprodutor@exemplo.com",
        "amount": 201.82,
        "release_date": "2025-11-21",
        "released": false
      }
    ],
    "my_commission": 565.11,
    "release_date": "2025-11-21",
    "released": false
  },
  "refund": null,
  "checkout": {
    "url": "https://checkout.b4you.com.br/i60e8400-e29b-41d4-a716-446655440047",
    "url_3_steps": "https://checkout.b4you.com.br/i60e8400-e29b-41d4-a716-446655440047/3steps"
  },
  "tracking": {
    "code": null,
    "url": null,
    "company": null,
    "price": 35.00
  },
  "marketplace": [
    {
      "id": "var_livro_gestao_001",
      "quantity": 2,
      "price": 89.90,
      "price_total": 179.80
    },
    {
      "id": "var_curso_marketing_002",
      "quantity": 1,
      "price": 297.00,
      "price_total": 297.00
    },
    {
      "id": "var_planilhas_financas_003",
      "quantity": 3,
      "price": 49.90,
      "price_total": 149.70
    },
    {
      "id": "var_ebook_vendas_004",
      "quantity": 1,
      "price": 97.00,
      "price_total": 97.00
    },
    {
      "id": "var_templates_design_005",
      "quantity": 1,
      "price": 67.00,
      "price_total": 67.00
    }
  ]
}
```

### Observações Importantes

- O campo `marketplace` será `null` quando a oferta não tiver produtos da Shopify
- Os IDs (`id`) são os identificadores originais dos produtos/variações da Shopify
- Os preços no marketplace já consideram descontos e cupons aplicados
- O `price_total` é sempre calculado como `price × quantity`, arredondado para 2 casas decimais

---

**© 2025 B4You - Todos os direitos reservados**

