---
title: Delivery Contract (Thank You Page)
---

# Delivery Contract (Thank You Page)

Este documento descreve o **contrato oficial de dados** retornado pelo endpoint de **pós-compra (Thank You Page)** do Checkout da B4You.

Ele é a **referência única e obrigatória** para qualquer consumo do endpoint `/delivery/:sale_item_id`, garantindo:

* Compatibilidade com o front legado
* Evolução segura do checkout moderno
* Clareza entre dados de **produto**, **oferta**, **plano** e **upsell**

---

## 1. Endpoint

```
GET /delivery/:sale_item_id
```

### Parâmetros

| Campo        | Tipo | Descrição                                           |
| ------------ | ---- | --------------------------------------------------- |
| sale_item_id | UUID | Identificador do `sale_item` principal ou de upsell |

---

## 2. Finalidade do Endpoint

O endpoint de Delivery tem como objetivo:

* Fornecer **resumo final da compra**
* Alimentar a **Thank You Page**
* Disparar **pixels de conversão**
* Informar **redirecionamento de membership**, quando aplicável

📌 **Importante:**
Este endpoint **não decide regras de negócio**. Ele apenas **materializa o estado final da venda**.

---

## 3. Conceitos Importantes

### 3.1 Sale vs SaleItem

* **Sale**

  * Representa a transação lógica do usuário
  * Agrupa um ou mais `sale_items`

* **SaleItem**

  * Representa cada item comprado
  * Pode ser:

    * Produto principal
    * Upsell
    * Plano

📌 Upsell **não cria uma nova Sale**, apenas um novo `sale_item`.

---

## 4. Estrutura Geral do Payload

```json
{
  "uuid": "<sale_item_uuid>",
  "total": 198.48,
  "payment_method": "card",
  "products": [ ... ],
  "student": { ... },
  "membership_redirect": "https://...",
  "physical": false,

  "delivery_context": { ... }
}
```

---

## 5. Campos de Topo (Contrato Legado)

⚠️ **Estes campos são LEGADOS e não podem ser removidos sem versionamento.**

### 5.1 uuid

UUID do `sale_item` utilizado como referência do delivery.

---

### 5.2 total

Valor total pago considerando **apenas itens pagos**.

---

### 5.3 payment_method

Método de pagamento do item principal.

Valores possíveis:

* `card`
* `pix`
* `billet`

---

### 5.4 products (LEGADO)

Lista simplificada de itens da venda.

```json
{
  "name": "Produto X",
  "uuid": "...",
  "payment": {
    "amount": 99.90,
    "payment_method": "card",
    "status": { ... }
  },
  "type": "main | upsell",
  "pixels": { ... },
  "id_type": 1
}
```

📌 **Observação:**

* Este array existe por compatibilidade
* Ele **não diferencia oferta, plano ou contexto avançado**

---

### 5.5 student

```json
{
  "full_name": "Nome do Aluno",
  "email": "email@exemplo.com"
}
```

---

### 5.6 membership_redirect

URL de redirecionamento para área de membros, quando aplicável.

---

### 5.7 physical

Indica se o item principal é físico.

---

## 6. delivery_context (EXTENSÃO MODERNA)

Este bloco **não substitui** o payload legado.

Ele existe para:

* Diferenciar **produto x oferta x plano**
* Suportar múltiplos itens
* Permitir evolução sem quebrar contratos antigos

```json
"delivery_context": {
  "sale_item": { ... },
  "product": { ... },
  "offer": { ... },
  "plan": { ... }
}
```

---

### 6.1 sale_item

```json
{
  "uuid": "...",
  "is_upsell": true,
  "quantity": 1,
  "payment_method": "card"
}
```

---

### 6.2 product

```json
{
  "id": 124,
  "uuid": "...",
  "name": "Produto Base",
  "cover": "https://..."
}
```

---

### 6.3 offer

```json
{
  "id": 97,
  "uuid": "Dqt1NhfE2m",
  "name": "Oferta Especial",
  "price": 198.48
}
```

📌 Pode ser `null` quando a venda não está vinculada a uma oferta.

---

### 6.4 plan

```json
{
  "id": 90,
  "uuid": "...",
  "label": "Plano Anual",
  "frequency_label": "anual"
}
```

📌 Presente apenas em vendas com plano.

---

## 7. Regras de Compatibilidade

* ❌ Não remover campos legados
* ❌ Não alterar formato de `products`
* ✅ Novos dados devem entrar via `delivery_context`
* ✅ Campos opcionais devem ser `null`, nunca ausentes

---

## 8. Casos de Uso Suportados

* Venda simples
* Venda com múltiplos itens
* Venda + upsell
* Upsell com oferta diferente do produto base
* Upsell com plano

---

## 9. Anti-padrões

❌ Inferir tipo de venda apenas por `products`
❌ Assumir que `products[0]` representa a oferta
❌ Hardcode de labels no frontend

---

## 10. Considerações Finais

O contrato de Delivery é **crítico para conversão, tracking e pós-compra**.

Qualquer alteração deve:

* Preservar compatibilidade
* Ser documentada neste arquivo
* Ser validada em sandbox

> ⚠️ Mudanças sem contrato geram regressões silenciosas e impacto financeiro.