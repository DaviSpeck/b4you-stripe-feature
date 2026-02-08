# E-commerce Integration - Frontend Documentation

## Visão Geral

O frontend do sistema de integração e-commerce foi simplificado para trabalhar com a arquitetura de **Produto Container** e **Oferta Padrão**. A interface permite que usuários configurem uma loja e todas as suas configurações através de um modal unificado.

## Limitações

- **Uma loja por usuário**: O botão "Nova Loja" só aparece se o usuário não tiver nenhuma loja cadastrada

---

## Componentes Principais

### 1. `list.js` - Listagem de Lojas

**Caminho**: `src/modules/ecommerce/list.js`

**Funcionalidades**:
- Lista todas as lojas do usuário
- Botão "Nova Loja" (apenas se `shops.length === 0`)
- Ações por loja:
  - **Copiar Script**: Copia código de integração para área de transferência
  - **Configurar Loja**: Abre modal de configuração completa
  - **Editar Loja**: Edita nome, domínio e token
  - **Remover Loja**: Remove a integração

**Estado**:
```javascript
const [shops, setShops] = useState([]);
const [selectedShop, setSelectedShop] = useState(null);
const [showShopModal, setShowShopModal] = useState(false);
const [showShopConfigModal, setShowShopConfigModal] = useState(false);
```

**API Calls**:
- `GET /integrations/ecommerce/shops` - Lista lojas
- `DELETE /integrations/ecommerce/shops/:uuid` - Remove loja

---

### 2. `modal-shop.js` - Criar/Editar Loja

**Caminho**: `src/modules/ecommerce/modal-shop.js`

**Funcionalidades**:
- Cria nova loja (apenas 3 campos obrigatórios)
- Edita loja existente

**Campos do Formulário**:
1. **Nome da Loja** (`shop_name`) - Obrigatório
2. **Domínio da Loja** (`shop_domain`) - Obrigatório
   - Exemplo: `minhaloja.myshopify.com`
3. **Token de Acesso** (`access_token`) - Obrigatório apenas na criação
   - Na edição, deixar em branco mantém o token atual

**Fluxo de Criação**:
1. Usuário preenche os 3 campos
2. Sistema cria automaticamente:
   - Produto container (físico, oculto)
   - Oferta padrão
   - Integração vinculada
3. Exibe mensagem de sucesso com informações do produto criado
4. Usuário deve configurar frete e pagamento após criação

**API Calls**:
- `POST /integrations/ecommerce/shops` - Criar
- `PUT /integrations/ecommerce/shops/:uuid` - Atualizar

---

### 3. `modal-shop-config.js` - Configuração Completa da Loja

**Caminho**: `src/modules/ecommerce/modal-shop-config.js`

**Funcionalidades**:
- Modal com abas para todas as configurações do produto container
- Busca dados completos da loja ao abrir (`GET /integrations/ecommerce/shops/:uuid`)

**Abas Disponíveis**:

#### 1. Order Bumps
- **Componente**: `ModalBumps`
- Configura bumps que se aplicam a **todas** as ofertas da loja
- Bumps são configurados na oferta padrão

#### 2. Upsell
- **Componente**: `ModalUpsell`
- Configuração de upsell

#### 3. Pagamento
- **Componente**: `ModalPayment`
- Configurações aplicadas à oferta padrão:
  - Métodos de pagamento
  - Parcelamento
  - Juros
  - Descontos (cartão, PIX, boleto)
  - Permitir cupom
  - Permitir dois cartões

#### 4. Frete
- **Componente**: `ModalShipping`
- Configurações aplicadas à oferta padrão:
  - Tipo de frete
  - Preço fixo ou por região
  - Texto de prazo de entrega

#### 5. Geral
- **Componente**: `ModalGeneral`
- Configurações gerais do produto container

#### 6. Vitrine
- **Componente**: `ModalVitrine`
- Configurações de marketplace e afiliados

#### 7. Parcerias
- **Componente**: `ModalParcerias`
- Sub-abas:
  - **Afiliados**: `AffiliateContent`
  - **Coprodução**: `CoproductionContent`
  - **Gerentes**: `ManagerContent`
  - **Fornecedor**: `SupplierContent`

