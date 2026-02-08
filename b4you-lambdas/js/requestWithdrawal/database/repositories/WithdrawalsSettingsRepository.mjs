import { Withdrawals_settings } from '../models/Withdrawals_settings.mjs';

export class WithdrawalsSettingsRepository {
  static async find(where) {
    const withdrawalsSettings = await Withdrawals_settings.findOne({
      where,
    });

    if (!withdrawalsSettings) return null;
    return withdrawalsSettings.toJSON();
  }
}
