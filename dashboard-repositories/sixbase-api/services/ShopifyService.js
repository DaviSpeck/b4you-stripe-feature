const Shopify = require('shopify-api-node');

class ShopifyNotification {
  constructor(shopName, accessToken) {
    this.shopify = new Shopify({
      shopName,
      accessToken
    });
  }

  async createOrUpdateOrder(orderData) {
    try {
      const order = await this.shopify.order.create(orderData);
      return order;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ShopifyNotification;
