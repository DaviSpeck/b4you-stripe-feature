---
title: api-checkout (resolução de ofertas)
---

## Rotas expostas

- `POST /api/checkout/ecommerce/resolve-offer`
- `GET /api/checkout/ecommerce/config`

## `POST /resolve-offer`: fluxo completo

1. **Valida entrada**: `shop_domain` ou `shop_uuid`, e `cart_data.items`.
2. **Carrega dados da loja** via VIEW (`getCheckoutDataByUuid`/`getCheckoutDataByDomain`) e fallback para query tradicional.
3. **Extrai oferta padrão** da loja (`default_offer`) e prepara `shopIntegration` com configurações e order bumps.
4. **Processa itens do carrinho**:
   - Calcula preço total e quantidade.
   - Normaliza itens (`sku`, `variant_id`, `title`, `price`, `grams`, `image`).
5. **Atualiza catálogo Shopify** por item (`upsertShopifyCatalog`).
6. **Monta oferta dinâmica** (produto container + metadata com `line_items`, `source: ecommerce`, `id_parent_offer`).
7. **Aplica herança** da oferta padrão (`inheritOfferConfig`).
8. **Gera hash determinístico** para identificar ofertas idênticas e evitar duplicação.
9. **Reaproveita ou cria oferta**:
   - Se encontrar hash igual, reutiliza a oferta.
   - Caso contrário, cria uma nova oferta e copia bumps da oferta padrão.
10. **Responde** com `checkoutUrl`, resumo do carrinho e bumps resolvidos.

## Resposta esperada

```json
{
  "success": true,
  "offer": {
    "id": 123,
    "uuid": "uuid-oferta",
    "name": "Produto X",
    "price": "99.00"
  },
  "checkoutUrl": "https://checkout.b4you.com.br/uuid-oferta/3Steps",
  "bumps": [],
  "cart_summary": {
    "total_items": 1,
    "total": "99.00"
  }
}
```

## `GET /config`

Retorna um resumo da loja (uuid, nome, config e status) a partir de `shop_domain` ou `shop_uuid`.

## Catálogo e rastreio de vendas

O controller de catálogo (`database/controllers/shopify_catalog.js`) faz:

- **Upsert do catálogo** a cada resolução de oferta (registrando `times_seen`, preço, SKU, vendor etc.).
- **Registro de compra** por SKU/variant após venda confirmada (`recordEcommerceSaleIfApplicable`).
- **Incremento de métricas** (quantidade vendida, receita, última compra).

## Registro de venda (PIX/Boleto)

No fluxo de venda, quando o pagamento é confirmado, o `salePixStatusController` e o `saleBilletStatusController` chamam `recordEcommerceSaleIfApplicable` para registrar a venda no catálogo com idempotência via cache.

## Evolução esperada

- **Ampliação do catálogo**: armazenar mais atributos de produto para relatórios (ex.: tags, coleções, status de estoque).
- **Observabilidade de resolução**: métricas de latência, taxa de cache hit por hash e erros de catalog upsert.
- **Normalização de preços**: padronizar o cálculo de preço unitário quando `variant_title` contém multiplicador.

## Fragilidades e pontos de atenção

- **Uso de VIEW**: falhas na `shop_checkout_data` levam ao fallback; monitorar divergências entre view e query tradicional.
- **Hash de oferta**: mudanças em campos da oferta ou bumps invalidam a oferta anterior e geram nova, impactando cache.
- **Catálogo dependente do carrinho**: só há atualização quando o carrinho é consultado, o que pode gerar lacunas.
