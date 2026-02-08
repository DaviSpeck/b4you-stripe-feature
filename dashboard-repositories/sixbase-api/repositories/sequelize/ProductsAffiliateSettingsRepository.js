const ProductAffiliateSettings = require('../../database/models/Product_affiliate_settings');

module.exports = class ProductAffiliateSettingsRepository {
  static async create(data) {
    const productAffiliateSettings = await ProductAffiliateSettings.create(
      data,
    );
    return productAffiliateSettings;
  }

  static async findOne(where) {
    const productAffiliateSettings = await ProductAffiliateSettings.findOne({
      where,
    });
    return productAffiliateSettings;
  }
};
