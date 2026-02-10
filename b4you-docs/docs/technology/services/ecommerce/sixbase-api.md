---
title: sixbase-api (dashboard backend)
---

## Arquitetura v2

A integração é baseada em:

- **Produto Container**: criado automaticamente para cada loja.
- **Oferta Padrão**: configurações herdadas por todas as ofertas dinâmicas.
- **Herança de configuração**: pagamento, frete, checkout e demais regras são propagadas da oferta padrão para cada oferta gerada no checkout.

## Estrutura de dados

A tabela `shop_integrations` guarda o vínculo de loja com `id_product` (produto container) e `id_default_offer` (oferta padrão), além do token de acesso e metadados da loja.

Campos críticos na criação:

- `shop_name` e `shop_domain` (identificação da loja)
- `access_token` (token da Shopify Admin API)
- `id_product` e `id_default_offer` (gerados automaticamente)

## Endpoints principais (dashboard)

- `GET /api/dashboard/integrations/ecommerce/shops`
- `GET /api/dashboard/integrations/ecommerce/shops/:uuid`
- `POST /api/dashboard/integrations/ecommerce/shops`
- `PUT /api/dashboard/integrations/ecommerce/shops/:uuid`
- `DELETE /api/dashboard/integrations/ecommerce/shops/:uuid`

## Order Bumps (dashboard)

O `sixbase-api` expõe endpoints de bumps vinculados à oferta padrão:

- `GET /api/dashboard/integrations/ecommerce/shops/:uuid/bumps`
- `POST /api/dashboard/integrations/ecommerce/shops/:uuid/bumps`
- `PUT /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId`
- `DELETE /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId`
- `PUT /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId/cover`
- `DELETE /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId/cover`

## Script de integração

O endpoint `POST /api/checkout/ecommerce/resolve-offer` é o mesmo usado pelo script universal para gerar a oferta dinâmica e retornar o checkout.

## Limitações declaradas

- Uma loja por usuário.
- Sem mapeamento de SKU e sem combos (após simplificação da arquitetura).

## Evolução esperada

- **Multilojas por usuário**: rever restrição atual e impacto nos fluxos de checkout e dashboard.
- **Novas integrações**: validar requisitos para integrar outras plataformas além de Shopify.
- **Expansão de relatórios**: endpoints para relatórios de catálogo e performance (SKU, vendor, tipo).

## Fragilidades e pontos de atenção

- **Produto container único**: configurações críticas ficam centralizadas em uma oferta padrão; alterações afetam todo checkout.
- **Token de acesso**: manutenção de tokens inválidos pode quebrar integração sem alertas explícitos.
- **Dependência das migrations**: mudanças estruturais exigem sincronismo entre backoffice, dashboard e checkout.
