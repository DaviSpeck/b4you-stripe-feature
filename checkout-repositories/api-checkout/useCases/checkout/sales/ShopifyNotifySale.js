const ShopifyNotification = require('../../../services/ShopifyService');

class ShopifyNotificationUseCase {
  constructor(shopName, accessToken, orderData) {
    this.shopName = shopName;
    this.accessToken = accessToken;
    this.orderData = orderData;
  }

  async execute() {
    const shopifyNotification = new ShopifyNotification(
      this.shopName,
      this.accessToken,
    );
    const order = await shopifyNotification.createOrUpdateOrder(this.orderData);
    try {
      console.log('Response shopify', order);
    } catch (error) {
      console.log('error on print shopify response', error);
    }

    return order;
  }
}

module.exports = ShopifyNotificationUseCase;
