import { Users } from './models/Users.mjs';
import { Commissions } from './models/Commissions.mjs';
import { SalesItems } from './models/Sales_items.mjs';
import { FormUserProfiles } from './models/Form_user_profiles.mjs';
import { LeaderboardWinners } from './models/LeaderboardWinners.mjs';

export function initModels(sequelize) {
    Users.initModel(sequelize);
    Commissions.initModel(sequelize);
    SalesItems.initModel(sequelize);
    FormUserProfiles.initModel(sequelize);
    LeaderboardWinners.initModel(sequelize);

    return {
        Users,
        Commissions,
        SalesItems,
        FormUserProfiles,
        LeaderboardWinners,
    };
}