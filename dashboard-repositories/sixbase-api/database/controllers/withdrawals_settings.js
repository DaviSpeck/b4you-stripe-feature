const Withdrawal_Settings = require('../models/Withdrawals_settings');
const {
  findWithdrawalsSettingsDefault,
} = require('./Withdrawals_settings_default');

const createWithdrawalSettings = async (id_user, t = null) => {
  const {
    free_month_withdrawal,
    max_daily_withdrawal,
    max_amount,
    min_amount,
    fee_fixed,
    fee_variable,
  } = await findWithdrawalsSettingsDefault();
  const withdrawal = await Withdrawal_Settings.create(
    {
      id_user,
      free_month_withdrawal,
      max_daily_withdrawal,
      max_amount,
      min_amount,
      fee_fixed,
      fee_variable,
    },
    t ? { transaction: t } : null,
  );
  return withdrawal;
};

const findWithdrawalSettings = async (where) => {
  const withdrawalSettings = await Withdrawal_Settings.findOne({
    raw: true,
    where,
  });
  return withdrawalSettings;
};

module.exports = {
  createWithdrawalSettings,
  findWithdrawalSettings,
};
