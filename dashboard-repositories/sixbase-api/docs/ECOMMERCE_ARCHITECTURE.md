# E-commerce Integration Architecture v2

## Visão Geral

O sistema de integração e-commerce foi simplificado para usar uma arquitetura baseada em **Produto Container** e **Oferta Padrão (Default Offer)**. Esta abordagem elimina a complexidade de mapeamento de SKU, combos e regras, centralizando todas as configurações no produto container.

## Princípios Fundamentais

1. **Um usuário = Uma loja**: Limitação atual permite apenas uma loja por usuário
2. **Produto Container**: Cada loja tem um produto físico (tipo 4) criado automaticamente que serve como container para todas as ofertas dinâmicas
3. **Oferta Padrão (Default Offer)**: Uma oferta padrão no produto container que contém todas as configurações herdadas por ofertas dinâmicas
4. **Herança de Configurações**: Todas as ofertas dinâmicas herdam automaticamente as configurações da oferta padrão

---

## Estrutura de Dados

### Tabela: `shop_integrations`

Armazena as informações básicas da integração da loja.

```sql
- id (INTEGER, PK)
- id_user (BIGINT, FK → users.id)
- platform (STRING) - 'shopify' por padrão
- shop_domain (STRING) - Domínio da loja (ex: minhaloja.myshopify.com)
- shop_name (STRING) - Nome da loja
- uuid (UUID, UNIQUE) - Identificador único da loja
- active (BOOLEAN) - Status da loja
- access_token (STRING(512)) - Token de acesso da Shopify Admin API
- id_product (BIGINT, FK → products.id) - Produto container
- id_default_offer (BIGINT, FK → product_offer.id) - Oferta padrão
- config (JSON) - Configurações adicionais (opcional)
- created_at, updated_at, deleted_at
```

### Relacionamentos

- `shop_integrations.id_product` → `products.id` (container_product)
- `shop_integrations.id_default_offer` → `product_offer.id` (default_offer)
- `shop_integrations.id_user` → `users.id`

---

## Fluxo de Criação da Loja

### 1. Criação (POST `/api/dashboard/integrations/ecommerce/shops`)

Quando um usuário cria uma loja, o sistema automaticamente:

1. **Cria o Produto Container**:
   - Tipo: Físico (id_type = 4)
   - Nome: `{shop_name} - E-commerce`
   - `visible: false` (não aparece na lista de produtos)
   - `payment_type: 'single'`

2. **Cria a Oferta Padrão**:
   - Nome: `{shop_name} - Oferta Padrão`
   - `price: 0` (preço dinâmico do carrinho)
   - `active: true`
   - Valores padrão:
     - `installments: 12`
     - `payment_methods: 'credit_card,pix,billet'`
     - `require_address: true`

3. **Cria a Integração**:
   - Vincula ao produto container (`id_product`)
   - Vincula à oferta padrão (`id_default_offer`)
   - Armazena `access_token` da Shopify

### Campos Obrigatórios na Criação

```json
{
  "shop_name": "Minha Loja",
  "shop_domain": "minhaloja.myshopify.com",
  "access_token": "shpat_xxx..."
}
```

**Nota**: Configurações de frete e pagamento devem ser feitas **após** a criação, no produto container através da oferta padrão.

---

## Sistema de Herança de Configurações

### Campos Herdados da Oferta Padrão

Todas as ofertas dinâmicas herdam automaticamente os seguintes campos da `default_offer`:

#### Pagamento
- `payment_methods`
- `installments`
- `student_pays_interest`
- `discount_card`, `discount_pix`, `discount_billet`
- `allow_coupon`
- `enable_two_cards_payment`
- `default_installment`

#### Frete
- `shipping_type`
- `shipping_price`
- `require_address`
- `allow_shipping_region`
- `shipping_price_no`, `shipping_price_ne`, `shipping_price_co`, `shipping_price_so`, `shipping_price_su`
- `shipping_text`
- `shipping_region`

#### Páginas de Agradecimento e Upsell
- `thankyou_page`
- `thankyou_page_card`
- `thankyou_page_pix`
- `thankyou_page_billet`
- `thankyou_page_upsell`
- `id_upsell`

