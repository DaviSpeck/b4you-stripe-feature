const WithdrawalsSettings = require('../../database/models/Withdrawals_settings');

module.exports = class WithdrawalsSettingsRepository {
  static async find(where) {
    const withdrawalsSettings = await WithdrawalsSettings.findOne({
      raw: true,
      where,
    });
    return withdrawalsSettings;
  }

  static async update(where, data) {
    await WithdrawalsSettings.update(data, { where });
  }
};
