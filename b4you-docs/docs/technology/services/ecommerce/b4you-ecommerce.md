---
title: b4you-ecommerce (script)
---

## O que é

O projeto entrega o **script universal** que as lojas instalam no tema. Ele intercepta tentativas de checkout, busca o carrinho do Shopify e resolve a oferta no backend antes de redirecionar para o checkout B4You. A distribuição principal é feita via CDN, com versão minificada em `dist/` e fonte em `src/index.js`.

## API pública do script

O objeto global `B4YouCheckout` expõe:

- `init(config)`: inicializa com `shop_uuid`/`shop_domain`, `button_id`, `debug`.
- `getCheckoutUrl()`: URL resolvida para o checkout.
- `getCartSummary()`: resumo local do carrinho (quando disponível).

> Observação: a API pública detalhada ainda é descrita no README do projeto e pode divergir do código minificado entregue no CDN.

## Fluxo do script (frontend)

1. **Inicialização** com `B4YouCheckout.init({ shop_uuid, shop_domain, button_id, debug })`.
2. **Intercepta navegação** para `/checkout` via `window.location.assign` e `history.pushState`.
3. **Intercepta cliques** em links ou formulários que apontem para `/checkout`.
4. **Busca carrinho do Shopify** via `GET /cart.js`.
5. **Chama** `POST /api/checkout/ecommerce/resolve-offer` no `api-checkout` com `shop_domain`/`shop_uuid`, `cart_data` e `checkout_url`.
6. **Redireciona** o usuário para `checkoutUrl` retornado pela API, com UTM params preservados.

## Contrato enviado para o backend

Exemplo de payload produzido a partir do carrinho Shopify:

```json
{
  "shop_uuid": "uuid-da-loja",
  "cart_data": {
    "items": [
      {
        "sku": "SKU-001",
        "variant_id": 123456,
        "title": "Produto X",
        "price": 9900,
        "quantity": 1,
        "image": "https://cdn.shopify.com/...",
        "grams": 500
      }
    ]
  },
  "checkout_url": "https://checkout.b4you.com.br"
}
```

## Configuração suportada pelo script

Parâmetros relevantes definidos no README:

- `shop_uuid` ou `shop_domain` (pelo menos um obrigatório)
- `button_id` (ID do botão de checkout)
- `debug` (logs no console)

## Onde instalar no tema Shopify

Pontos mais comuns:

- `theme.liquid` (global)
- `cart.liquid` (carrinho)
- `checkout.liquid` (caso o checkout seja customizado)

> Recomenda-se inserir próximo ao botão “Finalizar compra” para garantir que a interceptação funcione.

## Build & deploy

O build gera o arquivo minificado `dist/b4you-ecommerce-universal.min.js` e o deploy acontece via GitHub Actions enviando para S3 + CloudFront. O README informa a separação por branches (`main`/`develop`) e as secrets utilizadas para o pipeline.

## Evolução esperada

- **Suporte a outras plataformas**: hoje o script assume Shopify (`/cart.js`), então uma evolução natural é adicionar adaptadores para WooCommerce, VTEX, etc.
- **Fallback controlado**: definir estratégia de fallback (ex.: redirecionar para checkout nativo quando `resolve-offer` falhar) com telemetria.
- **Observabilidade no frontend**: logs estruturados e eventos customizados para monitorar taxa de resolução e erros de integração.

## Fragilidades e pontos de atenção

- **Dependência de `/cart.js`**: lojas Shopify com customizações podem alterar o payload ou bloquear o endpoint.
- **Interceptação de navegação**: mudanças no tema ou rotas customizadas podem impedir o intercept.
- **Resiliência a falhas de rede**: se a resolução falhar, o usuário cai no checkout nativo; monitorar esse fallback é essencial.