#### Personalização de Checkout
- `url_video_checkout`
- `counter`
- `counter_three_steps`
- `popup`
- `checkout_customizations`
- `terms`
- `url_terms`
- `type_exibition_value`
- `is_plan_discount_message`
- `show_cnpj`

### Função de Herança

```javascript
// utils/helpers/inheritOfferConfig.js
inheritOfferConfig(defaultOffer, dynamicData)
```

Esta função mescla as configurações da oferta padrão com os dados dinâmicos específicos do carrinho (preço, nome, metadata, etc.).

---

## Resolução de Ofertas Dinâmicas

### Endpoint: POST `/api/checkout/ecommerce/resolve-offer`

Este endpoint cria/atualiza ofertas dinâmicas baseadas no carrinho do Shopify.

### Fluxo

1. **Identificação da Loja**:
   - Recebe `shop_domain` ou `shop_uuid`
   - Busca a integração usando VIEW otimizada `shop_checkout_data` ou query tradicional

2. **Processamento do Carrinho**:
   - Extrai itens do `cart_data.items`
   - Usa preços diretamente do Shopify (não há mapeamento de SKU)
   - Calcula total e quantidade

3. **Geração de Hash Determinístico**:
   ```javascript
   hash = SHA256({
     shop: shopIntegrationId,
     items: [{ sku, quantity }, ...]
   })
   ```
   - Usado para identificar ofertas existentes com mesmo carrinho

4. **Criação/Atualização da Oferta**:
   - Se existe oferta com mesmo hash → atualiza preço e metadata
   - Se não existe → cria nova oferta
   - **Sempre herda configurações da default_offer**

5. **Dados Dinâmicos da Oferta**:
   ```javascript
   {
     id_product: containerProductId,
     name: "Produto 1 + Produto 2", // Nome gerado do carrinho
     price: totalPrice, // Soma dos itens do carrinho
     description: "...",
     banner_image: primeiraImagemDoCarrinho,
     metadata: {
       line_items: [...], // Itens do carrinho
       source: 'ecommerce',
       platform: 'shopify',
       shop_domain: '...',
       h_offer: offerHash
     },
     offer_image: [...], // Imagens dos produtos
     active: true
   }
   ```

6. **Resposta**:
   ```json
   {
     "checkout_url": "https://checkout.b4you.com.br/...",
     "offer": { ... },
     "bumps": [ ... ] // Order bumps da default_offer
   }
   ```

### VIEW: `shop_checkout_data`

VIEW otimizada que agrega todos os dados necessários para checkout em uma única query:

- Dados da loja (`shop_integrations`)
- Configurações da oferta padrão (`product_offer` com prefixo `offer_`)
- Order bumps da oferta padrão (JSON array)

**Vantagem**: Reduz múltiplas queries JOIN em uma única consulta.

---

## Order Bumps

### Conceito

Order bumps são configurados **no nível do produto** (na oferta padrão) e se aplicam a **TODAS** as ofertas dinâmicas geradas para aquela loja.

### Endpoints

- `GET /api/dashboard/integrations/ecommerce/shops/:uuid/bumps` - Lista bumps
- `POST /api/dashboard/integrations/ecommerce/shops/:uuid/bumps` - Cria bump
- `PUT /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId` - Atualiza bump
- `DELETE /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId` - Remove bump
- `PUT /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId/cover` - Upload imagem
- `DELETE /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId/cover` - Remove imagem

### Estrutura do Order Bump

```javascript
{
  id_offer: defaultOfferId, // Sempre a oferta padrão
  order_bump_offer: offerId, // Oferta do produto do bump
  product_name: "...",
  title: "...",
  label: "...",
  description: "...",
  price_before: 0,
  cover: "url",
  show_quantity: false,
  max_quantity: null
}
```

---

## Configurações da Loja

### Modal de Configuração

O modal "Configurar Loja" (`ModalShopConfig`) permite configurar todas as opções do produto container através de abas:

