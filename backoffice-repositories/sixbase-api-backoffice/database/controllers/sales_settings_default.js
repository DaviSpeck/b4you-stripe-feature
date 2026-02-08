const Sales_settings_default = require('../models/Sales_settings_default');

const findSalesSettingsDefault = async () => {
  const sales_settings = await Sales_settings_default.findOne({
    raw: true,
    order: [['id', 'desc']],
  });
  return sales_settings;
};

const updateSalesSettingsDefault = async (where, data) => {
  const sales_settings = await Sales_settings_default.update(data, { where });
  return sales_settings;
};

module.exports = { findSalesSettingsDefault, updateSalesSettingsDefault };
