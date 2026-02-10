---
title: Modelo de Dados de Vendas (Sales)
---

# Modelo de Dados de Vendas (Sales)

Este documento descreve o **modelo de dados de vendas** utilizado pelo serviço de Checkout da B4You, detalhando as entidades principais, seus relacionamentos e como elas evoluem ao longo do fluxo de compra e upsell.

O objetivo é garantir **clareza conceitual**, **consistência técnica** e **segurança evolutiva** do domínio de vendas.

---

## 1. Visão Geral do Domínio

O domínio de vendas é composto por três entidades centrais:

```

Sale
├─ SaleItem (1..N)
│    ├─ Product
│    ├─ Offer (opcional)
│    ├─ Plan (opcional)
│    └─ Charge (1..N)
└─ Student

```

📌 **Importante:**  
A entidade **`sale` representa a jornada**,  
enquanto **`sale_item` representa cada item comprado** (principal ou upsell).

---

## 2. Entidade: Sale (`sales`)

A tabela `sales` representa a **venda agregadora**, responsável por agrupar:

- Aluno
- Endereço
- Dados de contato
- Múltiplos itens (`sale_items`)
- Contexto da jornada

### Campos principais

| Campo | Descrição |
|------|----------|
| `id` | Identificador interno |
| `uuid` | Identificador público |
| `id_student` | Aluno associado |
| `id_user` | Produtor |
| `params` | Contexto técnico (IP, agent, etc) |
| `address` | Endereço (JSON) |
| `created_at` | Data de criação |
| `updated_at` | Última atualização |

### Responsabilidades

- Agrupar itens de uma mesma jornada
- Persistir dados do comprador
- Ser o **ponto de consulta** para delivery, tracking e pós-venda

---

## 3. Entidade: SaleItem (`sales_items`)

A tabela `sales_items` representa **cada compra individual** dentro de uma venda.

Ela é utilizada tanto para:
- Produto principal
- Upsell
- Ofertas adicionais
- Planos / assinaturas

### Campos principais

| Campo | Descrição |
|------|----------|
| `id` | Identificador interno |
| `uuid` | Identificador público |
| `id_sale` | Venda associada |
| `id_product` | Produto |
| `id_offer` | Oferta (opcional) |
| `id_plan` | Plano (opcional) |
| `type` | Tipo do item (principal, upsell, etc) |
| `is_upsell` | Flag de upsell |
| `price_total` | Valor final |
| `payment_method` | Método de pagamento |
| `id_status` | Status do item |
| `paid_at` | Data de pagamento |

📌 **Regra de ouro:**  
> Toda cobrança sempre gera **um novo `sale_item`**.

---

## 4. Tipos de SaleItem

O campo `type` define o papel do item dentro da venda.

| Tipo | Descrição |
|-----|----------|
| Produto Principal | Item inicial do checkout |
| Upsell | Item adquirido após pagamento |
| Order Bump | Item adicional no checkout |
| Assinatura | Item recorrente |

A resolução do tipo é feita via `saleItemsTypes`.

---

## 5. Entidade: Product (`products`)

Representa o **produto base** criado na Dashboard.

- É sempre obrigatório em um `sale_item`
- Define tipo de entrega (digital / físico)
- Carrega identidade visual e pixels

Relacionamento:
```

Product 1 ──── N SaleItem

```

---

## 6. Entidade: Offer (`product_offer`)

Representa uma **variação comercial** de um produto.

Uma oferta pode alterar:
- Preço
- Parcelamento
- Métodos de pagamento
- Upsell ativo
- Página de obrigado

Relacionamento:
```

Offer 1 ──── N SaleItem

```

📌 Um `sale_item` **pode existir sem oferta**, mas nunca sem produto.

---

## 7. Entidade: Plan (`product_plans`)

Representa um **plano de pagamento** (geralmente recorrente).

Campos relevantes:
- `payment_frequency`
- `frequency_label`
- `price`
- `subscription_fee`

Relacionamento:
```

Plan 1 ──── N SaleItem

```

📌 Planos só existem quando a oferta suporta recorrência.

---

## 8. Entidade: Charge (`charges`)

Cada cobrança no PSP gera uma entrada em `charges`.

Regras:
- Um `sale_item` pode ter **uma ou mais charges**
- Upsell sempre gera nova charge
- Pix gera charge `pending`
- Cartão gera charge `paid` ou `failed`

Relacionamento:
```

SaleItem 1 ──── N Charge

```

---

## 9. Relação com Upsell

No upsell:

- **A `sale` é reutilizada**
- Um novo `sale_item` é criado
- Uma nova `charge` é criada
- O vínculo é feito via `id_sale`

Fluxo:
```

Sale
├─ SaleItem (principal)
├─ SaleItem (upsell #1)
├─ SaleItem (upsell #2)

```

---

## 10. Compatibilidade com Estrutura Legada

O modelo atual mantém compatibilidade com:

- Front legado
- Integrações externas
- Tracking
- Relatórios financeiros

Por isso:
- `products` continua sendo retornado no delivery
- `sale_item` é abstraído no serializer
- Campos antigos não são removidos

📌 Novos dados entram via **extensões**, nunca por quebra de contrato.

---

## 11. Anti-padrões

❌ Criar charge sem `sale_item`  
❌ Criar venda nova para upsell  
❌ Alterar `sale_item` pago  
❌ Misturar regra de preço no frontend  

---

## 12. Evolução do Modelo

Evoluções previstas:

- Suporte a múltiplos adquirentes
- Materialização de métricas por `sale_item`
- Histórico de tentativas de pagamento
- Auditoria completa por item

---

> ⚠️ O modelo de vendas é **núcleo do negócio**.  
> Qualquer alteração deve preservar histórico, contratos e integridade financeira.