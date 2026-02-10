---
title: Cupons no Checkout B4You
---

# Cupons no Checkout B4You

Esta documentação descreve a **lógica de validação, aplicação e rastreabilidade de cupons** no Checkout da B4You.

---

## Resumo Rápido

- A lógica de cupons é centrada no modelo `coupons`, que define valores, regras de uso e metadados.
- O checkout utiliza **cache + validações online** para garantir que apenas cupons válidos sejam aplicados.
- Após a aplicação, descontos são **rateados entre itens**, fretes podem ser zerados e o uso é registrado para evitar reaplicações indevidas.

---

## 1. Modelo de Dados

| Campo | Função |
| --- | --- |
| coupon | Código digitado no checkout |
| percentage / amount | Percentual ou valor fixo (em reais) - **apenas um deve existir** |
| payment_methods | Meios aceitos (`card`, `pix`, `billet`) |
| active, expires_at | Controlam validade do cupom |
| min_amount, min_items | Restrições mínimas da cesta |
| free_shipping | Força custo de frete zero |
| first_sale_only | Permite uso apenas na primeira compra |
| single_use_by_client | Bloqueia reuso por CPF/CNPJ |
| override_cookie | Ignora cookies de afiliado existentes |
| id_affiliate | Vincula afiliado específico |
| apply_on_every_charge | Intenção de reaplicação em renovações |

---

## 2. Como o Checkout Encontra e Valida Cupons

1. **Oferta precisa permitir cupons (`allow_coupon`)**  
   Ao montar a resposta do checkout, validamos se o produto aceita cupons.

2. **Endpoint de verificação**  
   `GET /offers/:offer_id/coupon/:coupon`  
   Retorna os metadados do cupom e valida restrições por CPF/CNPJ.

3. **Busca consolidada ao fechar pedido**  
   O método `findCoupon`:
   - tenta cache (`coupon_<code>_<id_product>`)
   - valida expiração
   - valida meio de pagamento
   - persiste se passar em todas as regras

---

## 3. Regras de Aplicação e Cálculo do Desconto

- **Validação financeira adicional**  
  Antes do cálculo de taxas, validamos:
  - valor mínimo
  - quantidade mínima
  - CPF/CNPJ (reuso)

- **Frete gratuito**  
  Quando ativo, força frete zero em todos os itens.

- **Percentual vs Valor fixo**
  - Percentual: aplicado sobre `price` ou `subscription_fee`
  - Valor fixo: rateado entre os itens (`amount / sales_items.length`)

- **Taxa de assinatura**  
  Cupons também reduzem `subscription_fee`.

---

## 4. Fluxos por Meio de Pagamento

### Cartão de Crédito

- `payment_method = 'card'`
- Uso registrado em `coupons_use`
- Persistência em `coupons_sales`
- Order bumps entram no rateio

---

### Pix e Boleto

- Mesmo fluxo de validação
- Uso registrado mesmo com pagamento pendente
- `paid = false` em `coupons_sales`

---

### Assinaturas

- Cupons podem zerar frete de order bumps físicos
- Associados à subscription criada
- Para PIX, garantimos registro mesmo pendente

---

## 5. Registro e Rastreabilidade

- **coupons_sales**  
  Guarda vínculo cupom ↔ venda, valor abatido e status de pagamento

- **coupons_use**  
  Persiste CPF/CNPJ para bloqueio de reuso

- **Redis Cache**  
  Acelera validações, mas é invalidado ao detectar expiração

---

## 6. Boas Práticas ao Configurar Cupons

- Garanta que `payment_methods` reflita os meios ativos no checkout
- Configure `min_amount` e `min_items` para evitar descontos indevidos
- Combine `first_sale_only` e `single_use_by_client` em campanhas de aquisição
- Ative `override_cookie` para cupons de afiliado prioritário
- Monitore impacto de cupons fixos no `MIN_PRICE`

---

## Checklist Rápido de Debug

- Cupom não aparece → verifique `allow_coupon` e `active`
- Cupom inválido/vencido → valide `expires_at`, `payment_methods` e cache
- Desconto incorreto → inspecione `coupons_sales` e `Fees.js`
- Cliente não consegue reutilizar → verifique `coupons_use`

---

> ⚠️ Alterações nessa lógica impactam diretamente preço final, comissão e receita.  
> Toda mudança deve ser documentada e validada cuidadosamente.