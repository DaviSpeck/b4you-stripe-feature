import { Withdrawals_settings } from "../../database/models/Withdrawals_settings.mjs";

export class WithdrawalsSettingsRepository {
    static async find(where) {
        const withdrawalsSettings = await Withdrawals_settings.findOne({
            raw: true,
            where,
        });
        return withdrawalsSettings;
    }

    static async update(where, data) {
        await Withdrawals_settings.update(data, { where });
    }
};
