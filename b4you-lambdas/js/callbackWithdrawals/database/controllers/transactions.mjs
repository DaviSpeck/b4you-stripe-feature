import { Transactions } from '../models/Transactions.mjs';

export const updateTransaction = async (where, transactionObj, t = null) => {
  const transaction = await Transactions.update(
    transactionObj,
    {
      where,
    },
    t
      ? {
          transaction: t,
        }
      : null
  );
  return transaction;
};

export const findOneTransactionWithSaleItemsAndCommissions = async (where) =>
  Transactions.findOne({
    where,
    include: [
      {
        association: 'sales_items',
        include: [
          {
            association: 'transactions',
          },
          {
            association: 'product',
            paranoid: false,
            include: [
              {
                association: 'producer',
              },
            ],
          },
          {
            association: 'student',
          },
          {
            association: 'subscription',
            required: false,
            include: [
              {
                association: 'plan',
                paranoid: false,
              },
            ],
          },
        ],
      },
    ],
  });
