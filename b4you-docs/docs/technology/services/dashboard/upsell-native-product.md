---
title: Upsell Nativo - Nível Produto
---

# Upsell Nativo - Produto

Este documento descreve o funcionamento do **Upsell Nativo no nível de Produto**, que representa a **configuração base** aplicada a todas as ofertas associadas a um produto.

---

## 1. Conceito

O Upsell Nativo em nível de Produto define:

- Se o upsell está ativo ou não
- A experiência visual padrão
- O comportamento default de aceitação/recusa
- As regras de fallback para ofertas

📌 **Importante:**  
Configurações de Produto **podem ser sobrescritas** por configurações de Oferta.

---

## 2. Modelo de Dados

Entidade principal: `upsell_native_product`

Campos relevantes:
- `product_id`
- `is_one_click`
- `is_multi_offer`
- `media_url`
- `media_embed`
- Configurações visuais e textos

---

## 3. Regras de Negócio

- Um Produto pode ter **no máximo um Upsell Nativo**
- A ativação é **idempotente**
- O estado ativo real é controlado por `products.is_upsell_active`
- O upsell de Produto é utilizado como **fallback** quando:
  - A oferta não possui upsell próprio
  - A oferta herda configuração

---

## 4. Fluxo de Ativação

1. Usuário ativa Upsell no Produto
2. Backend valida ownership do produto
3. Registro de upsell é criado (ou reutilizado)
4. Produto é marcado como `is_upsell_active = true`
5. Estado é retornado via GET

📌 A Dashboard **não assume estado local**.  
A fonte da verdade é sempre o backend.

---

## 5. Integração com o Checkout

O Checkout:
- Consulta upsell por oferta
- Caso não exista, consulta upsell do produto
- Aplica a configuração retornada

---

## 6. Falhas e Fallback

- Se não existir upsell no Produto → comportamento padrão
- Se existir mas estiver inativo → não renderiza upsell
- Dados inconsistentes são tratados como `upsell inexistente`

---

> ⚠️ Alterações nesse nível afetam **todas as ofertas do produto**.