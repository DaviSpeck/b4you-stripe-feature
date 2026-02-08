const uuid = require('../../utils/helpers/uuid');
const { updateSaleItem } = require('../../database/controllers/sales_items');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { createRefund } = require('../../database/controllers/refunds');
const { findRefundStatus } = require('../../status/refundStatus');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');
const {
  findTransactionStatusByKey,
} = require('../../status/transactionStatus');
const {
  updateTransaction,
  createTransaction,
} = require('../../database/controllers/transactions');
const { findRoleTypeByKey } = require('../../types/roles');
const {
  updateBalance,
  findUserBalance,
} = require('../../database/controllers/balances');
const date = require('../../utils/helpers/date');
const {
  createSalesItemsTransactions,
} = require('../../database/controllers/sales_items_transactions');
const aws = require('../../queues/aws');
const { DATABASE_DATE_WITHOUT_TIME } = require('../../types/dateTypes');
const Commissions = require('../../database/models/Commissions');
const { findCommissionsStatus } = require('../../status/commissionsStatus');
const { pagarmeRefund } = require('./pagarme');

const refundCommissions = async (
  { commissions, refundFees },
  type = 'decrement',
) => {
  for await (const commission of commissions) {
    if (commission.id_role === findRoleTypeByKey('producer').id) {
      await updateBalance(commission.id_user, refundFees.fee_total, type);
    }
    await Commissions.update(
      { id_status: findCommissionsStatus('refunded').id },
      { where: { id: commission.id } },
    );

    if (commission.id_status === findCommissionsStatus('released').id) {
      await updateBalance(commission.id_user, commission.amount, type);
    }
  }
};

/**
 * Armazena os dados do reembolso no banco de dados.
 *
 * @param {Object} params - Parâmetros do reembolso
 * @param {Object} params.saleItem - Item de venda
 * @param {Object} params.apiResponse - Resposta da API Pagarme
 * @param {string} params.reason - Motivo do reembolso
 * @param {string} params.refund_uuid - UUID do reembolso
 * @param {Object} [params.bank] - Dados bancários
 * @param {string} params.role - Papel que solicitou ('student' ou 'producer')
 * @param {Object} [params.transaction] - Transação do Sequelize
 * @returns {Promise<Object>} Refund criado
 */
const storeRefundData = async ({
  saleItem,
  apiResponse,
  reason,
  refund_uuid,
  bank = {},
  role,
  transaction = null,
}) => {
  let refundStatus = findRefundStatus('Solicitado pelo produtor').id;
  const saleItemStatus = findSalesStatusByKey('request-refund').id;
  if (role === 'student') {
    refundStatus = findRefundStatus('Solicitado pelo comprador').id;
  }
  const refund = await createRefund(
    {
      id_student: saleItem.id_student,
      id_sale_item: saleItem.id,
      id_status: refundStatus,
      requested_by_student: role === 'student',
      reason,
      uuid: refund_uuid,
      api_response: apiResponse,
      bank,
    },
    transaction,
  );

  await updateSaleItem(
    {
      id_status: saleItemStatus,
    },
    { id: saleItem.id },
    transaction,
  );
  return refund;
};

/**
 * Processa reembolso de pagamento por PIX.
 *
 * @param {Object} params - Parâmetros do reembolso
 * @param {Object} params.saleItem - Item de venda
 * @param {number} params.amount - Valor a ser reembolsado
 * @param {string} params.reason - Motivo do reembolso
 * @param {string} params.role - Papel que solicitou ('student' ou 'producer')
 * @param {string} params.provider_id - ID da charge no provedor
 * @param {string} params.provider - Provedor de pagamento
 * @param {Object} [params.transaction] - Transação do Sequelize
 * @returns {Promise<void>}
 */
const refundPix = async ({
  saleItem,
  amount,
  reason,
  role,
  provider_id,
  provider,
  transaction: t = null,
}) => {
  const refund_uuid = uuid.v4();
  const apiResponse = await pagarmeRefund({
    saleItem,
    amount,
    provider_id,
    provider,
  });
  await storeRefundData({
    saleItem,
    apiResponse,
    reason,
    refund_uuid,
    role,
    transaction: t,
  });
};