#### 8. Rastreio
- **Componente**: `ModalRastreio`
- Configurações de rastreamento

#### 9. Cupons
- **Componente**: `ModalCupons`
- Gerenciamento de cupons do produto container
- Requer `ProductProvider` context

#### 10. Checkout
- **Componente**: `ModalCheckout`
- Sub-abas:
  - **Configurações**: Descrição na fatura, pixels de conversão
  - **Personalizar**: Logo, cores, vídeo, imagens, modelos de checkout

**Estado**:
```javascript
const [activeTab, setActiveTab] = useState('bumps');
const [fullShop, setFullShop] = useState(null);
const [loading, setLoading] = useState(true);
```

**API Calls**:
- `GET /integrations/ecommerce/shops/:uuid` - Busca loja completa com produto e oferta

---

### 4. `modal-payment.js` - Configurações de Pagamento

**Caminho**: `src/modules/ecommerce/modal-payment.js`

**Funcionalidades**:
- Configura pagamento na oferta padrão
- Aplicado a **todas** as ofertas dinâmicas

**Campos**:
- Método de Pagamento (select)
- Parcelamento no Cartão (1-12x)
- Juros do Parcelamento (Cliente/Produtor)
- Permitir Cupom (Sim/Não)
- Permitir Compra com Dois Cartões (Sim/Não)
- Desconto Cartão (0-50%)
- Desconto PIX (0-50%)
- Desconto Boleto (0-50%)

**API Calls**:
- `GET /products/:productUuid/offers` - Busca oferta padrão
- `PUT /products/:productUuid/offers/:offerUuid` - Atualiza oferta padrão

---

### 5. `modal-shipping.js` - Configurações de Frete

**Caminho**: `src/modules/ecommerce/modal-shipping.js`

**Funcionalidades**:
- Configura frete na oferta padrão
- Aplicado a **todas** as ofertas dinâmicas

**Campos**:
- Tipo de Frete (Grátis, Fixo dividido com afiliado, etc.)
- Frete por Região (Sim/Não)
- Preços por região (se habilitado)
- Texto para Prazo de Entrega

**API Calls**:
- `GET /products/:productUuid/offers` - Busca oferta padrão
- `PUT /products/:productUuid/offers/:offerUuid` - Atualiza oferta padrão

---

### 6. `modal-bumps.js` - Order Bumps

**Caminho**: `src/modules/ecommerce/modal-bumps.js`

**Funcionalidades**:
- Lista, cria, edita e remove order bumps
- Bumps são configurados na oferta padrão
- Aplicados a **todas** as ofertas dinâmicas

**API Calls**:
- `GET /integrations/ecommerce/shops/:uuid/bumps` - Lista bumps
- `POST /integrations/ecommerce/shops/:uuid/bumps` - Cria bump
- `PUT /integrations/ecommerce/shops/:uuid/bumps/:bumpId` - Atualiza bump
- `DELETE /integrations/ecommerce/shops/:uuid/bumps/:bumpId` - Remove bump
- `PUT /integrations/ecommerce/shops/:uuid/bumps/:bumpId/cover` - Upload imagem

---

### 7. `modal-general.js` - Configurações Gerais

**Caminho**: `src/modules/ecommerce/modal-general.js`

**Funcionalidades**:
- Configurações gerais do produto container
- Adaptado de `PageProductsEditGeneral`

**API Calls**:
- `GET /products/product/:uuid` - Busca produto
- `PUT /products/:uuid` - Atualiza produto

---

### 8. `modal-vitrine.js` - Vitrine/Marketplace

**Caminho**: `src/modules/ecommerce/modal-vitrine.js`

**Funcionalidades**:
- Configurações de marketplace e afiliados
- Adaptado de `ProductMarket` e `MarketContent`

**API Calls**:
- `GET /products/affiliate/:uuid` - Busca configurações de afiliados

---

### 9. `modal-parcerias.js` - Parcerias