1. **Order Bumps** - Bumps aplicados a todas as ofertas
2. **Upsell** - Configuração de upsell
3. **Pagamento** - Métodos, parcelamento, descontos, cupons, dois cartões
4. **Frete** - Tipo, preço, regiões, texto de entrega
5. **Geral** - Configurações gerais do produto
6. **Vitrine** - Configurações de marketplace/afiliados
7. **Parcerias** - Afiliados, Coprodução, Gerentes, Fornecedor
8. **Rastreio** - Configurações de rastreamento
9. **Cupons** - Gerenciamento de cupons
10. **Checkout** - Personalização e configurações de checkout

**Todas essas configurações são aplicadas na oferta padrão e herdadas por todas as ofertas dinâmicas.**

---

## API Endpoints

### Dashboard (Autenticado)

#### Shops
- `GET /api/dashboard/integrations/ecommerce/shops` - Lista lojas do usuário
- `GET /api/dashboard/integrations/ecommerce/shops/:uuid` - Detalhes da loja
- `POST /api/dashboard/integrations/ecommerce/shops` - Cria loja
- `PUT /api/dashboard/integrations/ecommerce/shops/:uuid` - Atualiza loja
- `DELETE /api/dashboard/integrations/ecommerce/shops/:uuid` - Remove loja

#### Order Bumps
- `GET /api/dashboard/integrations/ecommerce/shops/:uuid/bumps`
- `POST /api/dashboard/integrations/ecommerce/shops/:uuid/bumps`
- `PUT /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId`
- `DELETE /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId`
- `PUT /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId/cover`
- `DELETE /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId/cover`

### Checkout (Público)

- `POST /api/checkout/ecommerce/resolve-offer` - Resolve oferta do carrinho

---

## Script de Integração

### Código para Shopify

```html
<script src="https://api-checkout.b4you.com.br/scripts/b4you-ecommerce-universal.js"></script>
<script>
  B4YouCheckout.init({
    shop_uuid: 'SEU_UUID_AQUI',
    button_id: 'checkoutB4',
    debug: false
  });
</script>
```

### Fluxo do Script

1. Captura dados do carrinho Shopify
2. Envia para `/api/checkout/ecommerce/resolve-offer`
3. Recebe URL de checkout com oferta dinâmica
4. Redireciona para checkout B4You

---

## Limitações Atuais

1. **Uma loja por usuário**: Usuários podem ter apenas uma loja integrada
2. **Sem mapeamento de SKU**: Preços vêm diretamente do Shopify
3. **Sem combos**: Funcionalidade removida
4. **Sem regras de SKU**: Funcionalidade removida

---

## Migrations

### Principais Migrations

1. `20260121120000-create-shop-integrations.js` - Cria tabela `shop_integrations` (inclui `access_token`)
2. `20260122150000-create-view-shop-checkout-data.js` - Cria VIEW otimizada
3. `20260123100000-add-access-token-shop-integrations.js` - Compatibilidade (verifica se coluna existe)
4. `20260124120000-drop-unused-ecommerce-tables.js` - Remove tabelas antigas (SKU catalog, combos, rules)

---

## Segurança

- `access_token` é mascarado nas respostas da API (`'***'`)
- Apenas o dono da loja pode acessar/modificar suas configurações
- Validação de `id_user` em todos os endpoints

---

## Performance

- VIEW `shop_checkout_data` otimiza queries de checkout (1 query ao invés de múltiplas JOINs)
- Hash determinístico evita criação de ofertas duplicadas
- Cache de ofertas existentes por hash

---

## Exemplos

### Criar Loja

```bash
POST /api/dashboard/integrations/ecommerce/shops
{
  "shop_name": "Minha Loja",
  "shop_domain": "minhaloja.myshopify.com",
  "access_token": "shpat_abc123..."
}
```

### Resolver Oferta do Carrinho

```bash
POST /api/checkout/ecommerce/resolve-offer
{
  "shop_uuid": "abc123",
  "cart_data": {
    "items": [
      {
        "sku": "PROD-001",
        "variant_id": "123",
        "title": "Produto 1",
        "price": 99.90,
        "quantity": 2,
        "image": "https://..."
      }
    ]
  }
}
```

Resposta:
```json
{
  "checkout_url": "https://checkout.b4you.com.br/offer/xyz789",
  "offer": {
    "uuid": "xyz789",
    "name": "2x Produto 1",
    "price": "199.80",
    ...
  },
  "bumps": [...]
}
```