/**
 * Processa reembolso de pagamento por boleto.
 *
 * @param {Object} params - Parâmetros do reembolso
 * @param {Object} params.saleItem - Item de venda
 * @param {number} params.amount - Valor a ser reembolsado
 * @param {string} params.reason - Motivo do reembolso
 * @param {string} params.role - Papel que solicitou ('student' ou 'producer')
 * @param {Object} params.bank_account - Dados da conta bancária
 * @param {string} params.provider_id - ID da charge no provedor
 * @param {string} params.provider - Provedor de pagamento
 * @param {Object} [params.transaction] - Transação do Sequelize
 * @returns {Promise<Object>} Refund criado
 */
const refundBillet = async ({
  saleItem,
  amount,
  reason,
  role,
  bank_account,
  provider_id,
  provider,
  transaction: t = null,
}) => {
  const refund_uuid = uuid.v4();
  const apiResponse = await pagarmeRefund({
    saleItem,
    provider_id,
    amount,
    bank_account,
    provider,
  });

  const data = await storeRefundData({
    saleItem,
    apiResponse,
    reason,
    refund_uuid,
    bank: bank_account,
    role,
    transaction: t,
  });
  return data;
};

/**
 * Processa reembolso de pagamento por cartão.
 * Suporta múltiplas charges, calculando o valor proporcional para cada uma.
 *
 * @param {Object} params - Parâmetros do reembolso
 * @param {Object} params.saleItem - Item de venda com charges associadas
 * @param {string} params.reason - Motivo do reembolso
 * @param {string} params.role - Papel que solicitou ('student' ou 'producer')
 * @param {number} params.amount - Valor total a ser reembolsado
 * @param {string} [params.provider_id] - ID da charge no provedor (usado quando não há charges no saleItem)
 * @param {string} [params.provider] - Provedor de pagamento (usado quando não há charges no saleItem)
 * @param {Object} [params.transaction] - Transação do Sequelize
 * @returns {Promise<void>}
 */
const refundCard = async ({
  saleItem,
  reason,
  role,
  amount,
  provider_id,
  provider,
  transaction: t = null,
}) => {
  const cardCharges =
    saleItem.charges?.filter(
      (charge) => charge.payment_method === 'credit_card',
    ) || [];

  if (cardCharges.length === 1) {
    const refund_uuid = uuid.v4();
    const apiResponse = await pagarmeRefund({
      saleItem,
      amount,
      provider_id,
      provider,
    });

    await storeRefundData({
      saleItem,
      apiResponse,
      reason,
      refund_uuid,
      role,
      transaction: t,
    });
    return;
  }

  for await (const charge of cardCharges) {
    const refund_uuid = uuid.v4();

    const apiResponse = await pagarmeRefund({
      saleItem,
      amount: charge.price,
      provider_id: charge.provider_id,
      provider: charge.provider,
    });

    await storeRefundData({
      saleItem,
      apiResponse,
      reason,
      refund_uuid,
      role,
      transaction: t,
    });
  }
};

