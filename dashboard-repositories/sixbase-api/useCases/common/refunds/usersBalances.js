const CostCentralRepository = require('../../../repositories/sequelize/CostCentralRepository');
const SalesSettingsRepository = require('../../../repositories/sequelize/SalesSettingsRepository');
const TaxesRepository = require('../../../repositories/sequelize/TaxesRepository');
const RefundFees = require('../../refunds/RefundFees');
const { findRoleTypeByKey } = require('../../../types/roles');
const { updateBalance } = require('../../../database/controllers/balances');
const Commissions = require('../../../database/models/Commissions');

const { findCommissionsStatus } = require('../../../status/commissionsStatus');

const updateUsersBalance = async (saleItem, type = 'decrement', t = null) => {
  const commissions = await Commissions.findAll({
    where: { id_sale_item: saleItem.id },
  });
  const producerCommission = commissions.find(
    (c) => c.id_role === findRoleTypeByKey('producer').id,
  );

  const refundFees = await new RefundFees(
    TaxesRepository,
    CostCentralRepository,
  ).execute({
    amount: saleItem.price_total,
    method: saleItem.payment_method.toUpperCase(),
    refundSettings: await SalesSettingsRepository.find(
      producerCommission.id_user,
    ),
  });

  for await (const commission of commissions) {
    if (commission.id_role === findRoleTypeByKey('producer').id) {
      await updateBalance(commission.id_user, refundFees.fee_total, type, t);
    }
    await Commissions.update(
      { id_status: findCommissionsStatus('refunded').id },
      { where: { id: commission.id }, transaction: t },
    );

    if (commission.id_status === findCommissionsStatus('released').id) {
      await updateBalance(commission.id_user, commission.amount, type, t);
    }
  }
};

module.exports = {
  updateUsersBalance,
};
