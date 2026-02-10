---
title: Guia de Testes – API de Checkout Multi Adquirência
---

> ⚠️ Todos os testes descritos neste documento devem ser executados **preferencialmente em ambiente sandbox**.

# Guia de Testes – API de Checkout Multi Adquirência

Este documento descreve o **guia oficial de testes da API de Checkout com multi-adquirência**, cobrindo fluxos de pagamento, upsell, assinaturas, cupons, afiliados e cálculo financeiro.

Ele deve ser utilizado por **desenvolvedores, QA e times de integração** para validação funcional e regressão.

---

## 🔧 Úteis

### Variável de Ambiente

```bash
{{linkMultiAdquirencia}} = https://sandbox-api.b4you.com.br
```

---

## 🔗 Rotas de Teste (cURL)

### `/payment/card`

Rota responsável por processar a venda via **cartão de crédito**.

```bash
curl --location '{{linkMultiAdquirencia}}/payment/card' --header 'Content-Type: application/json' --data-raw '{
  "full_name": "Keith Barton",
  "email": "Albina96@hotmail.com",
  "document_number": "80107929007",
  "whatsapp": "(61) 98741-1223",
  "address": {
    "zipcode": "68906456",
    "street": "Rua Raimundo Coutinho",
    "number": "123",
    "complement": "",
    "neighborhood": "Marabaixo",
    "city": "Macapá",
    "state": "AP"
  },
  "card": {
    "card_number": "4000000000000010",
    "card_holder": "Louise Liz Castro",
    "expiration_date": "11/33",
    "cvv": "923",
    "installments": "1"
  },
  "offer_id": "rNHl12XPpA",
  "order_bumps": [
    "ec6b3828-f74b-4f59-9013-766f53142d57"
  ],
  "sessionID": "FGa4VpQ0w8bfttMiNQCQ8",
  "visitorId": "b2427d7106c1237607017e853a2eef09-77902be2-399d-4e67-ad90-ba8a0344e700",
  "coupon": null,
  "cartId": null,
  "b4f": null,
  "payment_method": "card",
  "integration_shipping_price": null,
  "integration_shipping_company": null
}'
```

---

### `/upsell/card`

Rota responsável por processar **vendas de upsell**.

```bash
curl --location '{{linkMultiAdquirencia}}/upsell/card' --header 'Content-Type: application/json' --data-raw '{
  "offer_id": "rNHl12XPpA",
  "sale_item_id": "768a1408-5911-4440-b247-52010ea0219d",
  "installments": "1",
  "payment_method": "credit_card",
  "card": {
    "card_number": "",
    "card_holder": "",
    "expiration_date": "",
    "cvv": ""
  },
  "plan_id": 123
}'
```

> ℹ️ O objeto `card` é opcional.  
> Caso não seja informado, será utilizado o cartão previamente vinculado ao cliente.

---

## 📦 Campos Obrigatórios por Rota

### `/payment/card`

- full_name  
- email  
- document_number  
- whatsapp  
- address  
- address.zipcode  
- address.street  
- address.number  
- address.neighborhood  
- address.city  
- address.state  
- card  
- card.card_number  
- card.card_holder  
- card.expiration_date  
- card.cvv  
- card.installments  
- offer_id  
- order_bumps  
- sessionID  
- visitorId  
- b4f  
- payment_method  
- integration_shipping_price  
- integration_shipping_company  

---

### `/upsell/card`

- offer_id  
- sale_item_id  
- installments  
- payment_method  
- card (opcional)  
- card.card_number  
- card.card_holder  
- card.expiration_date  
- card.cvv  
- plan_id  

---

## 🧪 Cenários de Teste Obrigatórios

O usuário deve ser capaz de:

- Efetuar a compra de um produto único (físico ou digital)
- Efetuar a compra de uma assinatura (pagamento recorrente)
- Efetuar compra com **order bump** (produto único ou assinatura)
- Efetuar compra de **upsell** com:
  - cartão novo
  - cartão já vinculado
- Receber acesso ao produto digital após aprovação
- Utilizar cupons válidos e dentro da vigência
- Efetuar compra com e sem afiliado
- Efetuar compra parcelada (até 12x) com cálculo correto de juros
- Calcular corretamente frete em produtos físicos
- Validar split financeiro no dashboard da Pagar.me
- Validar valor da parcela conforme bandeira do cartão
- Validar retorno e redirecionamento do link de upsell

---

## 🔍 Referência Visual

Checkout atual para comparação:  
https://sandbox-checkout.b4you.com.br/

---

## ✅ Observações Finais

- Este guia deve ser atualizado sempre que:
  - novas adquirentes forem adicionadas
  - regras de parcelamento mudarem
  - lógica de split sofrer alterações
- Utilize este documento como **checklist de regressão** antes de deploys críticos

---

> ⚠️ Este guia valida comportamento funcional e financeiro do checkout.  
> Alterações na API devem ser refletidas imediatamente nesta documentação.