const refundCommissionsChargeback = async ({
  transactions,
  sale_item,
  type = 'chargeback',
  transaction: t = null,
}) => {
  await Commissions.update(
    { id_status: findCommissionsStatus(type).id },
    { where: { id_sale_item: sale_item.id }, transaction: t },
  );
  const paymentTransactions = transactions.filter(
    (tr) => tr.id_type === findTransactionTypeByKey('payment').id,
  );
  const costTransactions = transactions.filter(
    (tr) => tr.id_type === findTransactionTypeByKey('cost').id,
  );
  const commissionsTransactions = transactions.filter(
    (tr) => tr.id_type === findTransactionTypeByKey('commission').id,
  );
  let commissions = transactions.filter(
    ({ id_type }) => id_type === findTransactionTypeByKey('commission').id,
  );

  // Collect queue calls to execute after commit
  const queueCalls = [];

  for await (const payment of paymentTransactions) {
    await updateTransaction(
      { id: payment.id },
      { id_status: findTransactionStatusByKey(type).id },
      t,
    );
  }
  for await (const cost of costTransactions) {
    await updateTransaction(
      { id: cost.id },
      { id_status: findTransactionStatusByKey(type).id },
      t,
    );
  }

  const affiliateCommission = commissionsTransactions.find(
    (tr) => tr.id_role === findRoleTypeByKey('affiliate').id,
  );
  if (!affiliateCommission || !affiliateCommission.released) {
    for await (const commission of commissionsTransactions) {
      if (commission.released) {
        await updateBalance(
          commission.id_user,
          commission.user_net_amount,
          'decrement',
          t,
        );
      }
      await updateTransaction(
        { id: commission.id },
        { id_status: findTransactionStatusByKey(type).id },
        t,
      );
      queueCalls.push(() =>
        aws.add('usersRevenue', {
          id_user: commission.id_user,
          amount: commission.user_net_amount,
          operation: 'decrement',
          paid_at: date(sale_item.paid_at)
            .subtract(3, 'hours')
            .format(DATABASE_DATE_WITHOUT_TIME),
        }),
      );
    }
  } else {
    commissions = commissionsTransactions.filter(
      (c) => c.id_role !== findRoleTypeByKey('affiliate').id,
    );
    const totalCommission = commissions.reduce(
      (acc, { user_net_amount: userCommission }) => {
        acc += userCommission;
        return acc;
      },
      0,
    );

    let totalAffiliate = affiliateCommission.user_net_amount;
    const affiliateBalance = await findUserBalance(
      affiliateCommission.id_user,
      t,
    );

    if (affiliateBalance.amount > 0) {
      let affiliateAmount = 0;
      if (affiliateBalance.amount >= totalAffiliate) {
        affiliateAmount = totalAffiliate;
        totalAffiliate = 0;
      } else {
        totalAffiliate =
          affiliateCommission.user_net_amount - affiliateBalance.amount;
        affiliateAmount = affiliateBalance.amount;
      }
      await updateTransaction(
        { id: affiliateCommission.id },
        { id_status: findTransactionStatusByKey(type).id },
        t,
      );
      await updateBalance(
        affiliateCommission.id_user,
        affiliateAmount,
        'decrement',
        t,
      );
    } else {
      totalAffiliate = affiliateCommission.user_net_amount;
    }

    for await (const commission of commissions) {
      const affiliateCommissionRate = Number(
        (
          (commission.user_net_amount / totalCommission) *
          totalAffiliate
        ).toFixed(2),
      );

      if (affiliateCommissionRate > 0) {
        const costAffiliate = await createTransaction(
          {
            uuid: uuid.v4(),
            id_user: commission.id_user,
            id_type: findTransactionTypeByKey('cost_affiliate').id,
            id_status: findTransactionStatusByKey('paid').id,
            user_net_amount: affiliateCommissionRate,
            method: commission.method,
          },
          t,
        );

        await createSalesItemsTransactions(
          {
            id_sale_item: sale_item.id,
            id_transaction: costAffiliate.id,
          },
          t,
        );
      }

      await updateTransaction(
        { id: commission.id },
        { id_status: findTransactionStatusByKey(type).id },
        t,
      );
      if (commission.released) {
        await updateBalance(
          commission.id_user,
          commission.user_net_amount + affiliateCommissionRate,
          'decrement',
          t,
        );
      }
      queueCalls.push(() =>
        aws.add('usersRevenue', {
          id_user: commission.id_user,
          amount: commission.user_net_amount,
          operation: 'decrement',
          paid_at: date(sale_item.paid_at)
            .subtract(3, 'hours')
            .format(DATABASE_DATE_WITHOUT_TIME),
        }),
      );
    }
  }

  // Execute queue calls after commit if transaction is provided
  if (t && queueCalls.length > 0) {
    t.afterCommit(async () => {
      await Promise.all(queueCalls.map((fn) => fn()));
    });
  } else if (queueCalls.length > 0) {
    // If no transaction, execute immediately (backward compatibility)
    await Promise.all(queueCalls.map((fn) => fn()));
  }
};

module.exports = {
  refundBillet,
  refundCard,
  refundPix,
  refundCommissions,
  storeRefundData,
  refundCommissionsChargeback,
};