**Caminho**: `src/modules/ecommerce/modal-parcerias.js`

**Funcionalidades**:
- Modal com 4 sub-abas:
  1. **Afiliados**: `AffiliateContent`
  2. **Coprodução**: `CoproductionContent`
  3. **Gerentes**: `ManagerContent`
  4. **Fornecedor**: `SupplierContent`

---

### 10. `modal-rastreio.js` - Rastreio

**Caminho**: `src/modules/ecommerce/modal-rastreio.js`

**Funcionalidades**:
- Configurações de rastreamento
- Adaptado de `PageTracking`

---

### 11. `modal-cupons.js` - Cupons

**Caminho**: `src/modules/ecommerce/modal-cupons.js`

**Funcionalidades**:
- Gerenciamento de cupons do produto container
- Requer `ProductProvider` context
- Adaptado de `PageCoupons`

**Importante**: 
- Busca produto completo para fornecer contexto
- Wraps conteúdo com `ProductProvider`

---

### 12. `modal-checkout.js` - Checkout

**Caminho**: `src/modules/ecommerce/modal-checkout.js`

**Funcionalidades**:
- Modal com 2 sub-abas:
  1. **Configurações**: `CheckoutConfigTab`
     - Descrição na fatura
     - Pixels de conversão
  2. **Personalizar**: `CheckoutPersonalizeTab`
     - Logo, favicon, cores
     - Vídeo embed
     - Imagens customizadas
     - Modelos de checkout

**Requer**: `ProductProvider` context

---

## Fluxo de Uso

### 1. Criar Loja

1. Usuário acessa página de E-commerce
2. Se não tiver loja, vê botão "Nova Loja"
3. Preenche:
   - Nome da loja
   - Domínio (ex: `minhaloja.myshopify.com`)
   - Token de acesso Shopify
4. Sistema cria automaticamente:
   - Produto container
   - Oferta padrão
   - Integração
5. Usuário recebe mensagem de sucesso

### 2. Configurar Loja

1. Usuário clica em "Configurar Loja" na lista
2. Modal abre com todas as abas de configuração
3. Usuário configura:
   - **Order Bumps**: Bumps aplicados a todas as ofertas
   - **Pagamento**: Métodos, parcelamento, descontos
   - **Frete**: Tipo, preço, regiões
   - **Geral, Vitrine, Parcerias, Rastreio, Cupons, Checkout**
4. Todas as configurações são salvas na oferta padrão
5. Configurações são herdadas por todas as ofertas dinâmicas

### 3. Copiar Script

1. Usuário clica em "Copiar Script"
2. Código JavaScript é copiado para área de transferência
3. Usuário cola no tema do Shopify

---

## Estrutura de Dados

### Shop Object (da API)

```javascript
{
  id: 1,
  uuid: "abc123",
  platform: "shopify",
  shop_domain: "minhaloja.myshopify.com",
  shop_name: "Minha Loja",
  environment: "production",
  active: true,
  access_token: "***", // Mascarado
  id_product: 123,
  id_default_offer: 456,
  container_product: {
    id: 123,
    uuid: "prod-xyz",
    name: "Minha Loja - E-commerce"
  },
  default_offer: {
    id: 456,
    uuid: "offer-xyz",
    name: "Minha Loja - Oferta Padrão"
  }
}
```

---

## Context Providers

### ProductProvider

Alguns componentes requerem `ProductProvider` para acessar dados do produto:

```javascript
import ProductProvider from '../../providers/contextProduct';

<ProductProvider value={{ product, setProduct }}>
  {/* Componentes filhos */}
</ProductProvider>
```

**Componentes que usam**:
- `ModalCupons`
- `ModalCheckout`
- `ModalForm` (formulário de cupons)

---

## Padrões de Código

### Loading States

Todos os modais devem ter estado de loading inicial:

```javascript
const [loading, setLoading] = useState(true);

if (loading) {
  return <Loader title='Carregando...' />;
}
```

### Error Handling

Sempre tratar erros e exibir mensagens ao usuário:

```javascript
try {
  // API call
} catch (err) {
  console.error('Erro:', err);
  const errorMessage = err.response?.data?.message || 'Erro ao salvar';
  notify({ message: errorMessage, type: 'error' });
}
```

### Embedded Mode

Modais podem ser usados em modo "embedded" (dentro de outro modal):

```javascript
const ModalComponent = ({ setShow, shop, embedded = false }) => {
  // ...
  if (!embedded && setShow) {
    return <ButtonDS onClick={() => setShow(false)}>Fechar</ButtonDS>;
  }
};
```

---

## API Integration

### Base URL

Todas as chamadas usam o provider `api`:

```javascript
import api from '../../providers/api';
```

### Endpoints Principais

#### Shops
- `GET /integrations/ecommerce/shops`
- `GET /integrations/ecommerce/shops/:uuid`
- `POST /integrations/ecommerce/shops`
- `PUT /integrations/ecommerce/shops/:uuid`
- `DELETE /integrations/ecommerce/shops/:uuid`

#### Order Bumps
- `GET /integrations/ecommerce/shops/:uuid/bumps`
- `POST /integrations/ecommerce/shops/:uuid/bumps`
- `PUT /integrations/ecommerce/shops/:uuid/bumps/:bumpId`
- `DELETE /integrations/ecommerce/shops/:uuid/bumps/:bumpId`

#### Product/Offer (para configurações)
- `GET /products/product/:uuid`
- `GET /products/:uuid/offers`
- `PUT /products/:uuid/offers/:offerUuid`

---

## Notificações

Todas as ações devem exibir notificações:

```javascript
import { notify } from '../functions';

notify({
  message: 'Operação realizada com sucesso!',
  type: 'success' // ou 'error', 'warning', 'info'
});
```

---

## Validações

### Formulário de Criação de Loja

- `shop_name`: Obrigatório, mínimo 3 caracteres
- `shop_domain`: Obrigatório, formato válido
- `access_token`: Obrigatório apenas na criação

### Formulário de Pagamento

- Todos os campos têm valores padrão
- Validação de valores numéricos para descontos

### Formulário de Frete

- Validação de valores monetários
- Validação de seleção de tipo de frete

---

## Exemplos de Uso

### Criar Loja

```javascript
const handleCreate = async () => {
  const payload = {
    shop_name: 'Minha Loja',
    shop_domain: 'minhaloja.myshopify.com',
    access_token: 'shpat_xxx...'
  };
  
  await api.post('/integrations/ecommerce/shops', payload);
};
```

### Configurar Pagamento

```javascript
const handleSavePayment = async () => {
  const payload = {
    payment_methods: 'credit_card,pix,billet',
    installments: 12,
    student_pays_interest: false,
    allow_coupon: true,
    enable_two_cards_payment: false,
    discount_card: 0,
    discount_pix: 5,
    discount_billet: 10
  };
  
  await api.put(
    `/products/${productUuid}/offers/${offerUuid}`,
    payload
  );
};
```

### Adicionar Order Bump

```javascript
const handleCreateBump = async () => {
  const payload = {
    product_name: 'Produto Bump',
    title: 'Oferta Especial',
    label: 'Adicionar',
    price_before: 199.90,
    order_bump_offer: offerId,
    show_quantity: false
  };
  
  await api.post(
    `/integrations/ecommerce/shops/${shopUuid}/bumps`,
    payload
  );
};
```

---

## Troubleshooting

### Modal não carrega

- Verificar se `shop.container_product.uuid` existe
- Verificar se `shop.default_offer.uuid` existe
- Adicionar loading state adequado

### Configurações não salvam

- Verificar se está usando `offerUuid` correto (default_offer)
- Verificar payload da API
- Verificar permissões do usuário

### Order Bumps não aparecem

- Verificar se bumps estão vinculados à `default_offer`
- Verificar se oferta padrão existe
- Verificar query de busca de bumps

---

## Melhorias Futuras

1. Suporte a múltiplas lojas por usuário
2. Mapeamento de SKU (se necessário)
3. Sistema de combos (se necessário)
4. Regras de validação de carrinho (se necessário)
