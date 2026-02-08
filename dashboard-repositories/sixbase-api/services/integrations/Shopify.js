const ShopifyAPI = require('shopify-api-node');

/**
 * Serviço para interação com a Admin REST API do Shopify
 * Utiliza a biblioteca oficial `shopify-api-node`
 */
class Shopify {
  /**
   * Cria instância do ShopifyAPI
   *
   * @param {string} shopUrl       URL da loja (ex: 'cff46b-30.myshopify.com')
   * @param {string} accessToken   Access Token da Shopify
   * @param {string} [apiVersion]  Versão da API (default: '2023-10')
   */
  constructor(shopUrl, accessToken, apiVersion = '2023-10') {
    const shopName = shopUrl.replace('.myshopify.com', '');
    this.shopify = new ShopifyAPI({ shopName, accessToken, apiVersion });
  }

  /**
   * Lista produtos
   * @param   {object} [options]      Paginação e filtros (ex: limit, since_id)
   * @returns {Promise<object[]>}     Array de produtos
   */
  async listProducts(options = {}) {
    return this.shopify.product.list(options);
  }

  /**
   * Busca detalhes de um produto
   * @param   {number|string} id      ID do produto
   * @returns {Promise<object>}       Produto
   */
  async getProduct(id) {
    return this.shopify.product.get(id);
  }

  /**
   * Cria um produto
   * @param   {object} data           Dados conforme API
   * @returns {Promise<object>}       Produto criado
   */
  async createProduct(data) {
    return this.shopify.product.create(data);
  }

  /**
   * Atualiza um produto
   * @param   {number|string} id      ID do produto
   * @param   {object} data           Campos a atualizar
   * @returns {Promise<object>}       Produto atualizado
   */
  async updateProduct(id, data) {
    return this.shopify.product.update(id, data);
  }

  /**
   * Exclui um produto
   * @param   {number|string} id      ID do produto
   * @returns {Promise<void>}
   */
  async deleteProduct(id) {
    return this.shopify.product.delete(id);
  }

  /**
   * Lista pedidos
   * @param   {object} [options]      Paginação e filtros (ex: status)
   * @returns {Promise<object[]>}     Array de pedidos
   */
  async listOrders(options = {}) {
    return this.shopify.order.list(options);
  }

  /**
   * Busca detalhes de um pedido
   * @param   {number|string} id      ID do pedido
   * @returns {Promise<object>}       Pedido
   */
  async getOrder(id) {
    return this.shopify.order.get(id);
  }

  /**
   * Cria um pedido
   * @param   {object} data           Dados conforme API
   * @returns {Promise<object>}       Pedido criado
   */
  async createOrder(data) {
    return this.shopify.order.create(data);
  }

  /**
   * Atualiza um pedido
   * @param   {number|string} id      ID do pedido
   * @param   {object} data           Campos a atualizar
   * @returns {Promise<object>}       Pedido atualizado
   */
  async updateOrder(id, data) {
    return this.shopify.order.update(id, data);
  }

  /**
   * Lista clientes
   * @param   {object} [options]      Paginação e filtros (ex: limit)
   * @returns {Promise<object[]>}     Array de clientes
   */
  async listCustomers(options = {}) {
    return this.shopify.customer.list(options);
  }

  /**
   * Busca detalhes de um cliente
   * @param   {number|string} id      ID do cliente
   * @returns {Promise<object>}       Cliente
   */
  async getCustomer(id) {
    return this.shopify.customer.get(id);
  }

  /**
   * Cria um cliente
   * @param   {object} data           Dados conforme API
   * @returns {Promise<object>}       Cliente criado
   */
  async createCustomer(data) {
    return this.shopify.customer.create(data);
  }

  /**
   * Atualiza um cliente
   * @param   {number|string} id      ID do cliente
   * @param   {object} data           Campos a atualizar
   * @returns {Promise<object>}       Cliente atualizado
   */
  async updateCustomer(id, data) {
    return this.shopify.customer.update(id, data);
  }
}

module.exports = Shopify;
