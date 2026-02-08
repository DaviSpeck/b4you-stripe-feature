const Withdrawals_settings_default = require('../models/Withdrawals_settings_default');

const findWithdrawalsSettingsDefault = async () => {
  const withdrawal_settings_default =
    await Withdrawals_settings_default.findOne({
      raw: true,
      order: [['id', 'desc']],
    });
  return withdrawal_settings_default;
};

const updateWithdrawalsSettingsDefault = async (where, data) => {
  const withdrawal_settings_default = await Withdrawals_settings_default.update(
    data,
    { where },
  );
  return withdrawal_settings_default;
};

module.exports = {
  findWithdrawalsSettingsDefault,
  updateWithdrawalsSettingsDefault,
};
