import { findTransactionTypeByKey } from '../types/transactions.mjs';
import { findTransactionStatusByKey } from '../status/transactions.mjs';
import { Transactions } from '../database/models/Transactions.mjs';
import { Balances } from '../database/models/Balances.mjs';
import aws from '../queues/aws.mjs';
import { date } from '../helpers/date.mjs';
import { BalanceHistory } from '../database/models/BalanceHistory.mjs';

const DATABASE_DATE_WITHOUT_TIME = 'YYYY-MM-DD';

export const refundCommissionsChargeback = async ({
  transactions,
  payment_type,
  sale_item,
  type = 'chargeback',
  t,
}) => {
  const paymentTransactions = transactions.filter(
    (tr) => tr.id_type === findTransactionTypeByKey('payment').id
  );
  const costTransactions = transactions.filter(
    (tr) => tr.id_type === findTransactionTypeByKey('cost').id
  );
  const commissionsTransactions = transactions.filter(
    (tr) => tr.id_type === findTransactionTypeByKey('commission').id
  );
  let commissions = 0;

  if (payment_type === 'subscription') {
    commissions = transactions
      .filter(({ id_type }) => id_type === findTransactionTypeByKey('commission').id)
      .sort((a, b) => b.id - a.id);

    const [firstCommission] = commissions;

    commissions = commissions.filter((c) => c.psp_id === firstCommission.psp_id);
  } else {
    commissions = transactions.filter(
      ({ id_type }) => id_type === findTransactionTypeByKey('commission').id
    );
  }

  for await (const payment of paymentTransactions) {
    await Transactions.update(
      { id_status: findTransactionStatusByKey(type).id },
      {
        transaction: t,
        where: {
          id: payment.id,
        },
      }
    );
  }
  for await (const cost of costTransactions) {
    await Transactions.update(
      { id_status: findTransactionStatusByKey(type).id },
      {
        transaction: t,
        where: {
          id: cost.id,
        },
      }
    );
  }

  for await (const commission of commissionsTransactions) {
    if (commission.released && commission.id_status === findTransactionStatusByKey('paid').id) {
      await Balances.decrement('amount', {
        by: commission.user_net_amount,
        where: { id_user: commission.id_user },
        lock: true,
        transaction: t,
      });
      await BalanceHistory.create(
        {
          id_user: commission.id_user,
          id_transaction: commission.id,
          operation: 'decrement',
          amount: commission.user_net_amount,
        },
        { transaction: t }
      );
    }
    await Transactions.update(
      { id_status: findTransactionStatusByKey(type).id, released: false },
      {
        transaction: t,
        where: { id: commission.id },
      }
    );
    t.afterCommit(async () => {
      await aws.add('usersRevenue', {
        id_user: commission.id_user,
        amount: commission.user_net_amount,
        operation: 'decrement',
        paid_at: date(sale_item.paid_at).subtract(3, 'hours').format(DATABASE_DATE_WITHOUT_TIME),
      });
    });
  }
};
