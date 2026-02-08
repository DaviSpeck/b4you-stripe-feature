const Product_affiliate_settings = require('../models/Product_affiliate_settings');

const createProductAffiliateSettings = async (settingsObj) => {
  const createdSettings = await Product_affiliate_settings.create(settingsObj);
  return createdSettings;
};

const findOneProductAffiliateSettings = async (where) => {
  const settings = await Product_affiliate_settings.findOne({
    raw: true,
    where,
  });
  return settings;
};

const updateProductAffiliateSettings = async (id_product, settingsObj) => {
  const updatedSettings = await Product_affiliate_settings.update(settingsObj, {
    where: {
      id_product,
    },
  });
  return updatedSettings;
};

module.exports = {
  createProductAffiliateSettings,
  findOneProductAffiliateSettings,
  updateProductAffiliateSettings,
};
