const Shopify = require('shopify-api-node');

class ShopifyNotification {
  constructor(shopName, accessToken) {
    this.shopify = new Shopify({
      shopName,
      accessToken,
    });
  }

  async createOrUpdateOrder(orderData) {
    console.log('ORDER DATA SHOPIFY', JSON.stringify(orderData));
    try {
      const order = await this.shopify.order.create(orderData);
      try {
        console.log('tring log order shopify', JSON.stringify(order));
      } catch (error) {
        console.log('error on shopify log', error);
      }
      return order;
    } catch (error) {
      throw error;
    }
  }

  async getAllDiscountCodes() {
    try {
      const priceRules = await this.shopify.priceRule.list();
      let allDiscountCodes = [];
      for (const rule of priceRules) {
        // eslint-disable-next-line no-await-in-loop
        const discountCodes = await this.shopify.discountCode.list(rule.id);
        allDiscountCodes = allDiscountCodes.concat(discountCodes);
      }
      return allDiscountCodes;
    } catch (error) {
      return error;
    }
  }

  async getDiscountPercentage(ruleId) {
    try {
      // const priceRules = await this.shopify.priceRule.get(ruleId.id);
      const priceRules = await this.shopify.priceRule.list(ruleId);

      return priceRules;
    } catch (error) {
      return error;
    }
  }
}

module.exports = ShopifyNotification;
