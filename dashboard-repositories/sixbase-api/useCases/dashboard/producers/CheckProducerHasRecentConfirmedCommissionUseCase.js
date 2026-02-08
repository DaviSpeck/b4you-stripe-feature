const CheckRecentRecordsUseCase = require('../common/CheckRecentRecordsUseCase');
const CommissionsModel = require('../../../database/models/Commissions');
const { findRoleTypeByKey } = require('../../../types/roles');
const { findCommissionsStatus } = require('../../../status/commissionsStatus');
const { Op } = require('sequelize');

class CheckProducerHasRecentConfirmedCommissionUseCase extends CheckRecentRecordsUseCase {
    constructor() {
        super({
            model: CommissionsModel,
            baseFilters: {
                id_role: findRoleTypeByKey('producer').id,
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

    async execute({ producerId, days = 90 }) {
        return super.execute({ id_user: producerId }, days);
    }
}

module.exports = CheckProducerHasRecentConfirmedCommissionUseCase;