---
title: Upsell Nativo - Nível Oferta
---

# Upsell Nativo - Oferta

Este documento descreve o funcionamento do **Upsell Nativo no nível de Oferta**, utilizado para **sobrescrever** ou **especializar** o comportamento definido no Produto.

---

## 1. Conceito

O Upsell Nativo por Oferta permite:

- Customizar a experiência de upsell para uma oferta específica
- Substituir textos, imagens ou comportamento
- Criar exceções pontuais de conversão

📌 **Importante:**  
O upsell de Oferta **sempre tem prioridade** sobre o upsell de Produto.

---

## 2. Modelo de Dados

Entidade principal: `upsell_native_offer`

Campos relevantes:
- `offer_id`
- `product_id`
- `is_one_click`
- `media_url`
- `media_embed`
- Flags de comportamento

---

## 3. Regras de Prioridade

1. Upsell da Oferta
2. Upsell do Produto
3. Nenhum Upsell

Essa ordem é **estritamente respeitada** pelo Checkout.

---

## 4. Fluxo de Resolução

1. Checkout consulta upsell por oferta
2. Se existir → aplica
3. Se não existir → consulta upsell do produto
4. Se não existir → segue fluxo padrão

---

## 5. Ownership e Segurança

- Toda oferta pertence a um produto
- Toda ação valida:
  - usuário → produto → oferta
- Não é permitido configurar upsell em ofertas de terceiros

---

## 6. Observações Importantes

- O uso excessivo de upsell por oferta aumenta complexidade
- Preferir Produto como configuração base
- Usar Oferta apenas para exceções reais

---

> ⚠️ Este nível deve ser usado com cautela, pois sobrescreve regras globais.