const CheckRecentRecordsUseCase = require('../common/CheckRecentRecordsUseCase');
const CommissionsModel = require('../../../database/models/Commissions');
const { findRoleTypeByKey } = require('../../../types/roles');
const { findCommissionsStatus } = require('../../../status/commissionsStatus');
const { Op } = require('sequelize');

class CheckAffiliateHasRecentConfirmedCommissionUseCase extends CheckRecentRecordsUseCase {
    constructor() {
        super({
            model: CommissionsModel,
            baseFilters: {
                id_role: findRoleTypeByKey('affiliate').id,
                id_status: {
                    [Op.in]: [
                        findCommissionsStatus('waiting').id,
                        findCommissionsStatus('released').id,
                        findCommissionsStatus('chargeback_dispute').id,
                    ],
                },
            },
        });
    }

    async execute({ affiliateId, days = 90 }) {
        return super.execute({ id_user: affiliateId }, days);
    }
}

module.exports = CheckAffiliateHasRecentConfirmedCommissionUseCase;