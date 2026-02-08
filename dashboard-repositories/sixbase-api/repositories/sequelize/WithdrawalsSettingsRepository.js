const WithdrawalsSettings = require('../../database/models/Withdrawals_settings');

module.exports = class WithdrawalsSettingsRepository {
  static async find(where) {
    const withdrawalsSettings = await WithdrawalsSettings.findOne({
      where,
    });

    if (withdrawalsSettings) return withdrawalsSettings.toJSON();
    return withdrawalsSettings;
  }
};
